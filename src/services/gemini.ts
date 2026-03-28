import { GoogleGenAI, Type, Modality } from "@google/genai";
import { GenerationRequest, Subject, Level, Grade, ContentType, QuizQuestion, Flashcard } from "../types";

function getAI() {
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
  if (!apiKey) {
    console.error("GEMINI_API_KEY is missing from process.env. Please ensure it is set in the environment or selected via the key dialog.");
  }
  return new GoogleGenAI({ apiKey: apiKey || "" });
}

function pcmToWav(pcmBase64: string, sampleRate: number = 24000): string {
  try {
    const pcmData = atob(pcmBase64);
    const buffer = new ArrayBuffer(44 + pcmData.length);
    const view = new DataView(buffer);

    // RIFF identifier
    view.setUint32(0, 0x52494646, false); // "RIFF"
    view.setUint32(4, 36 + pcmData.length, true);
    // WAVE identifier
    view.setUint32(8, 0x57415645, false); // "WAVE"
    // fmt chunk identifier
    view.setUint32(12, 0x666d7420, false); // "fmt "
    view.setUint32(16, 16, true); // format chunk length
    view.setUint16(20, 1, true); // sample format (1 is PCM)
    view.setUint16(22, 1, true); // channel count
    view.setUint32(24, sampleRate, true); // sample rate
    view.setUint32(28, sampleRate * 2, true); // byte rate (sample rate * block align)
    view.setUint16(32, 2, true); // block align (channel count * bytes per sample)
    view.setUint16(34, 16, true); // bits per sample
    // data chunk identifier
    view.setUint32(36, 0x64617461, false); // "data"
    view.setUint32(40, pcmData.length, true);

    // Write PCM data
    for (let i = 0; i < pcmData.length; i++) {
      view.setUint8(44 + i, pcmData.charCodeAt(i));
    }

    const blob = new Blob([buffer], { type: 'audio/wav' });
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error('Error converting PCM to WAV:', error);
    return "";
  }
}

export async function generateAudioExplanation(text: string) {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ 
        parts: [{ 
          text: `You are an expert Zimbabwean teacher. Provide a clear, engaging, and supportive audio explanation of the following educational content. Focus on key concepts and heritage connections. Keep it under 2 minutes: ${text.slice(0, 2000)}` 
        }] 
      }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      return pcmToWav(base64Audio, 24000);
    }
  } catch (error) {
    console.error('TTS Generation Error:', error);
    throw error;
  }
  return null;
}

const SYSTEM_INSTRUCTION = `You are "GREEN BOOK HBC ASSISTANT", an intelligent exam preparation assistant for Zimbabwean students under the Heritage-Based Curriculum (HBC).
Your role is to generate exam-style practice content, flashcards, quizzes, and explanations that help students prepare effectively.

Guidelines:
1. Always follow the format and difficulty level of ZIMSEC/HBC exams.
2. Generate ORIGINAL questions and answers — do not copy official ZIMSEC past papers.
3. Provide clear, step-by-step solutions for each question.
4. Adapt difficulty based on student level (Infant, Junior, Grade 7, O-Level, A-Level). For Infant and Junior levels, use very simple language and focus on basic literacy, numeracy, and social studies. For Grade 7 Mathematics, focus on foundational concepts such as arithmetic, basic geometry, and introductory algebra. For O-Level and A-Level, cover the full breadth of the ZIMSEC syllabi for all listed subjects.
5. Use simple, student-friendly language for explanations.
6. **Heritage-Based Content**: Infuse all content with Zimbabwean context, values, and heritage. Use local names, places, and examples where appropriate (e.g., in word problems, case studies, or history explanations).
7. When generating flashcards, keep them concise: one question, one answer.
8. For essays, provide structured feedback (grammar, clarity, argument strength).
9. For "Syllabus Guide", provide a comprehensive overview of the ZIMSEC syllabus for the chosen subject and level, including key topics, exam structure (Paper 1, Paper 2, etc.), and weightings.
10. For "Textbook Chapter", generate content that follows a standard Zimbabwean textbook structure:
    - **Chapter Title & Objectives**: What the student will learn.
    - **Key Terms**: Important vocabulary for the topic.
    - **Detailed Content**: Clear, step-by-step explanations with relevant Zimbabwean examples.
    - **Worked Examples**: Practical applications of the theory.
    - **Heritage Connections**: How this topic relates to Zimbabwean culture, history, or environment.
    - **Summary**: A quick recap of the main points.
    - **Review Questions**: A mix of short and long-form questions to test understanding.
11. For "Exam Paper", generate a full-length exam paper with the following structure:
    - **Header**: Subject, Level, Grade, Time Allowed, and Total Marks.
    - **Instructions**: Standard exam instructions for students.
    - **Section A: Multiple Choice Questions**: 10-20 questions with 4 options each.
    - **Section B: Short Answer Questions**: Questions requiring concise answers, with marks allocated (e.g., [2 marks], [5 marks]).
    - **Section C: Essay/Long Answer Questions**: In-depth questions or essay prompts, with detailed marks allocation.
    - **Marking Scheme**: Provide a comprehensive marking scheme at the end of the paper.
12. For images: If an image is provided, analyze it carefully. It may contain handwritten notes, an essay, or a diagram. Provide detailed feedback, corrections, or explanations based on the visual content. For diagrams, explain the components and their relationships.
13. **STRUCTURE**: All text-based answers (Practice Papers, Exam Papers, Explanations, Textbook Chapters, Syllabus Guides, Feedback) MUST be extremely well-structured using Markdown:
    - Use clear headings (##, ###) for sections.
    - Use bold text for key terms and concepts.
    - Use bullet points or numbered lists for steps and lists.
    - Use blockquotes for important tips or warnings.
    - Use horizontal rules (---) to separate major sections.
14. Always encourage learning, not just memorization.
15. Tone: Supportive, clear, and motivating. Encourage students to keep practicing and highlight progress.
16. **Heritage Integration**: For subjects like History, Heritage Studies, and Literature, ensure the content reflects the latest Zimbabwean curriculum updates, focusing on national identity, culture, and sustainable development.
`;

