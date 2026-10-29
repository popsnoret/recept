const express = require("express");
const pool = require("../config/database");
const authenticateToken = require("../middleware/auth");

const router = express.Router();

// Alla recept kräver inloggning.
router.use(authenticateToken);

// Hämta alla recept som tillhör den inloggade användaren
router.get("/", async (req, res) => {
  try {
    const [recipes] = await pool.query("SELECT * FROM recipes WHERE user_id = ? ORDER BY id DESC", [req.user.id]);

    res.status(200).json(recipes);
  } catch (error) {
    console.error("Fel vid hämtning av recept:", error.message);
    res.status(500).json({ message: "Kunde inte hämta recepten." });
  }
});

// Skapa ett nytt recept
router.post("/", async (req, res) => {
  try {
    const { title, description, ingredients, instructions } = req.body;

    if (
      typeof title !== "string" ||
      !title.trim() ||
      title.trim().length > 255 ||
      typeof description !== "string" ||
      typeof ingredients !== "string" ||
      typeof instructions !== "string" ||
      !description.trim() ||
      !ingredients.trim() ||
      !instructions.trim()
    ) {
      return res.status(400).json({
        message: "Fyll i titel, beskrivning, ingredienser och instruktioner.",
      });
    }

    const [result] = await pool.query(
      `INSERT INTO recipes
        (user_id, title, description, ingredients, instructions)
       VALUES (?, ?, ?, ?, ?)`,
      [req.user.id, title.trim(), description.trim(), ingredients.trim(), instructions.trim()],
    );

    return res.status(201).json({
      message: "Receptet har skapats.",
      recipe: {
        id: result.insertId,
        user_id: req.user.id,
        title: title.trim(),
        description: description.trim(),
        ingredients: ingredients.trim(),
        instructions: instructions.trim(),
      },
    });
  } catch (error) {
    console.error("Fel vid skapande av recept:", error.message);
    return res.status(500).json({
      message: "Kunde inte skapa receptet.",
    });
  }
});

// Hämta ett enskilt recept
router.get("/:id", async (req, res) => {
  try {
    const recipeId = Number(req.params.id);

    if (!Number.isInteger(recipeId) || recipeId < 1) {
      return res.status(400).json({
        message: "Ogiltigt recept-ID.",
      });
    }

    const [recipes] = await pool.query("SELECT * FROM recipes WHERE id = ? AND user_id = ?", [recipeId, req.user.id]);

    if (recipes.length === 0) {
      return res.status(404).json({
        message: "Receptet hittades inte.",
      });
    }

    return res.status(200).json(recipes[0]);
  } catch (error) {
    console.error("Fel vid hämtning av recept:", error.message);

    return res.status(500).json({
      message: "Kunde inte hämta receptet.",
    });
  }
});

// Uppdatera ett befintligt recept
router.put("/:id", async (req, res) => {
  try {
    const recipeId = Number(req.params.id);
    const { title, description, ingredients, instructions } = req.body;

    if (!Number.isInteger(recipeId) || recipeId < 1) {
      return res.status(400).json({
        message: "Ogiltigt recept-ID.",
      });
    }

    if (
      typeof title !== "string" ||
      !title.trim() ||
      title.trim().length > 255 ||
      typeof description !== "string" ||
      !description.trim() ||
      typeof ingredients !== "string" ||
      !ingredients.trim() ||
      typeof instructions !== "string" ||
      !instructions.trim()
    ) {
      return res.status(400).json({
        message: "Fyll i titel, beskrivning, ingredienser och instruktioner.",
      });
    }

    const [result] = await pool.query(
      `UPDATE recipes
       SET title = ?, description = ?, ingredients = ?
           , instructions = ?
       WHERE id = ? AND user_id = ?`,
      [title.trim(), description.trim(), ingredients.trim(), instructions.trim(), recipeId, req.user.id],
    );

    if (result.affectedRows === 0) {
      const [recipes] = await pool.query("SELECT id FROM recipes WHERE id = ? AND user_id = ?", [recipeId, req.user.id]);

      if (recipes.length === 0) {
        return res.status(404).json({
          message: "Receptet hittades inte.",
        });
      }
    }

    return res.status(200).json({
      message: "Receptet har uppdaterats.",
    });
  } catch (error) {
    console.error("Fel vid uppdatering av recept:", error.message);

    return res.status(500).json({
      message: "Kunde inte uppdatera receptet.",
    });
  }
});

// Radera ett recept
router.delete("/:id", async (req, res) => {
  try {
    const recipeId = Number(req.params.id);

    if (!Number.isInteger(recipeId) || recipeId < 1) {
      return res.status(400).json({
        message: "Ogiltigt recept-ID.",
      });
    }

    const [result] = await pool.query("DELETE FROM recipes WHERE id = ? AND user_id = ?", [recipeId, req.user.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Receptet hittades inte.",
      });
    }

    return res.status(200).json({
      message: "Receptet har raderats.",
    });
  } catch (error) {
    console.error("Fel vid radering av recept:", error.message);

    return res.status(500).json({
      message: "Kunde inte radera receptet.",
    });
  }
});

module.exports = router;
