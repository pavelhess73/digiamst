import { getDb, ensureTable, formatRow, setCors } from './_db.js';

export default async function handler(req, res) {
  setCors(res);

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Metoda není povolena. Použijte POST.' });
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

    const studentName = (body?.studentName || '').trim();
    const studentClass = (body?.studentClass || '').trim();
    const parentEmail = (body?.parentEmail || '').trim();
    const parentPhone = (body?.parentPhone || '').trim();
    const motivation = (body?.motivation || '').trim();

    if (!studentName || !parentEmail) {
      return res.status(400).json({
        success: false,
        error: 'Jméno žáka i e-mail rodiče jsou povinné položky.'
      });
    }

    await ensureTable();
    const sql = getDb();

    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const cleanClass = studentClass ? studentClass.replace(/\./g, '').toUpperCase() : 'ZAK';
    const newId = `AMS-2027-${cleanClass}-${randomCode}`;

    const [inserted] = await sql`
      INSERT INTO applications (
        id, created_at, student_name, student_class, parent_email, parent_phone, motivation, status, notes
      ) VALUES (
        ${newId}, NOW(), ${studentName}, ${studentClass}, ${parentEmail}, ${parentPhone}, ${motivation}, 'Nová', ''
      )
      RETURNING *
    `;

    const formatted = formatRow(inserted);

    return res.status(201).json({
      success: true,
      id: newId,
      message: 'Přihláška byla úspěšně uložena do databáze.',
      data: formatted
    });
  } catch (err) {
    console.error('Chyba při registraci:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Chyba při ukládání přihlášky do databáze.'
    });
  }
}
