export interface IRecipes {
  name: string;
  cuisine: string;
  description: string;
  ingredients?: string[];
  image?: string;
  difficulty: string;
  preparationTime: number;
  servings: number;
}

export interface IRecipeNav {
  title: string;
  imgSrc: string;
  time: number;
  servings: number;
  uri: string;
  path: string;
}
