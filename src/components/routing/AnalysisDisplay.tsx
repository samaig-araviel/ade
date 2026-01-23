'use client';

import { motion } from 'framer-motion';
import {
  Target,
  Layers,
  Gauge,
  MessageCircle,
  Hash,
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
        return 'bg-emerald-500/10 text-emerald-500';
      case 'standard':
        return 'bg-amber-500/10 text-amber-500';
      case 'demanding':
        return 'bg-red-500/10 text-red-500';
      default:
        return 'bg-gray-500/10 text-gray-500';
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
      <div className="px-4 py-2.5 border-b border-[var(--border-primary)] flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-wider font-medium text-[var(--text-quaternary)]">
          Prompt Analysis
        </span>
        <div className="flex items-center gap-2">
          {analysis.humanContextUsed && (
            <span className="text-[10px] px-2 py-0.5 bg-indigo-500/10 text-indigo-500 rounded-full">
              Human Context
            </span>
          )}
          <span className="text-[10px] px-2 py-0.5 bg-blue-500/10 text-blue-500 rounded-full font-medium">
            {analysis.modality.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-3">
        {/* Analysis Grid - 2x2 */}
        <div className="grid grid-cols-2 gap-2">
          {analysisItems.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className="flex items-center gap-2.5 p-2.5 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-subtle)]"
            >
              <div className="w-7 h-7 rounded-md bg-[var(--bg-tertiary)] flex items-center justify-center flex-shrink-0">
                <item.icon className="w-3.5 h-3.5 text-[var(--text-quaternary)]" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[9px] uppercase tracking-wider text-[var(--text-quaternary)] block">
                  {item.label}
                </span>
                {item.isComplexity ? (
                  <span className={`inline-flex px-1.5 py-0.5 text-[10px] font-medium rounded ${getComplexityStyle(item.value)}`}>
                    {item.value}
                  </span>
                ) : (
                  <span className="text-xs font-medium text-[var(--text-primary)] capitalize truncate block">
                    {item.value}
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Keywords */}
        {analysis.keywords && analysis.keywords.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="mt-3 pt-3 border-t border-[var(--border-subtle)]"
          >
            <div className="flex items-center gap-1.5 mb-2">
              <Hash className="w-3 h-3 text-[var(--text-quaternary)]" />
              <span className="text-[9px] uppercase tracking-wider text-[var(--text-quaternary)]">Keywords</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {analysis.keywords.slice(0, 6).map((keyword) => (
                <span
                  key={keyword}
                  className="px-2 py-0.5 text-[10px] font-mono bg-[var(--bg-tertiary)] text-[var(--text-secondary)] rounded"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