export async function generateExamContent(request: GenerationRequest) {
  const { subject, level, grade, contentType, topic, studentInput, image, referenceContent } = request;
  const ai = getAI();
  
  let prompt = `Generate ${contentType} for ${grade} (${level}) ${subject}.`;
  if (contentType === "Syllabus Guide") {
    prompt = `Generate a comprehensive ZIMSEC syllabus guide for ${grade} (${level}) ${subject}. Include key topics, exam structure (Paper 1, Paper 2, etc.), and weightings.`;
  }
  if (contentType === "Textbook Chapter") {
    prompt = `Create a comprehensive Zimbabwean textbook-style chapter for ${grade} (${level}) ${subject}.`;
  }
  if (topic) prompt += ` Focus on the topic: ${topic}.`;
  if (studentInput) prompt += ` Based on this input: ${studentInput}`;
  if (image) prompt += ` Please analyze the provided image of handwritten work, notes, or diagrams. Provide detailed feedback, corrections, or explanations based on the visual content.`;
  if (referenceContent) {
    prompt += `\n\n**REFERENCE TEXTBOOK CONTENT (Use this as the source of truth for accuracy and "textbook grade" quality):**\n${referenceContent}`;
  }

  const parts: any[] = [{ text: prompt }];
  if (image) {
    try {
      const base64Data = image.split(',')[1] || image;
      const mimeType = image.split(';')[0].split(':')[1] || 'image/jpeg';
      parts.push({
        inlineData: {
          data: base64Data,
          mimeType: mimeType
        }
      });
    } catch (err) {
      console.error("Error processing image for Gemini:", err);
    }
  }

  try {
    if (contentType === "Flashcards") {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: { parts },
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                answer: { type: Type.STRING },
              },
              required: ["question", "answer"],
            },
          },
        },
      });
      
      const text = response.text;
      if (!text) throw new Error("Empty response from Gemini for Flashcards");
      return JSON.parse(text);
    }

    if (contentType === "Quiz") {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: { parts },
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                options: { 
                  type: Type.ARRAY, 
                  items: { type: Type.STRING },
                  description: "Exactly 4 options"
                },
                correctAnswer: { 
                  type: Type.INTEGER,
                  description: "Index of the correct option (0-3)"
                },
                explanation: { type: Type.STRING },
              },
              required: ["question", "options", "correctAnswer", "explanation"],
            },
          },
        },
      });
      
      const text = response.text;
      if (!text) throw new Error("Empty response from Gemini for Quiz");
      return JSON.parse(text);
    }

    // For Practice Paper, Exam Paper, Explanations, Feedback - return Markdown
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: { parts },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      },
    });
    
    if (!response.text) throw new Error("Empty response from Gemini");
    return response.text;
  } catch (error) {
    console.error(`Error generating ${contentType}:`, error);
    throw error;
  }
}

export async function suggestTopics(subject: Subject, level: Level, grade: Grade) {
  const ai = getAI();
  const prompt = `List the main topics for ${grade} (${level}) ${subject} according to the Zimbabwean Heritage-Based Curriculum. Provide only a simple list of 10-15 topics, separated by commas.`;
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: { parts: [{ text: prompt }] },
      config: {
        systemInstruction: "You are a curriculum expert. Provide only the comma-separated list of topics.",
      },
    });
    
    if (!response.text) return [];
    return response.text.split(',').map(t => t.trim()).filter(t => t.length > 0);
  } catch (error) {
    console.error("Error suggesting topics:", error);
    return [];
  }
}

export async function generateImage(prompt: string) {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: {
        parts: [
          {
            text: `Generate a clear, educational illustration for a student studying: ${prompt}. The image should be professional, accurate, and helpful for visualizing the concept.`,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
        },
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
  } catch (error) {
    console.error("Error generating image:", error);
  }
  return null;
}

export async function testConnection() {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ parts: [{ text: "ping" }] }],
    });
    return response.text ? true : false;
  } catch (error) {
    console.error("Gemini Connection Test Failed:", error);
    return false;
  }
}
