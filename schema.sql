-- =============================================================================
-- Erasmus+ Amsterdam 2027 | ZŠ MOLEKULA
-- PostgreSQL Schema pro Neon.tech
-- =============================================================================

-- Vytvoření tabulky přihlášek
CREATE TABLE IF NOT EXISTS applications (
  id VARCHAR(64) PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  student_name VARCHAR(255) NOT NULL,
  student_class VARCHAR(50) NOT NULL,
  parent_email VARCHAR(255) NOT NULL,
  parent_phone VARCHAR(50) DEFAULT '',
  motivation TEXT DEFAULT '',
  status VARCHAR(50) NOT NULL DEFAULT 'Nová',
  notes TEXT DEFAULT ''
);

-- Indexy pro vyhledávání a filtrování
CREATE INDEX IF NOT EXISTS idx_applications_created_at ON applications (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications (status);
CREATE INDEX IF NOT EXISTS idx_applications_class ON applications (student_class);

-- Výchozí ukázková data (volitelné – nespustí se duplicitně díky ON CONFLICT)
INSERT INTO applications (id, created_at, student_name, student_class, parent_email, parent_phone, motivation, status, notes)
VALUES
  (
    'AMS-2027-8A-4219',
    '2026-09-22T14:30:00.000Z',
    'Lucie Dvořáková',
    '8.A',
    'dvorakova.jana@seznam.cz',
    '+420 776 123 456',
    'Moc ráda bych viděla Nxt Museum a zkusila tvořit multimediální obsah s generativní AI. Ráda fotím na mobilu a tvořím příspěvky v Canvě.',
    'Přijat do týmu',
    'Skvělé portfolio v Canvě, spolehlivá, dobrá úroveň angličtiny.'
  ),
  (
    'AMS-2027-7B-8912',
    '2026-09-23T08:15:00.000Z',
    'Matyáš Král',
    '7.B',
    'petr.kral@gmail.com',
    '+420 608 987 654',
    'Zajímá mě NEMO muzeum a technologie. Chci vidět, jak se učí informatika v Nizozemsku a zlepšit se v mluvení anglicky.',
    'Pozván k rozhovoru',
    'Zájem o technické experimenty. Pozvánka odeslána na 14:15.'
  ),
  (
    'AMS-2027-9A-1045',
    '2026-09-23T09:40:00.000Z',
    'Sofie Černá',
    '9.A',
    'cerna.eva@email.cz',
    '+420 732 445 566',
    'Baví mě architektura a digitální fotografie. V Amsterdamu bych chtěla vytvořit fotoreportáž o městských kanálech a lidech na kolech.',
    'Nová',
    ''
  ),
  (
    'AMS-2027-7A-2535',
    '2026-09-23T09:54:04.000Z',
    'Jakub Veselý',
    '7.A',
    'vesely.jakub@email.cz',
    '+420 777 888 999',
    'Chci zažít NEMO muzeum a tvořit v Canvě expediční deník.',
    'Nová',
    ''
  )
ON CONFLICT (id) DO NOTHING;
