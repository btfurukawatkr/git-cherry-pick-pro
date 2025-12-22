
import React from 'react';
import { GitCommit } from '../types';

interface Props {
  commit: GitCommit | null;
  onClose: () => void;
}

export const DiffViewer: React.FC<Props> = ({ commit, onClose }) => {
  if (!commit) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
      <div className="bg-[#161b22] border border-[#30363d] rounded-xl w-full max-w-4xl max-h-[80vh] flex flex-col shadow-2xl">
        <div className="p-4 border-b border-[#30363d] flex justify-between items-center bg-[#21262d] rounded-t-xl">
          <div className="flex items-center gap-3">
            <code className="bg-[#0d1117] text-blue-400 px-2 py-1 rounded text-sm mono">
              {commit.hash.substring(0, 7)}
            </code>
            <h3 className="text-white font-semibold truncate max-w-md">{commit.message}</h3>
          </div>
          <button onClick={onClose} className="text-[#8b949e] hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <div className="grid grid-cols-3 gap-4 text-xs text-[#8b949e]">
            <div className="bg-[#0d1117] p-3 rounded-lg border border-[#30363d]">
              <span className="block font-bold mb-1">Author</span>
              <span className="text-white">{commit.author}</span>
            </div>
            <div className="bg-[#0d1117] p-3 rounded-lg border border-[#30363d]">
              <span className="block font-bold mb-1">Date</span>
              <span className="text-white">{new Date(commit.date).toLocaleString()}</span>
            </div>
            <div className="bg-[#0d1117] p-3 rounded-lg border border-[#30363d]">
              <span className="block font-bold mb-1">Files Impacted</span>
              <span className="text-white">{commit.filesChanged.length} Files</span>
            </div>
          </div>

          <div className="space-y-4">
            {commit.filesChanged.map(file => (
              <div key={file} className="border border-[#30363d] rounded-lg overflow-hidden">
                <div className="bg-[#21262d] px-3 py-1.5 border-b border-[#30363d] text-xs mono text-[#c9d1d9]">
                  {file}
                </div>
                <div className="bg-[#0d1117] p-4 mono text-[11px] leading-relaxed">
                  <div className="text-[#8b949e]">@@ -14,12 +14,14 @@</div>
                  <div className="flex">
                    <span className="w-8 text-right pr-4 text-[#484f58] select-none">14</span>
                    <span className="text-[#c9d1d9]">  const handleAction = async () =&gt; &#123;</span>
                  </div>
                  <div className="flex bg-green-500/10">
                    <span className="w-8 text-right pr-4 text-[#3fb950] select-none">+</span>
                    <span className="text-[#3fb950]">    console.log("Initializing cherry-pick operation...");</span>
                  </div>
                  <div className="flex bg-green-500/10">
                    <span className="w-8 text-right pr-4 text-[#3fb950] select-none">+</span>
                    <span className="text-[#3fb950]">    const result = await gitService.apply(commitId);</span>
                  </div>
                  <div className="flex bg-red-500/10">
                    <span className="w-8 text-right pr-4 text-[#f85149] select-none">-</span>
                    <span className="text-[#f85149]">    // old logic removed</span>
                  </div>
                  <div className="flex">
                    <span className="w-8 text-right pr-4 text-[#484f58] select-none">17</span>
                    <span className="text-[#c9d1d9]">  &#125;;</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
