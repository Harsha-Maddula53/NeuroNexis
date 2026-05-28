import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { buildSystemPrompt, parseAIResponse, wrapAIDisplay, GROQ_API_URL } from "@/lib/ai";
import { buildRateLimitHeaders, checkRateLimit } from "@/lib/rate-limit";

// GET handler remains unchanged...
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userId = session.user.id;

    const trainRate = checkRateLimit(`ai:train:get:${userId}`, { limit: 120, windowMs: 60_000 });
    if (!trainRate.success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again shortly." },
        {
          status: 429,
          headers: buildRateLimitHeaders(trainRate),
        },
      );
    }

    // Find or create a self-conversation for training
    let trainingConversation = await prisma.conversation.findFirst({
      where: {
        participant1Id: userId,
        participant2Id: userId,
      },
    });

    if (!trainingConversation) {
      trainingConversation = await prisma.conversation.create({
        data: {
          participant1Id: userId,
          participant2Id: userId,
        },
      });
    }

    // Fetch all messages in the training conversation
    const messages = await prisma.message.findMany({
      where: { conversationId: trainingConversation.id },
      orderBy: { timestamp: "asc" },
    });

    return NextResponse.json({
      conversationId: trainingConversation.id,
      messages: messages.map((m) => ({
        id: m.id,
        sender: m.isAi ? "ai" : "user",
        text: m.content,
        timestamp: m.timestamp,
      })),
    });
  } catch (error) {
    console.error("TRAINING_GET_ERROR:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userId = session.user.id;

    const postRate = checkRateLimit(`ai:train:post:${userId}`, { limit: 25, windowMs: 60_000 });
    if (!postRate.success) {
      return NextResponse.json(
        { error: "Too many AI training prompts. Please slow down." },
        {
          status: 429,
          headers: buildRateLimitHeaders(postRate),
        },
      );
    }

    const body = await req.json();
    const conversationId = typeof body.conversationId === "string" ? body.conversationId : "";
    const userMessage = typeof body.userMessage === "string" ? body.userMessage.trim() : "";

    if (!conversationId || !userMessage) {
      return NextResponse.json({ error: "Missing conversationId or userMessage" }, { status: 400 });
    }

    if (userMessage.length > 2000) {
      return NextResponse.json({ error: "Message is too long" }, { status: 400 });
    }

    const trainingConversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      select: {
        id: true,
        participant1Id: true,
        participant2Id: true,
      },
    });

    if (!trainingConversation) {
      return NextResponse.json({ error: "Training conversation not found" }, { status: 404 });
    }

    const isOwnerTrainingConversation =
      trainingConversation.participant1Id === userId && trainingConversation.participant2Id === userId;

    if (!isOwnerTrainingConversation) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ error: "AI provider is not configured" }, { status: 500 });
    }

    // 1. Save user message
    await prisma.message.create({
      data: {
        conversationId,
        senderId: userId,
        content: userMessage,
        isAi: false,
      },
    });

    // 2. Load user and behavior
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { aiIdentity: true, behaviorProfile: true },
    });

    if (!user || !user.aiIdentity || !user.behaviorProfile) {
      return NextResponse.json({ error: "Profile incomplete" }, { status: 400 });
    }

    // 3. Load history
    const recentMessages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { timestamp: "desc" },
      take: 10,
    });
    const chronologicalMessages = recentMessages.reverse();

    // 4. Build Groq Stream
    const systemPrompt = buildSystemPrompt(user, user.name + " (Training)");
    const conversationContents = chronologicalMessages.map((m) => ({
      role: m.isAi ? 'assistant' : 'user',
      content: m.content,
    }));

    conversationContents.unshift({ role: 'system', content: systemPrompt });

    if (conversationContents.length === 1 || conversationContents[conversationContents.length - 1].role !== 'user') {
      conversationContents.push({ role: 'user', content: userMessage });
    }

    const controller = new AbortController();
    const groqBody = JSON.stringify({
      model: "llama-3.1-8b-instant", // Using Groq's fast LLAMA 3
      messages: conversationContents,
      max_tokens: 512,
      temperature: 0.8,
      stream: true, // Need to specify streaming explicitly for OpenAI compatibles
    });

    // Retry with exponential backoff for transient rate-limit (429) errors
    let response: Response | null = null;
    const MAX_RETRIES = 3;
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        },
        signal: controller.signal,
        body: groqBody,
      });

      if (response.ok) break;

      // If rate-limited and we have retries left, wait and try again
      if (response.status === 429 && attempt < MAX_RETRIES) {
        const backoffMs = Math.pow(2, attempt + 1) * 1000; // 2s, 4s, 8s
        console.warn(`Groq 429 rate limit hit. Retrying in ${backoffMs}ms (attempt ${attempt + 1}/${MAX_RETRIES})...`);
        await new Promise(resolve => setTimeout(resolve, backoffMs));
        continue;
      }

      // Non-retryable error or retries exhausted
      const err = await response.json().catch(() => ({}));
      const errMsg = err.error?.message || (response.status === 429
        ? "AI is temporarily overloaded. Please wait a moment and try again."
        : "AI service unavailable. Please try again shortly.");
      throw new Error(errMsg);
    }

    if (!response || !response.ok) {
      throw new Error("AI service unavailable after retries. Please try again shortly.");
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

          // Save to DB at the end
          const { content, confidence } = parseAIResponse(fullText);
          await prisma.message.create({
            data: {
              conversationId,
              senderId: userId,
              content: wrapAIDisplay(user.name, content),
              isAi: true,
              confidenceLevel: confidence,
            },
          });
          
          await prisma.conversation.update({
            where: { id: conversationId },
            data: { lastMessageAt: new Date() },
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

  } catch (error: any) {
    console.error("STREAM_ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

