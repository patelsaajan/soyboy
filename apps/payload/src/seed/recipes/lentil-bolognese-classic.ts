import type { SeedRecipe } from '../types'

const recipe: SeedRecipe = {
  title: 'Lentil Bolognese (Classic)',
  uri: 'lentil-bolognese-classic',
  cuisine: 'Italian',
  time: '45 minutes',
  serves: 4,
  description:
    'A hearty, comforting lentil bolognese packed with vegetables and rich flavours. Budget-friendly and perfect for meal prep.',
  imgSrc: 'lentil-bolognese.png',
  intro:
    'This lentil bolognese is a hearty, comforting dish filled with protein and fibre. A budget-friendly meal that makes great leftovers and is perfect for meal prep.',
  ingredients: [
    { quantity: 1, unit: 'tin', item: 'Green lentils' },
    { quantity: 0.5, unit: 'bulb', item: 'Garlic' },
    { quantity: 2, unit: 'sticks', item: 'Celery' },
    { quantity: 1, unit: 'medium', item: 'Onion' },
    { quantity: 2, unit: 'medium', item: 'Carrots' },
    { quantity: 2, unit: '', item: 'Chilis' },
    { quantity: 1, unit: '', item: 'Sweet pepper' },
    { quantity: 1, unit: 'tin', item: 'Tinned tomatoes' },
    { quantity: 1, unit: 'to taste', item: 'Oregano' },
    { quantity: 1, unit: 'to taste', item: 'Thyme' },
    { quantity: 1, unit: 'handful', item: 'Fresh basil' },
  ],
  method: [
    { title: 'Prepare the Veggies', text: 'Dice the carrots, celery, and onions. Add to a pan with salt and boiling water. Sweat with a lid on — the longer they cook, the richer the flavour.' },
    { title: 'Add Garlic and Chilis', text: 'Push the veggies aside, add garlic and chilis, and sauté for 1 minute, then stir through.' },
    { title: 'Season', text: 'Add dried oregano, thyme, salt, and pepper. Cook for a minute, then pour in the tinned tomatoes and reduce.' },
    { title: 'Add Lentils and Simmer', text: 'Add the tinned lentils and boiling water. Simmer for at least 10 minutes.' },
    { title: 'Stir in Fresh Basil', text: 'Just before serving, chiffonade the fresh basil and stir through the sauce.' },
  ],
  nutritional: [
    { item: 'Calories', value: '280kcal' },
    { item: 'Protein', value: '14.5g' },
    { item: 'Carbohydrates', value: '40.3g' },
    { item: 'Fat', value: '4.2g' },
    { item: 'Fiber', value: '11.8g' },
    { item: 'Vitamin A', value: '85% DV' },
  ],
  servingSuggestions: ['Spaghetti or any pasta of choice', 'Homemade garlic bread', 'Nutritional yeast on top'],
}

export default recipe
