// This page was removed as the AI Predictor feature has been deprecated.
// It might be automatically removed in a future cleanup.
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AiPredictorPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/dashboard');
  }, [router]);
  return null;
}
