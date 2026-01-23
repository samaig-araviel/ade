'use client';

import { motion, AnimatePresence } from 'framer-motion';
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

interface RoutingStepsProps {
  currentStep: RoutingStep;
  timing?: {
    analysisMs?: number;
    scoringMs?: number;
    selectionMs?: number;
    totalMs?: number;
  };
}

const steps = [
  { id: 'analyzing', label: 'Analyzing', description: 'Understanding your prompt', icon: Search },
  { id: 'filtering', label: 'Filtering', description: 'Applying constraints', icon: Filter },
  { id: 'scoring', label: 'Scoring', description: 'Evaluating all models', icon: BarChart3 },
  { id: 'selecting', label: 'Selecting', description: 'Choosing the best match', icon: CheckCircle2 },
  { id: 'reasoning', label: 'Reasoning', description: 'Generating explanation', icon: MessageSquare },
];

export function RoutingSteps({ currentStep, timing }: RoutingStepsProps) {
  const getStepStatus = (stepId: string) => {
    const stepOrder = ['idle', 'analyzing', 'filtering', 'scoring', 'selecting', 'reasoning', 'complete'];
    const currentIndex = stepOrder.indexOf(currentStep);
    const stepIndex = stepOrder.indexOf(stepId);

    if (currentStep === 'idle') return 'pending';
    if (currentStep === 'complete') return 'complete';
    if (stepIndex < currentIndex) return 'complete';
    if (stepIndex === currentIndex) return 'active';
    return 'pending';
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-lg font-semibold text-text-primary">Routing Pipeline</h3>
        {timing?.totalMs && currentStep === 'complete' && (
          <motion.span
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-sm font-mono text-accent-success"
          >
            {timing.totalMs}ms
          </motion.span>
        )}
      </div>

      <div className="relative">
        {/* Connection Line */}
        <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-border-primary" />

        {/* Progress Line */}
        <motion.div
          className="absolute left-6 top-8 w-0.5 bg-accent-secondary"
          initial={{ height: 0 }}
          animate={{
            height: currentStep === 'complete' ? 'calc(100% - 64px)' :
                   currentStep === 'idle' ? 0 :
                   `${(steps.findIndex(s => s.id === currentStep) / (steps.length - 1)) * 100}%`
          }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />

        <div className="space-y-6">
          {steps.map((step, index) => {
            const status = getStepStatus(step.id);
            const Icon = step.icon;

            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative flex items-center gap-4"
              >
                {/* Step Icon */}
                <motion.div
                  className={`
                    relative z-10 flex items-center justify-center w-12 h-12 rounded-full
                    transition-all duration-300
                    ${status === 'complete'
                      ? 'bg-accent-success text-white'
                      : status === 'active'
                      ? 'bg-accent-secondary text-white'
                      : 'bg-bg-tertiary text-text-quaternary border border-border-primary'
                    }
                  `}
                  animate={status === 'active' ? { scale: [1, 1.05, 1] } : {}}
                  transition={{ duration: 1, repeat: status === 'active' ? Infinity : 0 }}
                >
                  <AnimatePresence mode="wait">
                    {status === 'complete' ? (
                      <motion.div
                        key="check"
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0, rotate: 180 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                      >
                        <Check className="w-5 h-5" />
                      </motion.div>
                    ) : status === 'active' ? (
                      <motion.div
                        key="loading"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      >
                        <Loader2 className="w-5 h-5" />
                      </motion.div>
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Step Content */}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`
                      font-medium transition-colors duration-300
                      ${status === 'complete'
                        ? 'text-text-primary'
                        : status === 'active'
                        ? 'text-accent-secondary'
                        : 'text-text-tertiary'
                      }
                    `}>
                      {step.label}
                    </span>
                    {status === 'active' && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-xs text-accent-secondary"
                      >
                        Processing...
                      </motion.span>
                    )}
                  </div>
                  <p className="text-sm text-text-quaternary">{step.description}</p>
                </div>

                {/* Timing Badge */}
                {status === 'complete' && timing && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-xs font-mono text-text-quaternary bg-bg-tertiary px-2 py-1 rounded"
                  >
                    {step.id === 'analyzing' && timing.analysisMs ? `${timing.analysisMs}ms` : ''}
                    {step.id === 'scoring' && timing.scoringMs ? `${timing.scoringMs}ms` : ''}
                    {step.id === 'selecting' && timing.selectionMs ? `${timing.selectionMs}ms` : ''}
                  </motion.span>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
