const express = require("express");
const pool = require("../config/database");
const authenticateToken = require("../middleware/auth");

const router = express.Router();

router.use(authenticateToken);

// Hämta den inloggade användarens favoriter
router.get("/", async (req, res) => {
  try {
    const [favorites] = await pool.query(
      `SELECT recipes.*
       FROM favorites
       JOIN recipes ON favorites.recipe_id = recipes.id
       WHERE favorites.user_id = ?
       ORDER BY favorites.created_at DESC`,
      [req.user.id],
    );

    return res.status(200).json(favorites);
  } catch (error) {
    console.error("Fel vid hämtning av favoriter:", error.message);
    return res.status(500).json({
      message: "Kunde inte hämta favoriterna.",
    });
  }
});

// Lägg till en favorit
router.post("/:recipeId", async (req, res) => {
  try {
    const recipeId = Number(req.params.recipeId);

    if (!Number.isInteger(recipeId) || recipeId < 1) {
      return res.status(400).json({
        message: "Ogiltigt recept-ID.",
      });
    }

    // Kontrollera att receptet tillhör den inloggade användaren
    const [recipes] = await pool.query("SELECT id FROM recipes WHERE id = ? AND user_id = ?", [recipeId, req.user.id]);

    if (recipes.length === 0) {
      return res.status(404).json({
        message: "Receptet hittades inte.",
      });
    }

    await pool.query("INSERT IGNORE INTO favorites (user_id, recipe_id) VALUES (?, ?)", [req.user.id, recipeId]);

    return res.status(200).json({
      message: "Receptet har lagts till som favorit.",
    });
  } catch (error) {
    console.error("Fel vid tillägg av favorit:", error.message);
    return res.status(500).json({
      message: "Kunde inte lägga till favoriten.",
    });
  }
});

// Ta bort en favorit
router.delete("/:recipeId", async (req, res) => {
  try {
    const recipeId = Number(req.params.recipeId);

    if (!Number.isInteger(recipeId) || recipeId < 1) {
      return res.status(400).json({
        message: "Ogiltigt recept-ID.",
      });
    }

    await pool.query("DELETE FROM favorites WHERE user_id = ? AND recipe_id = ?", [req.user.id, recipeId]);

    return res.status(200).json({
      message: "Favoriten har tagits bort.",
    });
  } catch (error) {
    console.error("Fel vid borttagning av favorit:", error.message);
    return res.status(500).json({
      message: "Kunde inte ta bort favoriten.",
    });
  }
});

module.exports = router;
