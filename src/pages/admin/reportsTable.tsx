import type { Selection, SortDescriptor } from "@heroui/react";

import {
  Button,
  Chip,
  Input,
  Label,
  Pagination,
  Table,
  TextField,
} from "@heroui/react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { AdminPublication } from "@/config/admin-api";
import { ExcelIcon, PencilIcon, TrashIcon } from "@/components/icons";
import { AdminDatePicker } from "@/components/admin/admin-date-picker";
import { FilterSelect } from "@/components/admin/filter-select";
import { SelectionCheckbox } from "@/components/admin/selection-checkbox";
import { exportRowsToExcel } from "@/lib/export-excel";
import { formatPublicationDate } from "@/lib/date-format";

const TYPE_FILTER_OPTIONS = [
  { id: "", label: "Todos" },
  { id: "solo", label: "En solitario" },
  { id: "event", label: "Evento / rueda de prensa" },
];

const STATUS_FILTER_OPTIONS = [
  { id: "", label: "Todos" },
  { id: "draft", label: "Borrador" },
  { id: "published", label: "Publicado" },
];

const STATUS_LABELS: Record<AdminPublication["status"], string> = {
  draft: "Borrador",
  published: "Publicado",
};

const TYPE_LABELS: Record<AdminPublication["type"], string> = {
  solo: "En solitario",
  event: "Evento / rueda de prensa",
};

