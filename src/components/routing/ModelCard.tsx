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
  ChevronDown,
  Check,
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
        return 'bg-amber-500/10 text-amber-500';
      case 'openai':
        return 'bg-emerald-500/10 text-emerald-500';
      case 'google':
        return 'bg-blue-500/10 text-blue-500';
      default:
        return 'bg-gray-500/10 text-gray-500';
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
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`
        bg-[var(--bg-secondary)] rounded-xl border overflow-hidden
        ${rank === 'primary'
          ? 'border-indigo-500/30 ring-1 ring-indigo-500/10'
          : 'border-[var(--border-primary)]'}
      `}
    >
      {/* Header */}
      <button
        className="w-full px-4 py-3 text-left hover:bg-[var(--bg-tertiary)]/30 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {/* Score Circle */}
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
              rank === 'primary'
                ? 'bg-gradient-to-br from-indigo-500/20 to-purple-500/20'
                : 'bg-[var(--bg-tertiary)]'
            }`}>
              <span className={`text-lg font-bold ${rank === 'primary' ? 'text-indigo-500' : getScoreColor(model.score)}`}>
                {Math.round(model.score * 100)}
              </span>
            </div>

            {/* Model Info */}
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <h4 className="font-medium text-sm text-[var(--text-primary)] truncate">
                  {model.name}
                </h4>
                {rank === 'primary' && (
                  <span className="flex-shrink-0 w-4 h-4 rounded-full bg-emerald-500/10 flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 text-emerald-500" />
                  </span>
                )}
              </div>
              <span className={`inline-flex text-[10px] px-1.5 py-0.5 rounded font-medium ${getProviderStyle(model.provider)}`}>
                {model.provider}
              </span>
            </div>
          </div>

          {/* Expand Arrow */}
          <motion.div
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.15 }}
            className="text-[var(--text-quaternary)]"
          >
            <ChevronDown className="w-4 h-4" />
          </motion.div>
        </div>

        {/* Summary - Always visible */}
        <p className="mt-2 text-xs text-[var(--text-tertiary)] line-clamp-2 leading-relaxed">
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
        transition={{ duration: 0.15 }}
        className="overflow-hidden"
      >
        <div className="px-4 pb-4">
          <div className="border-t border-[var(--border-subtle)] pt-3">
            <h5 className="text-[9px] uppercase tracking-wider font-medium text-[var(--text-quaternary)] mb-2.5">
              Scoring Factors
            </h5>
            <div className="space-y-2.5">
              {model.reasoning.factors.map((factor, i) => {
                const Icon = getFactorIcon(factor.name);
                return (
                  <div key={factor.name}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <Icon className="w-3 h-3 text-[var(--text-quaternary)]" />
                        <span className="text-[11px] text-[var(--text-secondary)]">{factor.name}</span>
                        <span className="text-[9px] text-[var(--text-quaternary)]">
                          ({Math.round(factor.weight * 100)}%)
                        </span>
                      </div>
                      <span className={`text-[11px] font-medium ${getScoreColor(factor.score)}`}>
                        {Math.round(factor.score * 100)}
                      </span>
                    </div>
                    {/* Score Bar */}
                    <div className="h-1 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${getScoreBarColor(factor.score)}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${factor.score * 100}%` }}
                        transition={{ duration: 0.4, delay: i * 0.03 }}
                      />
                    </div>
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
