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

import { AdminRoleName, AdminUser } from "@/config/admin-api";
import {
  BanIcon,
  CheckIcon,
  ExcelIcon,
  PencilIcon,
  TrashIcon,
} from "@/components/icons";
import { FilterSelect } from "@/components/admin/filter-select";
import { SelectionCheckbox } from "@/components/admin/selection-checkbox";
import { exportRowsToExcel } from "@/lib/export-excel";

const ROLE_FILTER_OPTIONS = [
  { id: "", label: "Todos" },
  { id: "developer", label: "Desarrollador" },
  { id: "photographer", label: "Fotógrafo" },
];

const STATUS_FILTER_OPTIONS = [
  { id: "", label: "Todos" },
  { id: "active", label: "Activo" },
  { id: "inactive", label: "Inactivo" },
];

const ROLE_LABELS: Record<AdminRoleName, string> = {
  developer: "Desarrollador",
  photographer: "Fotógrafo",
};

const columns = [
  { id: "select", name: "", sortable: false },
  { id: "name", name: "Nombre", sortable: true },
  { id: "email", name: "Email", sortable: true },
  { id: "role", name: "Rol", sortable: true },
  { id: "status", name: "Estado", sortable: true },
  { id: "actions", name: "Acciones", sortable: false },
] as const;

type ColumnId = (typeof columns)[number]["id"];

const ROWS_PER_PAGE = 8;

function displayName(user: AdminUser): string {
  return user.profile?.displayName ?? user.email;
}

function compareByColumn(a: AdminUser, b: AdminUser, column: ColumnId): number {
  switch (column) {
    case "name":
      return displayName(a).localeCompare(displayName(b));
    case "email":
      return a.email.localeCompare(b.email);
    case "role":
      return ROLE_LABELS[a.role.name].localeCompare(ROLE_LABELS[b.role.name]);
    case "status":
      return Number(a.isActive) - Number(b.isActive);
    case "select":
    case "actions":
      return 0;
  }
}

interface UsersTableProps {
  users: AdminUser[];
  currentUserId: string | undefined;
  onEdit: (user: AdminUser) => void;
  onDelete: (user: AdminUser) => void;
  onToggleActive: (user: AdminUser) => void;
}

/**
 * Mismo patrón que `ReportsTable`/`CategoriesTable`/`CommentsTable`: `Table`
 * de HeroUI con colección dinámica (`items` + función-hijo), filtros por
 * columna + buscador de texto, y exportación a Excel sobre el conjunto ya
 * filtrado/ordenado.
 */
