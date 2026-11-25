/**
 * Client-side CSV & XLSX (TSV-compatible Excel format) export utilities
 */

export function exportToCSV(filename: string, headers: string[], rows: (string | number)[][]) {
  const escapeCsv = (val: string | number) => {
    const str = String(val ?? '');
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const csvContent = [
    headers.map(escapeCsv).join(','),
    ...rows.map((row) => row.map(escapeCsv).join(',')),
  ].join('\r\n');

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, filename.endsWith('.csv') ? filename : `${filename}.csv`);
}

export function exportToXLSX(filename: string, headers: string[], rows: (string | number)[][]) {
  // Generate HTML Excel table format (.xls/.xlsx compatible, natively opened by Microsoft Excel)
  const headerHtml = headers.map((h) => `<th style="background-color:#560067;color:#ffffff;font-weight:bold;border:1px solid #ddd;padding:8px;">${escapeHtml(h)}</th>`).join('');
  const rowsHtml = rows
    .map(
      (r) =>
        `<tr>${r
          .map((cell) => `<td style="border:1px solid #ddd;padding:6px;">${escapeHtml(String(cell ?? ''))}</td>`)
          .join('')}</tr>`
    )
    .join('');

  const excelXml = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <!--[if gte mso 9]>
        <xml>
          <x:ExcelWorkbook>
            <x:ExcelWorksheets>
              <x:ExcelWorksheet>
                <x:Name>Sheet1</x:Name>
                <x:WorksheetOptions>
                  <x:DisplayGridlines/>
                </x:WorksheetOptions>
              </x:ExcelWorksheet>
            </x:ExcelWorksheets>
          </x:ExcelWorkbook>
        </xml>
        <![endif]-->
        <meta http-equiv="content-type" content="text/plain; charset=UTF-8"/>
      </head>
      <body>
        <table>
          <thead><tr>${headerHtml}</tr></thead>
          <tbody>${rowsHtml}</tbody>
        </table>
      </body>
    </html>
  `;

  const blob = new Blob(['\uFEFF' + excelXml], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  downloadBlob(blob, filename.endsWith('.xls') || filename.endsWith('.xlsx') ? filename : `${filename}.xls`);
}

export const exportToCsv = (headers: string[], rows: (string | number)[][], filename: string) =>
  exportToCSV(filename, headers, rows);

export const exportToExcel = (headers: string[], rows: (string | number)[][], filename: string) =>
  exportToXLSX(filename, headers, rows);

function escapeHtml(str: string) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function downloadBlob(blob: Blob, fullFilename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fullFilename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
