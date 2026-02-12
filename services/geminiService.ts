
import { GoogleGenAI, Type } from "@google/genai";
import { Concept, QuizQuestion, ConceptRelationship, Flashcard } from "../types.ts";

// Helper to sanitize JSON response from Gemini if extra text or markdown is included in output
const sanitizeJson = (text: string) => {
  if (!text) return "{}";
  const cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
  const startObj = cleaned.indexOf('{');
  const startArr = cleaned.indexOf('[');
  let start = -1;
  if (startObj !== -1 && startArr !== -1) start = Math.min(startObj, startArr);
  else if (startObj !== -1) start = startObj;
  else if (startArr !== -1) start = startArr;

  const endObj = cleaned.lastIndexOf('}');
  const endArr = cleaned.lastIndexOf(']');
  let end = -1;
  if (endObj !== -1 && endArr !== -1) end = Math.max(endObj, endArr);
  else if (endObj !== -1) end = endObj;
  else if (endArr !== -1) end = endArr;

  if (start !== -1 && end !== -1 && end > start) {
    return cleaned.substring(start, end + 1);
  }
  return cleaned;
};

export const processMaterial = async (
  content: string, 
  type: 'pdf' | 'video' | 'notes' | 'audio',
  fileData?: { data: string; mimeType: string }
): Promise<{ concepts: Concept[], relationships: ConceptRelationship[], summary: string }> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Act as a Knowledge Engineer. Analyze this ${type} content and extract its architectural essence.
    1. SUMMARY: A powerful 2-sentence synthesis.
    2. ATOMIC CONCEPTS: Identify 5-7 core concepts with 1-sentence descriptions.
    3. RELATIONSHIPS: Map how concepts connect (prerequisite, related, extension).
    
    Source Material context: ${content.substring(0, 15000)}`;

    const parts: any[] = [{ text: prompt }];
    if (fileData) {
      parts.push({
        inlineData: {
          data: fileData.data,
          mimeType: fileData.mimeType
        }
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            concepts: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  description: { type: Type.STRING }
                },
                required: ["name", "description"]
              }
            },
            relationships: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  source: { type: Type.STRING },
                  target: { type: Type.STRING },
                  type: { type: Type.STRING, enum: ["prerequisite", "related", "extension"] }
                }
              }
            }
          }
        }
      }
    });

    const data = JSON.parse(sanitizeJson(response.text || "{}"));
    const docId = `doc-${Date.now()}`;
    
    const concepts: Concept[] = (data.concepts || []).map((c: any, i: number) => ({
      id: `c-${docId}-${i}`,
      name: c.name,
      description: c.description,
      masteryLevel: 25,
      status: 'learning',
      documentId: docId,
      lastReviewedAt: Date.now(),
      nextReviewAt: Date.now() + 86400000
    }));

    const relationships: ConceptRelationship[] = (data.relationships || []).map((r: any) => ({
      sourceId: concepts.find(c => c.name.toLowerCase() === r.source.toLowerCase())?.id || concepts[0]?.id || 'root',
      targetId: concepts.find(c => c.name.toLowerCase() === r.target.toLowerCase())?.id || concepts[1]?.id || 'leaf',
      type: r.type
    })).filter((r: any) => r.sourceId !== 'root' && r.targetId !== 'leaf');

    return { concepts, relationships, summary: data.summary || "Knowledge extracted successfully." };
  } catch (error: any) {
    console.error("Gemini Extraction Error:", error);
    throw new Error(error.message || "Cognitive link failed. The Genie is having trouble reading that material.");
  }
};

export const generateFlashcards = async (concepts: Concept[]): Promise<Flashcard[]> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Convert these concepts into high-quality active recall flashcards. 
    Focus on creating a question for the 'front' and a concise explanation for the 'back'.
    Concepts: ${concepts.map(c => `${c.name}: ${c.description}`).join(' | ')}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              front: { type: Type.STRING, description: "A probing question or concept name" },
              back: { type: Type.STRING, description: "The definitive explanation or answer" }
            },
            required: ["front", "back"]
          }
        }
      }
    });

    const cards = JSON.parse(sanitizeJson(response.text || "[]"));
    return cards.map((c: any) => ({
      id: `fc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      front: c.front,
      back: c.back,
      interval: 0,
      easeFactor: 2.5,
      nextReviewAt: Date.now(),
      lastReviewedAt: null,
      repetitionCount: 0
    }));
  } catch (error) {
    console.error("Flashcard Generation Error:", error);
    throw new Error("Genie failed to synthesize flashcards.");
  }
};

export const generateQuizQuestions = async (content: string, concepts: Concept[], count: number = 5): Promise<QuizQuestion[]> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate ${count} active recall questions. Context: ${content.substring(0, 8000)}. Topics: ${concepts.map(c => c.name).join(', ')}.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              correctAnswer: { type: Type.STRING },
              explanation: { type: Type.STRING },
              difficulty: { type: Type.STRING, enum: ["easy", "medium", "hard"] }
            },
            required: ["question", "options", "correctAnswer", "explanation", "difficulty"]
          }
        }
      }
    });
    const qs = JSON.parse(sanitizeJson(response.text || "[]"));
    return qs.map((q: any, i: number) => ({ 
      ...q, 
      id: `q-${Date.now()}-${i}`, 
      conceptId: concepts[i % concepts.length]?.id 
    }));
  } catch (error) {
    throw new Error("Failed to synthesize questions.");
  }
};

export const generateBossChallenge = async (concepts: Concept[]): Promise<QuizQuestion[]> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Create a 5-question multi-concept trial for: ${concepts.map(c => c.name).join(", ")}.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              correctAnswer: { type: Type.STRING },
              explanation: { type: Type.STRING }
            },
            required: ["question", "options", "correctAnswer", "explanation"]
          }
        }
      }
    });
    const qs = JSON.parse(sanitizeJson(response.text || "[]"));
    return qs.map((q: any, i: number) => ({ 
      ...q, 
      id: `boss-${Date.now()}-${i}`, 
      difficulty: 'boss', 
      conceptId: concepts[0]?.id 
    }));
  } catch (error) {
    throw new Error("Failed to summon Boss challenge.");
  }
};

export const chatWithTutor = async (message: string, history: { role: string, parts: { text: string }[] }[], context: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const chat = ai.chats.create({
    model: 'gemini-3-pro-preview',
    config: {
      systemInstruction: `You are StudyGenie AI, a world-class educational polymath and tutor. 
      Your purpose is to assist students in mastering their academic materials with the same depth, reasoning, and broad intelligence as the standard Gemini models.
      
      - PRIMARY CONTEXT: If documents are provided in the context below (delimited by --- DOCUMENT ---), treat them as your primary source of ground truth for specific questions.
      - GENERAL KNOWLEDGE: If the user asks general questions, math problems, coding help, or requests historical/scientific information NOT found in the context, use your vast internal knowledge to provide expert-level, pedagogical, and accurate answers.
      - TONE: Be encouraging, intellectual, clear, and professional. 
      - FORMATTING: Use Markdown for beautiful responses, including bold text for emphasis and code blocks for technical answers.
      
      CURRENT KNOWLEDGE VAULT CONTEXT:
      ${context || 'No documents provided. Operating in general intelligence mode.'}`
    },
    history: history
  });
  const response = await chat.sendMessage({ message });
  return response.text;
};
