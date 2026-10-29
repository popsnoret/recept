// Handles user registration and login.
// Validates input, hashes passwords, and issues JWT tokens
// when users successfully authenticate.

const express = require("express");
const bcrypt = require("bcryptjs");
const pool = require("../config/database");
const jwt = require("jsonwebtoken");

const router = express.Router();

// Registrera en ny användare
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Kontrollera att alla fält är ifyllda
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Namn, e-post och lösenord måste fyllas i.",
      });
    }

    // Kontrollera längden på uppgifterna
    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      name.trim().length === 0 ||
      name.trim().length > 100 ||
      email.trim().length > 255 ||
      password.length < 8 ||
      password.length > 72
    ) {
      return res.status(400).json({
        message: "Kontrollera uppgifterna. Lösenordet måste vara minst 8 tecken.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Kontrollera att e-postadressen har ett rimligt format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return res.status(400).json({
        message: "Ange en giltig e-postadress.",
      });
    }

    // Kontrollera om e-postadressen redan används
    const [existingUsers] = await pool.query("SELECT id FROM users WHERE email = ?", [normalizedEmail]);

    if (existingUsers.length > 0) {
      return res.status(409).json({
        message: "E-postadressen är redan registrerad.",
      });
    }

    // Hasha lösenordet innan det sparas
    const passwordHash = await bcrypt.hash(password, 12);

    const [result] = await pool.query("INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)", [name.trim(), normalizedEmail, passwordHash]);

    // Skicka aldrig lösenordet eller lösenordshashen till klienten
    return res.status(201).json({
      message: "Kontot har skapats.",
      user: {
        id: result.insertId,
        name: name.trim(),
        email: normalizedEmail,
      },
    });
  } catch (error) {
    console.error("Registreringsfel:", error.message);

    return res.status(500).json({
      message: "Ett fel uppstod vid registreringen.",
    });
  }
});

// Logga in en användare
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (typeof email !== "string" || typeof password !== "string" || !email.trim() || !password || password.length > 72) {
      return res.status(400).json({
        message: "Ange e-postadress och lösenord.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const [users] = await pool.query("SELECT id, name, email, password_hash FROM users WHERE email = ?", [normalizedEmail]);

    if (users.length === 0) {
      return res.status(401).json({
        message: "Fel e-postadress eller lösenord.",
      });
    }

    const user = users[0];

    // Jämför lösenordet med den sparade hashen
    const passwordMatches = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatches) {
      return res.status(401).json({
        message: "Fel e-postadress eller lösenord.",
      });
    }

    const token = jwt.sign(
      {
        userId: user.id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "2h",
      },
    );

    return res.status(200).json({
      message: "Du är inloggad.",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Inloggningsfel:", error.message);

    return res.status(500).json({
      message: "Ett fel uppstod vid inloggningen.",
    });
  }
});

module.exports = router;
