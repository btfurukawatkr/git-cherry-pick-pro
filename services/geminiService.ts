
import { GoogleGenAI, Type } from "@google/genai";
import { GitCommit, Repository } from "../types";

/**
 * A local heuristic fallback for when internet is unavailable.
 * Matches commits based on message similarity and metadata.
 */
function localHeuristicAnalysis(source: Repository, target: Repository): Set<string> {
  const duplicateIds = new Set<string>();
  const targetMessages = target.commits.map(c => c.message.toLowerCase());
  
  for (const sCommit of source.commits) {
    const sMsg = sCommit.message.toLowerCase();
    
    // Heuristic 1: Exact or extremely similar message match
    // Often cherry-picks add a "(cherry picked from commit ...)" suffix
    const hasMatch = targetMessages.some(tMsg => {
      const cleanT = tMsg.split('(cherry picked from')[0].trim();
      const cleanS = sMsg.trim();
      return cleanT === cleanS || tMsg.includes(sCommit.hash.substring(0, 7));
    });

    if (hasMatch) {
      duplicateIds.add(sCommit.id);
      continue;
    }

    // Heuristic 2: Match by Author + Files changed (if identical)
    const metadataMatch = target.commits.some(tCommit => 
      tCommit.author === sCommit.author && 
      JSON.stringify(tCommit.filesChanged.sort()) === JSON.stringify(sCommit.filesChanged.sort())
    );

    if (metadataMatch) {
      duplicateIds.add(sCommit.id);
    }
  }
  
  return duplicateIds;
}

export async function analyzeCommitMatching(source: Repository, target: Repository): Promise<GitCommit[]> {
  // If no API key or explicitly offline, use local heuristics immediately
  if (!process.env.API_KEY) {
    console.info("No API key found. Using local heuristic analysis.");
    const dupIds = localHeuristicAnalysis(source, target);
    return source.commits.map(c => dupIds.has(c.id) ? { ...c, status: 'picked' as const } : c);
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `
      Identify which commits in the SOURCE list have effectively already been applied to the TARGET list.
      SOURCE: ${JSON.stringify(source.commits.map(c => ({ id: c.id, hash: c.hash, message: c.message })))}
      TARGET: ${JSON.stringify(target.commits.map(c => ({ message: c.message })))}
      Return JSON with 'duplicateIds' array.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            duplicateIds: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["duplicateIds"]
        }
      }
    });

    const result = JSON.parse(response.text || '{"duplicateIds": []}');
    const dupIds = new Set(result.duplicateIds);

    return source.commits.map(commit => 
      dupIds.has(commit.id) ? { ...commit, status: 'picked' as const } : commit
    );

  } catch (error) {
    console.warn("Gemini API unreachable or failed. Falling back to local heuristics.", error);
    const dupIds = localHeuristicAnalysis(source, target);
    return source.commits.map(c => dupIds.has(c.id) ? { ...c, status: 'picked' as const } : c);
  }
}
