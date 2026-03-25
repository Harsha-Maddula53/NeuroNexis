import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { buildSystemPrompt, parseAIResponse, wrapAIDisplay, GEMINI_API_URL } from "@/lib/ai";

// GET: Fetch or create the training conversation and return its messages
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userId = (session.user as any).id;

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

// POST: Save user message, get AI response, save AI message, return both
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await req.json();
    const { conversationId, userMessage } = body;

    if (!conversationId || !userMessage) {
      return NextResponse.json(
        { error: "Missing conversationId or userMessage" },
        { status: 400 }
      );
    }

    // 1. Save the user's message to the database
    await prisma.message.create({
      data: {
        conversationId,
        senderId: userId,
        content: userMessage,
        isAi: false,
      },
    });

    // 2. Load the user's AI identity and behavior profile
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        aiIdentity: true,
        behaviorProfile: true,
      },
    });

    if (!user || !user.aiIdentity || !user.behaviorProfile) {
      return NextResponse.json(
        { error: "Please complete your AI identity and behavior profile first." },
        { status: 400 }
      );
    }

    // 3. Load recent conversation history from the DB for context
    const recentMessages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { timestamp: "desc" },
      take: 20,
    });

    const chronologicalMessages = recentMessages.reverse();

    // 4. Build prompt
    const systemPrompt = buildSystemPrompt(user, user.name + " (Training)");

    const promptString = `
      ${systemPrompt}
      
      TRAINING CONVERSATION HISTORY:
      ${chronologicalMessages.map((m) => `${m.isAi ? 'AI' : 'User'}: ${m.content}`).join('\n')}
      
      Generate the next response as the AI persona described above. This is a training session where the owner is testing you.
    `;

    // 5. Call Gemini API
    const response = await fetch(GEMINI_API_URL + '?key=' + process.env.GEMINI_API_KEY, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: promptString }] }],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Gemini API request failed");
    }

    const result = await response.json();
    const text = result.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const { content, confidence } = parseAIResponse(text);

    // 6. Save the AI response to the database
    const aiMessage = await prisma.message.create({
      data: {
        conversationId,
        senderId: userId,
        content: wrapAIDisplay(user.name, content),
        isAi: true,
        confidenceLevel: confidence,
      },
    });

    // 7. Update conversation timestamp
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date() },
    });

    return NextResponse.json({
      id: aiMessage.id,
      content,
      confidence,
      timestamp: aiMessage.timestamp,
    });
  } catch (error: any) {
    console.error("TRAINING_AI_ERROR:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate training response" },
      { status: 500 }
    );
  }
}
