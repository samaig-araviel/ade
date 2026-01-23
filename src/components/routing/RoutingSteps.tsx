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
    <div className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-primary)] p-3">
      <div className="flex items-center justify-between gap-1">
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
                    w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200
                    ${status === 'completed' ? 'bg-emerald-500/10 text-emerald-500' : ''}
                    ${status === 'active' ? 'bg-indigo-500 text-white' : ''}
                    ${status === 'pending' ? 'bg-[var(--bg-tertiary)] text-[var(--text-quaternary)]' : ''}
                  `}
                >
                  {status === 'completed' ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                    >
                      <Check className="w-4 h-4" />
                    </motion.div>
                  ) : status === 'active' ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                      <Loader2 className="w-4 h-4" />
                    </motion.div>
                  ) : (
                    <Icon className="w-3.5 h-3.5" />
                  )}
                </div>
                <span
                  className={`
                    mt-1.5 text-[10px] font-medium whitespace-nowrap
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
                <div className="flex-1 mx-1.5 h-0.5 bg-[var(--bg-tertiary)] overflow-hidden rounded-full">
                  <motion.div
                    className="h-full bg-emerald-500"
                    initial={{ width: '0%' }}
                    animate={{
                      width: nextStatus !== 'pending' ? '100%' : '0%'
                    }}
                    transition={{ duration: 0.2 }}
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
          className="mt-3 pt-2.5 border-t border-[var(--border-subtle)]"
        >
          <div className="flex justify-center gap-4 text-[10px] text-[var(--text-quaternary)]">
            <span>Analysis: <span className="text-[var(--text-secondary)]">{timing.analysisMs}ms</span></span>
            <span>Scoring: <span className="text-[var(--text-secondary)]">{timing.scoringMs}ms</span></span>
            <span>Selection: <span className="text-[var(--text-secondary)]">{timing.selectionMs}ms</span></span>
          </div>
        </motion.div>
      )}
    </div>
  );
}
