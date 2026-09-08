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

import { AdminComment } from "@/config/admin-api";
import { CheckIcon, ExcelIcon, MailIcon } from "@/components/icons";
import { FilterSelect } from "@/components/admin/filter-select";
import { SelectionCheckbox } from "@/components/admin/selection-checkbox";
import { exportRowsToExcel } from "@/lib/export-excel";
import { formatDateTime } from "@/lib/date-format";

const STATUS_FILTER_OPTIONS = [
  { id: "", label: "Todos" },
  { id: "unread", label: "No leído" },
  { id: "read", label: "Leído" },
];

const STATUS_LABELS: Record<AdminComment["status"], string> = {
  unread: "No leído",
  read: "Leído",
};

const columns = [
  { id: "select", name: "", sortable: false },
  { id: "contact", name: "Contacto", sortable: true },
  { id: "message", name: "Mensaje", sortable: false },
  { id: "status", name: "Estado", sortable: true },
  { id: "date", name: "Fecha", sortable: true },
  { id: "publication", name: "Publicación", sortable: false },
  { id: "actions", name: "Acciones", sortable: false },
] as const;

type ColumnId = (typeof columns)[number]["id"];

const ROWS_PER_PAGE = 8;

function truncate(text: string, maxLength: number): string {
  const flat = text.replace(/\s+/g, " ").trim();

  if (flat.length <= maxLength) return flat;

  return `${flat.slice(0, maxLength).trimEnd()}…`;
}

function compareByColumn(
  a: AdminComment,
  b: AdminComment,
  column: ColumnId,
): number {
  switch (column) {
    case "contact":
      return (a.contact ?? "").localeCompare(b.contact ?? "");
    case "status":
      return STATUS_LABELS[a.status].localeCompare(STATUS_LABELS[b.status]);
    case "date":
      return a.createdAt.localeCompare(b.createdAt);
    case "select":
    case "message":
    case "publication":
    case "actions":
      return 0;
  }
}

interface CommentsTableProps {
  comments: AdminComment[];
  updatingId: string | null;
  onToggleStatus: (comment: AdminComment) => void;
}

/**
 * Mismo patrón que `ReportsTable`/`CategoriesTable`: `Table` de HeroUI con
 * colección dinámica (`items` + función-hijo), filtros por columna + buscador
 * de texto, y exportación a Excel sobre el conjunto ya filtrado/ordenado.
 */
