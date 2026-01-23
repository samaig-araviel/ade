'use client';

import { motion } from 'framer-motion';
import { Badge } from '../ui/Badge';
import { Card, CardContent, CardHeader } from '../ui/Card';
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
  const getComplexityColor = (complexity: string) => {
    switch (complexity.toLowerCase()) {
      case 'quick':
        return 'success';
      case 'standard':
        return 'warning';
      case 'demanding':
        return 'error';
      default:
        return 'default';
    }
  };

  const getToneEmoji = (tone: string) => {
    switch (tone.toLowerCase()) {
      case 'casual':
        return '😊';
      case 'focused':
        return '🎯';
      case 'curious':
        return '🤔';
      case 'frustrated':
        return '😤';
      case 'urgent':
        return '⚡';
      case 'playful':
        return '😄';
      case 'professional':
        return '💼';
      default:
        return '💬';
    }
  };

  const analysisItems = [
    {
      icon: Target,
      label: 'Intent',
      value: analysis.intent,
      description: 'What you want to accomplish'
    },
    {
      icon: Layers,
      label: 'Domain',
      value: analysis.domain,
      description: 'Subject area detected'
    },
    {
      icon: Gauge,
      label: 'Complexity',
      value: analysis.complexity,
      badge: getComplexityColor(analysis.complexity),
      description: 'Task difficulty level'
    },
    {
      icon: MessageCircle,
      label: 'Tone',
      value: analysis.tone,
      emoji: getToneEmoji(analysis.tone),
      description: 'Communication style detected'
    },
  ];

  return (
    <Card variant="bordered">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-accent-secondary" />
          <h3 className="font-semibold text-text-primary">Prompt Analysis</h3>
          {analysis.humanContextUsed && (
            <Badge variant="info" size="sm">Human Context Applied</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {analysisItems.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-3 rounded-lg bg-bg-tertiary border border-border-subtle"
            >
              <div className="flex items-center gap-2 mb-1">
                <item.icon className="w-4 h-4 text-text-quaternary" />
                <span className="text-xs text-text-quaternary uppercase tracking-wider">
                  {item.label}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {item.emoji && <span>{item.emoji}</span>}
                {item.badge ? (
                  <Badge variant={item.badge as 'success' | 'warning' | 'error' | 'default'} size="md">
                    {item.value}
                  </Badge>
                ) : (
                  <span className="font-medium text-text-primary capitalize">
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
            transition={{ delay: 0.4 }}
            className="mt-4 pt-4 border-t border-border-subtle"
          >
            <div className="flex items-center gap-2 mb-2">
              <Hash className="w-4 h-4 text-text-quaternary" />
              <span className="text-xs text-text-quaternary uppercase tracking-wider">
                Keywords Extracted
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {analysis.keywords.slice(0, 8).map((keyword, i) => (
                <motion.span
                  key={keyword}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + i * 0.05 }}
                  className="px-2 py-1 text-xs font-mono bg-bg-accent text-text-secondary rounded"
                >
                  {keyword}
                </motion.span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Modality */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-4 pt-4 border-t border-border-subtle"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-secondary">Input Modality</span>
            <Badge variant="info" size="md">
              {analysis.modality.replace('+', ' + ').toUpperCase()}
            </Badge>
          </div>
        </motion.div>
      </CardContent>
    </Card>
  );
}
