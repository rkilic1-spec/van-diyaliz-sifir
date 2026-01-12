const express = require("express");
const fs = require("fs");
const path = require("path");
const { haftalikDagitimYap } = require("./engine/dagitimMotoru");

const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());
app.use("/data", express.static(path.join(__dirname, "data")));

// HEMŞİRE EKLE
app.post("/admin/hemsire-ekle", (req, res) => {
  const file = path.join(__dirname, "data/hemsireler.json");
  const data = JSON.parse(fs.readFileSync(file, "utf8"));

  data.push({
    id: Date.now(),
    ad: req.body.ad,
    aktif: true
  });

  fs.writeFileSync(file, JSON.stringify(data, null, 2));
  res.send("Hemşire eklendi");
});

// HASTA EKLE
app.post("/admin/hasta-ekle", (req, res) => {
  const file = path.join(__dirname, "data/hastalar.json");
  const data = JSON.parse(fs.readFileSync(file, "utf8"));

  data.push({
    id: Date.now(),
    ad: req.body.ad,
    aktif: true
  });

  fs.writeFileSync(file, JSON.stringify(data, null, 2));
  res.send("Hasta eklendi");
});

// DAĞITIM ÇALIŞTIR
app.post("/admin/dagitim", (req, res) => {
  try {
    haftalikDagitimYap(req.body.hafta);
    res.send("Dağıtım yapıldı");
  } catch (e) {
    res.status(400).send(e.message);
  }
});

// DAĞITIMI GÖR
app.get("/admin/dagitim/:hafta", (req, res) => {
  const file = path.join(__dirname, "data/dagitimlar.json");
  const data = JSON.parse(fs.readFileSync(file, "utf8"));
  res.json(data[req.params.hafta] || []);
});

app.listen(PORT, () =>
  console.log("🚀 Diyaliz sistemi çalışıyor:", PORT)
);
