import * as XLSX from "xlsx";

/**
 * Exporta filas ya formateadas (claves = cabeceras de columna) a un .xlsx que
 * el navegador descarga directamente. Usar siempre sobre los datos ya
 * filtrados/ordenados que ve el usuario en la tabla, no sobre el dataset
 * completo sin filtrar.
 */
export function exportRowsToExcel(
  filename: string,
  rows: Record<string, string | number>[],
): void {
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, "Datos");
  XLSX.writeFile(workbook, `${filename}.xlsx`);
}
