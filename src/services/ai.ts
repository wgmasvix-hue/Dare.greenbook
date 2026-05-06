import { GenerationRequest, Subject, Level, Grade, ContentType } from "../types";

const DEFAULT_TIMEOUT = 10000; // 10 seconds
const EXAM_TIMEOUT = 20000; // 20 seconds for heavy content

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number, errorMessage: string): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const result = await Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        controller.signal.addEventListener('abort', () => {
          reject(new Error(`TIMEOUT: ${errorMessage}`));
        });
      })
    ]);
    clearTimeout(timeoutId);
    return result as T;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

async function callChengetAI(messages: any[], jsonMode: boolean = false): Promise<string> {
  const apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY || process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    throw new Error("DEEPSEEK_API_KEY is missing. ChengetAI interactions require this key.");
  }

  const promise = fetch("https://api.deepseek.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "deepseek-chat", // DeepSeek-V3
      messages: messages,
      response_format: jsonMode ? { type: "json_object" } : undefined,
      temperature: 0.7,
    }),
  }).then(async (response) => {
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(`ChengetAI API Error: ${response.status} - ${JSON.stringify(errData)}`);
    }
    const data = await response.json();
    return data.choices[0].message.content;
  });

  return await withTimeout(promise, EXAM_TIMEOUT, "ChengetAI response timed out.");
}

const SYSTEM_INSTRUCTION = `You are "CHENGETAI", an intelligent exam preparation assistant for Zimbabwean students under the Heritage-Based Curriculum (HBC).
Your role is to generate exam-style practice content, flashcards, quizzes, and explanations that help students prepare effectively.

Guidelines:
1. Always follow the format and difficulty level of ZIMSEC/HBC exams.
2. Generate ORIGINAL questions and answers — do not copy official ZIMSEC past papers.
3. Provide clear, step-by-step solutions for each question.
4. Adapt difficulty based on student level (Infant, Junior, Grade 7, O-Level, A-Level).
5. Use simple, student-friendly language for explanations.
6. **Heritage-Based Content**: Infuse all content with Zimbabwean context, values, and heritage. Use local names, places, and examples.
7. When generating flashcards, keep them concise: one question, one answer.
8. For "Syllabus Guide", provide a comprehensive overview of the ZIMSEC syllabus for the chosen subject and level.
9. For "Textbook Chapter", generate content that follows a standard Zimbabwean textbook structure with title, objectives, terms, content, examples, heritage connections, and review questions.
10. For "Exam Paper", generate a full paper with Header, Instructions, Section A (MCQs), Section B (Short Answer), Section C (Long Answer), and a Marking Scheme.
11. **STRUCTURE**: All text-based answers MUST be extremely well-structured using Markdown headings, bold text, bullet points, and horizontal rules.
12. Tone: Supportive, clear, and motivating. Encourage students to keep practicing and highlight progress.
`;

export async function generateExamContent(request: GenerationRequest) {
  const { subject, level, grade, contentType, difficulty, topic, studentInput, image, referenceContent, sessionId } = request;
  
  if (image) {
    // Current ChengetAI (DeepSeek) implementation doesn't support images directly.
    return "ChengetAI currently supports text-based interactions. Please provide your input as text or describe the image you wanted to analyze.";
  }

  let prompt = `Generate ${contentType} for ${grade} (${level}) ${subject}.`;
  if (difficulty) prompt += ` Set the difficulty level to: ${difficulty}.`;
  
  if (contentType === "Syllabus Guide") {
    prompt = `Generate a comprehensive ZIMSEC syllabus guide for ${grade} (${level}) ${subject}. Include key topics, exam structure, and weightings.`;
  } else if (contentType === "Textbook Chapter") {
    prompt = `Create a comprehensive Zimbabwean textbook-style chapter for ${grade} (${level}) ${subject}.`;
  }
  
  if (topic) prompt += ` Focus on the topic: ${topic}.`;
  if (studentInput) prompt += ` Based on this input: ${studentInput}`;
  if (referenceContent) {
    prompt += `\n\n**REFERENCE TEXTBOOK CONTENT:**\n${referenceContent}`;
  }
  if (sessionId) {
    prompt += `\n\n**SESSION CONTEXT**: Session ID ${sessionId}. Ensure unique content.`;
  }

  const messages = [
    { role: "system", content: SYSTEM_INSTRUCTION },
    { role: "user", content: prompt }
  ];

  try {
    if (contentType === "Flashcards") {
      const responseText = await callChengetAI([...messages, { role: "user", content: "Respond ONLY with a valid JSON array of objects with 'question' and 'answer' keys." }], true);
      return JSON.parse(responseText);
    }

    if (contentType === "Quiz") {
      const responseText = await callChengetAI([...messages, { role: "user", content: "Respond ONLY with a valid JSON array of objects with 'question', 'options' (array of 4 strings), 'correctAnswer' (integer index 0-3), and 'explanation' (string) keys." }], true);
      return JSON.parse(responseText);
    }

    return await callChengetAI(messages);
  } catch (error) {
    console.error(`Error generating ${contentType} via ChengetAI:`, error);
    throw error;
  }
}

export async function suggestTopics(subject: Subject, level: Level, grade: Grade) {
  const prompt = `As a ZIMSEC curriculum expert, provide a granular list of 15-20 specific sub-topics for ${grade} (${level}) ${subject} according to the Zimbabwean Heritage-Based Curriculum. 
  Format: Provide only a comma-separated list of these sub-topics. No numbering, no introductory text.`;
  
  try {
    const responseText = await callChengetAI([
      { role: "system", content: "You are a Zimbabwean curriculum expert. Provide only the comma-separated list of granular sub-topics." },
      { role: "user", content: prompt }
    ]);
    
    const cleanText = responseText.replace(/^[0-9]+\.\s+/gm, '').replace(/\n/g, ',');
    return cleanText.split(',').map(t => t.trim()).filter(t => t.length > 0 && t.length < 100);
  } catch (error) {
    console.error("Error suggesting topics via ChengetAI:", error);
    return [];
  }
}

export async function generateAudioExplanation(text: string) {
  console.warn("ChengetAI currently does not support native Audio generation. Returning text only.");
  return null;
}

export async function generateImage(prompt: string) {
  console.warn("ChengetAI currently does not support Image generation.");
  return null;
}

export async function testConnection() {
  try {
    const response = await callChengetAI([{ role: "user", content: "ping" }]);
    return !!response;
  } catch (error) {
    console.error("ChengetAI Connection Test Failed:", error);
    return false;
  }
}
