declare interface Window {
  Sentry?: {
    captureException?: (error: unknown) => void
  }
}

