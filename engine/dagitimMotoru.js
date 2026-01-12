const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "..", "data");
const HASTA_FILE = path.join(DATA_DIR, "hastalar.json");
const HEMSIRE_FILE = path.join(DATA_DIR, "hemsireler.json");
const DAGITIM_FILE = path.join(DATA_DIR, "dagitimlar.json");

function oku(file, def) {
  if (!fs.existsSync(file)) return def;
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function yaz(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

function haftalikDagitimYap(hafta) {
  const hastalar = oku(HASTA_FILE, []);
  const hemsireler = oku(HEMSIRE_FILE, []);
  const dagitimlar = oku(DAGITIM_FILE, {});

  if (hastalar.length === 0 || hemsireler.length === 0) {
    throw new Error("Hasta veya hemşire yok");
  }

  dagitimlar[hafta] = [];

  let i = 0;
  for (const hasta of hastalar.filter(h => h.aktif)) {
    const hemsire = hemsireler[i % hemsireler.length];

    dagitimlar[hafta].push({
      hasta: hasta.ad,
      hemsire: hemsire.ad
    });

    i++;
  }

  yaz(DAGITIM_FILE, dagitimlar);
}

module.exports = { haftalikDagitimYap };
