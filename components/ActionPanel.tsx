
import React, { useRef, useEffect } from 'react';

interface Props {
  selectedCount: number;
  isExecuting: boolean;
  onExecute: () => void;
  logs: string[];
}

export const ActionPanel: React.FC<Props> = ({ selectedCount, isExecuting, onExecute, logs }) => {
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="space-y-4 sticky top-24">
      <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4">
        <h3 className="text-white font-semibold mb-2">Actions</h3>
        <p className="text-xs text-[#8b949e] mb-4">
          Prepare selected commits to be cherry-picked into the target repository.
        </p>
        
        <div className="flex items-center justify-between p-3 bg-[#0d1117] rounded-md border border-[#30363d] mb-4">
          <span className="text-xs text-[#8b949e]">Selected:</span>
          <span className="text-sm font-bold text-white">{selectedCount} Commits</span>
        </div>

        <button 
          onClick={onExecute}
          disabled={selectedCount === 0 || isExecuting}
          className="w-full bg-[#238636] hover:bg-[#2ea043] disabled:bg-[#238636]/50 text-white font-bold py-2.5 px-4 rounded-md transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-900/10"
        >
          {isExecuting ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Processing...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Execute Cherry-Pick
            </>
          )}
        </button>
      </div>

      <div className="bg-[#161b22] border border-[#30363d] rounded-lg flex flex-col h-64">
        <div className="p-3 border-b border-[#30363d] flex justify-between items-center bg-[#21262d]">
          <span className="text-xs font-bold uppercase tracking-wider text-[#8b949e]">Execution Log</span>
          {isExecuting && (
            <span className="flex h-2 w-2 rounded-full bg-green-500 animate-ping"></span>
          )}
        </div>
        <div className="flex-1 p-3 overflow-y-auto mono text-[10px] space-y-1 scrollbar-thin scrollbar-thumb-[#30363d]">
          {logs.length === 0 ? (
            <div className="text-[#484f58] italic">Waiting for command...</div>
          ) : (
            logs.map((log, i) => (
              <div key={i} className="flex gap-2">
                <span className="text-[#484f58] select-none">[{i+1}]</span>
                <span className={log.startsWith('Succ') ? 'text-green-400' : 'text-[#c9d1d9]'}>
                  {log}
                </span>
              </div>
            ))
          )}
          <div ref={logEndRef} />
        </div>
      </div>
    </div>
  );
};
