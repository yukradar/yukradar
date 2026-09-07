const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/api/yukler", (req, res) => {
  res.json({
    success: true,
    message: "YükRadar yük sistemi çalışıyor",
    yukler: []
  });
});

app.get("/", (req, res) => {
  res.send("YükRadar Backend çalışıyor 🚚");
});
const gelenYukler = [];

app.post("/api/kaynaklar/yuk", (req, res) => {
  const yuk = req.body;

  gelenYukler.push({
    id: Date.now(),
    ...yuk,
    alindi: new Date().toISOString()
  });

  res.json({
    success: true,
    message: "Yük YükRadar'a alındı",
    yuk
  });
});
app.listen(PORT, () => {
  console.log(`YükRadar backend ${PORT} portunda çalışıyor`);
});