import { NextResponse } from 'next/server';
import { getDecision } from '@/lib/kv';
import { notFound, internalError } from '@/lib/errors';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(
  _request: Request,
  { params }: RouteParams
) {
  try {
    const { id } = await params;

    const decision = await getDecision(id);

    if (!decision) {
      return notFound(`Decision ${id}`);
    }

    return NextResponse.json(decision);
  } catch (error) {
    console.error('Get decision error:', error);
    return internalError('An error occurred while retrieving the decision');
  }
}
