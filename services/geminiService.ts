
import { GoogleGenAI, Type } from "@google/genai";
import { GitCommit, Repository } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Uses Gemini to analyze commit messages and metadata across two repositories 
 * to detect if any source commits have already been cherry-picked into the target.
 */
export async function analyzeCommitMatching(source: Repository, target: Repository): Promise<GitCommit[]> {
  try {
    const prompt = `
      I have two lists of git commits from different repositories.
      The first list is from the SOURCE repository.
      The second list is from the TARGET repository.
      
      Task: Identify which commits in the SOURCE list have effectively already been applied to the TARGET list.
      A commit might be "already picked" if:
      1. Its message explicitly says "(cherry picked from commit [hash])"
      2. Its message is identical or very similar (e.g., same feature name, same bug fix description)
      3. The author and files changed are the same.

      SOURCE COMMITS:
      ${JSON.stringify(source.commits.map(c => ({ id: c.id, hash: c.hash, message: c.message, author: c.author })))}

      TARGET COMMITS:
      ${JSON.stringify(target.commits.map(c => ({ hash: c.hash, message: c.message })))}

      Return a list of IDs from the SOURCE repository that are already present in the TARGET.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            duplicateIds: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "The IDs of commits from the source that are already in the target."
            },
            reasoning: {
              type: Type.STRING,
              description: "Brief explanation of why these were matched."
            }
          },
          required: ["duplicateIds"]
        }
      }
    });

    const result = JSON.parse(response.text || '{"duplicateIds": []}');
    const dupIds = new Set(result.duplicateIds);

    // Update the source commits with the analyzed status
    return source.commits.map(commit => {
      if (dupIds.has(commit.id)) {
        return { ...commit, status: 'picked' as const };
      }
      return commit;
    });

  } catch (error) {
    console.error("Gemini analysis error:", error);
    // On error, return original commits (fail gracefully)
    return source.commits;
  }
}
