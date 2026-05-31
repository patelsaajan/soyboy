import type { SeedRecipe } from '../types'

const recipe: SeedRecipe = {
  title: 'Pancakes',
  uri: 'pancakes',
  cuisine: 'Breakfast',
  time: '20 minutes',
  serves: 2,
  description:
    'Fluffy, easy-to-make vegan pancakes — perfect for Pancake Day or any day that calls for a sweet breakfast.',
  imgSrc: 'pancakes.jpg',
  intro:
    "I was staying with a mate and it was Pancake Day, so I thought — why not make some pancakes? No eggs needed here; apple cider vinegar curdles the soya milk to create a buttermilk substitute that makes these fluffy every time.",
  ingredients: [
    { quantity: 125, unit: 'g', item: 'Flour' },
    { quantity: 240, unit: 'ml', item: 'Soya milk' },
    { quantity: 1, unit: 'tbsp', item: 'Sugar' },
    { quantity: 1, unit: 'tbsp', item: 'Apple cider vinegar' },
    { quantity: 1, unit: 'tbsp', item: 'Baking powder' },
    { quantity: 1, unit: 'tsp', item: 'Vanilla extract' },
    { quantity: 0.5, unit: 'tsp', item: 'Salt' },
  ],
  method: [
    { title: 'Mix Dry Ingredients', text: 'In a large bowl, combine the flour, sugar, baking powder, and salt. Stir to distribute.' },
    { title: 'Mix Wet Ingredients', text: 'Whisk together soya milk, apple cider vinegar, and vanilla extract. Let sit for 2–3 minutes until slightly curdled.' },
    { title: 'Combine Wet and Dry', text: 'Pour the wet into the dry and gently mix until just combined. Rest the batter for 5 minutes.' },
    { title: 'Cook the Pancakes', text: 'Heat a frying pan over medium heat and lightly grease. Pour small amounts of batter and flip once edges lift and bubbles form on the surface.' },
  ],
  nutritional: [
    { item: 'Calories', value: '190kcal' },
    { item: 'Protein', value: '5.2g' },
    { item: 'Carbohydrates', value: '35.7g' },
    { item: 'Fat', value: '2.8g' },
    { item: 'Fiber', value: '2.3g' },
    { item: 'Iron', value: '8% DV' },
  ],
  servingSuggestions: ['Drizzle with maple syrup or agave nectar', 'Top with berries and powdered sugar', 'Add vegan chocolate chips or peanut butter'],
}

export default recipe
