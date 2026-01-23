'use client';

import { motion } from 'framer-motion';
import { Badge } from '../ui/Badge';
import { Card, CardContent } from '../ui/Card';
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

  const getProviderBadge = (provider: string) => {
    switch (provider.toLowerCase()) {
      case 'anthropic':
        return 'anthropic';
      case 'openai':
        return 'openai';
      case 'google':
        return 'google';
      default:
        return 'default';
    }
  };

  const getProviderIcon = (provider: string) => {
    switch (provider.toLowerCase()) {
      case 'anthropic':
        return '🧠';
      case 'openai':
        return '⚡';
      case 'google':
        return '🔮';
      default:
        return '🤖';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-accent-success';
    if (score >= 0.6) return 'text-accent-warning';
    return 'text-accent-error';
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card
        variant={rank === 'primary' ? 'elevated' : 'bordered'}
        glow={rank === 'primary'}
        className={rank === 'primary' ? 'border-2 border-accent-secondary/30' : ''}
      >
        <CardContent className="p-0">
          {/* Header */}
          <div
            className="p-4 cursor-pointer"
            onClick={() => setExpanded(!expanded)}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{getProviderIcon(model.provider)}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-text-primary">{model.name}</h4>
                    {rank === 'primary' && (
                      <Badge variant="success" size="sm">Recommended</Badge>
                    )}
                  </div>
                  <Badge variant={getProviderBadge(model.provider) as 'anthropic' | 'openai' | 'google' | 'default'} size="sm">
                    {model.provider}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Score Circle */}
                <div className="relative">
                  <svg className="w-14 h-14 -rotate-90">
                    <circle
                      cx="28"
                      cy="28"
                      r="24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="4"
                      className="text-bg-accent"
                    />
                    <motion.circle
                      cx="28"
                      cy="28"
                      r="24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="4"
                      strokeLinecap="round"
                      className={getScoreColor(model.score)}
                      initial={{ strokeDasharray: '0 150.8' }}
                      animate={{ strokeDasharray: `${model.score * 150.8} 150.8` }}
                      transition={{ duration: 1, delay: index * 0.1 }}
                    />
                  </svg>
                  <span className={`absolute inset-0 flex items-center justify-center text-sm font-bold ${getScoreColor(model.score)}`}>
                    {Math.round(model.score * 100)}
                  </span>
                </div>

                <motion.button
                  className="p-1 text-text-tertiary hover:text-text-primary transition-colors"
                  animate={{ rotate: expanded ? 180 : 0 }}
                >
                  <ChevronDown className="w-5 h-5" />
                </motion.button>
              </div>
            </div>

            {/* Summary */}
            <p className="mt-3 text-sm text-text-secondary">
              {model.reasoning.summary}
            </p>
          </div>

          {/* Expanded Details */}
          <motion.div
            initial={false}
            animate={{ height: expanded ? 'auto' : 0, opacity: expanded ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-0">
              <div className="border-t border-border-primary pt-4">
                <h5 className="text-sm font-medium text-text-secondary mb-3">Scoring Breakdown</h5>
                <div className="space-y-3">
                  {model.reasoning.factors.map((factor, i) => {
                    const Icon = getFactorIcon(factor.name);
                    return (
                      <motion.div
                        key={factor.name}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="group"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4 text-text-quaternary" />
                            <span className="text-sm text-text-secondary">{factor.name}</span>
                            <span className="text-xs text-text-quaternary">
                              ({Math.round(factor.weight * 100)}% weight)
                            </span>
                          </div>
                          <span className={`text-sm font-medium ${getScoreColor(factor.score)}`}>
                            {Math.round(factor.score * 100)}
                          </span>
                        </div>
                        {/* Score Bar */}
                        <div className="h-1.5 bg-bg-accent rounded-full overflow-hidden">
                          <motion.div
                            className={`h-full rounded-full ${
                              factor.score >= 0.8 ? 'bg-accent-success' :
                              factor.score >= 0.6 ? 'bg-accent-warning' :
                              'bg-accent-error'
                            }`}
                            initial={{ width: 0 }}
                            animate={{ width: `${factor.score * 100}%` }}
                            transition={{ duration: 0.8, delay: i * 0.1 }}
                          />
                        </div>
                        <p className="text-xs text-text-quaternary mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {factor.detail}
                        </p>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
