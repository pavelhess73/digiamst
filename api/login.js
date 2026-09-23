import { setCors } from './_db.js';

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

    const expectedPassword = process.env.ADMIN_PASSWORD;
    const adminToken = process.env.ADMIN_TOKEN;

    if (!expectedPassword || !adminToken) {
      return res.status(503).json({
        success: false,
        error: 'Administrace není nakonfigurována. Nastavte proměnné ADMIN_PASSWORD a ADMIN_TOKEN na Vercelu.'
      });
    }

    if (body && body.password === expectedPassword) {
      return res.status(200).json({
        success: true,
        token: adminToken,
        message: 'Přihlášení do administrace proběhlo úspěšně.'
      });
    }

    return res.status(401).json({
      success: false,
      error: 'Nesprávné administrátorské heslo.'
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: 'Interní chyba serveru při přihlašování.'
    });
  }
}
