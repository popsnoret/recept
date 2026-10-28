export type Recipe = {
  id: number;
  title: string;
  cookingTime: number;
  difficulty: "Enkel" | "Medel" | "Svår";
  image: string;
  ingredients: {
    id: number;
    text: string;
  }[];
  instructions: {
    id: number;
    text: string;
  }[];
  servings: number;
  rating?: number;
};
