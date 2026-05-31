import type { SeedRecipe } from '../types'

const recipe: SeedRecipe = {
  title: 'Mushroom Fried Rice',
  uri: 'mushroom-fried-rice',
  cuisine: 'Chinese',
  time: '30 minutes',
  serves: 3,
  description:
    'A savoury, umami-packed dish with earthy mushrooms, crispy tofu, and fragrant aromatics stir-fried with fluffy rice. Quick, hearty, and satisfying.',
  imgSrc: 'mushroom-fried-rice.jpg',
  intro:
    'This dish is the perfect balance of umami, spice, and texture. Crispy tofu, fragrant garlic, and mushrooms soaking up all the savoury goodness. Perfect for busy evenings.',
  ingredients: [
    { quantity: 200, unit: 'g', item: 'Firm tofu' },
    { quantity: 250, unit: 'g', item: 'Mushrooms' },
    { quantity: 1, unit: 'knob', item: 'Ginger' },
    { quantity: 2, unit: 'cloves', item: 'Garlic' },
    { quantity: 3, unit: '', item: 'Green chilis' },
    { quantity: 3, unit: '', item: 'Spring onions' },
    { quantity: 1, unit: 'mug', item: 'Rice' },
    { quantity: 1, unit: 'tsp', item: 'Sesame oil' },
    { quantity: 1, unit: 'tbsp', item: 'Sugar' },
    { quantity: 1, unit: 'to taste', item: 'Salt and pepper' },
  ],
  method: [
    { title: 'Prepare the Ingredients', text: 'Chop mushrooms, mince garlic and ginger, slice spring onions and chilis.' },
    { title: 'Cook the Rice', text: 'Rinse and cook the rice. Spread it out to cool and prevent clumping.' },
    { title: 'Prepare the Tofu', text: 'Cut tofu into cubes and fry in oil until golden and crispy. Remove and set aside.' },
    { title: 'Sauté Aromatics', text: 'Fry the ginger, garlic, and chilis in the same pan until fragrant.' },
    { title: 'Cook the Mushrooms', text: 'Add the mushrooms and cook until moisture releases and edges are slightly crispy.' },
    { title: 'Stir-Fry the Rice', text: 'Add the cooled rice. Drizzle in sesame oil, add salt, sugar, and pepper, and stir-fry until combined.' },
    { title: 'Add the Tofu and Spring Onions', text: 'Return the crispy tofu and toss in the spring onions for a final burst of freshness.' },
  ],
  nutritional: [
    { item: 'Calories', value: '340kcal' },
    { item: 'Protein', value: '14.2g' },
    { item: 'Carbohydrates', value: '45.6g' },
    { item: 'Fat', value: '9.3g' },
    { item: 'Fibre', value: '4.2g' },
    { item: 'Potassium', value: '18% DV' },
  ],
}

export default recipe
