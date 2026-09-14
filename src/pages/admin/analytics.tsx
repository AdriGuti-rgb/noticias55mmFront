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
import {
  CameraIcon,
  ChatIcon,
  MailIcon,
  TagIcon,
  TrophyIcon,
  UploadIcon,
} from "@/components/icons";
import { toast } from "@/lib/toast";

interface AnalyticsOverview {
  totalPublications: number;
  totalPhotos: number;
  totalCategories: number;
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

interface KpiTileProps {
  icon: React.FC<{ size?: number; className?: string }>;
  label: string;
  value: number | string;
  hint?: string;
}

function KpiTile({ icon: Icon, label, value, hint }: KpiTileProps) {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent">
          <Icon size={18} />
        </span>
        <div className="min-w-0">
          <p className="text-2xl font-semibold text-foreground">{value}</p>
          <p className="text-sm text-muted">{label}</p>
        </div>
      </div>
      {hint && <p className="mt-3 text-xs text-muted">{hint}</p>}
    </Card>
  );
}

function BreakdownCard({
  title,
  rows,
  labels,
  total,
}: {
  title: string;
  rows: { count: number; key: string }[];
  labels: Record<string, string>;
  total: number;
}) {
  return (
    <Card className="p-5">
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      <ul className="mt-4 flex flex-col gap-3 text-sm">
        {rows.map((row) => {
          const percent = total > 0 ? Math.round((row.count / total) * 100) : 0;

          return (
            <li key={row.key}>
              <div className="flex justify-between text-muted">
                <span>{labels[row.key] ?? row.key}</span>
                <span className="font-medium text-foreground">
                  {row.count} <span className="text-muted">({percent}%)</span>
                </span>
              </div>
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-field">
                <div
                  className="h-full rounded-full bg-accent"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

function AnalyticsSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((i) => (
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

      {overview && (() => {
        const published =
          overview.publicationsByStatus.find((row) => row.status === "published")?.count ?? 0;
        const draft =
          overview.publicationsByStatus.find((row) => row.status === "draft")?.count ?? 0;
        const avgViews =
          overview.totalPublications > 0
            ? (overview.viewsTotal / overview.totalPublications).toFixed(1)
            : "0";
        const avgPhotos =
          overview.totalPublications > 0
            ? (overview.totalPhotos / overview.totalPublications).toFixed(1)
            : "0";
        const topCategory = [...overview.publicationsByCategory].sort(
          (a, b) => b.count - a.count,
        )[0];
        const readComments = overview.comments.total - overview.comments.unread;

        return (
          <div className="mt-6 flex flex-col gap-6">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <KpiTile
                hint={`${published} publicadas · ${draft} borradores`}
                icon={CameraIcon}
                label="Publicaciones"
                value={overview.totalPublications}
              />
              <KpiTile
                hint={`${avgPhotos} por publicación`}
                icon={UploadIcon}
                label="Fotos"
                value={overview.totalPhotos}
              />
              <KpiTile
                hint={topCategory ? `Más usada: ${topCategory.category}` : undefined}
                icon={TagIcon}
                label="Categorías"
                value={overview.totalCategories}
              />
              <KpiTile
                hint={`${avgViews} por publicación`}
                icon={TrophyIcon}
                label="Vistas totales"
                value={overview.viewsTotal}
              />
              <KpiTile
                hint={`${readComments} leídos`}
                icon={ChatIcon}
                label="Comentarios"
                value={overview.comments.total}
              />
              <KpiTile
                hint={overview.comments.unread > 0 ? "Pendientes de revisar" : "Todo al día"}
                icon={MailIcon}
                label="Sin leer"
                value={overview.comments.unread}
              />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <Card className="p-5">
                <h2 className="text-sm font-semibold text-foreground">
                  Publicaciones más visitadas
                </h2>
                {overview.mostVisited.length === 0 ? (
                  <p className="mt-4 text-sm text-muted">Todavía no hay vistas registradas.</p>
                ) : (
                  <>
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
                            cursor={{ fill: "var(--field-background)" }}
                            contentStyle={{
                              background: "var(--surface)",
                              border: "1px solid var(--separator)",
                              borderRadius: 8,
                              color: "var(--foreground)",
                            }}
                            itemStyle={{ color: "var(--foreground)" }}
                            labelStyle={{ color: "var(--foreground)" }}
                          />
                          <Bar dataKey="viewCount" fill="var(--accent)" name="Vistas" radius={4} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <ul className="mt-4 flex flex-col gap-1.5 border-t border-separator pt-4 text-sm">
                      {overview.mostVisited.map((pub, index) => (
                        <li key={pub.id} className="flex items-center justify-between gap-3">
                          <span className="flex min-w-0 items-center gap-2 text-muted">
                            <span className="text-xs text-accent">#{index + 1}</span>
                            <span className="truncate text-foreground">{pub.title}</span>
                          </span>
                          <span className="shrink-0 text-xs text-muted">
                            {pub.viewCount} {pub.viewCount === 1 ? "vista" : "vistas"}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </Card>

              <Card className="p-5">
                <h2 className="text-sm font-semibold text-foreground">
                  Publicaciones por categoría
                </h2>
                {overview.publicationsByCategory.length === 0 ? (
                  <p className="mt-4 text-sm text-muted">Todavía no hay publicaciones.</p>
                ) : (
                  <>
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
                            itemStyle={{ color: "var(--foreground)" }}
                            labelStyle={{ color: "var(--foreground)" }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <ul className="mt-4 flex flex-col gap-2 border-t border-separator pt-4 text-sm">
                      {[...overview.publicationsByCategory]
                        .sort((a, b) => b.count - a.count)
                        .map((row, index) => (
                          <li key={row.category} className="flex items-center gap-2">
                            <span
                              className="size-2.5 shrink-0 rounded-full"
                              style={{
                                background: DONUT_COLORS[
                                  overview.publicationsByCategory.findIndex(
                                    (c) => c.category === row.category,
                                  ) % DONUT_COLORS.length
                                ],
                              }}
                            />
                            <span className="min-w-0 flex-1 truncate text-muted">
                              {row.category}
                            </span>
                            <span className="text-xs font-medium text-foreground">
                              {row.count}
                            </span>
                            {index === 0 && (
                              <span className="text-xs text-accent">líder</span>
                            )}
                          </li>
                        ))}
                    </ul>
                  </>
                )}
              </Card>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <BreakdownCard
                labels={STATUS_LABELS}
                rows={overview.publicationsByStatus.map((row) => ({
                  key: row.status,
                  count: row.count,
                }))}
                title="Por estado"
                total={overview.totalPublications}
              />
              <BreakdownCard
                labels={TYPE_LABELS}
                rows={overview.publicationsByType.map((row) => ({
                  key: row.type,
                  count: row.count,
                }))}
                title="Por tipo"
                total={overview.totalPublications}
              />
            </div>
          </div>
        );
      })()}
    </div>
  );
}
