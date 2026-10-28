const express = require("express");
const pool = require("./config/database");
const authRoutes = require("./routes/auth");

const app = express();
const PORT = 3000;

app.use(express.json());

// Registrering och inloggning
app.use("/api/auth", authRoutes);

// Testa att API:t fungerar
app.get("/", (req, res) => {
  res.json({ message: "Receptappens API fungerar!" });
});

// Kontrollera att API:t kan ansluta till databasen
app.get("/api/health", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT 1 AS result");

    res.json({
      message: "API och databas fungerar!",
      database: rows[0].result === 1 ? "connected" : "error",
    });
  } catch (error) {
    console.error("Databasfel:", error.message);

    res.status(500).json({
      message: "Kunde inte ansluta till databasen.",
    });
  }
});

// Enkel test-endpoint
app.get("/test", (req, res) => {
  res.send("Test fungerar!");
});

// Starta servern
app.listen(PORT, () => {
  console.log(`API:t körs på http://localhost:${PORT}`);
});
