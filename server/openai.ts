import OpenAI from "openai";
import fs from "fs";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

export async function transcribeAudio(audioFilePath: string): Promise<{ text: string, duration: number }> {
  if (!openai) {
    throw new Error("OpenAI API key not configured");
  }

  const audioReadStream = fs.createReadStream(audioFilePath);

  const transcription = await openai.audio.transcriptions.create({
    file: audioReadStream,
    model: "whisper-1",
  });

  return {
    text: transcription.text,
    duration: 0, // Duration not available in Whisper API response
  };
}

export async function evaluateSpeech(
  transcription: string,
  testType: string
): Promise<{
  overallScore: number;
  pronunciationScore: number;
  fluencyScore: number;
  vocabularyScore: number;
  grammarScore: number;
  feedback: {
    pronunciation: string;
    fluency: string;
    vocabulary: string;
    grammar: string;
    strengths: string[];
    improvements: string[];
  };
}> {
  if (!openai) {
    throw new Error("OpenAI API key not configured");
  }

  const prompt = `You are an expert ${testType} language examiner. Evaluate this spoken response transcription:

"${transcription}"

Provide a detailed evaluation with scores (0-100) for:
1. Pronunciation (based on transcription quality and clarity)
2. Fluency (based on sentence structure and coherence)
3. Vocabulary (range and appropriateness)
4. Grammar (accuracy and complexity)

Also provide:
- Specific feedback for each category
- 3-4 key strengths
- 3-4 areas for improvement

Return JSON in this exact format:
{
  "pronunciationScore": number,
  "fluencyScore": number,
  "vocabularyScore": number,
  "grammarScore": number,
  "feedback": {
    "pronunciation": "string",
    "fluency": "string",
    "vocabulary": "string",
    "grammar": "string",
    "strengths": ["string", "string", "string"],
    "improvements": ["string", "string", "string"]
  }
}`;

  const response = await openai.chat.completions.create({
    model: "gpt-5",
    messages: [
      {
        role: "system",
        content: "You are an expert language assessment AI. Provide detailed, constructive feedback.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    response_format: { type: "json_object" },
  });

  const result = JSON.parse(response.choices[0].message.content || "{}");

  const overallScore = Math.round(
    (result.pronunciationScore +
      result.fluencyScore +
      result.vocabularyScore +
      result.grammarScore) / 4
  );

  return {
    overallScore,
    pronunciationScore: result.pronunciationScore,
    fluencyScore: result.fluencyScore,
    vocabularyScore: result.vocabularyScore,
    grammarScore: result.grammarScore,
    feedback: result.feedback,
  };
}
