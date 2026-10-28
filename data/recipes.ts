import { Recipe } from "../types/Recipe";

export const recipes: Recipe[] = [
  {
    id: 1,
    title: "Ugnspannkaka",
    cookingTime: 40,
    difficulty: "Enkel",
    image: "https://images.unsplash.com/photo-1599785209707-a456fc1337bb?w=600",
    servings: 4,
    rating: 4,
    ingredients: [
      { id: 1, text: "4 dl vetemjöl" },
      { id: 2, text: "1 tsk strösocker" },
      { id: 3, text: "1 tsk salt" },
      { id: 4, text: "8 dl mjölk (3 %)" },
      { id: 5, text: "4 ägg" },
      { id: 6, text: "Smör (till formen)" },
    ],
    instructions: [
      { id: 1, text: "Sätt ugnen på 225°C." },
      {
        id: 2,
        text: "Blanda mjölet med socker och salt i en bunke.",
      },
      {
        id: 3,
        text: "Tillsätt hälften av mjölken och vispa till en jämn, tjock smet. Rör ner äggen.",
      },
      {
        id: 4,
        text: "Vispa ner resterande mjölk och fortsätt vispa till en klumpfri smet.",
      },
      {
        id: 5,
        text: "Häll smeten i en smord långpanna och grädda i cirka 30–40 minuter.",
      },
    ],
  },
  {
    id: 2,
    title: "Pannkakor",
    cookingTime: 30,
    difficulty: "Enkel",
    image: "https://images.unsplash.com/photo-1528207776546-365bb710ee93?w=600",
    servings: 4,
    rating: 0,
    ingredients: [
      { id: 1, text: "2,5 dl vetemjöl" },
      { id: 2, text: "6 dl mjölk" },
      { id: 3, text: "3 ägg" },
      { id: 4, text: "0,5 tsk salt" },
      { id: 5, text: "Smör till stekning" },
    ],
    instructions: [
      { id: 1, text: "Vispa mjölet med hälften av mjölken till en slät smet." },
      { id: 2, text: "Vispa ner resten av mjölken, äggen och saltet." },
      { id: 3, text: "Stek tunna pannkakor i smör på medelvärme." },
    ],
  },
  {
    id: 3,
    title: "Amerikanska pannkakor",
    cookingTime: 30,
    difficulty: "Enkel",
    image: "https://images.unsplash.com/photo-1528207776546-365bb710ee93?w=600",
    servings: 4,
    rating: 0,
    ingredients: [
      { id: 1, text: "2,5 dl vetemjöl" },
      { id: 2, text: "2 tsk bakpulver" },
      { id: 3, text: "2 msk socker" },
      { id: 4, text: "2,5 dl mjölk" },
      { id: 5, text: "1 ägg" },
      { id: 6, text: "2 msk smält smör" },
    ],
    instructions: [
      { id: 1, text: "Blanda mjöl, bakpulver och socker i en bunke." },
      { id: 2, text: "Vispa ner mjölk, ägg och smält smör." },
      { id: 3, text: "Stek små, tjocka pannkakor på medelvärme." },
    ],
  },
];
