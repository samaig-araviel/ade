'use client';

import { useCallback, useMemo, useState } from 'react';
import {
  AudioLines,
  Box,
  ChevronLeft,
  ChevronRight,
  Eye,
  Filter,
  Globe,
  Loader2,
  Search,
  X,
  Zap,
} from 'lucide-react';
import { useAde } from '@/lib/dashboard/context';
import { MODELS_PER_PAGE } from '@/lib/dashboard/constants';
import { getProviderColor } from '@/lib/dashboard/helpers';
import type { ModelInfo } from '@/lib/dashboard/types';

const ALL_PROVIDERS = 'all';

function matchesSearch(model: ModelInfo, needle: string): boolean {
  if (!needle) return true;
  const q = needle.toLowerCase();
  return (
    model.name.toLowerCase().includes(q) ||
    model.id.toLowerCase().includes(q) ||
    model.provider.toLowerCase().includes(q)
  );
}

export default function ModelsPage() {
  const { models, modelsLoading, modelsError, refetchModels } = useAde();
  const [selectedProvider, setSelectedProvider] = useState<string>(ALL_PROVIDERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);

  const providers = useMemo(
    () => [ALL_PROVIDERS, ...Array.from(new Set(models.map((m) => m.provider.toLowerCase())))],
    [models]
  );

  const filteredModels = useMemo(() => {
    const trimmed = searchQuery.trim();
    return models.filter((m) => {
      if (selectedProvider !== ALL_PROVIDERS && m.provider.toLowerCase() !== selectedProvider) {
        return false;
      }
      return matchesSearch(m, trimmed);
    });
  }, [models, selectedProvider, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredModels.length / MODELS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const paginatedModels = filteredModels.slice(
    (safePage - 1) * MODELS_PER_PAGE,
    safePage * MODELS_PER_PAGE
  );

  const hasActiveFilter = selectedProvider !== ALL_PROVIDERS || searchQuery.trim().length > 0;

  const selectProvider = useCallback((provider: string) => {
    setSelectedProvider(provider);
    setPage(1);
  }, []);

  const updateSearch = useCallback((value: string) => {
    setSearchQuery(value);
    setPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setSelectedProvider(ALL_PROVIDERS);
    setSearchQuery('');
    setPage(1);
  }, []);

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#111', margin: '0 0 8px', letterSpacing: '-0.02em' }}>
          Models
        </h1>
        <p style={{ fontSize: 14, color: '#6B7280', margin: 0, lineHeight: 1.6 }}>
          Explore the {models.length} models available through ADE. Each model has unique
          strengths, pricing, and capabilities optimized for different use cases.
        </p>
      </div>

      <div style={{ position: 'relative', marginBottom: 16 }}>
        <Search
          style={{
            position: 'absolute',
            left: 14,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 16,
            height: 16,
            color: '#9CA3AF',
            pointerEvents: 'none',
          }}
        />
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => updateSearch(e.target.value)}
          placeholder="Search by model name, ID, or provider..."
          aria-label="Search models"
          style={{
            width: '100%',
            padding: searchQuery ? '11px 42px 11px 42px' : '11px 14px 11px 42px',
            fontSize: 14,
            color: '#111',
            background: '#fff',
            border: '1px solid #E5E5E5',
            borderRadius: 10,
            outline: 'none',
            transition: 'border-color 0.15s, box-shadow 0.15s',
            fontFamily: 'inherit',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = '#111';
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(17, 17, 17, 0.06)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = '#E5E5E5';
            e.currentTarget.style.boxShadow = 'none';
          }}
        />
        {searchQuery && (
          <button
            onClick={() => updateSearch('')}
            aria-label="Clear search"
            style={{
              position: 'absolute',
              right: 10,
              top: '50%',
              transform: 'translateY(-50%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 24,
              height: 24,
              background: '#F3F4F6',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              color: '#6B7280',
            }}
          >
            <X style={{ width: 12, height: 12 }} />
          </button>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <Filter style={{ width: 14, height: 14, color: '#6B7280' }} />
          <span style={{ fontSize: 13, color: '#6B7280' }}>Filter by provider:</span>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {providers.map((provider) => {
              const active = selectedProvider === provider;
              return (
                <button
                  key={provider}
                  onClick={() => selectProvider(provider)}
                  style={{
                    padding: '6px 12px',
                    fontSize: 12,
                    fontWeight: active ? 600 : 400,
                    color: active ? '#fff' : '#374151',
                    background: active ? '#000' : '#F3F4F6',
                    border: 'none',
                    borderRadius: 6,
                    cursor: 'pointer',
                    textTransform: 'capitalize',
                  }}
                >
                  {provider === ALL_PROVIDERS ? 'All Providers' : provider}
                </button>
              );
            })}
          </div>
        </div>
        <div style={{ fontSize: 13, color: '#6B7280' }}>
          Showing {paginatedModels.length} of {filteredModels.length} models
        </div>
      </div>

      {modelsLoading && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 48 }}>
          <Loader2 style={{ width: 20, height: 20, color: '#666', animation: 'spin 1s linear infinite' }} />
          <span style={{ marginLeft: 8, fontSize: 14, color: '#666' }}>Loading models...</span>
        </div>
      )}

      {modelsError && (
        <div style={{ padding: 16, background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, color: '#DC2626' }}>
          {modelsError}
          <button
            onClick={() => void refetchModels()}
            style={{ marginLeft: 8, textDecoration: 'underline', background: 'none', border: 'none', color: '#DC2626', cursor: 'pointer' }}
          >
            Retry
          </button>
        </div>
      )}

      {!modelsLoading && !modelsError && filteredModels.length === 0 && (
        <div style={{ padding: '56px 32px', background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12, textAlign: 'center' }}>
          <div
            style={{
              width: 48,
              height: 48,
              background: '#F3F4F6',
              borderRadius: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            <Search style={{ width: 20, height: 20, color: '#9CA3AF' }} />
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: '#111', margin: '0 0 4px' }}>
            No models match your filters
          </h3>
          <p style={{ fontSize: 13, color: '#6B7280', margin: '0 0 16px' }}>
            Try a different search term or clear the filters to see all models.
          </p>
          {hasActiveFilter && (
            <button
              onClick={clearFilters}
              style={{
                padding: '8px 16px',
                fontSize: 13,
                fontWeight: 500,
                color: '#fff',
                background: '#111',
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer',
              }}
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {!modelsLoading && !modelsError && filteredModels.length > 0 && (
        <>
          <div className="models-grid" style={{ display: 'grid', gap: 16 }}>
            {paginatedModels.map((model) => (
              <div key={model.id} style={{ background: '#fff', border: '1px solid #E5E5E5', borderRadius: 12, padding: 20, transition: 'box-shadow 0.2s', cursor: 'default' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: `${getProviderColor(model.provider)}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: 16, fontWeight: 700, color: getProviderColor(model.provider) }}>
                        {model.provider.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 600, color: '#111' }}>{model.name}</div>
                      <div style={{ fontSize: 12, color: '#6B7280' }}>{model.provider}</div>
                    </div>
                  </div>
                  <code style={{ fontSize: 11, color: '#6B7280', background: '#F3F4F6', padding: '4px 8px', borderRadius: 4 }}>
                    {model.id}
                  </code>
                </div>

                <p style={{ fontSize: 13, color: '#4B5563', margin: '0 0 16px', lineHeight: 1.6 }}>{model.description}</p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
                  <div style={{ padding: '10px 12px', background: '#F9FAFB', borderRadius: 8 }}>
                    <div style={{ fontSize: 10, fontWeight: 500, color: '#6B7280', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.03em' }}>Input</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#111' }}>${model.pricing.inputPer1k.toFixed(4)}</div>
                    <div style={{ fontSize: 10, color: '#9CA3AF' }}>per 1K tokens</div>
                  </div>
                  <div style={{ padding: '10px 12px', background: '#F9FAFB', borderRadius: 8 }}>
                    <div style={{ fontSize: 10, fontWeight: 500, color: '#6B7280', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.03em' }}>Output</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#111' }}>${model.pricing.outputPer1k.toFixed(4)}</div>
                    <div style={{ fontSize: 10, color: '#9CA3AF' }}>per 1K tokens</div>
                  </div>
                  <div style={{ padding: '10px 12px', background: '#F9FAFB', borderRadius: 8 }}>
                    <div style={{ fontSize: 10, fontWeight: 500, color: '#6B7280', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.03em' }}>Latency</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#111' }}>{model.performance.avgLatencyMs}ms</div>
                    <div style={{ fontSize: 10, color: '#9CA3AF' }}>average</div>
                  </div>
                  <div style={{ padding: '10px 12px', background: '#F9FAFB', borderRadius: 8 }}>
                    <div style={{ fontSize: 10, fontWeight: 500, color: '#6B7280', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.03em' }}>Uptime</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#111' }}>{model.performance.reliabilityPercent}%</div>
                    <div style={{ fontSize: 10, color: '#9CA3AF' }}>reliability</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16, padding: '10px 12px', background: '#F9FAFB', borderRadius: 8 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 10, fontWeight: 500, color: '#6B7280', marginBottom: 2, textTransform: 'uppercase' }}>Context Window</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>
                      {(model.capabilities.maxInputTokens / 1000).toFixed(0)}K input /{' '}
                      {(model.capabilities.maxOutputTokens / 1000).toFixed(0)}K output
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {model.capabilities.supportsVision && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', fontSize: 11, fontWeight: 500, background: '#DBEAFE', color: '#1D4ED8', borderRadius: 6 }}>
                      <Eye style={{ width: 12, height: 12 }} /> Vision
                    </span>
                  )}
                  {model.capabilities.supportsAudio && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', fontSize: 11, fontWeight: 500, background: '#FEE2E2', color: '#DC2626', borderRadius: 6 }}>
                      <AudioLines style={{ width: 12, height: 12 }} /> Audio
                    </span>
                  )}
                  {model.capabilities.supportsStreaming && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', fontSize: 11, fontWeight: 500, background: '#D1FAE5', color: '#059669', borderRadius: 6 }}>
                      <Zap style={{ width: 12, height: 12 }} /> Streaming
                    </span>
                  )}
                  {model.capabilities.supportsFunctionCalling && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', fontSize: 11, fontWeight: 500, background: '#FEF3C7', color: '#D97706', borderRadius: 6 }}>
                      <Box style={{ width: 12, height: 12 }} /> Functions
                    </span>
                  )}
                  {model.capabilities.supportsWebSearch && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', fontSize: 11, fontWeight: 500, background: '#ECFDF5', color: '#059669', borderRadius: 6 }}>
                      <Globe style={{ width: 12, height: 12 }} /> Web Search
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 24 }}>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage === 1}
                style={{
                  display: 'flex', alignItems: 'center', gap: 4, padding: '8px 12px', fontSize: 13,
                  color: safePage === 1 ? '#9CA3AF' : '#374151', background: '#fff',
                  border: '1px solid #E5E5E5', borderRadius: 6, cursor: safePage === 1 ? 'not-allowed' : 'pointer',
                }}
              >
                <ChevronLeft style={{ width: 14, height: 14 }} /> Previous
              </button>
              <div style={{ display: 'flex', gap: 4 }}>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    style={{
                      width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 13, fontWeight: safePage === pageNum ? 600 : 400,
                      color: safePage === pageNum ? '#fff' : '#374151',
                      background: safePage === pageNum ? '#000' : '#fff',
                      border: '1px solid #E5E5E5', borderRadius: 6, cursor: 'pointer',
                    }}
                  >
                    {pageNum}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
                style={{
                  display: 'flex', alignItems: 'center', gap: 4, padding: '8px 12px', fontSize: 13,
                  color: safePage === totalPages ? '#9CA3AF' : '#374151', background: '#fff',
                  border: '1px solid #E5E5E5', borderRadius: 6, cursor: safePage === totalPages ? 'not-allowed' : 'pointer',
                }}
              >
                Next <ChevronRight style={{ width: 14, height: 14 }} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
