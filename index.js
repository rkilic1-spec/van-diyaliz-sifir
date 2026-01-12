const express = require("express");
const session = require("express-session");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(
  session({
    secret: "diyaliz-secret",
    resave: false,
    saveUninitialized: true
  })
);

const DATA = (f) => path.join(__dirname, "data", f);

// ROOT
app.get("/", (req, res) => {
  res.send("🚀 Diyaliz sistemi çalışıyor");
});

// LOGIN
app.get("/login", (req, res) => {
  res.send(`
    <form method="POST">
      <input name="user" placeholder="admin">
      <input name="pass" type="password">
      <button>Giriş</button>
    </form>
  `);
});

app.post("/login", (req, res) => {
  if (req.body.user === "admin" && req.body.pass === "1234") {
    req.session.admin = true;
    return res.redirect("/admin");
  }
  res.send("Hatalı giriş");
});

// ADMIN
app.get("/admin", (req, res) => {
  if (!req.session.admin) return res.redirect("/login");
  res.send(`
    <h1>Admin</h1>
    <form method="POST" action="/dagitim">
      <input name="hafta" value="2026-01-HAFTA-1">
      <button>Dağıtımı Çalıştır</button>
    </form>
    <a href="/dagitim/2026-01-HAFTA-1">Dağıtımı Gör</a>
  `);
});

// DAGITIM
app.post("/dagitim", (req, res) => {
  const hafta = req.body.hafta;
  const dagitimlar = {};
  dagitimlar[hafta] = [
    { hasta: "Örnek Hasta", hemsire: "Örnek Hemşire" }
  ];
  fs.writeFileSync(DATA("dagitimlar.json"), JSON.stringify(dagitimlar, null, 2));
  res.send("Dağıtım yapıldı");
});

app.get("/dagitim/:hafta", (req, res) => {
  if (!fs.existsSync(DATA("dagitimlar.json"))) return res.json([]);
  const d = JSON.parse(fs.readFileSync(DATA("dagitimlar.json")));
  res.json(d[req.params.hafta] || []);
});

app.listen(PORT, () => {
  console.log("✅ Server çalışıyor:", PORT);
});

const readJSON = (file, def) => {
  if (!fs.existsSync(file)) return def;
  return JSON.parse(fs.readFileSync(file));
};

const writeJSON = (file, data) => {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
};
app.get("/admin/hemsire", (req, res) => {
  if (!req.session.admin) return res.redirect("/login");

  res.send(`
    <h2>Hemşire Ekle</h2>
    <form method="POST">
      <input name="ad" placeholder="Ad Soyad">
      <button>Ekle</button>
    </form>
    <a href="/admin">Geri</a>
  `);
});
app.post("/admin/hemsire", (req, res) => {
  const file = DATA("hemsireler.json");
  const hemsireler = readJSON(file, []);

  hemsireler.push({
    id: Date.now(),
    ad: req.body.ad,
    aktif: true
  });

  writeJSON(file, hemsireler);
  res.redirect("/admin/hemsire");
});
app.get("/admin/hasta", (req, res) => {
  if (!req.session.admin) return res.redirect("/login");

  res.send(`
    <h2>Hasta Ekle</h2>
    <form method="POST">
      <input name="ad" placeholder="Hasta Adı">
      <select name="gun">
        <option>Pzt-Çar-Cum</option>
        <option>Sal-Per-Cts</option>
      </select>
      <select name="seans">
        <option>Sabah</option>
        <option>Öğle</option>
      </select>
      <button>Ekle</button>
    </form>
    <a href="/admin">Geri</a>
  `);
});
app.post("/admin/hasta", (req, res) => {
  const file = DATA("hastalar.json");
  const hastalar = readJSON(file, []);

  hastalar.push({
    id: Date.now(),
    ad: req.body.ad,
    gun: req.body.gun,
    seans: req.body.seans,
    aktif: true
  });

  writeJSON(file, hastalar);
  res.redirect("/admin/hasta");
});

