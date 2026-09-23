import { getDb, ensureTable, formatRow, setCors } from './_db.js';

export default async function handler(req, res) {
  setCors(res);

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Metoda není povolena. Použijte GET.' });
  }

  try {
    await ensureTable();
    const sql = getDb();

    const rows = await sql`
      SELECT * FROM applications
      ORDER BY created_at DESC
    `;

    const apps = rows.map(formatRow);

    const csvHeader = 'ID;Datum odeslání;Jméno žáka;Třída;Email rodiče;Telefon rodiče;Stav přihlášky;Motivace;Interní poznámka';
    const csvLines = [csvHeader];

    for (const a of apps) {
      const cleanMotiv = (a.motivation || '')
        .replace(/;/g, ',')
        .replace(/\r\n|\n/g, ' ')
        .replace(/"/g, '""');

      const cleanNotes = (a.notes || '')
        .replace(/;/g, ',')
        .replace(/\r\n|\n/g, ' ')
        .replace(/"/g, '""');

      const dateStr = a.createdAt ? new Date(a.createdAt).toLocaleString('cs-CZ') : '';

      const line = `${a.id};${dateStr};${a.studentName};${a.studentClass};${a.parentEmail};${a.parentPhone};${a.status};"${cleanMotiv}";"${cleanNotes}"`;
      csvLines.push(line);
    }

    // UTF-8 BOM (\uFEFF) pro správné kódování diakritiky v Excelu
    const csvString = '\uFEFF' + csvLines.join('\r\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="prihlasky_amsterdam_2027.csv"');
    return res.status(200).send(csvString);
  } catch (err) {
    console.error('Chyba při exportu CSV:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Chyba při generování CSV exportu.'
    });
  }
}
