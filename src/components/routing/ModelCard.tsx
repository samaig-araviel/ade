'use client';

import { motion } from 'framer-motion';
import {
  Zap,
  DollarSign,
  Clock,
  Brain,
  Eye,
  Mic,
  Star,
  ChevronDown
} from 'lucide-react';
import { useState } from 'react';

interface ModelRecommendation {
  id: string;
  name: string;
  provider: string;
  score: number;
  reasoning: {
    summary: string;
    factors: Array<{
      name: string;
      score: number;
      weight: number;
      weightedScore: number;
      detail: string;
    }>;
  };
}

interface ModelCardProps {
  model: ModelRecommendation;
  rank: 'primary' | 'backup';
  index?: number;
}

export function ModelCard({ model, rank, index = 0 }: ModelCardProps) {
  const [expanded, setExpanded] = useState(rank === 'primary');

  const getProviderStyle = (provider: string) => {
    switch (provider.toLowerCase()) {
      case 'anthropic':
        return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'openai':
        return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'google':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-emerald-500';
    if (score >= 0.6) return 'text-amber-500';
    return 'text-red-500';
  };

  const getScoreBarColor = (score: number) => {
    if (score >= 0.8) return 'bg-emerald-500';
    if (score >= 0.6) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const getFactorIcon = (factorName: string) => {
    const name = factorName.toLowerCase();
    if (name.includes('task') || name.includes('fitness')) return Brain;
    if (name.includes('cost')) return DollarSign;
    if (name.includes('speed') || name.includes('latency')) return Zap;
    if (name.includes('vision') || name.includes('image')) return Eye;
    if (name.includes('audio') || name.includes('voice')) return Mic;
    if (name.includes('time') || name.includes('conversation')) return Clock;
    return Star;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`
        bg-[var(--bg-secondary)] rounded-xl border overflow-hidden
        ${rank === 'primary'
          ? 'border-indigo-500/30 shadow-lg shadow-indigo-500/5'
          : 'border-[var(--border-primary)]'}
      `}
    >
      {/* Header */}
      <button
        className="w-full p-4 text-left"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-[var(--text-primary)] truncate">{model.name}</h4>
              {rank === 'primary' && (
                <span className="flex-shrink-0 text-xs px-2 py-0.5 bg-emerald-500/10 text-emerald-500 rounded-full border border-emerald-500/20">
                  Best Match
                </span>
              )}
            </div>
            <span className={`inline-flex text-xs px-2 py-0.5 rounded border ${getProviderStyle(model.provider)}`}>
              {model.provider}
            </span>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Score */}
            <div className="text-right">
              <div className={`text-2xl font-bold ${getScoreColor(model.score)}`}>
                {Math.round(model.score * 100)}
              </div>
              <div className="text-xs text-[var(--text-quaternary)]">score</div>
            </div>

            <motion.div
              animate={{ rotate: expanded ? 180 : 0 }}
              className="text-[var(--text-quaternary)]"
            >
              <ChevronDown className="w-5 h-5" />
            </motion.div>
          </div>
        </div>

        {/* Summary */}
        <p className="mt-3 text-sm text-[var(--text-secondary)] line-clamp-2">
          {model.reasoning.summary}
        </p>
      </button>

      {/* Expanded Details */}
      <motion.div
        initial={false}
        animate={{
          height: expanded ? 'auto' : 0,
          opacity: expanded ? 1 : 0
        }}
        transition={{ duration: 0.2 }}
        className="overflow-hidden"
      >
        <div className="px-4 pb-4 pt-0">
          <div className="border-t border-[var(--border-primary)] pt-4">
            <h5 className="text-xs font-medium text-[var(--text-quaternary)] mb-3">
              SCORING BREAKDOWN
            </h5>
            <div className="space-y-3">
              {model.reasoning.factors.map((factor, i) => {
                const Icon = getFactorIcon(factor.name);
                return (
                  <div key={factor.name} className="group">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <Icon className="w-3.5 h-3.5 text-[var(--text-quaternary)]" />
                        <span className="text-sm text-[var(--text-secondary)]">{factor.name}</span>
                        <span className="text-xs text-[var(--text-quaternary)]">
                          {Math.round(factor.weight * 100)}%
                        </span>
                      </div>
                      <span className={`text-sm font-medium ${getScoreColor(factor.score)}`}>
                        {Math.round(factor.score * 100)}
                      </span>
                    </div>
                    {/* Score Bar */}
                    <div className="h-1.5 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${getScoreBarColor(factor.score)}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${factor.score * 100}%` }}
                        transition={{ duration: 0.5, delay: i * 0.05 }}
                      />
                    </div>
                    {factor.detail && (
                      <p className="mt-1 text-xs text-[var(--text-quaternary)] opacity-0 group-hover:opacity-100 transition-opacity">
                        {factor.detail}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
