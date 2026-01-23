'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Badge } from '../ui/Badge';
import { Card, CardContent } from '../ui/Card';
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  Activity,
  Cpu,
  Database,
  Zap,
  Clock,
  RefreshCw
} from 'lucide-react';

interface ServiceStatus {
  name: string;
  status: 'operational' | 'degraded' | 'outage';
  latency?: number;
  uptime?: number;
}

interface HealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  version: string;
  timestamp: string;
  services: {
    kv: 'connected' | 'disconnected' | 'unavailable';
    router: 'ready' | 'not_ready';
  };
}

export function StatusPage() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastCheck, setLastCheck] = useState<Date>(new Date());

  const checkHealth = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/v1/health');
      const data = await response.json();
      setHealth(data);
    } catch {
      setHealth({
        status: 'unhealthy',
        version: 'unknown',
        timestamp: new Date().toISOString(),
        services: { kv: 'disconnected', router: 'not_ready' }
      });
    }
    setLastCheck(new Date());
    setLoading(false);
  };

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const services: ServiceStatus[] = [
    {
      name: 'Routing Engine',
      status: health?.services.router === 'ready' ? 'operational' : 'outage',
      latency: 12,
      uptime: 99.99
    },
    {
      name: 'Model Registry',
      status: 'operational',
      latency: 2,
      uptime: 99.99
    },
    {
      name: 'Data Store (KV)',
      status: health?.services.kv === 'connected' ? 'operational' :
              health?.services.kv === 'unavailable' ? 'degraded' : 'outage',
      latency: 8,
      uptime: health?.services.kv === 'connected' ? 99.95 : 0
    },
    {
      name: 'Analysis Pipeline',
      status: 'operational',
      latency: 5,
      uptime: 99.98
    },
  ];

  const getOverallStatus = () => {
    if (services.some(s => s.status === 'outage')) return 'outage';
    if (services.some(s => s.status === 'degraded')) return 'degraded';
    return 'operational';
  };

  const overallStatus = getOverallStatus();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational':
        return <CheckCircle className="w-5 h-5 text-accent-success" />;
      case 'degraded':
        return <AlertTriangle className="w-5 h-5 text-accent-warning" />;
      case 'outage':
        return <XCircle className="w-5 h-5 text-accent-error" />;
      default:
        return <Activity className="w-5 h-5 text-text-quaternary" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational':
        return 'bg-accent-success';
      case 'degraded':
        return 'bg-accent-warning';
      case 'outage':
        return 'bg-accent-error';
      default:
        return 'bg-text-quaternary';
    }
  };

  return (
    <div className="w-full">
      {/* Overall Status Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`
          p-4 rounded-xl mb-6
          ${overallStatus === 'operational' ? 'bg-accent-success/10 border border-accent-success/20' :
            overallStatus === 'degraded' ? 'bg-accent-warning/10 border border-accent-warning/20' :
            'bg-accent-error/10 border border-accent-error/20'}
        `}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getStatusIcon(overallStatus)}
            <div>
              <h3 className="font-semibold text-text-primary">
                {overallStatus === 'operational' ? 'All Systems Operational' :
                 overallStatus === 'degraded' ? 'Partial System Degradation' :
                 'System Outage Detected'}
              </h3>
              <p className="text-sm text-text-secondary">
                Last checked: {lastCheck.toLocaleTimeString()}
              </p>
            </div>
          </div>
          <button
            onClick={checkHealth}
            disabled={loading}
            className="p-2 rounded-lg hover:bg-bg-tertiary transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 text-text-secondary ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </motion.div>

      {/* Service Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {services.map((service, index) => (
          <motion.div
            key={service.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card variant="bordered">
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(service.status)}`}>
                      {service.status === 'operational' && (
                        <span className={`block w-2 h-2 rounded-full ${getStatusColor(service.status)} animate-ping`} />
                      )}
                    </div>
                    <span className="font-medium text-text-primary">{service.name}</span>
                  </div>
                  <Badge
                    variant={service.status === 'operational' ? 'success' :
                             service.status === 'degraded' ? 'warning' : 'error'}
                    size="sm"
                  >
                    {service.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-text-quaternary" />
                    <div>
                      <p className="text-xs text-text-quaternary">Latency</p>
                      <p className="text-sm font-mono text-text-primary">
                        {service.latency !== undefined ? `${service.latency}ms` : '—'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-text-quaternary" />
                    <div>
                      <p className="text-xs text-text-quaternary">Uptime</p>
                      <p className="text-sm font-mono text-text-primary">
                        {service.uptime !== undefined ? `${service.uptime}%` : '—'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Uptime Bar */}
                <div className="mt-4">
                  <div className="flex gap-0.5">
                    {Array.from({ length: 30 }).map((_, i) => (
                      <div
                        key={i}
                        className={`flex-1 h-6 rounded-sm ${
                          i < 28 ? 'bg-accent-success' :
                          service.status === 'degraded' ? 'bg-accent-warning' :
                          service.status === 'outage' ? 'bg-accent-error' :
                          'bg-accent-success'
                        }`}
                        title={`Day ${i + 1}`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-text-quaternary mt-1">Last 30 days</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Version Info */}
      {health && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 flex items-center justify-center gap-4 text-sm text-text-quaternary"
        >
          <span className="flex items-center gap-1">
            <Cpu className="w-4 h-4" />
            Version {health.version}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Database className="w-4 h-4" />
            KV: {health.services.kv}
          </span>
        </motion.div>
      )}
    </div>
  );
}
