const request = require("supertest");
const jwt = require("jsonwebtoken");

jest.mock("../config/database", () => ({
  query: jest.fn(),
}));

process.env.JWT_SECRET = "jest-test-secret";

const pool = require("../config/database");
const app = require("../server");

describe("Recept API – autentisering", () => {
  beforeEach(() => {
    pool.query.mockReset();
  });

  test("ska neka åtkomst till recept utan token", async () => {
    const response = await request(app).get("/api/recipes");

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Du måste vara inloggad.");
  });

  test("ska neka åtkomst till att skapa recept utan token", async () => {
    const response = await request(app).post("/api/recipes").send({
      title: "Testrecept",
      description: "En beskrivning",
      ingredients: "Mjöl och vatten",
      instructions: "Blanda ingredienserna.",
    });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Du måste vara inloggad.");
  });

  test("ska neka åtkomst med en ogiltig token", async () => {
    const response = await request(app).get("/api/recipes").set("Authorization", "Bearer ogiltig-token");

    expect(response.status).toBe(403);
    expect(response.body.message).toBe("Ogiltig eller utgången token.");
  });

  test("ska neka åtkomst till ett recept som tillhör en annan användare", async () => {
    const token = jwt.sign({ userId: 2 }, process.env.JWT_SECRET, { expiresIn: "2h" });

    // Simulera att receptet inte tillhör användare 2.
    pool.query.mockResolvedValueOnce([[]]);

    const response = await request(app).get("/api/recipes/1").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Receptet hittades inte.");

    expect(pool.query).toHaveBeenCalledWith("SELECT * FROM recipes WHERE id = ? AND user_id = ?", [1, 2]);
  });
  test("ska neka en användare att uppdatera någon annans recept", async () => {
    const token = jwt.sign({ userId: 2 }, process.env.JWT_SECRET, { expiresIn: "2h" });

    pool.query.mockResolvedValueOnce([{ affectedRows: 0 }]);
    pool.query.mockResolvedValueOnce([[]]);

    const response = await request(app).put("/api/recipes/1").set("Authorization", `Bearer ${token}`).send({
      title: "Ändrat recept",
      description: "Beskrivning",
      ingredients: "Mjöl",
      instructions: "Blanda.",
    });

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Receptet hittades inte.");
  });

  test("ska neka en användare att radera någon annans recept", async () => {
    const token = jwt.sign({ userId: 2 }, process.env.JWT_SECRET, { expiresIn: "2h" });

    pool.query.mockResolvedValueOnce([{ affectedRows: 0 }]);

    const response = await request(app).delete("/api/recipes/1").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Receptet hittades inte.");
  });
});
