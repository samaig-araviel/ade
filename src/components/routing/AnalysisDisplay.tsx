'use client';

import { motion } from 'framer-motion';
import {
  Target,
  Layers,
  Gauge,
  MessageCircle,
  Hash,
  Sparkles
} from 'lucide-react';

interface QueryAnalysis {
  intent: string;
  domain: string;
  complexity: string;
  tone: string;
  modality: string;
  keywords: string[];
  humanContextUsed: boolean;
}

interface AnalysisDisplayProps {
  analysis: QueryAnalysis;
}

export function AnalysisDisplay({ analysis }: AnalysisDisplayProps) {
  const getComplexityStyle = (complexity: string) => {
    switch (complexity.toLowerCase()) {
      case 'quick':
        return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'standard':
        return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'demanding':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  const analysisItems = [
    { icon: Target, label: 'Intent', value: analysis.intent },
    { icon: Layers, label: 'Domain', value: analysis.domain },
    { icon: Gauge, label: 'Complexity', value: analysis.complexity, isComplexity: true },
    { icon: MessageCircle, label: 'Tone', value: analysis.tone },
  ];

  return (
    <div className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-primary)] overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[var(--border-primary)] flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-indigo-500" />
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">Prompt Analysis</h3>
        {analysis.humanContextUsed && (
          <span className="ml-auto text-xs px-2 py-0.5 bg-indigo-500/10 text-indigo-500 rounded-full border border-indigo-500/20">
            Human Context
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Analysis Grid */}
        <div className="grid grid-cols-2 gap-3">
          {analysisItems.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-3 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-primary)]"
            >
              <div className="flex items-center gap-1.5 mb-1.5">
                <item.icon className="w-3.5 h-3.5 text-[var(--text-quaternary)]" />
                <span className="text-xs text-[var(--text-quaternary)]">
                  {item.label}
                </span>
              </div>
              {item.isComplexity ? (
                <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded border ${getComplexityStyle(item.value)}`}>
                  {item.value}
                </span>
              ) : (
                <span className="text-sm font-medium text-[var(--text-primary)] capitalize">
                  {item.value}
                </span>
              )}
            </motion.div>
          ))}
        </div>

        {/* Keywords */}
        {analysis.keywords && analysis.keywords.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-4 pt-4 border-t border-[var(--border-primary)]"
          >
            <div className="flex items-center gap-1.5 mb-2">
              <Hash className="w-3.5 h-3.5 text-[var(--text-quaternary)]" />
              <span className="text-xs text-[var(--text-quaternary)]">Keywords</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {analysis.keywords.slice(0, 6).map((keyword) => (
                <span
                  key={keyword}
                  className="px-2 py-1 text-xs font-mono bg-[var(--bg-tertiary)] text-[var(--text-secondary)] rounded border border-[var(--border-primary)]"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Modality */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-4 pt-4 border-t border-[var(--border-primary)] flex items-center justify-between"
        >
          <span className="text-xs text-[var(--text-quaternary)]">Input Modality</span>
          <span className="text-xs px-2 py-1 bg-blue-500/10 text-blue-500 rounded border border-blue-500/20 font-medium">
            {analysis.modality.toUpperCase()}
          </span>
        </motion.div>
      </div>
    </div>
  );
}
