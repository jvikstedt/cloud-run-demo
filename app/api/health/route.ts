import { NextResponse } from 'next/server';
import { db } from '@/lib/firestore';

export async function GET() {
  try {
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'cloud-run-demo',
    };

    await db.collection('_health_check').limit(1).get();

    return NextResponse.json(health);
  } catch (error) {
    console.error('Health check failed:', error);

    return NextResponse.json(
      {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 503 }
    );
  }
}
