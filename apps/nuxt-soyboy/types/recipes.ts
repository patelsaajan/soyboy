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

export interface Recipe {
  title: string;
  date: string;
  published: boolean;
  cuisine: string;
  time: string;
  serves: number;
  description: string;
  imgSrc: string;
  uri: string;
  ingredients: {
    quantity: number;
    unit: string;
    item: string;
  }[];
  nutritional: {
    item: string;
    value: string;
  }[];
  intro: string;
  quickFacts?: {
    title: string;
    text: string;
  }[];
  method: {
    title: string;
    text: string;
  }[];
  suggestions?: {
    title: string;
    text: string;
  }[];
  servingSuggestions?: string[];
  outro?: string;
}
