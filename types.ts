
export interface GitCommit {
  id: string;
  hash: string;
  author: string;
  date: string;
  message: string;
  filesChanged: string[];
  status?: 'ready' | 'picked' | 'pending' | 'conflict';
  sourceRepo: string;
}

export interface Repository {
  id: string;
  name: string;
  url: string;
  branch: string;
  commits: GitCommit[];
}

export interface CherryPickAction {
  sourceCommitId: string;
  targetRepoId: string;
  status: 'queued' | 'executing' | 'completed' | 'failed';
  log: string;
}

export enum RepoRole {
  SOURCE = 'SOURCE',
  TARGET = 'TARGET'
}
