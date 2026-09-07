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

app.listen(PORT, () => {
  console.log(`YükRadar backend ${PORT} portunda çalışıyor`);
});