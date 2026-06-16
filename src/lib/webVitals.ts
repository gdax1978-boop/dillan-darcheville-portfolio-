import { onCLS, onINP, onLCP, onFCP, onTTFB } from 'web-vitals';

type MetricName = 'CLS' | 'INP' | 'LCP' | 'FCP' | 'TTFB';

function report(metric: { name: MetricName; value: number; id: string }) {
  if (import.meta.env.DEV) {
    const ratings: Record<MetricName, string> = {
      LCP: metric.value < 2500 ? '✅ Good' : metric.value < 4000 ? '⚠️ Needs Improvement' : '❌ Poor',
      INP: metric.value < 200 ? '✅ Good' : metric.value < 500 ? '⚠️ Needs Improvement' : '❌ Poor',
      CLS: metric.value < 0.1 ? '✅ Good' : metric.value < 0.25 ? '⚠️ Needs Improvement' : '❌ Poor',
      FCP: metric.value < 1800 ? '✅ Good' : metric.value < 3000 ? '⚠️ Needs Improvement' : '❌ Poor',
      TTFB: metric.value < 800 ? '✅ Good' : metric.value < 1800 ? '⚠️ Needs Improvement' : '❌ Poor',
    };
    console.log(`[Web Vitals] ${metric.name}: ${Math.round(metric.value)}ms ${ratings[metric.name]}`);
  }

  // Report to GA4 when measurement ID is configured
  if (typeof (window as any).gtag === 'function') {
    (window as any).gtag('event', metric.name, {
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      event_category: 'Web Vitals',
      event_label: metric.id,
      non_interaction: true,
    });
  }
}

export function reportWebVitals() {
  onCLS(report);
  onINP(report);
  onLCP(report);
  onFCP(report);
  onTTFB(report);
}
