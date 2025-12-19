
import React from 'react';
import { GitCommit } from '../types';

interface Props {
  commits: GitCommit[];
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
  onSelectAll: (ids: string[]) => void;
  isAnalyzing: boolean;
}

export const CommitList: React.FC<Props> = ({ commits, selectedIds, onToggle, onSelectAll, isAnalyzing }) => {
  const allIds = commits.filter(c => c.status !== 'picked').map(c => c.id);
  const isAllSelected = allIds.length > 0 && selectedIds.size === allIds.length;

  return (
    <table className="w-full text-left border-collapse">
      <thead className="sticky top-0 bg-[#21262d] text-[#8b949e] text-xs uppercase z-10">
        <tr>
          <th className="px-4 py-3 w-10">
            <input 
              type="checkbox" 
              className="rounded border-[#30363d] bg-[#0d1117] checked:bg-[#238636]"
              checked={isAllSelected}
              onChange={() => onSelectAll(allIds)}
            />
          </th>
          <th className="px-4 py-3 font-semibold">Status</th>
          <th className="px-4 py-3 font-semibold">Commit</th>
          <th className="px-4 py-3 font-semibold">Message</th>
          <th className="px-4 py-3 font-semibold">Author</th>
          <th className="px-4 py-3 font-semibold">Date</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-[#30363d]">
        {commits.map((commit) => {
          const isPicked = commit.status === 'picked';
          const isSelected = selectedIds.has(commit.id);
          
          return (
            <tr 
              key={commit.id} 
              className={`hover:bg-[#1c2128] group transition-colors ${isSelected ? 'bg-[#1c2128]' : ''} ${isPicked ? 'opacity-60 grayscale' : ''}`}
            >
              <td className="px-4 py-3">
                {!isPicked && (
                  <input 
                    type="checkbox" 
                    className="rounded border-[#30363d] bg-[#0d1117] checked:bg-[#238636]" 
                    checked={isSelected}
                    onChange={() => onToggle(commit.id)}
                  />
                )}
              </td>
              <td className="px-4 py-3">
                {isPicked ? (
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 border border-green-500/20">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                    PICKED
                  </span>
                ) : commit.status === 'conflict' ? (
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/10 text-red-500 border border-red-500/20">
                    CONFLICT
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#30363d] text-[#8b949e]">
                    READY
                  </span>
                )}
              </td>
              <td className="px-4 py-3">
                <code className="mono text-xs text-blue-400 group-hover:underline cursor-pointer">
                  {commit.hash.substring(0, 7)}
                </code>
              </td>
              <td className="px-4 py-3 max-w-xs xl:max-w-md">
                <div className="text-sm font-medium text-[#c9d1d9] truncate" title={commit.message}>
                  {commit.message}
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <img 
                    src={`https://ui-avatars.com/api/?name=${commit.author}&background=random&size=20`} 
                    alt={commit.author} 
                    className="w-5 h-5 rounded-full"
                  />
                  <span className="text-xs text-[#8b949e]">{commit.author}</span>
                </div>
              </td>
              <td className="px-4 py-3">
                <span className="text-xs text-[#8b949e] whitespace-nowrap">
                  {new Date(commit.date).toLocaleDateString()}
                </span>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};
