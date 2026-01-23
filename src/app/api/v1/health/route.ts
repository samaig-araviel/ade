import { NextResponse } from 'next/server';
import { HealthResponse } from '@/types';
import { isKVAvailable } from '@/lib/kv';

// Version from package.json or default
const VERSION = process.env.npm_package_version ?? '1.0.0';

export async function GET() {
  // Check KV connectivity
  let kvStatus: HealthResponse['services']['kv'];
  let isHealthy: boolean;

  try {
    const isConnected = await isKVAvailable();
    kvStatus = isConnected ? 'connected' : 'disconnected';
    isHealthy = isConnected;
  } catch {
    kvStatus = 'unknown';
    isHealthy = true; // Assume healthy if KV is just unavailable
  }

  const response: HealthResponse = {
    status: isHealthy ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    version: VERSION,
    services: {
      kv: kvStatus,
    },
  };

  return NextResponse.json(response);
}
