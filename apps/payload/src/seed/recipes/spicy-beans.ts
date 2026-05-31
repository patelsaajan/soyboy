import type { SeedRecipe } from '../types'

const recipe: SeedRecipe = {
  title: 'Spicy Beans',
  uri: 'spicy-beans',
  cuisine: 'Fusion',
  time: '30 minutes',
  serves: 3,
  description:
    "If you're bored of basic baked beans, this spicy, flavour-packed version will wake up your taste buds. Perfect for using up leftovers and getting creative with spices.",
  imgSrc: 'baked-beans.jpeg',
  intro:
    'I started making this with my flatmate as a way to add some pizzazz to plain canned beans. Ditch the sugary tinned stuff and go with tinned tomatoes and your favourite bean variety instead.',
  ingredients: [
    { quantity: 1, unit: 'tin', item: 'Any beans' },
    { quantity: 0.5, unit: 'bulb', item: 'Garlic' },
    { quantity: 1, unit: 'medium', item: 'Onion' },
    { quantity: 2, unit: '', item: 'Chilis' },
    { quantity: 2, unit: 'tins', item: 'Tinned tomatoes' },
    { quantity: 1, unit: 'to taste', item: 'Mixed spices' },
    { quantity: 1, unit: 'drizzle', item: 'Olive oil' },
  ],
  method: [
    { title: 'Prep Your Ingredients', text: 'Finely dice the onion, mince the garlic, and slice the chilis.' },
    { title: 'Sauté the Aromatics', text: 'Fry the onions until golden, then add garlic and chilis. Cook for 2–3 minutes until fragrant.' },
    { title: 'Spice and Sauce', text: 'Add your favourite dry spices and optionally balsamic vinegar. After a couple of minutes, add the tinned tomatoes and a mug of water. Reduce for 5 minutes.' },
    { title: 'Beans and Simmer', text: 'Stir in the beans. Simmer for 10 minutes. Finish with a squeeze of lemon and a drizzle of olive oil.' },
    { title: 'Adjust Thickness', text: 'If too thin, stir in a cornstarch slurry (1 tsp cornstarch + 1 tbsp water) and simmer for a minute.' },
  ],
  nutritional: [
    { item: 'Calories', value: '250kcal' },
    { item: 'Protein', value: '12.3g' },
    { item: 'Carbohydrates', value: '34.5g' },
    { item: 'Fat', value: '6.1g' },
    { item: 'Fiber', value: '10.2g' },
    { item: 'Vitamin C', value: '30% DV' },
  ],
  servingSuggestions: ['Sourdough toast or your favourite crusty bread', 'Fresh herbs or a spoonful of vegan yogurt', 'Guacamole for a creamy contrast'],
}

export default recipe
