import { NextResponse } from 'next/server';
import { getModelById, toModelInfo } from '@/models';
import { notFound } from '@/lib/errors';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(
  _request: Request,
  { params }: RouteParams
) {
  const { id } = await params;

  const model = getModelById(id);

  if (!model) {
    return notFound(`Model ${id}`);
  }

  return NextResponse.json(toModelInfo(model));
}
