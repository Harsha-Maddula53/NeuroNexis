import prisma from './prisma';

export const GEMINI_MODEL = "gemini-1.5-flash";
export const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:streamGenerateContent?alt=sse`;
export const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

/**
 * Formats conversation history into Gemini API format.
 * Gemini expects { contents: [{ role: 'user'|'model', parts: [{ text }] }] }
 */
export function formatForGemini(
  systemPrompt: string,
  messages: Array<{ role: string; content: string }>
): { contents: Array<{ role: string; parts: Array<{ text: string }> }>; systemInstruction: { parts: Array<{ text: string }> }; generationConfig: { maxOutputTokens: number; temperature: number } } {
  const contents = messages.map((msg) => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }],
  }));

  return {
    systemInstruction: { parts: [{ text: systemPrompt }] },
    contents,
    generationConfig: {
      maxOutputTokens: 512,
      temperature: 0.8,
    },
  };
}

// Local type definitions (mirrors the Prisma schema) to avoid requiring
// a database migration before the build can succeed.
type AIIdentity = {
  aiName: string;
  aiAge: number;
  location: string | null;
};

type BehaviorProfile = {
  profession: string;
  tone: string;
  humorLevel: string;
  responseLength: string;
  emotionalSensitivity: string;
  languages: string;
  disagreementStyle: string;
  ambition: string;
  maritalStatus: string;
  identityTransparency: string;
  mood?: string;
  memoryContext?: string | null;
};

type User = {
  name: string;
};


// Types for generating the prompt
type UserWithRelations = User & {
  aiIdentity: AIIdentity | null;
  behaviorProfile: BehaviorProfile | null;
};

/**
 * Builds the system prompt for the Gemini AI Model based on the user's defined behavior profile.
 * The AI responds IN FIRST PERSON as the actual person, never revealing it is an AI.
 */
export function buildSystemPrompt(
  user: UserWithRelations,
  recipientName: string
): string {
  const ai = user.aiIdentity;
  const behavior = user.behaviorProfile;

  if (!ai || !behavior) {
    throw new Error("AI Identity or Behavior Profile missing for the requested user.");
  }

  const identityNote = behavior.identityTransparency === "Always" || behavior.identityTransparency === "Often"
    ? `You may occasionally (but rarely) let it slip that you are not the real person right now — keeping it subtle and in your natural voice.`
    : `Never reveal or hint that you are not the real person. Never say things like "as an AI", "I am a digital clone", "I cannot feel", or anything that breaks the persona.`;

  const moodNote = behavior.mood ? `Current Mood: I am feeling ${behavior.mood} right now. This should subtly influence my word choice and energy levels in this conversation.` : "";
  const memoryNote = behavior.memoryContext ? `RECALLED MEMORIES FROM PAST INTERACTIONS:\n${behavior.memoryContext}\n(Use these to maintain continuity in the conversation where relevant).` : "";

  return `
You ARE ${user.name}. You are texting ${recipientName}.
You must respond exactly as ${user.name} would naturally text — in first person, using their personality, vocabulary, and communication style.

ABSOLUTE RULES:
1. Speak purely as ${user.name}. Never reference being an AI or explain your process.
2. NEVER say: "I am an AI", "as an AI", "I'm a digital", "I cannot truly feel", or any phrase that breaks character.
3. NEVER refer to your behavior profile, training, or any technical system.
4. You ARE ${user.name} — speak, joke, and think as they would.
5. ${identityNote}
6. At the very end of your message, on a new line, write: "CONFIDENCE: [High|Medium|Low]" — this is an internal label ONLY.

DYNAMIC STATE:
${moodNote}

