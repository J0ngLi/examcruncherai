export type AnalyticsEventName =
  | "signup"
  | "login"
  | "revision_set_generated"
  | "quiz_started"
  | "upgrade_clicked"
  | "checkout_started";

export function trackEvent(event: AnalyticsEventName, payload: Record<string, string | number | boolean> = {}) {
  if (typeof window === "undefined") return;

  const entry = {
    event,
    payload,
    timestamp: new Date().toISOString(),
  };

  const key = "examcrunch_analytics_events";
  const current = window.localStorage.getItem(key);
  const list = current ? (JSON.parse(current) as typeof entry[]) : [];
  window.localStorage.setItem(key, JSON.stringify([entry, ...list].slice(0, 200)));

  const trackedWindow = window as Window & { dataLayer?: unknown[] };
  if (trackedWindow.dataLayer) {
    trackedWindow.dataLayer.push(entry);
  }

  console.info("[analytics]", event, payload);
}
