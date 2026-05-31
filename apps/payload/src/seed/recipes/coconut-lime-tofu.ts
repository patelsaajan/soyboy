import type { SeedRecipe } from '../types'

const recipe: SeedRecipe = {
  title: 'Coconut Lime Tofu',
  uri: 'coconut-lime-tofu',
  cuisine: 'Fusion',
  time: '30 minutes',
  serves: 2,
  description:
    "A creamy, zesty tofu dish infused with coconut, lime, and warming spices. Packed with plant protein, healthy fats, and fibre, it's perfect for hot summer evenings or when you're craving something vibrant and satisfying.",
  imgSrc: 'coconut-lime-tofu.jpg',
  intro:
    'Vibrant, creamy, and deeply satisfying — this coconut lime tofu hits all the right notes. The coconut cream brings richness, the lime cuts through it, and the ginger and garlic add warmth.',
  ingredients: [
    { quantity: 250, unit: 'ml', item: 'Coconut cream' },
    { quantity: 400, unit: 'g', item: 'Firm tofu' },
    { quantity: 0.5, unit: '', item: 'Lime' },
    { quantity: 1, unit: '', item: 'Onion' },
    { quantity: 1, unit: '', item: 'Chilli' },
    { quantity: 3, unit: 'cloves', item: 'Garlic' },
    { quantity: 1, unit: 'thumb', item: 'Fresh ginger' },
    { quantity: 1, unit: 'tsp', item: 'Paprika' },
    { quantity: 1, unit: 'tsp', item: 'Cayenne pepper' },
    { quantity: 1, unit: 'handful', item: 'Fresh coriander' },
    { quantity: 1, unit: 'tbsp', item: 'Soy sauce' },
  ],
  method: [
    { title: 'Prepare the Tofu', text: 'Drain and pat dry the tofu, then coat in cornflour and salt for frying, or simmer in salted water for 10 minutes.' },
    { title: 'Chop and Sauté the Aromatics', text: 'Dice the onion and fry over medium heat with a pinch of salt for 5–7 minutes. Add minced garlic, ginger, and diced chilli and cook until fragrant.' },
    { title: 'Add the Dry Spices', text: 'Stir in the paprika, cayenne pepper, and a splash of water. Season with salt and black pepper.' },
    { title: 'Add the Coconut and Lime', text: 'Pour in the coconut cream, squeeze in the lime juice, and let everything simmer gently.' },
    { title: 'Finish and Serve', text: 'Add the tofu and chopped coriander. Serve hot with steamed rice.' },
  ],
  nutritional: [
    { item: 'Calories', value: '380kcal' },
    { item: 'Protein', value: '18g' },
    { item: 'Carbohydrates', value: '14g' },
    { item: 'Fat', value: '28g' },
    { item: 'Fibre', value: '6g' },
    { item: 'Potassium', value: '20% DV' },
    { item: 'Iron', value: '18% DV' },
  ],
}

export default recipe