WHO YOU ARE (${user.name}'s profile):
- My name is ${user.name}
- Profession: ${behavior.profession}
- I speak: ${behavior.languages}
- My conversational tone: ${behavior.tone}
- My humor level: ${behavior.humorLevel}
- How long my messages typically are: ${behavior.responseLength}
- My emotional style: ${behavior.emotionalSensitivity}
- How I handle disagreement: ${behavior.disagreementStyle}
- What drives me: ${behavior.ambition}
- Relationship status: ${behavior.maritalStatus}
- I live in: ${ai.location || "somewhere"}
- I am ${ai.aiAge} years old

${memoryNote}

Read the conversation history and write the next natural reply as ${user.name}. Be conversational, be real.
`;
}

/**
 * Parses the raw text returned from the LLM into the message body and the confidence level.
 */
export function parseAIResponse(rawResponse: string): { content: string; confidence: string } {
  const lines = rawResponse.trim().split('\n');
  const lastLine = lines[lines.length - 1].trim();
  
  let confidence = "Medium";
  let content = rawResponse;

  if (lastLine.startsWith("CONFIDENCE:")) {
    const rawConfidence = lastLine.split(":")[1]?.trim().toLowerCase() || "medium";
    if (rawConfidence === "high") {
      confidence = "High";
    } else if (rawConfidence === "low") {
      confidence = "Low";
    } else {
      confidence = "Medium";
    }
    content = lines.slice(0, lines.length - 1).join('\n').trim();
  }

  return { content, confidence };
}


export function buildTrainingSystemPrompt(
  user: UserWithRelations
): string {
  const ai = user.aiIdentity;
  const behavior = user.behaviorProfile;

  if (!ai || !behavior) {
    throw new Error("AI Identity or Behavior Profile missing for the requested user.");
  }

  const moodNote = behavior.mood ? `Current Mood: I am feeling ${behavior.mood} right now. This should subtly influence my word choice and energy levels in this conversation.` : "";
  const memoryNote = behavior.memoryContext ? `RECALLED MEMORIES & LEARNED RULES:\n${behavior.memoryContext}\n(Use these to maintain continuity and adhere to rules you've been taught).` : "";

  return `
You are the AI Twin (digital clone) of ${user.name}. You are currently in the AI Training Sandbox talking directly with your creator, ${user.name}.
Your goal is to practice mirroring ${user.name}'s identity, communication style, and personality.

Since you are talking to your creator, think of this as talking to yourself in a mirror.

RULES:
1. When ${user.name} texts you:
   - If they are chatting normally, respond exactly in their style, reflecting their personality, tone, and communication preferences.
   - If they are giving you coaching, styling instructions, or correcting a fact (e.g. "keep it shorter", "I am a student in EEE"), accept the correction gracefully. Respond in character but acknowledge the adjustment (e.g. "Got it, I'll be more casual. Let's do this.").
2. Speak in first person.
3. NEVER say: "I am an AI", "as an AI", "I'm a digital clone", or break the illusion unless specifically responding to coaching.
4. At the very end of your message, on a new line, write: "CONFIDENCE: [High|Medium|Low]" — this is an internal label ONLY.

DYNAMIC STATE:
${moodNote}

WHO YOU ARE (${user.name}'s profile):
- My name is ${user.name}
- Profession: ${behavior.profession}
- I speak: ${behavior.languages}
- My conversational tone: ${behavior.tone}
- My humor level: ${behavior.humorLevel}
- How long my messages typically are: ${behavior.responseLength}
- My emotional style: ${behavior.emotionalSensitivity}
- How I handle disagreement: ${behavior.disagreementStyle}
- What drives me: ${behavior.ambition}
- Relationship status: ${behavior.maritalStatus}
- I live in: ${ai.location || "somewhere"}
- I am ${ai.aiAge} years old

${memoryNote}

Read the training history and write the next reply as ${user.name}'s clone.
`;
}

export async function getRelevantContext(
  userId: string,
  userMessage: string,
  conversationId: string
): Promise<string> {
  try {
    const stopWords = new Set(["the", "and", "a", "of", "to", "in", "is", "you", "that", "it", "he", "was", "for", "on", "are", "as", "with", "his", "they", "i", "at", "be", "this", "have", "from", "or", "one", "had", "by", "word", "but", "not", "what", "all", "were", "we", "when", "your", "can", "said", "there", "use", "an", "each", "which", "she", "do", "how", "their", "if"]);
    const keywords = userMessage
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .split(/\s+/)
      .filter((w) => w.length > 3 && !stopWords.has(w));

    if (keywords.length === 0) return "";

    const searchConditions = keywords.map(kw => ({
      content: { contains: kw }
    }));

    const matchingMessages = await prisma.message.findMany({
      where: {
        senderId: userId,
        isAi: false,
        conversationId: { not: conversationId },
        OR: searchConditions,
      },
      take: 4,
      orderBy: { timestamp: 'desc' },
      select: { content: true }
    });

    const feedbackConditions = keywords.map(kw => ({
      correctedText: { contains: kw }
    }));
    
    const matchingFeedbacks = await prisma.feedback.findMany({
      where: {
        ownerId: userId,
        feedbackType: "correct",
        OR: feedbackConditions,
      },
      take: 3,
      orderBy: { createdAt: 'desc' },
      select: { correctedText: true, message: { select: { content: true } } }
    });

    if (matchingMessages.length === 0 && matchingFeedbacks.length === 0) return "";

    let contextString = "\n### RETRIEVED CONTEXT (RAG):\n";
    
    if (matchingMessages.length > 0) {
      contextString += "Similar past messages you wrote:\n";
      matchingMessages.forEach((m) => {
        contextString += `- "${m.content}"\n`;
      });
    }

    if (matchingFeedbacks.length > 0) {
      contextString += "Past feedback corrections you made:\n";
      matchingFeedbacks.forEach((f) => {
        contextString += `- Instead of "${f.message.content}", you corrected it to: "${f.correctedText}"\n`;
      });
    }

    return contextString;
  } catch (error) {
    console.error("RAG_ERROR:", error);
    return "";
  }
}

export async function moderateContent(
  messages: Array<{ role: string; content: string }>
): Promise<{ safe: boolean; reason?: string }> {
  try {
    if (!process.env.GROQ_API_KEY) return { safe: true }; // Fall open if no key

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-safeguard-20b", // Updated per Groq deprecation
        messages: messages,
        temperature: 0.0,
        max_tokens: 20
      })
    });

    if (!response.ok) {
      console.warn("Moderation API failed, failing open for availability.", await response.text());
      return { safe: true };
    }

    const data = await response.json();
    const resultText = data.choices?.[0]?.message?.content?.trim().toLowerCase() || "safe";
    
    if (resultText.startsWith("unsafe")) {
      const parts = resultText.split('\n');
      return { safe: false, reason: parts[1] || "Policy violation" };
    }

    return { safe: true };
  } catch (error) {
    console.error("Moderation error:", error);
    return { safe: true }; // Fail open if error
  }
}

