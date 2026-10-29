const express = require("express");
const pool = require("../config/database");
const authenticateToken = require("../middleware/auth");

const router = express.Router();

router.use(authenticateToken);

// Omvandla ingredienser och instruktioner från databasen till listor.
function parseList(value) {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);

    if (Array.isArray(parsed)) {
      return parsed.map((item, index) => (typeof item === "string" ? { id: index + 1, text: item } : { id: item.id ?? index + 1, text: item.text ?? "" }));
    }
  } catch {
    // Äldre recept kan innehålla vanlig text i stället för JSON.
  }

  return String(value)
    .split("\n")
    .map((text, index) => ({ id: index + 1, text: text.trim() }))
    .filter((item) => item.text !== "");
}

// Omvandla databasens recept till formatet som appen använder.
function formatRecipe(recipe) {
  return {
    id: recipe.id,
    title: recipe.title,
    cookingTime: recipe.cooking_time,
    difficulty: recipe.difficulty,
    image: recipe.image || "",
    servings: recipe.servings,
    rating: 0,
    ingredients: parseList(recipe.ingredients),
    instructions: parseList(recipe.instructions),
  };
}

// Kontrollera och förbered information från formuläret.
function validateRecipe(body) {
  const { title, cookingTime, difficulty, image, servings, ingredients, instructions } = body;

  if (
    typeof title !== "string" ||
    !title.trim() ||
    title.trim().length > 150 ||
    !Number.isInteger(Number(cookingTime)) ||
    Number(cookingTime) <= 0 ||
    !Number.isInteger(Number(servings)) ||
    Number(servings) <= 0 ||
    !["Enkel", "Medel", "Svår"].includes(difficulty) ||
    (image !== undefined && typeof image !== "string") ||
    (image && image.length > 1000) ||
    !Array.isArray(ingredients) ||
    ingredients.length === 0 ||
    !ingredients.every((item) => typeof item === "string" && item.trim()) ||
    !Array.isArray(instructions) ||
    instructions.length === 0 ||
    !instructions.every((item) => typeof item === "string" && item.trim())
  ) {
    return null;
  }

  return {
    title: title.trim(),
    cookingTime: Number(cookingTime),
    difficulty,
    image: image?.trim() || "",
    servings: Number(servings),
    ingredients: JSON.stringify(
      ingredients.map((text, index) => ({
        id: index + 1,
        text: text.trim(),
      })),
    ),
    instructions: JSON.stringify(
      instructions.map((text, index) => ({
        id: index + 1,
        text: text.trim(),
      })),
    ),
  };
}

// Hämta den inloggade användarens recept.
router.get("/", async (req, res) => {
  try {
    const [recipes] = await pool.query(
      `SELECT *
       FROM recipes
       WHERE user_id = ?
       ORDER BY id DESC`,
      [req.user.id],
    );

    return res.status(200).json(recipes.map(formatRecipe));
  } catch (error) {
    console.error("Fel vid hämtning av recept:", error.message);

    return res.status(500).json({
      message: "Kunde inte hämta recepten.",
    });
  }
});

// Skapa ett nytt recept.
router.post("/", async (req, res) => {
  try {
    const recipe = validateRecipe(req.body);

    if (!recipe) {
      return res.status(400).json({
        message: "Kontrollera att alla obligatoriska fält är korrekt ifyllda.",
      });
    }

    const [result] = await pool.query(
      `INSERT INTO recipes
        (user_id, title, description, ingredients, instructions,
         cooking_time, difficulty, image, servings)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, recipe.title, "", recipe.ingredients, recipe.instructions, recipe.cookingTime, recipe.difficulty, recipe.image, recipe.servings],
    );

    const [rows] = await pool.query("SELECT * FROM recipes WHERE id = ? AND user_id = ?", [result.insertId, req.user.id]);

    return res.status(201).json({
      message: "Receptet har skapats.",
      recipe: formatRecipe(rows[0]),
    });
  } catch (error) {
    console.error("Fel vid skapande av recept:", error.message);

    return res.status(500).json({
      message: "Kunde inte skapa receptet.",
    });
  }
});

// Hämta ett enskilt recept.
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

    return res.status(200).json(formatRecipe(recipes[0]));
  } catch (error) {
    console.error("Fel vid hämtning av recept:", error.message);

    return res.status(500).json({
      message: "Kunde inte hämta receptet.",
    });
  }
});

// Uppdatera ett recept.
router.put("/:id", async (req, res) => {
  try {
    const recipeId = Number(req.params.id);

    if (!Number.isInteger(recipeId) || recipeId < 1) {
      return res.status(400).json({
        message: "Ogiltigt recept-ID.",
      });
    }

    const recipe = validateRecipe(req.body);

    if (!recipe) {
      return res.status(400).json({
        message: "Kontrollera att alla obligatoriska fält är korrekt ifyllda.",
      });
    }

    const [result] = await pool.query(
      `UPDATE recipes
       SET title = ?, ingredients = ?, instructions = ?,
           cooking_time = ?, difficulty = ?, image = ?, servings = ?
       WHERE id = ? AND user_id = ?`,
      [recipe.title, recipe.ingredients, recipe.instructions, recipe.cookingTime, recipe.difficulty, recipe.image, recipe.servings, recipeId, req.user.id],
    );

    if (result.affectedRows === 0) {
      const [existing] = await pool.query("SELECT id FROM recipes WHERE id = ? AND user_id = ?", [recipeId, req.user.id]);

      if (existing.length === 0) {
        return res.status(404).json({
          message: "Receptet hittades inte.",
        });
      }
    }

    const [rows] = await pool.query("SELECT * FROM recipes WHERE id = ? AND user_id = ?", [recipeId, req.user.id]);

    return res.status(200).json({
      message: "Receptet har uppdaterats.",
      recipe: formatRecipe(rows[0]),
    });
  } catch (error) {
    console.error("Fel vid uppdatering av recept:", error.message);

    return res.status(500).json({
      message: "Kunde inte uppdatera receptet.",
    });
  }
});

// Radera ett recept och dess tillhörande favoriter.
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
