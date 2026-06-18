'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { HealthResponse, JsonModalState, ModelInfo } from './types';

interface AdeContextValue {
  health: HealthResponse | null;
  healthLoading: boolean;
  refetchHealth: () => Promise<void>;

  models: ModelInfo[];
  modelsLoading: boolean;
  modelsError: string | null;
  refetchModels: () => Promise<void>;

  jsonModal: JsonModalState | null;
  openJsonModal: (modal: JsonModalState) => void;
  closeJsonModal: () => void;
  fetchEndpointJson: (endpoint: string, title: string) => Promise<void>;

  statusOpen: boolean;
  openStatus: () => void;
  closeStatus: () => void;
}

const AdeContext = createContext<AdeContextValue | null>(null);

export function AdeProvider({ children }: { children: ReactNode }) {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [healthLoading, setHealthLoading] = useState(false);

  const [models, setModels] = useState<ModelInfo[]>([]);
  const [modelsLoading, setModelsLoading] = useState(false);
  const [modelsError, setModelsError] = useState<string | null>(null);

  const [jsonModal, setJsonModal] = useState<JsonModalState | null>(null);
  const [statusOpen, setStatusOpen] = useState(false);

  const refetchHealth = useCallback(async () => {
    setHealthLoading(true);
    try {
      const res = await fetch('/api/v1/health');
      if (res.ok) {
        setHealth(await res.json());
      }
    } catch {
      // Silently fail — header just stays in its previous state.
    } finally {
      setHealthLoading(false);
    }
  }, []);

  const refetchModels = useCallback(async () => {
    setModelsLoading(true);
    setModelsError(null);
    try {
      const res = await fetch('/api/v1/models');
      if (!res.ok) throw new Error('Failed to fetch models');
      const data = await res.json();
      setModels(data.models || []);
    } catch (err) {
      setModelsError(err instanceof Error ? err.message : 'Failed to load models');
    } finally {
      setModelsLoading(false);
    }
  }, []);

  const openJsonModal = useCallback((modal: JsonModalState) => setJsonModal(modal), []);
  const closeJsonModal = useCallback(() => setJsonModal(null), []);

  const fetchEndpointJson = useCallback(
    async (endpoint: string, title: string) => {
      try {
        const res = await fetch(endpoint);
        const data = await res.json();
        setJsonModal({ title, data });
      } catch {
        setJsonModal({ title, data: { error: 'Failed to fetch data' } });
      }
    },
    []
  );

  const openStatus = useCallback(() => {
    setStatusOpen(true);
    void refetchHealth();
  }, [refetchHealth]);

  const closeStatus = useCallback(() => setStatusOpen(false), []);

  useEffect(() => {
    void refetchHealth();
    void refetchModels();
  }, [refetchHealth, refetchModels]);

  const value = useMemo<AdeContextValue>(
    () => ({
      health,
      healthLoading,
      refetchHealth,
      models,
      modelsLoading,
      modelsError,
      refetchModels,
      jsonModal,
      openJsonModal,
      closeJsonModal,
      fetchEndpointJson,
      statusOpen,
      openStatus,
      closeStatus,
    }),
    [
      health,
      healthLoading,
      refetchHealth,
      models,
      modelsLoading,
      modelsError,
      refetchModels,
      jsonModal,
      openJsonModal,
      closeJsonModal,
      fetchEndpointJson,
      statusOpen,
      openStatus,
      closeStatus,
    ]
  );

  return <AdeContext.Provider value={value}>{children}</AdeContext.Provider>;
}

export function useAde(): AdeContextValue {
  const ctx = useContext(AdeContext);
  if (!ctx) {
    throw new Error('useAde must be used within an AdeProvider');
  }
  return ctx;
}
