
import { Repository, GitCommit } from '../types';

export const getMockRepoData = () => {
  const sourceCommits: GitCommit[] = [
    {
      id: 'c1',
      hash: 'a3d9f2b1e8402938475c02938475c02938475c01',
      author: 'Jane Doe',
      date: new Date(Date.now() - 3600000 * 2).toISOString(),
      message: 'feat: add advanced search filtering to the dashboard',
      filesChanged: ['src/components/Search.tsx', 'src/hooks/useSearch.ts'],
      status: 'ready',
      sourceRepo: 'SourceApp'
    },
    {
      id: 'c2',
      hash: 'b5c8e1a0d7391827364b91827364b91827364b02',
      author: 'John Smith',
      date: new Date(Date.now() - 3600000 * 5).toISOString(),
      message: 'fix: resolve race condition in authentication flow',
      filesChanged: ['src/services/auth.ts'],
      status: 'picked',
      sourceRepo: 'SourceApp'
    },
    {
      id: 'c3',
      hash: 'f9e0d1c2b3a45678901234567890123456789003',
      author: 'Jane Doe',
      date: new Date(Date.now() - 86400000).toISOString(),
      message: 'docs: update deployment instructions for AWS',
      filesChanged: ['README.md', 'DEPLOY.md'],
      status: 'ready',
      sourceRepo: 'SourceApp'
    },
    {
      id: 'c4',
      hash: 'd8c7b6a501234567890123456789012345678904',
      author: 'Alice Wong',
      date: new Date(Date.now() - 86400000 * 2).toISOString(),
      message: 'refactor: cleanup redundant styles in common components',
      filesChanged: ['src/styles/base.css', 'src/components/Button.tsx'],
      status: 'ready',
      sourceRepo: 'SourceApp'
    },
    {
      id: 'c5',
      hash: 'e7f6g5h4i3j2k1l098765432109876543210905',
      author: 'Bob Vance',
      date: new Date(Date.now() - 86400000 * 3).toISOString(),
      message: 'chore: bump dependencies for security patches',
      filesChanged: ['package.json', 'package-lock.json'],
      status: 'ready',
      sourceRepo: 'SourceApp'
    },
    {
      id: 'c6',
      hash: '0123456789abcdef0123456789abcdef01234567',
      author: 'John Smith',
      date: new Date(Date.now() - 86400000 * 4).toISOString(),
      message: 'feat: implement real-time notifications via websockets',
      filesChanged: ['src/services/socket.ts', 'src/App.tsx'],
      status: 'ready',
      sourceRepo: 'SourceApp'
    }
  ];

  const targetCommits: GitCommit[] = [
    {
      id: 't1',
      hash: 'z1x2c3v4b5n6m7l8k9j0p9o8i7u6y5t4r3e2w1q0',
      author: 'John Smith',
      date: new Date(Date.now() - 3600000).toISOString(),
      message: 'fix: resolve race condition in authentication flow (cherry picked from commit b5c8e1a)',
      filesChanged: ['src/services/auth.ts'],
      status: 'picked',
      sourceRepo: 'TargetApp'
    }
  ];

  return {
    source: {
      id: 'repo-src',
      name: 'core-platform-services',
      url: 'git@github.com:org/core-services.git',
      branch: 'main',
      commits: sourceCommits
    },
    target: {
      id: 'repo-tgt',
      name: 'customer-facing-app',
      url: 'git@github.com:org/client-app.git',
      branch: 'release/v2.1',
      commits: targetCommits
    }
  };
};
