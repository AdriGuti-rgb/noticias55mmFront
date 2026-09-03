import type { SortDescriptor } from "@heroui/react";

import { Button, Chip, Pagination, Table } from "@heroui/react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { AdminPublication } from "@/config/admin-api";
import { PencilIcon, TrashIcon } from "@/components/icons";

const STATUS_LABELS: Record<AdminPublication["status"], string> = {
  draft: "Borrador",
  published: "Publicado",
};

const TYPE_LABELS: Record<AdminPublication["type"], string> = {
  solo: "En solitario",
  event: "Evento / rueda de prensa",
};

const columns = [
  { id: "title", name: "Título", sortable: true },
  { id: "category", name: "Categoría", sortable: true },
  { id: "type", name: "Tipo", sortable: true },
  { id: "status", name: "Estado", sortable: true },
  { id: "location", name: "Ubicación", sortable: true },
  { id: "date", name: "Fecha", sortable: true },
  { id: "photos", name: "Fotos", sortable: true },
  { id: "slug", name: "Slug", sortable: true },
  { id: "actions", name: "Acciones", sortable: false },
] as const;

type ColumnId = (typeof columns)[number]["id"];

const ROWS_PER_PAGE = 8;

/** `date` (YYYY-MM-DD) ya ordena bien como texto; si no hay, cae a `publishedAt` (ISO, también ordenable). */
function dateSortValue(publication: AdminPublication): string {
  return publication.date ?? publication.publishedAt ?? "";
}

function formatDateColumn(publication: AdminPublication): string {
  if (publication.date) {
    const [year, month, day] = publication.date.split("-");
    return `${day}/${month}/${year}`;
  }
  if (publication.publishedAt) {
    return new Date(publication.publishedAt).toLocaleDateString("es-ES");
  }
  return "—";
}

function compareByColumn(a: AdminPublication, b: AdminPublication, column: ColumnId): number {
  switch (column) {
    case "title":
      return a.title.localeCompare(b.title);
    case "category":
      return a.category.name.localeCompare(b.category.name);
    case "type":
      return TYPE_LABELS[a.type].localeCompare(TYPE_LABELS[b.type]);
    case "status":
      return STATUS_LABELS[a.status].localeCompare(STATUS_LABELS[b.status]);
    case "location":
      return (a.location ?? "").localeCompare(b.location ?? "");
    case "date":
      return dateSortValue(a).localeCompare(dateSortValue(b));
    case "photos":
      return a.photos.length - b.photos.length;
    case "slug":
      return a.slug.localeCompare(b.slug);
    case "actions":
      return 0;
  }
}

interface ReportsTableProps {
  publications: AdminPublication[];
  deletingId: string | null;
  onDelete: (publication: AdminPublication) => void;
}

/**
 * Usa el `Table` de HeroUI (react-aria-components) con el patrón de colección
 * dinámica: `items` + función-hijo, tanto en `Table.Body` como en
 * `Table.Collection` por fila. **No** usar `Array.prototype.map` para generar
 * `Table.Row`/`Table.Cell` directamente como children — ese fue el fallo real
 * que tumbó la web la primera vez (`cannot be rendered outside a collection`):
 * react-aria-components necesita el hijo-función sobre `items` para construir
 * su colección interna, no un array de elementos ya creados. Ver CLAUDE.md.
 *
 * El ordenado es manual (estado + `Array.prototype.sort`), sin TanStack: solo
 * se usa el `sortDescriptor`/`onSortChange` que ya trae `Table.Content` de
 * HeroUI/react-aria para pintar la flecha de orden en la cabecera.
 */
