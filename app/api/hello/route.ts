import { NextResponse } from 'next/server';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(_request: Request) {
  return NextResponse.json({
    message: 'Hello from Next.js API on Cloud Run!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
}
