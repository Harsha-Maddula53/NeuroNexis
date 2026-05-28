export const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

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

/**
 * Ensures transparency by adding the AI prefix if it's missing.
 */
export function wrapAIDisplay(name: string, content: string): string {
  const prefix = `(AI Representation of ${name}) `;
  if (content.startsWith("(AI ")) return content; // Already prefixed
  return prefix + content;
}
