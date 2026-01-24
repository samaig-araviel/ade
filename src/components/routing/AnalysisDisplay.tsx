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
        return 'bg-emerald-100 text-emerald-700';
      case 'standard':
        return 'bg-amber-100 text-amber-700';
      case 'demanding':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const analysisItems = [
    { icon: Target, label: 'Intent', value: analysis.intent },
    { icon: Layers, label: 'Domain', value: analysis.domain },
    { icon: Gauge, label: 'Complexity', value: analysis.complexity, isComplexity: true },
    { icon: MessageCircle, label: 'Tone', value: analysis.tone },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <span className="text-[15px] font-semibold text-gray-900">
          Prompt Analysis
        </span>
        <div className="flex items-center gap-2">
          {analysis.humanContextUsed && (
            <span className="text-[11px] px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full font-medium">
              Human Context
            </span>
          )}
          <span className="text-[11px] px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-medium uppercase">
            {analysis.modality}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Analysis Grid - 2x2 */}
        <div className="grid grid-cols-2 gap-3">
          {analysisItems.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100"
            >
              <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center flex-shrink-0">
                <item.icon className="w-4 h-4 text-gray-500" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] uppercase tracking-wider text-gray-400 block">
                  {item.label}
                </span>
                {item.isComplexity ? (
                  <span className={`inline-flex px-2 py-0.5 text-[11px] font-medium rounded ${getComplexityStyle(item.value)}`}>
                    {item.value}
                  </span>
                ) : (
                  <span className="text-[13px] font-medium text-gray-900 capitalize truncate block">
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
            className="mt-4 pt-4 border-t border-gray-100"
          >
            <div className="flex items-center gap-1.5 mb-2">
              <Hash className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-[10px] uppercase tracking-wider text-gray-400">Keywords</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {analysis.keywords.slice(0, 6).map((keyword) => (
                <span
                  key={keyword}
                  className="px-2 py-1 text-[11px] font-mono bg-gray-100 text-gray-600 rounded"
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
