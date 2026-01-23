'use client';

import { motion } from 'framer-motion';
import {
  Search,
  Filter,
  BarChart3,
  CheckCircle2,
  MessageSquare,
  Loader2,
  Check
} from 'lucide-react';

export type RoutingStep =
  | 'idle'
  | 'analyzing'
  | 'filtering'
  | 'scoring'
  | 'selecting'
  | 'reasoning'
  | 'complete';

interface Timing {
  totalMs: number;
  analysisMs: number;
  scoringMs: number;
  selectionMs: number;
}

interface RoutingStepsProps {
  currentStep: RoutingStep;
  timing?: Timing;
}

const steps = [
  { id: 'analyzing', label: 'Analyze', icon: Search },
  { id: 'filtering', label: 'Filter', icon: Filter },
  { id: 'scoring', label: 'Score', icon: BarChart3 },
  { id: 'selecting', label: 'Select', icon: CheckCircle2 },
  { id: 'reasoning', label: 'Explain', icon: MessageSquare },
];

export function RoutingSteps({ currentStep, timing }: RoutingStepsProps) {
  const getStepStatus = (stepId: string) => {
    const stepOrder = ['analyzing', 'filtering', 'scoring', 'selecting', 'reasoning'];
    const currentIndex = stepOrder.indexOf(currentStep);
    const stepIndex = stepOrder.indexOf(stepId);

    if (currentStep === 'idle') return 'pending';
    if (currentStep === 'complete') return 'completed';
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'active';
    return 'pending';
  };

  if (currentStep === 'idle') {
    return null;
  }

  return (
    <div className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-primary)] p-4">
      <div className="flex items-center justify-between gap-2">
        {steps.map((step, index) => {
          const status = getStepStatus(step.id);
          const Icon = step.icon;
          const nextStepId = steps[index + 1]?.id;
          const nextStatus = nextStepId ? getStepStatus(nextStepId) : 'pending';

          return (
            <div key={step.id} className="flex items-center flex-1 last:flex-none">
              {/* Step */}
              <div className="flex flex-col items-center">
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300
                    ${status === 'completed' ? 'bg-emerald-500 text-white' : ''}
                    ${status === 'active' ? 'bg-indigo-500 text-white' : ''}
                    ${status === 'pending' ? 'bg-[var(--bg-tertiary)] text-[var(--text-quaternary)] border border-[var(--border-primary)]' : ''}
                  `}
                >
                  {status === 'completed' ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    >
                      <Check className="w-5 h-5" />
                    </motion.div>
                  ) : status === 'active' ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                      <Loader2 className="w-5 h-5" />
                    </motion.div>
                  ) : (
                    <Icon className="w-4 h-4" />
                  )}
                </div>
                <span
                  className={`
                    mt-2 text-xs font-medium whitespace-nowrap
                    ${status === 'completed' ? 'text-emerald-500' : ''}
                    ${status === 'active' ? 'text-indigo-500' : ''}
                    ${status === 'pending' ? 'text-[var(--text-quaternary)]' : ''}
                  `}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector */}
              {index < steps.length - 1 && (
                <div className="flex-1 mx-2 h-0.5 bg-[var(--bg-tertiary)] overflow-hidden rounded-full">
                  <motion.div
                    className="h-full bg-emerald-500"
                    initial={{ width: '0%' }}
                    animate={{
                      width: nextStatus !== 'pending' ? '100%' : '0%'
                    }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Timing display */}
      {currentStep === 'complete' && timing && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-4 pt-4 border-t border-[var(--border-primary)]"
        >
          <div className="flex justify-center gap-6 text-xs text-[var(--text-tertiary)]">
            <span>Analysis: {timing.analysisMs}ms</span>
            <span>Scoring: {timing.scoringMs}ms</span>
            <span>Selection: {timing.selectionMs}ms</span>
          </div>
        </motion.div>
      )}
    </div>
  );
}
