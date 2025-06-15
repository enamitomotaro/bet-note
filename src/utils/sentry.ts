export function reportErrorToSentry(error: unknown) {
  try {
    const sentry = (window as any).Sentry
    if (sentry && typeof sentry.captureException === 'function') {
      sentry.captureException(error)
    } else {
      console.error('Sentry is not initialized', error)
    }
  } catch (err) {
    console.error('Failed to report to Sentry', err)
  }
}

