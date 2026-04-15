import { NextRequest } from 'next/server';
import { getDecision } from '@/lib/kv';
import { notFound } from '@/lib/errors';
import { requestContext } from '@/lib/request-context';
import { respondError, respondJson } from '@/lib/error-response';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const ctx = requestContext(request, 'decisions.get');
  try {
    const { id } = await params;

    const decision = await getDecision(id);

    if (!decision) {
      return notFound(`Decision ${id}`);
    }

    return respondJson(decision as unknown as Record<string, unknown>, {
      requestId: ctx.requestId,
    });
  } catch (error) {
    return respondError(error, ctx.log, { requestId: ctx.requestId });
  }
}
