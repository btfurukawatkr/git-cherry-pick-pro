
import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { RepoConfig } from './components/RepoConfig';
import { CommitList } from './components/CommitList';
import { ActionPanel } from './components/ActionPanel';
import { GitCommit, Repository, RepoRole } from './types';
import { getMockRepoData } from './services/gitSimulator';
import { analyzeCommitMatching } from './services/geminiService';

const App: React.FC = () => {
  const [sourceRepo, setSourceRepo] = useState<Repository | null>(null);
  const [targetRepo, setTargetRepo] = useState<Repository | null>(null);
  const [selectedCommitIds, setSelectedCommitIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionLogs, setExecutionLogs] = useState<string[]>([]);

  // Initialize with some mock data
  useEffect(() => {
    const data = getMockRepoData();
    setSourceRepo(data.source);
    setTargetRepo(data.target);
  }, []);

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

  const runAnalysis = async () => {
    if (!sourceRepo || !targetRepo) return;
    
    setIsAnalyzing(true);
    try {
      const updatedCommits = await analyzeCommitMatching(sourceRepo, targetRepo);
      setSourceRepo({ ...sourceRepo, commits: updatedCommits });
    } catch (error) {
      console.error("Analysis failed", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleExecute = async () => {
    if (selectedCommitIds.size === 0) return;
    
    setIsExecuting(true);
    setExecutionLogs(["Starting cherry-pick sequence..."]);
    
    const commitsToPick = sourceRepo?.commits.filter(c => selectedCommitIds.has(c.id)) || [];
    
    for (const commit of commitsToPick) {
      setExecutionLogs(prev => [...prev, `Cherry-picking: ${commit.hash.substring(0, 7)} - ${commit.message}`]);
      
      // Simulate network/git delay
      await new Promise(r => setTimeout(r, 1500));
      
      setExecutionLogs(prev => [...prev, `Successfully applied ${commit.hash.substring(0, 7)} to ${targetRepo?.name}`]);
      
      // Update target repo locally (simulated)
      setTargetRepo(prev => {
        if (!prev) return null;
        return {
          ...prev,
          commits: [{ ...commit, status: 'picked', id: `new-${commit.id}` }, ...prev.commits]
        };
      });

      // Update source repo status
      setSourceRepo(prev => {
        if (!prev) return null;
        return {
          ...prev,
          commits: prev.commits.map(c => c.id === commit.id ? { ...c, status: 'picked' } : c)
        };
      });
    }

    setExecutionLogs(prev => [...prev, "All selected commits processed successfully!"]);
    setSelectedCommitIds(new Set());
    setIsExecuting(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0d1117]">
      <Header />
      
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

          <div className="bg-[#161b22] border border-[#30363d] rounded-lg overflow-hidden flex-1 flex flex-col">
            <div className="p-4 border-b border-[#30363d] flex justify-between items-center bg-[#21262d]">
              <h2 className="font-semibold text-white flex items-center gap-2">
                Available Commits
                {sourceRepo && (
                  <span className="text-xs bg-[#30363d] px-2 py-0.5 rounded-full text-[#8b949e]">
                    {sourceRepo.commits.length}
                  </span>
                )}
              </h2>
              <button 
                onClick={runAnalysis}
                disabled={isAnalyzing}
                className="text-xs bg-[#238636] hover:bg-[#2ea043] text-white px-3 py-1.5 rounded-md font-medium disabled:opacity-50 transition-colors flex items-center gap-2"
              >
                {isAnalyzing ? (
                  <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : null}
                AI Match Scan
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              <CommitList 
                commits={sourceRepo?.commits || []}
                selectedIds={selectedCommitIds}
                onToggle={handleToggleCommit}
                onSelectAll={handleSelectAll}
                isAnalyzing={isAnalyzing}
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

      <footer className="p-4 text-center text-[#8b949e] text-xs border-t border-[#30363d]">
        Built for Professional Git Workflows • No actual Git commands were harmed in this simulation.
      </footer>
    </div>
  );
};

export default App;
