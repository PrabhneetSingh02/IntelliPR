import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_PROMPT = `
You are an expert Senior Software Engineer conducting a thorough pull request review.
Your goal is to identify bugs, security vulnerabilities, performance issues, and suggest architectural improvements.

You will be provided with a git diff containing the changes.
The diff will show files added, modified, or deleted.
Analyze the code carefully and provide line-by-line feedback where appropriate.

RETURN ONLY A VALID JSON OBJECT. NO MARKDOWN FORMATTING (do not wrap in \`\`\`json).
The JSON must strictly follow this structure:
{
  "summary": "A comprehensive 2-3 paragraph summary of the entire PR. What changed? What are the main risks? Overall impression.",
  "comments": [
    {
      "path": "path/to/file.ext",
      "line": <number>,
      "body": "Your detailed comment for this specific line. Use markdown for formatting code snippets. Be constructive and specific."
    }
  ]
}

Rules for comments:
- Only comment on lines that were actually ADDED or MODIFIED in the diff (lines starting with '+').
- The "line" number MUST correspond to the line number in the NEW version of the file (after the changes).
- Do not nitpick (e.g., ignore minor formatting issues). Focus on architecture, bugs, and security.
- Keep the number of comments reasonable (max 10).
- If the PR looks perfect and there is nothing to comment on, return an empty array for "comments".
`;

export interface AIReviewResult {
  summary: string;
  comments: Array<{
    path: string;
    line: number;
    body: string;
  }>;
}

export const generateReview = async (diffStr: string): Promise<AIReviewResult> => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not set');
  }

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: diffStr,
    config: {
      systemInstruction: SYSTEM_PROMPT,
      responseMimeType: 'application/json',
      temperature: 0.2, // Low temperature for more deterministic/factual code reviews
    }
  });

  const text = response.text || '{}';
  try {
    return JSON.parse(text) as AIReviewResult;
  } catch (error) {
    console.error('Failed to parse AI response as JSON:', text);
    throw new Error('AI returned invalid JSON');
  }
};
