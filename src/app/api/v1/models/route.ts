import { NextResponse } from 'next/server';
import { getAllModels, toModelInfo } from '@/models';

export async function GET() {
  const models = getAllModels();
  const modelInfos = models.map(toModelInfo);

  return NextResponse.json({
    models: modelInfos,
    count: modelInfos.length,
  });
}