export function ReportsTable({ publications, deletingId, onDelete }: ReportsTableProps) {
  const [page, setPage] = useState(1);
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor | null>(null);

  const sortedPublications = useMemo(() => {
    if (!sortDescriptor) return publications;
    const column = sortDescriptor.column as ColumnId;
    const sorted = [...publications].sort((a, b) => compareByColumn(a, b, column));
    return sortDescriptor.direction === "descending" ? sorted.reverse() : sorted;
  }, [publications, sortDescriptor]);

  const totalPages = Math.max(1, Math.ceil(sortedPublications.length / ROWS_PER_PAGE));
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  const paginatedItems = useMemo(() => {
    const start = (page - 1) * ROWS_PER_PAGE;
    return sortedPublications.slice(start, start + ROWS_PER_PAGE);
  }, [sortedPublications, page]);

  const start = sortedPublications.length === 0 ? 0 : (page - 1) * ROWS_PER_PAGE + 1;
  const end = Math.min(page * ROWS_PER_PAGE, sortedPublications.length);

  const handleSortChange = (descriptor: SortDescriptor) => {
    setSortDescriptor(descriptor);
    setPage(1);
  };

  const renderCell = (publication: AdminPublication, columnId: ColumnId) => {
    switch (columnId) {
      case "title":
        return <span className="font-medium text-foreground">{publication.title}</span>;
      case "category":
        return <span className="text-sm text-foreground">{publication.category.name}</span>;
      case "type":
        return <span className="text-sm text-muted">{TYPE_LABELS[publication.type]}</span>;
      case "status":
        return (
          <Chip size="sm" variant={publication.status === "published" ? "primary" : "secondary"}>
            {STATUS_LABELS[publication.status]}
          </Chip>
        );
      case "location":
        return <span className="text-sm text-muted">{publication.location ?? "—"}</span>;
      case "date":
        return <span className="text-sm text-muted">{formatDateColumn(publication)}</span>;
      case "photos":
        return <span className="text-sm text-muted">{publication.photos.length}</span>;
      case "slug":
        return <span className="text-xs text-muted">/{publication.slug}</span>;
      case "actions":
        return (
          <div className="flex items-center gap-2">
            <Link
              aria-label="Editar"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-separator text-foreground transition-colors hover:border-accent hover:text-accent"
              to={`/system/admin/publications/${publication.id}`}
            >
              <PencilIcon size={16} />
            </Link>
            <Button
              isIconOnly
              aria-label="Eliminar"
              isDisabled={deletingId === publication.id}
              size="sm"
              variant="danger-soft"
              onPress={() => onDelete(publication)}
            >
              <TrashIcon size={16} />
            </Button>
          </div>
        );
    }
  };

  return (
    <Table>
      <Table.ScrollContainer>
        <Table.Content
          aria-label="Publicaciones"
          className="min-w-240"
          sortDescriptor={sortDescriptor ?? undefined}
          onSortChange={handleSortChange}
        >
          <Table.Header columns={columns}>
            {(column) => (
              <Table.Column allowsSorting={column.sortable} isRowHeader={column.id === "title"}>
                {({ sortDirection }) =>
                  column.sortable ? (
                    <Table.SortableColumnHeader sortDirection={sortDirection}>
                      {column.name}
                    </Table.SortableColumnHeader>
                  ) : (
                    column.name
                  )
                }
              </Table.Column>
            )}
          </Table.Header>
          <Table.Body items={paginatedItems}>
            {(publication) => (
              <Table.Row>
                <Table.Collection items={columns}>
                  {(column) => <Table.Cell>{renderCell(publication, column.id)}</Table.Cell>}
                </Table.Collection>
              </Table.Row>
            )}
          </Table.Body>
        </Table.Content>
      </Table.ScrollContainer>
      {totalPages > 1 && (
        <Table.Footer>
          <Pagination size="sm">
            <Pagination.Summary>
              {start} a {end} de {sortedPublications.length}
            </Pagination.Summary>
            <Pagination.Content>
              <Pagination.Item>
                <Pagination.Previous
                  isDisabled={page === 1}
                  onPress={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <Pagination.PreviousIcon />
                  Anterior
                </Pagination.Previous>
              </Pagination.Item>
              {pages.map((p) => (
                <Pagination.Item key={p}>
                  <Pagination.Link isActive={p === page} onPress={() => setPage(p)}>
                    {p}
                  </Pagination.Link>
                </Pagination.Item>
              ))}
              <Pagination.Item>
                <Pagination.Next
                  isDisabled={page === totalPages}
                  onPress={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Siguiente
                  <Pagination.NextIcon />
                </Pagination.Next>
              </Pagination.Item>
            </Pagination.Content>
          </Pagination>
        </Table.Footer>
      )}
    </Table>
  );
}
