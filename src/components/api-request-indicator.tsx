import { useSyncExternalStore } from "react";

import { IrisSpinner } from "@/components/iris-spinner";
import { getApiRequestCount, subscribeToApiRequests } from "@/lib/api-activity";

export function ApiRequestIndicator() {
  const requestCount = useSyncExternalStore(
    subscribeToApiRequests,
    getApiRequestCount,
    () => 0,
  );

  if (requestCount === 0) return null;

  return (
    <span
      aria-label="Cargando"
      className="fixed bottom-5 right-5 z-50 text-accent drop-shadow"
      data-slot="api-request-spinner"
      role="status"
    >
      <IrisSpinner className="size-9" />
    </span>
  );
}