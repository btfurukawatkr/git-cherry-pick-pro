
import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { RepoConfig } from './components/RepoConfig';
import { CommitList } from './components/CommitList';
import { ActionPanel } from './components/ActionPanel';
import { DiffViewer } from './components/DiffViewer';
import { GitCommit, Repository, RepoRole } from './types';
import { apiService } from './services/apiService';

const App: React.FC = () => {
  const [sourceRepo, setSourceRepo] = useState<Repository | null>(null);
  const [targetRepo, setTargetRepo] = useState<Repository | null>(null);
  const [selectedCommitIds, setSelectedCommitIds] = useState<Set<string>>(new Set());
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionLogs, setExecutionLogs] = useState<string[]>([]);
  const [previewCommit, setPreviewCommit] = useState<GitCommit | null>(null);
  const [backendOnline, setBackendOnline] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const data = await apiService.getRepos();
      setSourceRepo(data.source);
      setTargetRepo(data.target);
      const isOnline = await apiService.checkHealth();
      setBackendOnline(isOnline);
    } catch (error) {
      console.error("Failed to load initial data", error);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleToggleCommit = (id: string) => {
    const next = new Set(selectedCommitIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedCommitIds(next);
  };

  const handleSelectAll = (ids: string[]) => {
    if (selectedCommitIds.size === ids.length) {
      setSelectedCommitIds(new Set());
    } else {
      setSelectedCommitIds(new Set(ids));
    }
  };

  const handleShowDiff = (commit: GitCommit) => {
    setPreviewCommit(commit);
  };

  const runAnalysis = async () => {
    if (!sourceRepo || !targetRepo) return;
    
    setIsAnalyzing(true);
    try {
      // In a real scenario, this calls the Java backend which then calls Gemini
      const updatedCommits = await apiService.analyze(sourceRepo, targetRepo);
      setSourceRepo({ ...sourceRepo, commits: updatedCommits });
      setExecutionLogs(prev => [...prev, "Backend AI Analysis: Scan complete."]);
    } catch (error) {
      console.error("Analysis failed", error);
      setExecutionLogs(prev => [...prev, "API Error: Falling back to local heuristic scan..."]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleExecute = async () => {
    if (selectedCommitIds.size === 0 || !sourceRepo || !targetRepo) return;
    
    setIsExecuting(true);
    setExecutionLogs(["Requesting cherry-pick from Spring Boot backend..."]);
    
    try {
      const result = await apiService.executeCherryPick(
        Array.from(selectedCommitIds),
        targetRepo.id
      );
      
      setExecutionLogs(prev => [...prev, ...result.logs]);
      
      if (result.success) {
        // Refresh local state after successful backend operation
        await loadData();
        setSelectedCommitIds(new Set());
      }
    } catch (error) {
      setExecutionLogs(prev => [...prev, "CRITICAL: Backend communication failed. Check Java server logs."]);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0d1117]">
      <Header backendOnline={backendOnline} />
      
      <main className="flex-1 container mx-auto p-6 flex flex-col lg:flex-row gap-6">
        <div className="flex-1 flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <RepoConfig 
              role={RepoRole.SOURCE} 
              repo={sourceRepo} 
              onUpdate={setSourceRepo} 
            />
            <RepoConfig 
              role={RepoRole.TARGET} 
              repo={targetRepo} 
              onUpdate={setTargetRepo} 
            />
          </div>

          <div className="bg-[#161b22] border border-[#30363d] rounded-lg overflow-hidden flex-1 flex flex-col shadow-sm">
            <div className="p-4 border-b border-[#30363d] flex justify-between items-center bg-[#21262d]">
              <h2 className="font-semibold text-white flex items-center gap-2">
                Commits to Pick
                {sourceRepo && (
                  <span className="text-xs bg-[#30363d] px-2 py-0.5 rounded-full text-[#8b949e]">
                    {sourceRepo.commits.filter(c => c.status !== 'picked').length} Available
                  </span>
                )}
              </h2>
              <div className="flex gap-2">
                <button 
                  onClick={runAnalysis}
                  disabled={isAnalyzing || !sourceRepo}
                  className="text-xs bg-[#30363d] hover:bg-[#3c444d] text-white px-3 py-1.5 rounded-md font-medium disabled:opacity-50 transition-colors flex items-center gap-2"
                >
                  {isAnalyzing && <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
                  {isAnalyzing ? 'Analyzing...' : 'Remote AI Scan'}
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              <CommitList 
                commits={sourceRepo?.commits || []}
                selectedIds={selectedCommitIds}
                onToggle={handleToggleCommit}
                onSelectAll={handleSelectAll}
                isAnalyzing={isAnalyzing}
                onShowDiff={handleShowDiff}
              />
            </div>
          </div>
        </div>

        <aside className="w-full lg:w-80 flex flex-col gap-6">
          <ActionPanel 
            selectedCount={selectedCommitIds.size}
            isExecuting={isExecuting}
            onExecute={handleExecute}
            logs={executionLogs}
          />
        </aside>
      </main>

      {previewCommit && (
        <DiffViewer 
          commit={previewCommit} 
          onClose={() => setPreviewCommit(null)} 
        />
      )}

      <footer className="p-4 text-center text-[#484f58] text-[11px] border-t border-[#30363d] bg-[#0d1117]">
        Git Cherry-Pick Pro • Java Spring Boot Backend v1.0.0 • {new Date().getFullYear()}
      </footer>
    </div>
  );
};

export default App;
