import type { SeedRecipe } from '../types'

const recipe: SeedRecipe = {
  title: 'Cannellini Guacamole',
  uri: 'cannellini-guacamole',
  cuisine: 'Fusion',
  time: '15 minutes',
  serves: 2,
  description:
    'A creamy, protein-packed twist on classic guacamole, using cannellini beans and sundried tomatoes for a refreshing, nutrient-dense spread. Perfect for hot summer days, served on toast with a drizzle of Sriracha mayo.',
  imgSrc: 'cani-gauc.jpeg',
  intro:
    "This guacamole-style spread is a refreshing and nourishing dish, great for hot summer days or a light meal. Packed with plant-based protein, fiber, and healthy fats, it's as satisfying as it is delicious.",
  ingredients: [
    { quantity: 1, unit: 'tin', item: 'Cannellini beans' },
    { quantity: 2, unit: '', item: 'Avocados' },
    { quantity: 6, unit: '', item: 'Sundried tomatoes' },
    { quantity: 0.5, unit: 'medium', item: 'Red onion' },
    { quantity: 2, unit: '', item: 'Chilis' },
    { quantity: 1, unit: '', item: 'Lemon' },
    { quantity: 2, unit: 'slices', item: 'Sourdough bread' },
    { quantity: 1, unit: 'handful', item: 'Lettuce' },
    { quantity: 1, unit: 'spread', item: 'Hummus' },
  ],
  method: [
    { title: 'Prepare the Ingredients', text: 'Drain and rinse the cannellini beans, then place them in a large bowl. Cut open the avocados, remove the pits, and scoop the flesh into the bowl.' },
    { title: 'Chop and Mix', text: 'Finely dice the red onion and chilis, then roughly chop the sundried tomatoes. Add everything to the bowl.' },
    { title: 'Season and Mash', text: 'Squeeze in the juice of one lemon and season with salt and pepper to taste. Use a fork to mash everything together until you reach your desired consistency.' },
    { title: 'Toast and Assemble', text: 'Toast the sourdough bread until golden brown. Spread a generous layer of hummus on top, followed by a handful of lettuce and a scoop of the cannellini guacamole. Drizzle with Sriracha mayo and serve.' },
  ],
  nutritional: [
    { item: 'Calories', value: '350kcal' },
    { item: 'Protein', value: '9.5g' },
    { item: 'Carbohydrates', value: '30g' },
    { item: 'Fat', value: '21g' },
    { item: 'Fiber', value: '8g' },
    { item: 'Potassium', value: '25% DV' },
    { item: 'Vitamin B6', value: '15% DV' },
  ],
}

export default recipe
