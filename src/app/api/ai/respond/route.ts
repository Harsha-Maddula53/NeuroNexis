import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { buildSystemPrompt, parseAIResponse, wrapAIDisplay, GROQ_API_URL } from "@/lib/ai";
import { buildRateLimitHeaders, checkRateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const conversationId = typeof body.conversationId === "string" ? body.conversationId : "";
    const requestedRecipientId = typeof body.recipientId === "string" ? body.recipientId : "";

    if (!conversationId || !requestedRecipientId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const senderId = session.user.id;

    const rate = checkRateLimit(`ai:respond:${senderId}`, { limit: 20, windowMs: 60_000 });
    if (!rate.success) {
      return NextResponse.json(
        { error: "Too many AI requests. Please try again shortly." },
        {
          status: 429,
          headers: buildRateLimitHeaders(rate),
        },
      );
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      select: {
        participant1Id: true,
        participant2Id: true,
      },
    });

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    const senderIsParticipant =
      conversation.participant1Id === senderId || conversation.participant2Id === senderId;

    if (!senderIsParticipant) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const recipientId =
      conversation.participant1Id === senderId
        ? conversation.participant2Id
        : conversation.participant1Id;

    if (requestedRecipientId !== recipientId) {
      return NextResponse.json({ error: "Recipient mismatch" }, { status: 403 });
    }

    const recipientUser = await prisma.user.findUnique({
      where: { id: recipientId },
      include: {
        aiIdentity: true,
        behaviorProfile: true,
      }
    });

    if (!recipientUser || !recipientUser.aiIdentity || !recipientUser.behaviorProfile) {
       return NextResponse.json({ error: "Recipient has not configured their AI identity or behavior profile." }, { status: 400 });
    }

    if (!recipientUser.aiEnabled) {
      return NextResponse.json({ error: "Recipient AI is disabled" }, { status: 400 });
    }

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ error: "AI provider is not configured" }, { status: 500 });
    }

    // 2. Fetch Sender Data (Just for the name to give context to the AI)
    const senderUser = await prisma.user.findUnique({
        where: { id: senderId },
        select: { name: true }
    });

    if (!senderUser) {
        return NextResponse.json({ error: "Sender not found" }, { status: 404 });
    }

    const systemPromptText = buildSystemPrompt(recipientUser, senderUser.name);

    const recentMessages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { timestamp: "desc" },
      take: 10,
      include: { sender: { select: { name: true } } },
    });

    // Build multi-turn conversation in Groq (OpenAI) native format
    const conversationContents = recentMessages.reverse().map((message) => ({
      role: message.isAi ? 'assistant' : 'user',
      content: message.content,
    }));

    // Add current context/system message manually. Groq supports "system" roles.
    conversationContents.unshift({ role: 'system', content: systemPromptText });

    const groqBody = JSON.stringify({
      model: "llama-3.1-8b-instant", // Using Groq's insanely fast LLAMA 3 model
      messages: conversationContents,
      max_tokens: 256,
      temperature: 0.8,
      stream: true,
    });

    let response: Response | null = null;
    const MAX_RETRIES = 3;
    
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);

      try {
        response = await fetch(GROQ_API_URL, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          },
          signal: controller.signal,
          body: groqBody,
        });
        clearTimeout(timeout);

        if (response.ok) break;

        if (response.status === 429 && attempt < MAX_RETRIES) {
          const backoffMs = Math.pow(2, attempt + 1) * 1000;
          console.warn(`Groq 429 rate limit hit (respond). Retrying in ${backoffMs}ms...`);
          await new Promise(resolve => setTimeout(resolve, backoffMs));
          continue;
        }

        const errorData = await response.json().catch(() => ({}));
        const errMsg = errorData.error?.message || (response.status === 429 
          ? "AI is temporarily overloaded. Please wait a moment." 
          : "Groq API request failed");
        throw new Error(errMsg);
      } catch (err: any) {
        clearTimeout(timeout);
        if (err.name === 'AbortError' && attempt < MAX_RETRIES) {
           console.warn(`Groq timeout (respond). Retrying...`);
           continue;
        }
        throw err;
      }
    }

    if (!response || !response.ok) {
      throw new Error("AI service unavailable after retries.");
    }

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    let fullText = "";

    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        if (!reader) return controller.close();

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');
            
            for (const line of lines) {
              if (line.trim() === '') continue;
              if (line.trim() === 'data: [DONE]') continue;
              if (line.startsWith('data: ')) {
                try {
                  const dataObj = JSON.parse(line.substring(6));
                  const text = dataObj.choices?.[0]?.delta?.content || "";
                  if (text) {
                    fullText += text;
                    controller.enqueue(encoder.encode(text));
                  }
                } catch (e) {
                  // Incomplete JSON chunk or error parsing, ignore and continue
                }
              }
            }
          }

          const { content, confidence } = parseAIResponse(fullText);

          await prisma.message.create({
            data: {
              conversationId,
              senderId: recipientId,
              content: wrapAIDisplay(recipientUser.name, content),
              isAi: true,
              confidenceLevel: confidence
            }
          });

          await prisma.conversation.update({
              where: { id: conversationId },
              data: { lastMessageAt: new Date() }
          });
        } catch (err) {
          console.error("Stream error:", err);
        } finally {
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    });

  } catch (error: unknown) {
    console.error("Error in AI respond route:", error);
    const message = error instanceof Error ? error.message : "Failed to generate AI response";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

