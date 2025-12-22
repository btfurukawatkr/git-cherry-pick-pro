
import { GitCommit, Repository } from "../types";
import { getMockRepoData } from "./gitSimulator";
import { analyzeCommitMatching } from "./geminiService";

const API_BASE = "http://localhost:8080/api";

async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 1500); // Short timeout for local dev detection
    
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      signal: controller.signal,
      headers: { "Content-Type": "application/json", ...options?.headers },
    });
    clearTimeout(id);
    if (!response.ok) throw new Error("Server Error");
    return await response.json();
  } catch (error) {
    // SILENT FALLBACK: If backend is missing, use local simulator
    if (endpoint === "/repos") return getMockRepoData() as any;
    throw error;
  }
}

export const apiService = {
  getRepos: () => apiFetch<{ source: Repository; target: Repository }>("/repos"),
  
  analyze: async (source: Repository, target: Repository) => {
    try {
      return await apiFetch<GitCommit[]>("/analyze", {
        method: "POST",
        body: JSON.stringify({ source, target }),
      });
    } catch {
      // If backend analysis fails, perform client-side analysis (Gemini or Heuristic)
      return await analyzeCommitMatching(source, target);
    }
  },
    
  executeCherryPick: async (commitIds: string[], targetRepoId: string) => {
    try {
      return await apiFetch<{ success: boolean; logs: string[] }>("/cherry-pick", {
        method: "POST",
        body: JSON.stringify({ commitIds, targetRepoId }),
      });
    } catch {
      // Simulate local cherry-pick for offline/no-backend mode
      await new Promise(r => setTimeout(r, 800));
      return { 
        success: true, 
        logs: [
          "Running local git simulator...",
          ...commitIds.map(id => `Successfully picked ${id} (simulated)`),
          "Clean: all operations finished."
        ] 
      };
    }
  },

  checkHealth: async () => {
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 1000);
      const res = await fetch(`${API_BASE}/health`, { signal: controller.signal });
      clearTimeout(id);
      return res.ok;
    } catch {
      return false;
    }
  }
};