export function CommentsTable({
  comments,
  updatingId,
  onToggleStatus,
}: CommentsTableProps) {
  const [page, setPage] = useState(1);
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor | null>({
    column: "date",
    direction: "descending",
  });
  const [statusFilter, setStatusFilter] = useState<AdminComment["status"] | "">(
    "",
  );
  const [search, setSearch] = useState("");
  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set());

  const hasActiveFilters = Boolean(statusFilter || search);

  const clearFilters = () => {
    setStatusFilter("");
    setSearch("");
  };

  const filteredComments = useMemo(() => {
    const query = search.trim().toLowerCase();

    return comments.filter((comment) => {
      if (statusFilter && comment.status !== statusFilter) return false;
      if (query) {
        const haystack =
          `${comment.contact ?? ""} ${comment.message}`.toLowerCase();

        if (!haystack.includes(query)) return false;
      }

      return true;
    });
  }, [comments, statusFilter, search]);

  const sortedComments = useMemo(() => {
    if (!sortDescriptor) return filteredComments;
    const column = sortDescriptor.column as ColumnId;
    const sorted = [...filteredComments].sort((a, b) =>
      compareByColumn(a, b, column),
    );

    return sortDescriptor.direction === "descending"
      ? sorted.reverse()
      : sorted;
  }, [filteredComments, sortDescriptor]);

  const totalPages = Math.max(
    1,
    Math.ceil(sortedComments.length / ROWS_PER_PAGE),
  );
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  const paginatedItems = useMemo(() => {
    const start = (page - 1) * ROWS_PER_PAGE;

    return sortedComments.slice(start, start + ROWS_PER_PAGE);
  }, [sortedComments, page]);

  const start =
    sortedComments.length === 0 ? 0 : (page - 1) * ROWS_PER_PAGE + 1;
  const end = Math.min(page * ROWS_PER_PAGE, sortedComments.length);

  useEffect(() => {
    setPage(1);
  }, [statusFilter, search]);

  const handleSortChange = (descriptor: SortDescriptor) => {
    setSortDescriptor(descriptor);
    setPage(1);
  };

  const selectedCount =
    selectedKeys === "all" ? sortedComments.length : selectedKeys.size;

  const handleExport = () => {
    const rows =
      selectedKeys === "all"
        ? sortedComments
        : selectedKeys.size > 0
          ? sortedComments.filter((comment) => selectedKeys.has(comment.id))
          : sortedComments;

    exportRowsToExcel(
      "comentarios",
      rows.map((comment) => ({
        Contacto: comment.contact ?? "Anónimo",
        Mensaje: comment.message,
        Estado: STATUS_LABELS[comment.status],
        Fecha: formatDateTime(comment.createdAt),
        Publicación: comment.publication?.title ?? "",
        "Correo enviado": comment.emailSent ? "Sí" : "No",
      })),
    );
  };

  const renderCell = (comment: AdminComment, columnId: ColumnId) => {
    switch (columnId) {
      case "select":
        return null;
      case "contact":
        return (
          <span className="font-medium text-foreground">
            {comment.contact?.trim() || "Anónimo"}
          </span>
        );
      case "message":
        return (
          <span className="text-sm text-muted" title={comment.message}>
            {truncate(comment.message, 80)}
          </span>
        );
      case "status":
        return (
          <Chip
            color={comment.status === "unread" ? "accent" : "default"}
            size="sm"
          >
            {STATUS_LABELS[comment.status]}
          </Chip>
        );
      case "date":
        return (
          <span className="text-sm text-muted">
            {formatDateTime(comment.createdAt)}
          </span>
        );
      case "publication":
        return comment.publication ? (
          <Link
            className="text-sm text-accent hover:underline"
            to={`/system/admin/publications/${comment.publication.id}`}
          >
            {comment.publication.title}
          </Link>
        ) : (
          <span className="text-sm text-muted">—</span>
        );
      case "actions":
        return (
          <Button
            isIconOnly
            aria-label={
              comment.status === "unread" ? "Marcar leído" : "Marcar no leído"
            }
            isDisabled={updatingId === comment.id}
            size="sm"
            variant="secondary"
            onPress={() => onToggleStatus(comment)}
          >
            {comment.status === "unread" ? (
              <CheckIcon size={16} />
            ) : (
              <MailIcon size={16} />
            )}
          </Button>
        );
    }
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <TextField className="min-w-56" name="search">
          <Label>Buscar</Label>
          <Input
            placeholder="Contacto o mensaje…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </TextField>

        <div className="flex flex-col gap-1 text-xs">
          <span className="font-medium text-foreground">Estado</span>
          <FilterSelect
            aria-label="Estado"
            items={STATUS_FILTER_OPTIONS}
            value={statusFilter}
            onChange={(value) =>
              setStatusFilter(value as AdminComment["status"] | "")
            }
          />
        </div>

        <div className="ml-auto flex items-end gap-2">
          {hasActiveFilters && (
            <Button size="sm" variant="tertiary" onPress={clearFilters}>
              Limpiar filtros
            </Button>
          )}
          <Button
            isDisabled={sortedComments.length === 0}
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

      {sortedComments.length === 0 ? (
        <p className="text-sm text-muted">
          Ningún comentario coincide con estos filtros.
        </p>
      ) : (
        <Table>
          <Table.ScrollContainer>
            <Table.Content
              aria-label="Comentarios"
              className="min-w-200"
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
                    isRowHeader={column.id === "contact"}
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
                {(comment) => (
                  <Table.Row id={comment.id}>
                    <Table.Collection items={columns}>
                      {(column) => (
                        <Table.Cell>
                          {column.id === "select" ? (
                            <SelectionCheckbox />
                          ) : (
                            renderCell(comment, column.id)
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
                  {start} a {end} de {sortedComments.length}
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
