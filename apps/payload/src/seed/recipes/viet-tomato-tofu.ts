import type { SeedRecipe } from '../types'

const recipe: SeedRecipe = {
  title: 'Tomato Tofu',
  uri: 'viet-tomato-tofu',
  cuisine: 'Vietnamese',
  time: '25 minutes',
  serves: 4,
  description:
    'Vietnamese Tomato Tofu features crispy fried tofu simmered in a tangy, savoury tomato sauce infused with garlic and shallots. Rich, wholesome, and perfect served over steamed rice.',
  imgSrc: 'viet-tomato-tofu.jpg',
  intro:
    'A classic Vietnamese dish featuring crispy tofu simmered in a tangy tomato sauce. This was a dish I ate daily while travelling Vietnam — simple, comforting, and always satisfying.',
  ingredients: [
    { quantity: 400, unit: 'g', item: 'Firm tofu' },
    { quantity: 2, unit: 'tbsp', item: 'Light soya sauce' },
    { quantity: 2, unit: 'cloves', item: 'Garlic' },
    { quantity: 2, unit: '', item: 'Green chilis' },
    { quantity: 5, unit: 'medium', item: 'Tomatoes' },
    { quantity: 2, unit: '', item: 'Spring onions' },
    { quantity: 1, unit: 'medium', item: 'Onion' },
  ],
  method: [
    { title: 'Prepare the Tofu', text: 'Remove excess moisture from the tofu then cut into triangles.' },
    { title: 'Fry the Tofu', text: 'Fry in oil until golden and crispy on all sides. Drain on paper towels.' },
    { title: 'Make the Tomato Sauce', text: 'Sauté the onion until translucent, add garlic, then stir in the diced tomatoes and cook down into a sauce.' },
    { title: 'Season the Sauce', text: 'Add soy sauce, a pinch of sugar, salt, and black pepper. Adjust seasoning to taste.' },
    { title: 'Combine and Simmer', text: 'Return the tofu to the pan, add a splash of water, and simmer for 10 minutes.' },
    { title: 'Garnish and Serve', text: 'Top with chopped spring onions and coriander. Serve with steamed rice.' },
  ],
  nutritional: [
    { item: 'Calories', value: '240kcal' },
    { item: 'Protein', value: '18g' },
    { item: 'Carbohydrates', value: '12g' },
    { item: 'Fat', value: '14g' },
    { item: 'Fiber', value: '4g' },
    { item: 'Vitamin A', value: '20% DV' },
  ],
}

export default recipe
