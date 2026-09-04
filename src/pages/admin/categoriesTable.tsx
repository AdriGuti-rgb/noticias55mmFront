import type { Selection, SortDescriptor } from "@heroui/react";

import {
  Button,
  Input,
  Label,
  Pagination,
  Table,
  TextField,
} from "@heroui/react";
import { useEffect, useMemo, useState } from "react";

import { Category } from "@/config/admin-api";
import { FilterSelect } from "@/components/admin/filter-select";
import { SelectionCheckbox } from "@/components/admin/selection-checkbox";
import {
  CATEGORY_ICON_OPTIONS,
  getCategoryIcon,
} from "@/config/category-icons";
import { ExcelIcon, PencilIcon, TagIcon, TrashIcon } from "@/components/icons";
import { exportRowsToExcel } from "@/lib/export-excel";

const ICON_FILTER_OPTIONS = [
  { id: "", label: "Todos" },
  ...CATEGORY_ICON_OPTIONS.map((option) => ({
    id: option.key,
    label: option.label,
  })),
  { id: "none", label: "Sin icono" },
];

const columns = [
  { id: "select", name: "", sortable: false },
  { id: "icon", name: "Icono", sortable: false },
  { id: "name", name: "Nombre", sortable: true },
  { id: "nameEn", name: "Nombre (inglés)", sortable: true },
  { id: "slug", name: "Slug", sortable: true },
  { id: "actions", name: "Acciones", sortable: false },
] as const;

type ColumnId = (typeof columns)[number]["id"];

const ROWS_PER_PAGE = 8;

function compareByColumn(a: Category, b: Category, column: ColumnId): number {
  switch (column) {
    case "name":
      return a.name.localeCompare(b.name);
    case "nameEn":
      return (a.nameEn ?? "").localeCompare(b.nameEn ?? "");
    case "slug":
      return a.slug.localeCompare(b.slug);
    case "select":
    case "icon":
    case "actions":
      return 0;
  }
}

interface CategoriesTableProps {
  categories: Category[];
  deletingId: string | null;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}

/**
 * Mismo patrón que `ReportsTable`: `Table` de HeroUI con colección dinámica
 * (`items` + función-hijo), filtros por columna + buscador de texto, y
 * exportación a Excel sobre el conjunto ya filtrado/ordenado. Ver CLAUDE.md
 * ("Listados de administración: tabla + filtros + exportar a Excel").
 */
export function CategoriesTable({
  categories,
  deletingId,
  onEdit,
  onDelete,
}: CategoriesTableProps) {
  const [page, setPage] = useState(1);
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor | null>(
    null,
  );
  const [iconFilter, setIconFilter] = useState("");
  const [search, setSearch] = useState("");
  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set());

  const hasActiveFilters = Boolean(iconFilter || search);

  const clearFilters = () => {
    setIconFilter("");
    setSearch("");
  };

  const filteredCategories = useMemo(() => {
    const query = search.trim().toLowerCase();

    return categories.filter((category) => {
      if (iconFilter === "none" && category.icon) return false;
      if (iconFilter && iconFilter !== "none" && category.icon !== iconFilter)
        return false;
      if (query) {
        const haystack =
          `${category.name} ${category.nameEn ?? ""} ${category.slug}`.toLowerCase();

        if (!haystack.includes(query)) return false;
      }

      return true;
    });
  }, [categories, iconFilter, search]);

  const sortedCategories = useMemo(() => {
    if (!sortDescriptor) return filteredCategories;
    const column = sortDescriptor.column as ColumnId;
    const sorted = [...filteredCategories].sort((a, b) =>
      compareByColumn(a, b, column),
    );

    return sortDescriptor.direction === "descending"
      ? sorted.reverse()
      : sorted;
  }, [filteredCategories, sortDescriptor]);

  const totalPages = Math.max(
    1,
    Math.ceil(sortedCategories.length / ROWS_PER_PAGE),
  );
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  const paginatedItems = useMemo(() => {
    const start = (page - 1) * ROWS_PER_PAGE;

    return sortedCategories.slice(start, start + ROWS_PER_PAGE);
  }, [sortedCategories, page]);

  const start =
    sortedCategories.length === 0 ? 0 : (page - 1) * ROWS_PER_PAGE + 1;
  const end = Math.min(page * ROWS_PER_PAGE, sortedCategories.length);

  useEffect(() => {
    setPage(1);
  }, [iconFilter, search]);

  const handleSortChange = (descriptor: SortDescriptor) => {
    setSortDescriptor(descriptor);
    setPage(1);
  };

  const selectedCount =
    selectedKeys === "all" ? sortedCategories.length : selectedKeys.size;

  const handleExport = () => {
    const rows =
      selectedKeys === "all"
        ? sortedCategories
        : selectedKeys.size > 0
          ? sortedCategories.filter((category) => selectedKeys.has(category.id))
          : sortedCategories;

    exportRowsToExcel(
      "categorias",
      rows.map((category) => ({
        Nombre: category.name,
        "Nombre (inglés)": category.nameEn ?? "",
        Slug: category.slug,
        Icono: category.icon ?? "",
      })),
    );
  };

  const renderCell = (category: Category, columnId: ColumnId) => {
    switch (columnId) {
      case "select":
        return null;
      case "icon": {
        const Icon = getCategoryIcon(category.icon) ?? TagIcon;

        return <Icon className="text-muted" size={18} />;
      }
      case "name":
        return (
          <span className="font-medium text-foreground">{category.name}</span>
        );
      case "nameEn":
        return (
          <span className="text-sm text-muted">{category.nameEn ?? "—"}</span>
        );
      case "slug":
        return <span className="text-xs text-muted">/{category.slug}</span>;
      case "actions":
        return (
          <div className="flex items-center gap-2">
            <Button
              isIconOnly
              aria-label="Editar categoría"
              size="sm"
              variant="secondary"
              onPress={() => onEdit(category)}
            >
              <PencilIcon size={16} />
            </Button>
            <Button
              isIconOnly
              aria-label="Eliminar categoría"
              isDisabled={deletingId === category.id}
              size="sm"
              variant="danger"
              onPress={() => onDelete(category)}
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
        <TextField className="min-w-56" name="search">
          <Label>Buscar</Label>
          <Input
            placeholder="Nombre o slug…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </TextField>

        <div className="flex flex-col gap-1 text-xs">
          <span className="font-medium text-foreground">Icono</span>
          <FilterSelect
            aria-label="Icono"
            items={ICON_FILTER_OPTIONS}
            value={iconFilter}
            onChange={setIconFilter}
          />
        </div>

        <div className="ml-auto flex items-end gap-2">
          {hasActiveFilters && (
            <Button size="sm" variant="tertiary" onPress={clearFilters}>
              Limpiar filtros
            </Button>
          )}
          <Button
            isDisabled={sortedCategories.length === 0}
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

      {sortedCategories.length === 0 ? (
        <p className="text-sm text-muted">
          Ninguna categoría coincide con estos filtros.
        </p>
      ) : (
        <Table>
          <Table.ScrollContainer>
            <Table.Content
              aria-label="Categorías"
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
                    isRowHeader={column.id === "name"}
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
                {(category) => (
                  <Table.Row id={category.id}>
                    <Table.Collection items={columns}>
                      {(column) => (
                        <Table.Cell>
                          {column.id === "select" ? (
                            <SelectionCheckbox />
                          ) : (
                            renderCell(category, column.id)
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
                  {start} a {end} de {sortedCategories.length}
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