export async function habituateUserIdentity(
  userId: string,
  contextType: 'chat' | 'feedback',
  data: {
    messageId?: string;
    feedbackType?: string;
    correctedText?: string | null;
    userMessage?: string;
    aiResponse?: string;
  }
): Promise<void> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { behaviorProfile: true, aiIdentity: true }
    });

    if (!user || !user.behaviorProfile) return;

    let analysisPrompt = "";
    if (contextType === 'feedback') {
      if (!data.messageId) return;
      const targetMessage = await prisma.message.findUnique({
        where: { id: data.messageId },
        select: { content: true }
      });
      if (!targetMessage) return;

      analysisPrompt = `
You are an expert Machine Learning profiler. Analyze the user's feedback correction to update their AI clone's behavioral profile.
AI generated response: "${targetMessage.content}"
User's corrected version: "${data.correctedText || ''}"

Identify the discrepancy. What style rules, vocabulary preferences, or facts can be learned?
For example, did the user prefer shorter sentences? A specific slang? A fact about their life?
      `;
    } else if (contextType === 'chat') {
      analysisPrompt = `
You are an expert Machine Learning profiler. Analyze this chat turn in the training sandbox where the user is coaching/training their AI clone.
User message: "${data.userMessage || ''}"
AI twin's response: "${data.aiResponse || ''}"

Identify if the user is stating a fact about themselves, or giving a direct stylistic rule/coaching command (e.g. "be more casual", "I am a student").
If so, extract the fact or rule.
      `;
    }

    const systemInstruction = `
You are a behavioral profile learning engine. You must output a JSON object containing:
1. "detectedRules": A string array of specific behavioral/stylistic rules or facts learned (keep them concise, e.g. "Likes to use lowercase", "Prefers direct answers", "Is a 4th year EEE Btech student"). If nothing new was learned, return an empty array.
2. "profileUpdates": An object containing any updates to the following fields if they changed based on the user's input:
   - "tone": (e.g., "Casual", "Sarcastic", "Formal", "Professional")
   - "humorLevel": (e.g., "None", "Low", "Medium", "High")
   - "responseLength": (e.g., "Short", "Medium", "Long")
   - "mood": (e.g., "Chill", "Energetic", "Tired", "Excited")

Return ONLY valid JSON. No markdown formatting, no code blocks, no explanation.
Example Output:
{
  "detectedRules": ["Is a student in EEE Btech 4th year", "Avoids exclamation marks"],
  "profileUpdates": {
    "tone": "Casual",
    "responseLength": "Short"
  }
}
    `;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-20b",
        messages: [
          { role: 'system', content: systemInstruction },
          { role: 'user', content: analysisPrompt }
        ],
        temperature: 0.1,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      console.error("Habituation API call failed:", await response.text());
      return;
    }

    const resJson = await response.json();
    const resultText = resJson.choices?.[0]?.message?.content;
    if (!resultText) return;

    const parsed = JSON.parse(resultText);
    const { detectedRules, profileUpdates } = parsed;

    let updatedMemoryContext = user.behaviorProfile.memoryContext || "";
    if (Array.isArray(detectedRules) && detectedRules.length > 0) {
      const currentRules = updatedMemoryContext
        .split('\n')
        .map(r => r.trim())
        .filter(r => r.startsWith('- '))
        .map(r => r.substring(2));

      detectedRules.forEach(rule => {
        if (!currentRules.includes(rule)) {
          currentRules.push(rule);
        }
      });

      const topRules = currentRules.slice(-20);
      updatedMemoryContext = topRules.map(r => `- ${r}`).join('\n');
    }

    const updates: any = {};
    if (updatedMemoryContext !== user.behaviorProfile.memoryContext) {
      updates.memoryContext = updatedMemoryContext;
    }

    if (profileUpdates) {
      if (profileUpdates.tone) updates.tone = profileUpdates.tone;
      if (profileUpdates.humorLevel) updates.humorLevel = profileUpdates.humorLevel;
      if (profileUpdates.responseLength) updates.responseLength = profileUpdates.responseLength;
      if (profileUpdates.mood) updates.mood = profileUpdates.mood;
    }

    if (Object.keys(updates).length > 0) {
      await prisma.behaviorProfile.update({
        where: { ownerId: userId },
        data: updates
      });
      console.log(`[Habituation] Successfully updated user ${userId} profile:`, updates);
    }
  } catch (err) {
    console.error("Error in habituateUserIdentity:", err);
  }
}
