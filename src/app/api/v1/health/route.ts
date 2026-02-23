import { NextResponse } from 'next/server';

// Version from package.json or default
const VERSION = process.env.npm_package_version ?? '1.0.0';

export async function GET() {
  const response = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: VERSION,
    services: {
      engine: 'ready',
      store: 'in-memory',
    },
  };

  return NextResponse.json(response);
}
