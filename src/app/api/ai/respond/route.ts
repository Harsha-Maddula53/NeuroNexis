import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { buildSystemPrompt, parseAIResponse, wrapAIDisplay, GEMINI_API_URL } from "@/lib/ai";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { conversationId, senderId, recipientId, recentMessages } = body;

    if (!conversationId || !senderId || !recipientId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. Fetch Recipient Data (The AI Persona)
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

    // 2. Fetch Sender Data (Just for the name to give context to the AI)
    const senderUser = await prisma.user.findUnique({
        where: { id: senderId },
        select: { name: true }
    });

    if (!senderUser) {
        return NextResponse.json({ error: "Sender not found" }, { status: 404 });
    }

    // 3. Build System Prompt
    const systemInstruction = buildSystemPrompt(recipientUser, senderUser.name);

    // 4. Format Conversation History for Gemini
    // We append the system instruction as the very first contextual message for Gemini to follow.
    // In gemini-1.5 this can also be set via systemInstruction param in model initialization, 
    // but building it into the prompt context works across versions.
    const promptString = `
      ${systemInstruction}
      
      CONVERSATION HISTORY:
      ${(recentMessages || []).map((m: any) => `${m.senderName}: ${m.content}`).join('\n')}
      
      Generate the next response as the AI persona described above responding to ${senderUser.name}.
    `;

    // 5. Call Gemini API via Fetch
    const response = await fetch(GEMINI_API_URL + '?key=' + process.env.GEMINI_API_KEY, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: promptString
              }
            ]
          }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Gemini API request failed");
    }

    const result = await response.json();
    const text = result.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // 6. Parse response into content and confidence
    const { content, confidence } = parseAIResponse(text);

    // 7. Store the new AI message in the database
    const newMessage = await prisma.message.create({
      data: {
        conversationId,
        senderId: recipientId, // The AI responds on behalf of the recipient
        content: wrapAIDisplay(recipientUser.name, content),
        isAi: true,
        confidenceLevel: confidence
      }
    });

    // 8. Update conversation timestamp
    await prisma.conversation.update({
        where: { id: conversationId },
        data: { lastMessageAt: new Date() }
    });

    return NextResponse.json({ 
        success: true, 
        message: newMessage 
    });

  } catch (error: any) {
    console.error("Error in AI respond route:", error);
    return NextResponse.json({ error: error.message || "Failed to generate AI response" }, { status: 500 });
  }
}
