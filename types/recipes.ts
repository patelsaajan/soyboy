export default interface IRecipes {
  name: string;
  cuisine: string;
  description: string;
  ingredients?: string[];
  image?: string;
  difficulty: string;
  preparationTime: number;
  servings: number;
}
