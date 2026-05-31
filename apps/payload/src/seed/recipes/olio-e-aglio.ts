import type { SeedRecipe } from '../types'

const recipe: SeedRecipe = {
  title: 'Olio e Aglio',
  uri: 'olio-e-aglio',
  cuisine: 'Italian',
  time: '20 minutes',
  serves: 3,
  description:
    "A quick, garlicky pasta that comes together effortlessly — perfect for when you're low on ingredients but craving something delicious.",
  imgSrc: 'garlic-oil-pasta.jpg',
  intro:
    "This isn't the kind of meal you'd make for a date night — at least not an early one. But it's quick, easy, and absolutely bangs. I made this when my university flat was completely empty and I couldn't be bothered to walk three minutes to the shops.",
  ingredients: [
    { quantity: 1, unit: 'generous amount', item: 'Good olive oil' },
    { quantity: 1, unit: 'bulb', item: 'Garlic' },
    { quantity: 4, unit: '', item: 'Chilis' },
    { quantity: 1, unit: 'handful', item: 'Fresh parsley' },
    { quantity: 1, unit: 'juice of', item: 'Lemon' },
    { quantity: 375, unit: 'g', item: 'Pasta' },
  ],
  method: [
    { title: 'Prep Your Garlic and Chilis', text: 'Slice your garlic into thin cross-sections and do the same with the chilis.' },
    { title: 'Infuse the Oil', text: 'Heat a large pan over medium-low heat with a generous amount of olive oil. Add the garlic and chilis and let them gently sizzle for about 10 minutes until golden.' },
    { title: 'Cook the Pasta', text: 'Bring a large pot of salted water to a boil. Cook the pasta and save a cup of pasta water before draining.' },
    { title: 'Bring It Together', text: "Add the chopped parsley to the golden oil — it'll sizzle. Quickly add the drained pasta and a splash of pasta water. Toss, squeeze in lemon juice, and serve." },
  ],
  nutritional: [
    { item: 'Calories', value: '450kcal' },
    { item: 'Protein', value: '12g' },
    { item: 'Carbohydrates', value: '65g' },
    { item: 'Fat', value: '15g' },
    { item: 'Fiber', value: '4g' },
    { item: 'Iron', value: '10% DV' },
  ],
  suggestions: [
    { title: 'Sun-dried Tomatoes', text: 'Add sun-dried tomatoes halfway through infusing the oil for a tangy, sweet contrast.' },
    { title: 'Bread', text: 'Make homemade garlic bread to go alongside for a full garlic overload.' },
  ],
}

export default recipe
