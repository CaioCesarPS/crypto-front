import { NextResponse } from 'next/server'

/**
 * Health check endpoint for Docker health checks and monitoring
 * Returns 200 OK if the application is running properly
 */
export async function GET() {
  try {
    // You can add additional health checks here:
    // - Database connectivity
    // - External API availability
    // - Cache status

    return NextResponse.json(
      {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV,
      },
      { status: 200 }
    )
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    )
  }
}
