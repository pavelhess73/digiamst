import { getDb, ensureTable, formatRow, setCors } from './_db.js';

// E-mailová validace
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Verifikace Cloudflare Turnstile tokenu na backendu
 */
async function verifyTurnstile(token) {
  const secret = process.env.TURNSTILE_SECRET_KEY;

  // Pokud není secret key nastaven, přeskočíme ověření (vývoj / testing)
  if (!secret) {
    console.warn('[Turnstile] TURNSTILE_SECRET_KEY není nastavena – přeskakuji ověření.');
    return true;
  }

  // Testovací secret klíč od Cloudflare vždy vrací úspěch
  if (secret === '1x0000000000000000000000000000000AA') {
    return true;
  }

  try {
    const formData = new URLSearchParams();
    formData.append('secret', secret);
    formData.append('response', token || '');

    const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    const data = await verifyRes.json();
    return data.success === true;
  } catch (err) {
    console.error('[Turnstile] Chyba při ověřování:', err);
    return false;
  }
}

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

    // =========================================================================
    // 1. HONEYPOT – Pokud je vyplněno, vrátíme falešný úspěch (bot past)
    // =========================================================================
    if (body?.website) {
      console.warn('[Security] Honeypot vyplněn – blokuji request (bot).');
      return res.status(200).json({
        success: true,
        id: `AMS-2027-BOT-${Math.floor(1000 + Math.random() * 9000)}`,
        message: 'Přihláška byla úspěšně přijata.'
      });
    }

    // =========================================================================
    // 2. CLOUDFLARE TURNSTILE ověření
    // =========================================================================
    const turnstileToken = body?.turnstileToken || '';
    const turnstileOk = await verifyTurnstile(turnstileToken);
    if (!turnstileOk) {
      return res.status(400).json({
        success: false,
        error: 'Ověření CAPTCHA selhalo. Obnovte stránku a zkuste to znovu.'
      });
    }

    // =========================================================================
    // 3. ŠKOLNÍ PIN ověření
    // =========================================================================
    const submittedPin = (body?.schoolPin || '').trim().toUpperCase();
    const expectedPin  = (process.env.SCHOOL_PIN || 'AMSTERDAM2027').trim().toUpperCase();

    if (!submittedPin || submittedPin !== expectedPin) {
      return res.status(400).json({
        success: false,
        error: 'Neplatný školní PIN kód. Získej správný kód od učitele IT nebo v Bakalářích.'
      });
    }

    // =========================================================================
    // 4. Validace vstupních dat (XSS ochrana přes parametrizované SQL dotazy)
    // =========================================================================
    const studentName  = (body?.studentName  || '').trim().slice(0, 255);
    const studentClass = (body?.studentClass || '').trim().slice(0, 50);
    const parentEmail  = (body?.parentEmail  || '').trim().slice(0, 255);
    const parentPhone  = (body?.parentPhone  || '').trim().slice(0, 50);
    const motivation   = (body?.motivation   || '').trim().slice(0, 2000);

    if (!studentName) {
      return res.status(400).json({ success: false, error: 'Jméno žáka je povinné.' });
    }

    if (!parentEmail || !EMAIL_REGEX.test(parentEmail)) {
      return res.status(400).json({ success: false, error: 'Zadejte platný e-mail zákonného zástupce.' });
    }

    if (!studentClass) {
      return res.status(400).json({ success: false, error: 'Třída žáka je povinná.' });
    }

    // =========================================================================
    // 5. Uložení do databáze (parametrizované dotazy – ochrana před SQL Injection)
    // =========================================================================
    await ensureTable();
    const sql = getDb();

    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const cleanClass  = studentClass.replace(/\./g, '').toUpperCase();
    const newId       = `AMS-2027-${cleanClass}-${randomCode}`;

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
      error: 'Interní chyba serveru při ukládání přihlášky. Zkuste to prosím znovu.'
    });
  }
}
