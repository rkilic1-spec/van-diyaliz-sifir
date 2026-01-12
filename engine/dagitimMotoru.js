const fs = require("fs");
const path = require("path");

const DATA = path.join(__dirname, "..", "data");

function oku(dosya) {
  return JSON.parse(
    fs.readFileSync(path.join(DATA, dosya), "utf8")
  );
}

function yaz(dosya, veri) {
  fs.writeFileSync(
    path.join(DATA, dosya),
    JSON.stringify(veri, null, 2)
  );
}

function dagitimYap(hafta) {
  const hastalar = oku("hastalar.json").filter(h => h.aktif);
  const hemsireler = oku("hemsireler.json").filter(h => h.aktif);

  if (hastalar.length === 0) {
    throw new Error("Aktif hasta yok");
  }
  if (hemsireler.length === 0) {
    throw new Error("Aktif hemşire yok");
  }

  let sonuc = [];
  let hIndex = 0;

  for (const hasta of hastalar) {
    const hemsire = hemsireler[hIndex % hemsireler.length];

    sonuc.push({
      hafta,
      hasta: hasta.ad,
      hemsire: hemsire.ad,
      gun: hasta.gun,
      seans: hasta.seans
    });

    hIndex++;
  }

  let dagitimlar = {};
  const dosya = path.join(DATA, "dagitimlar.json");

  if (fs.existsSync(dosya)) {
    dagitimlar = JSON.parse(fs.readFileSync(dosya, "utf8"));
  }

  dagitimlar[hafta] = sonuc;
  yaz("dagitimlar.json", dagitimlar);
}

module.exports = { dagitimYap };
