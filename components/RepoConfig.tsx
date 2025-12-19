
import React from 'react';
import { Repository, RepoRole } from '../types';

interface Props {
  role: RepoRole;
  repo: Repository | null;
  onUpdate: (repo: Repository) => void;
}

export const RepoConfig: React.FC<Props> = ({ role, repo, onUpdate }) => {
  const isSource = role === RepoRole.SOURCE;
  
  return (
    <div className={`p-4 rounded-lg border bg-[#161b22] ${isSource ? 'border-blue-500/30' : 'border-purple-500/30'}`}>
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-2 h-2 rounded-full ${isSource ? 'bg-blue-500' : 'bg-purple-500'}`}></div>
        <span className="text-xs font-bold uppercase tracking-wider text-[#8b949e]">
          {isSource ? 'Source Repository' : 'Target Repository'}
        </span>
      </div>
      
      {repo ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-semibold truncate">{repo.name}</h3>
            <span className="mono text-[10px] bg-[#30363d] px-2 py-0.5 rounded text-[#8b949e]">
              {repo.branch}
            </span>
          </div>
          <div className="text-xs text-[#8b949e] truncate flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 015.656 0l4-4a4 4 0 00-5.656-5.656l-1.101 1.101" />
            </svg>
            {repo.url}
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center py-4 border border-dashed border-[#30363d] rounded text-xs text-[#8b949e]">
          No repository selected
        </div>
      )}
    </div>
  );
};