export function UsersTable({
  users,
  currentUserId,
  onEdit,
  onDelete,
  onToggleActive,
}: UsersTableProps) {
  const [page, setPage] = useState(1);
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor | null>(
    null,
  );
  const [roleFilter, setRoleFilter] = useState<AdminRoleName | "">("");
  const [statusFilter, setStatusFilter] = useState<"active" | "inactive" | "">(
    "",
  );
  const [search, setSearch] = useState("");
  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set());

  const hasActiveFilters = Boolean(roleFilter || statusFilter || search);

  const clearFilters = () => {
    setRoleFilter("");
    setStatusFilter("");
    setSearch("");
  };

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return users.filter((user) => {
      if (roleFilter && user.role.name !== roleFilter) return false;
      if (statusFilter === "active" && !user.isActive) return false;
      if (statusFilter === "inactive" && user.isActive) return false;
      if (query) {
        const haystack = `${displayName(user)} ${user.email}`.toLowerCase();

        if (!haystack.includes(query)) return false;
      }

      return true;
    });
  }, [users, roleFilter, statusFilter, search]);

  const sortedUsers = useMemo(() => {
    if (!sortDescriptor) return filteredUsers;
    const column = sortDescriptor.column as ColumnId;
    const sorted = [...filteredUsers].sort((a, b) =>
      compareByColumn(a, b, column),
    );

    return sortDescriptor.direction === "descending"
      ? sorted.reverse()
      : sorted;
  }, [filteredUsers, sortDescriptor]);

  const totalPages = Math.max(1, Math.ceil(sortedUsers.length / ROWS_PER_PAGE));
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  const paginatedItems = useMemo(() => {
    const start = (page - 1) * ROWS_PER_PAGE;

    return sortedUsers.slice(start, start + ROWS_PER_PAGE);
  }, [sortedUsers, page]);

  const start = sortedUsers.length === 0 ? 0 : (page - 1) * ROWS_PER_PAGE + 1;
  const end = Math.min(page * ROWS_PER_PAGE, sortedUsers.length);

  useEffect(() => {
    setPage(1);
  }, [roleFilter, statusFilter, search]);

  const handleSortChange = (descriptor: SortDescriptor) => {
    setSortDescriptor(descriptor);
    setPage(1);
  };

  const selectedCount =
    selectedKeys === "all" ? sortedUsers.length : selectedKeys.size;

  const handleExport = () => {
    const rows =
      selectedKeys === "all"
        ? sortedUsers
        : selectedKeys.size > 0
          ? sortedUsers.filter((user) => selectedKeys.has(user.id))
          : sortedUsers;

    exportRowsToExcel(
      "usuarios",
      rows.map((user) => ({
        Nombre: displayName(user),
        Email: user.email,
        Rol: ROLE_LABELS[user.role.name],
        Estado: user.isActive ? "Activo" : "Inactivo",
      })),
    );
  };

  const renderCell = (user: AdminUser, columnId: ColumnId) => {
    switch (columnId) {
      case "select":
        return null;
      case "name":
        return (
          <span className="font-medium text-foreground">
            {displayName(user)}
          </span>
        );
      case "email":
        return <span className="text-sm text-muted">{user.email}</span>;
      case "role":
        return (
          <Chip size="sm" variant="secondary">
            {ROLE_LABELS[user.role.name]}
          </Chip>
        );
      case "status":
        return (
          <Chip color={user.isActive ? "success" : "danger"} size="sm">
            {user.isActive ? "Activo" : "Inactivo"}
          </Chip>
        );
      case "actions":
        return (
          <div className="flex items-center gap-2">
            <Button
              isIconOnly
              aria-label={
                user.isActive ? "Desactivar usuario" : "Activar usuario"
              }
              size="sm"
              variant="secondary"
              onPress={() => onToggleActive(user)}
            >
              {user.isActive ? <BanIcon size={16} /> : <CheckIcon size={16} />}
            </Button>
            <Button
              isIconOnly
              aria-label="Editar usuario"
              size="sm"
              variant="secondary"
              onPress={() => onEdit(user)}
            >
              <PencilIcon size={16} />
            </Button>
            <Button
              isIconOnly
              aria-label="Eliminar usuario"
              isDisabled={user.id === currentUserId}
              size="sm"
              variant="danger"
              onPress={() => onDelete(user)}
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
            placeholder="Nombre o email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </TextField>

        <div className="flex flex-col gap-1 text-xs">
          <span className="font-medium text-foreground">Rol</span>
          <FilterSelect
            aria-label="Rol"
            items={ROLE_FILTER_OPTIONS}
            value={roleFilter}
            onChange={(value) => setRoleFilter(value as AdminRoleName | "")}
          />
        </div>

        <div className="flex flex-col gap-1 text-xs">
          <span className="font-medium text-foreground">Estado</span>
          <FilterSelect
            aria-label="Estado"
            items={STATUS_FILTER_OPTIONS}
            value={statusFilter}
            onChange={(value) =>
              setStatusFilter(value as "active" | "inactive" | "")
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
            isDisabled={sortedUsers.length === 0}
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

      {sortedUsers.length === 0 ? (
        <p className="text-sm text-muted">
          Ningún usuario coincide con estos filtros.
        </p>
      ) : (
        <Table>
          <Table.ScrollContainer>
            <Table.Content
              aria-label="Usuarios"
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
                {(user) => (
                  <Table.Row id={user.id}>
                    <Table.Collection items={columns}>
                      {(column) => (
                        <Table.Cell>
                          {column.id === "select" ? (
                            <SelectionCheckbox />
                          ) : (
                            renderCell(user, column.id)
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
                  {start} a {end} de {sortedUsers.length}
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
