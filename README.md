# Erasmus+ Amsterdam 2027 – ZŠ MOLEKULA

Webová prezentace, přihlašovací systém a administrační portál pro skupinovou mobilitu žáků 2. stupně v Amsterdamu v rámci programu Erasmus+.

Projekt je připraven pro nasazení do produkce na **Vercel** s cloudovou databází **PostgreSQL na Neon.tech**.

---

## 🚀 Architektura projektu

- **Frontend**: Responzivní web v Tailwind CSS s Lucide ikonami (`index.html` pro žáky a rodiče, `admin.html` pro pedagogy a koordinátory).
- **Backend**: Vercel Serverless Functions (`/api/*`) napsané v moderním Node.js (ESM).
- **Databáze**: Serverless PostgreSQL na [Neon.tech](https://neon.tech) s ovladačem `@neondatabase/serverless` a automatickou inicializací tabulky.
- **Záložní lokální režim**: Pro offline prezentaci bez cloudu lze stále spustit původní lokální PowerShell server `server.ps1`.

---

## ⚡ Nasazení na Vercel & Neon.tech (krok za krokem)

### 1. Vytvoření databáze na Neon.tech
1. Zaregistrujte se nebo se přihlaste na [neon.tech](https://neon.tech).
2. Vytvořte nový projekt (např. `digiamst`).
3. V sekci **Dashboard** nebo **Connection Details** zkopírujte připojovací řetězec (**Connection String / Pooled connection**).
   Formát vypadá takto:
   ```text
   postgresql://neondb_owner:heslo@ep-nazev-123456.eu-central-1.aws.neon.tech/neondb?sslmode=require
   ```
4. *(Volitelné)*: V záložce **SQL Editor** na Neonu můžete spustit připravený skript [`schema.sql`](./schema.sql), který vloží výchozí ukázkové přihlášky. (Pokud ho nespustíte, tabulka se při prvním odeslání nebo načtení vytvoří automaticky).

### 2. Import a nasazení na Vercel
1. Otevřete [Vercel Dashboard](https://vercel.com/dashboard) a klikněte na **Add New... -> Project**.
2. Vyberte váš GitHub repozitář `pavelhess73/digiamst`.
3. V sekci **Environment Variables** přidejte:
   - **`DATABASE_URL`**: Váš connection string z Neon.tech (viz krok 1).
   - *(Volitelné)* **`ADMIN_PASSWORD`**: Vlastní heslo pro vstup do administrace (pokud nezadáte, platí výchozí: `molekula2027`).
4. Klikněte na **Deploy**. Vercel automaticky nasadí statické stránky i serverless API.

---

## 📁 Struktura souborů

```text
├── api/
│   ├── _db.js           # Sdílený modul pro Neon PostgreSQL a auto-migraci
│   ├── login.js         # POST /api/login (ověření admin hesla)
│   ├── register.js      # POST /api/register (uložení přihlášky žáka)
│   ├── applications.js  # GET, PATCH, DELETE /api/applications (správa záznamů)
│   └── export.js        # GET /api/export (stažení CSV v UTF-8 s BOM pro Excel)
├── data/
│   └── applications.json# Lokální JSON soubor (používaný pro server.ps1)
├── index.html           # Hlavní prezentační web a přihlašovací formulář
├── script.js            # Interaktivní logika hlavní stránky
├── admin.html           # Administrační nástěnka pro koordinátory
├── admin.js             # Logika administrace, filtrování, modální okna
├── styles.css           # Doplňkové animace a skleněný efekt (glassmorphism)
├── schema.sql           # SQL definice tabulky a ukázková data pro PostgreSQL
├── vercel.json          # Konfigurace pro Vercel
├── package.json         # Konfigurace závislostí (@neondatabase/serverless)
├── .env.example         # Šablona proměnných prostředí
└── server.ps1           # Lokální PowerShell web server pro offline režim
```

---

## 🔒 Administrace

- **URL**: `/admin.html` (nebo `/admin` na Vercelu)
- **Výchozí heslo**: `molekula2027` (lze změnit přes proměnnou `ADMIN_PASSWORD` na Vercelu)
- **Funkce**:
  - Filtrování podle stavu (Nová, Pozván k rozhovoru, Přijat do týmu, Náhradník, Zamítnuto) a třídy (7., 8., 9. ročník).
  - Fulltextové vyhledávání podle jména, e-mailu či ID.
  - Zápis interních poznámek koordinátora / ŠPP.
  - Export kompletní databáze do Excelu jedním kliknutím (`.csv` v UTF-8 BOM).
