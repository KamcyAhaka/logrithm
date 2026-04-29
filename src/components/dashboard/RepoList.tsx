'use client'

import React from 'react';
import { ExternalLink, Star, GitFork } from 'lucide-react';

interface Repo {
  name: string;
  url: string;
  stargazerCount: number;
  forkCount: number;
  primaryLanguage: { name: string; color: string } | null;
  commitCount: number;
}

interface RepoListProps {
  repos: Repo[];
}

export const RepoList = ({ repos }: RepoListProps) => {
  return (
    <div className="glass p-6 rounded-2xl border border-white/5 bg-white/[0.02]">
      <h3 className="text-lg font-bold font-mono mb-4">Top Repositories</h3>
      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
        {repos.map((repo, i) => (
          <div key={i} className="group p-4 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all">
            <div className="flex justify-between items-start">
              <div>
                <a 
                  href={repo.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm font-bold flex items-center space-x-1 hover:text-primary transition-colors"
                >
                  <span>{repo.name}</span>
                  <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
                <div className="flex items-center space-x-3 mt-1.5 text-xs text-white/40">
                  {repo.primaryLanguage && (
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: repo.primaryLanguage.color }} />
                      <span>{repo.primaryLanguage.name}</span>
                    </div>
                  )}
                  <span>{repo.commitCount} commits</span>
                </div>
              </div>
              <div className="flex items-center space-x-3 text-xs text-white/40">
                <div className="flex items-center space-x-1">
                  <Star size={12} />
                  <span>{repo.stargazerCount}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <GitFork size={12} />
                  <span>{repo.forkCount}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
