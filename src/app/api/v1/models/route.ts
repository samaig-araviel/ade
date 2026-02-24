import { NextRequest, NextResponse } from 'next/server';
import { getModelsForTier, getAllModels, toModelInfo } from '@/models';
import { AccessTier } from '@/types';

export async function GET(request: NextRequest) {
  const tier = request.nextUrl.searchParams.get('tier') as AccessTier | null;
  const validTiers = new Set(Object.values(AccessTier));

  const models = tier && validTiers.has(tier)
      ? getModelsForTier(tier)
      : getAllModels();

  const modelInfos = models.map(toModelInfo);

  return NextResponse.json({
    models: modelInfos,
    count: modelInfos.length,
  });
}