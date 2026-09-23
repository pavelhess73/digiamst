import { getDb, ensureTable, formatRow, setCors } from './_db.js';

export default async function handler(req, res) {
  setCors(res);

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        body = {};
      }
    }

    await ensureTable();
    const sql = getDb();

    // -------------------------------------------------------------------------
    // GET: Seznam všech přihlášek
    // -------------------------------------------------------------------------
    if (req.method === 'GET') {
      const rows = await sql`
        SELECT * FROM applications
        ORDER BY created_at DESC
      `;

      return res.status(200).json({
        success: true,
        count: rows.length,
        data: rows.map(formatRow)
      });
    }

    // -------------------------------------------------------------------------
    // PATCH: Úprava stavu nebo poznámky přihlášky
    // -------------------------------------------------------------------------
    if (req.method === 'PATCH') {
      const id = body?.id || req.query?.id;
      const status = body?.status;
      const notes = body?.notes;

      if (!id) {
        return res.status(400).json({ success: false, error: 'Nebylo předáno ID přihlášky.' });
      }

      const rows = await sql`
        UPDATE applications
        SET
          status = CASE WHEN ${status !== undefined} THEN ${status} ELSE status END,
          notes = CASE WHEN ${notes !== undefined} THEN ${notes} ELSE notes END
        WHERE id = ${id}
        RETURNING id
      `;

      if (rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: `Přihláška s ID ${id} nebyla nalezena.`
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Záznam byl úspěšně aktualizován.'
      });
    }

    // -------------------------------------------------------------------------
    // DELETE: Smazání přihlášky
    // -------------------------------------------------------------------------
    if (req.method === 'DELETE') {
      const id = body?.id || req.query?.id;

      if (!id) {
        return res.status(400).json({ success: false, error: 'Nebylo předáno ID přihlášky ke smazání.' });
      }

      const rows = await sql`
        DELETE FROM applications
        WHERE id = ${id}
        RETURNING id
      `;

      if (rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: `Přihláška s ID ${id} nebyla nalezena.`
        });
      }

      return res.status(200).json({
        success: true,
        message: `Přihláška ${id} byla smazána.`
      });
    }

    return res.status(405).json({
      success: false,
      error: `Metoda ${req.method} není podporována.`
    });
  } catch (err) {
    console.error('Chyba v /api/applications:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Chyba při práci s databází.'
    });
  }
}
