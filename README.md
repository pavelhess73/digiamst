# Erasmus+ Amsterdam 2027 – ZŠ MOLEKULA

Webová prezentace, přihlašovací systém a administrační portál pro skupinovou mobilitu žáků 2. stupně v Amsterdamu v rámci programu Erasmus+.

## 🚀 O projektu

- **Interaktivní landing page** s představením programu, harmonogramu, kritérií výběru a online přihláškou.
- **Administrační rozhraní (`admin.html`)** pro správu přihlášek žáků, hodnocení, filtrování, export do CSV a tisk/PDF.
- **Lokální PowerShell server & REST API (`server.ps1`)** zajišťující ukládání a načítání přihlášek (`data/applications.json`) bez nutnosti instalovat externí závislosti jako Node.js nebo Python.

## 📁 Struktura projektu

- `index.html` – Hlavní webová stránka a formulář přihlášky
- `script.js` – Logika pro hlavní stránku a odesílání přihlášek
- `styles.css` – Doplňkové styly k Tailwind CSS
- `admin.html` – Administrační nástěnka pro pedagogy
- `admin.js` – Logika administrace, filtrování, stavové změny a exporty
- `server.ps1` – Jednoduchý HTTP server a REST API v PowerShellu
- `data/applications.json` – Databáze přihlášek (JSON úložiště)

## 💻 Spuštění lokálně

### Spuštění se serverem (doporučeno):
Ve Windows PowerShellu spusťte:
```powershell
.\server.ps1
```
Server poběží na adrese:
- Hlavní stránka: `http://localhost:8080/`
- Administrace: `http://localhost:8080/admin.html`
