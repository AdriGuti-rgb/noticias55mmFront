type ApiActivityListener = () => void;

let activeRequests = 0;
const listeners = new Set<ApiActivityListener>();

export function getApiRequestCount(): number {
  return activeRequests;
}

export function subscribeToApiRequests(listener: ApiActivityListener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function startApiRequest(): () => void {
  activeRequests += 1;
  listeners.forEach((listener) => listener());

  let finished = false;
  return () => {
    if (finished) return;
    finished = true;
    activeRequests = Math.max(0, activeRequests - 1);
    listeners.forEach((listener) => listener());
  };
}