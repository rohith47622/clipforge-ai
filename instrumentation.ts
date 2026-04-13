/**
 * Instrumentation file for monitoring and error tracking
 * Initialize Sentry and other monitoring tools
 * 
 * NOTE: Sentry temporarily disabled due to Next.js 15 compatibility issues
 * Re-enable after updating Sentry to latest version
 */

// import * as Sentry from '@sentry/nextjs'

export async function register() {
  // Sentry monitoring disabled for development
  // To re-enable: npm install @sentry/nextjs@latest
  // Then uncomment the code below and pass SENTRY_DSN in .env
  
  /*
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await Sentry.init({
      dsn: process.env.SENTRY_DSN,
      tracesSampleRate: 1.0,
      debug: process.env.NODE_ENV === 'development',
      environment: process.env.NODE_ENV,
      integrations: [
        new Sentry.Integrations.Console(),
        new Sentry.Integrations.Http({ tracing: true }),
      ],
    })
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await Sentry.init({
      dsn: process.env.SENTRY_DSN,
      tracesSampleRate: 1.0,
      environment: process.env.NODE_ENV,
    })
  }
  */
}