const columns = [
  { id: "select", name: "", sortable: false },
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

function compareByColumn(
  a: AdminPublication,
  b: AdminPublication,
  column: ColumnId,
): number {
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
    case "select":
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
export function ReportsTable({
  publications,
  deletingId,
  onDelete,
}: ReportsTableProps) {
  const [page, setPage] = useState(1);
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor | null>(
    null,
  );
  const [categoryFilter, setCategoryFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState<AdminPublication["type"] | "">(
    "",
  );
  const [statusFilter, setStatusFilter] = useState<
    AdminPublication["status"] | ""
  >("");
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set());

  const categoryOptions = useMemo(() => {
    const byId = new Map<string, string>();

    publications.forEach((p) => byId.set(p.category.id, p.category.name));

    const sorted = Array.from(byId.entries())
      .map(([id, label]) => ({ id, label }))
      .sort((a, b) => a.label.localeCompare(b.label));

    return [{ id: "", label: "Todas" }, ...sorted];
  }, [publications]);

  const hasActiveFilters = Boolean(
    categoryFilter || typeFilter || statusFilter || search || dateFrom || dateTo,
  );

  const clearFilters = () => {
    setCategoryFilter("");
    setTypeFilter("");
    setStatusFilter("");
    setSearch("");
    setDateFrom("");
    setDateTo("");
  };

  const filteredPublications = useMemo(() => {
    const query = search.trim().toLowerCase();

    return publications.filter((publication) => {
      if (categoryFilter && publication.category.id !== categoryFilter)
        return false;
      if (typeFilter && publication.type !== typeFilter) return false;
      if (statusFilter && publication.status !== statusFilter) return false;
      if (query) {
        const haystack =
          `${publication.title} ${publication.location ?? ""} ${publication.slug}`.toLowerCase();

        if (!haystack.includes(query)) return false;
      }
      if (dateFrom || dateTo) {
        if (!publication.date) return false;
        if (dateFrom && publication.date < dateFrom) return false;
        if (dateTo && publication.date > dateTo) return false;
      }

      return true;
    });
  }, [publications, categoryFilter, typeFilter, statusFilter, search, dateFrom, dateTo]);

  const sortedPublications = useMemo(() => {
    if (!sortDescriptor) return filteredPublications;
    const column = sortDescriptor.column as ColumnId;
    const sorted = [...filteredPublications].sort((a, b) =>
      compareByColumn(a, b, column),
    );

    return sortDescriptor.direction === "descending"
      ? sorted.reverse()
      : sorted;
  }, [filteredPublications, sortDescriptor]);

  const totalPages = Math.max(
    1,
    Math.ceil(sortedPublications.length / ROWS_PER_PAGE),
  );
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  const paginatedItems = useMemo(() => {
    const start = (page - 1) * ROWS_PER_PAGE;

    return sortedPublications.slice(start, start + ROWS_PER_PAGE);
  }, [sortedPublications, page]);

  const start =
    sortedPublications.length === 0 ? 0 : (page - 1) * ROWS_PER_PAGE + 1;
  const end = Math.min(page * ROWS_PER_PAGE, sortedPublications.length);

  useEffect(() => {
    setPage(1);
  }, [categoryFilter, typeFilter, statusFilter, search, dateFrom, dateTo]);

  const handleSortChange = (descriptor: SortDescriptor) => {
    setSortDescriptor(descriptor);
    setPage(1);
  };

  const selectedCount =
    selectedKeys === "all" ? sortedPublications.length : selectedKeys.size;

  const handleExport = () => {
    const rows =
      selectedKeys === "all"
        ? sortedPublications
        : selectedKeys.size > 0
          ? sortedPublications.filter((publication) =>
              selectedKeys.has(publication.id),
            )
          : sortedPublications;

    exportRowsToExcel(
      "publicaciones",
      rows.map((publication) => ({
        Título: publication.title,
        Categoría: publication.category.name,
        Tipo: TYPE_LABELS[publication.type],
        Estado: STATUS_LABELS[publication.status],
        Ubicación: publication.location ?? "",
        Fecha: formatPublicationDate(publication),
        Fotos: publication.photos.length,
        Slug: publication.slug,
      })),
    );
  };

  const renderCell = (publication: AdminPublication, columnId: ColumnId) => {
    switch (columnId) {
      case "select":
        return null;
      case "title":
        return (
          <span className="font-medium text-foreground">
            {publication.title}
          </span>
        );
      case "category":
        return (
          <span className="text-sm text-foreground">
            {publication.category.name}
          </span>
        );
      case "type":
        return (
          <span className="text-sm text-muted">
            {TYPE_LABELS[publication.type]}
          </span>
        );
      case "status":
        return (
          <Chip
            size="sm"
            variant={
              publication.status === "published" ? "primary" : "secondary"
            }
          >
            {STATUS_LABELS[publication.status]}
          </Chip>
        );
      case "location":
        return (
          <span className="text-sm text-muted">
            {publication.location ?? "—"}
          </span>
        );
      case "date":
        return (
          <span className="text-sm text-muted">
            {formatPublicationDate(publication)}
          </span>
        );
      case "photos":
        return (
          <span className="text-sm text-muted">
            {publication.photos.length}
          </span>
        );
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
    <div>
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <TextField className="min-w-48" name="search">
          <Label>Buscar</Label>
          <Input
            placeholder="Título, ubicación o slug…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </TextField>

        <div className="flex flex-col gap-1 text-xs">
          <span className="font-medium text-foreground">Categoría</span>
          <FilterSelect
            aria-label="Categoría"
            items={categoryOptions}
            value={categoryFilter}
            onChange={setCategoryFilter}
          />
        </div>

        <div className="flex flex-col gap-1 text-xs">
          <span className="font-medium text-foreground">Tipo</span>
          <FilterSelect
            aria-label="Tipo"
            items={TYPE_FILTER_OPTIONS}
            value={typeFilter}
            onChange={(value) =>
              setTypeFilter(value as AdminPublication["type"] | "")
            }
          />
        </div>

        <div className="flex flex-col gap-1 text-xs">
          <span className="font-medium text-foreground">Estado</span>
          <FilterSelect
            aria-label="Estado"
            items={STATUS_FILTER_OPTIONS}
            value={statusFilter}
            onChange={(value) =>
              setStatusFilter(value as AdminPublication["status"] | "")
            }
          />
        </div>

        <div className="flex flex-col gap-1 text-xs">
          <span className="font-medium text-foreground">Desde</span>
          <AdminDatePicker
            aria-label="Fecha desde"
            value={dateFrom}
            onChange={setDateFrom}
          />
        </div>

        <div className="flex flex-col gap-1 text-xs">
          <span className="font-medium text-foreground">Hasta</span>
          <AdminDatePicker
            aria-label="Fecha hasta"
            value={dateTo}
            onChange={setDateTo}
          />
        </div>

        <div className="ml-auto flex items-end gap-2">
          {hasActiveFilters && (
            <Button size="sm" variant="tertiary" onPress={clearFilters}>
              Limpiar filtros
            </Button>
          )}
          <Button
            isDisabled={sortedPublications.length === 0}
            size="sm"
            variant="secondary"
            onPress={handleExport}
          >
            <ExcelIcon size={16} />
            {selectedCount > 0
              ? `Exportar seleccionadas (${selectedCount})`
              : "Exportar a Excel"}
          </Button>
        </div>
      </div>

      {sortedPublications.length === 0 ? (
        <p className="text-sm text-muted">
          Ningún reportaje coincide con estos filtros.
        </p>
      ) : (
        <Table>
          <Table.ScrollContainer>
            <Table.Content
              aria-label="Publicaciones"
              className="min-w-240"
              selectedKeys={selectedKeys}
              selectionMode="multiple"
              sortDescriptor={sortDescriptor ?? undefined}
              onSelectionChange={setSelectedKeys}
              onSortChange={handleSortChange}
            >
              <Table.Header columns={columns}>
                {(column) => (
                  <Table.Column
                    allowsSorting={column.sortable}
                    isRowHeader={column.id === "title"}
                  >
                    {({ sortDirection }) =>
                      column.id === "select" ? (
                        <SelectionCheckbox />
                      ) : column.sortable ? (
                        <Table.SortableColumnHeader
                          sortDirection={sortDirection}
                        >
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
                  <Table.Row id={publication.id}>
                    <Table.Collection items={columns}>
                      {(column) => (
                        <Table.Cell>
                          {column.id === "select" ? (
                            <SelectionCheckbox />
                          ) : (
                            renderCell(publication, column.id)
                          )}
                        </Table.Cell>
                      )}
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
                      <Pagination.Link
                        isActive={p === page}
                        onPress={() => setPage(p)}
                      >
                        {p}
                      </Pagination.Link>
                    </Pagination.Item>
                  ))}
                  <Pagination.Item>
                    <Pagination.Next
                      isDisabled={page === totalPages}
                      onPress={() =>
                        setPage((p) => Math.min(totalPages, p + 1))
                      }
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
      )}
    </div>
  );
}
