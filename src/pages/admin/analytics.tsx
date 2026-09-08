import { useEffect, useState } from "react";
import { Card, Skeleton } from "@heroui/react";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { adminApi, ApiError } from "@/config/admin-api";
import { toast } from "@/lib/toast";

interface AnalyticsOverview {
  totalPublications: number;
  publicationsByStatus: { status: string; count: number }[];
  publicationsByType: { type: string; count: number }[];
  publicationsByCategory: { category: string; count: number }[];
  viewsTotal: number;
  mostVisited: { id: string; slug: string; title: string; viewCount: number }[];
  comments: { unread: number; total: number };
}

const DONUT_COLORS = [
  "oklch(0.68 0.16 254)",
  "oklch(0.72 0.17 175)",
  "oklch(0.75 0.18 60)",
  "oklch(0.68 0.19 25)",
  "oklch(0.7 0.14 320)",
  "oklch(0.72 0.15 110)",
];

const STATUS_LABELS: Record<string, string> = {
  draft: "Borrador",
  published: "Publicado",
};

const TYPE_LABELS: Record<string, string> = {
  solo: "En solitario",
  event: "Evento / rueda de prensa",
};

function KpiTile({ label, value }: { label: string; value: number }) {
  return (
    <Card className="p-5">
      <p className="text-3xl font-semibold text-foreground">{value}</p>
      <p className="mt-1 text-sm text-muted">{label}</p>
    </Card>
  );
}

function AnalyticsSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 rounded-2xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Skeleton className="h-72 rounded-2xl" />
        <Skeleton className="h-72 rounded-2xl" />
      </div>
    </div>
  );
}

export default function AdminAnalyticsPage() {
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    adminApi
      .get<AnalyticsOverview>("/admin/analytics/overview")
      .then(setOverview)
      .catch((err) => {
        setLoadError(true);
        toast.danger(
          err instanceof ApiError
            ? err.message
            : "No se pudieron cargar las analíticas.",
        );
      });
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">
        Analíticas
      </h1>

      {overview === null && !loadError && (
        <div className="mt-6">
          <AnalyticsSkeleton />
        </div>
      )}

      {overview === null && loadError && (
        <p className="mt-8 text-sm text-muted">
          No se pudieron cargar las analíticas.
        </p>
      )}

      {overview && (
        <div className="mt-6 flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <KpiTile label="Publicaciones" value={overview.totalPublications} />
            <KpiTile label="Vistas totales" value={overview.viewsTotal} />
            <KpiTile label="Comentarios" value={overview.comments.total} />
            <KpiTile label="Comentarios sin leer" value={overview.comments.unread} />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card className="p-5">
              <h2 className="text-sm font-semibold text-foreground">
                Publicaciones más visitadas
              </h2>
              {overview.mostVisited.length === 0 ? (
                <p className="mt-4 text-sm text-muted">Todavía no hay vistas registradas.</p>
              ) : (
                <div className="mt-4 h-64 text-muted">
                  <ResponsiveContainer height="100%" width="100%">
                    <BarChart data={overview.mostVisited} layout="vertical">
                      <XAxis
                        stroke="currentColor"
                        tick={{ fill: "currentColor", fontSize: 12 }}
                        type="number"
                      />
                      <YAxis
                        dataKey="title"
                        stroke="currentColor"
                        tick={{ fill: "currentColor", fontSize: 12 }}
                        type="category"
                        width={140}
                      />
                      <Tooltip
                        contentStyle={{
                          background: "var(--surface)",
                          border: "1px solid var(--separator)",
                          borderRadius: 8,
                          color: "var(--foreground)",
                        }}
                      />
                      <Bar dataKey="viewCount" fill="var(--accent)" name="Vistas" radius={4} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Card>

            <Card className="p-5">
              <h2 className="text-sm font-semibold text-foreground">
                Publicaciones por categoría
              </h2>
              {overview.publicationsByCategory.length === 0 ? (
                <p className="mt-4 text-sm text-muted">Todavía no hay publicaciones.</p>
              ) : (
                <div className="mt-4 h-64">
                  <ResponsiveContainer height="100%" width="100%">
                    <PieChart>
                      <Pie
                        data={overview.publicationsByCategory}
                        dataKey="count"
                        endAngle={-269.999}
                        innerRadius={55}
                        nameKey="category"
                        outerRadius={85}
                        startAngle={90}
                      >
                        {overview.publicationsByCategory.map((entry, index) => (
                          <Cell
                            key={entry.category}
                            fill={DONUT_COLORS[index % DONUT_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: "var(--surface)",
                          border: "1px solid var(--separator)",
                          borderRadius: 8,
                          color: "var(--foreground)",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <Card className="p-5">
              <h2 className="text-sm font-semibold text-foreground">Por estado</h2>
              <ul className="mt-3 flex flex-col gap-2 text-sm">
                {overview.publicationsByStatus.map((row) => (
                  <li key={row.status} className="flex justify-between text-muted">
                    <span>{STATUS_LABELS[row.status] ?? row.status}</span>
                    <span className="font-medium text-foreground">{row.count}</span>
                  </li>
                ))}
              </ul>
            </Card>
            <Card className="p-5">
              <h2 className="text-sm font-semibold text-foreground">Por tipo</h2>
              <ul className="mt-3 flex flex-col gap-2 text-sm">
                {overview.publicationsByType.map((row) => (
                  <li key={row.type} className="flex justify-between text-muted">
                    <span>{TYPE_LABELS[row.type] ?? row.type}</span>
                    <span className="font-medium text-foreground">{row.count}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
