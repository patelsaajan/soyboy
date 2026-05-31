import type { SeedRecipe } from '../types'

const recipe: SeedRecipe = {
  title: 'Satay Sauce',
  uri: 'satay-sauce',
  cuisine: 'Korean',
  time: '20 minutes',
  serves: 3,
  highlighted: true,
  description:
    'Korean Satay Sauce blends the spicy, smoky flavour of gochujang with creamy peanut butter for a rich, savoury kick. Balances sweetness and heat with a touch of lime.',
  imgSrc: 'korean-satay.jpg',
  intro:
    "This recipe is packed with all the nutrients your body needs to feel energized. Full of plant-based protein, healthy fats, and vitamins and minerals that support everything from bone health to immunity.",
  ingredients: [
    { quantity: 400, unit: 'g', item: 'Firm tofu' },
    { quantity: 2, unit: 'tbsp', item: 'Light soya sauce' },
    { quantity: 2, unit: 'tbsp', item: 'Lemon or rice vinegar' },
    { quantity: 0.5, unit: 'bulb', item: 'Garlic' },
    { quantity: 3, unit: '', item: 'Green chilis' },
    { quantity: 3, unit: 'tbsp', item: 'Peanut butter' },
    { quantity: 1, unit: 'tbsp', item: 'Gochujang' },
  ],
  method: [
    { title: 'Prepare the Tofu', text: 'Pat the tofu dry and cut into cubes. Optionally toss in cornflour and salt for extra crunch.' },
    { title: 'Prepare the Garlic and Chilis', text: 'Finely slice the garlic and chilis into strips.' },
    { title: 'Fry the Tofu', text: 'Shallow fry the tofu until golden brown. Drain on a paper towel.' },
    { title: 'Fry the Garlic, Chilis, and Gochujang', text: 'In the same pan, place gochujang on one side and garlic and chilis on the other.' },
    { title: 'Add Peanut Butter and Mix', text: 'Add peanut butter in a 2:1 ratio to gochujang. Once garlic crisps, mix everything with a splash of water and soy sauce. Reduce down.' },
    { title: 'Final Touches', text: 'Add lemon or lime juice and rice vinegar. Toss in the tofu and serve.' },
  ],
  nutritional: [
    { item: 'Calories', value: '223kcal' },
    { item: 'Protein', value: '16.3g' },
    { item: 'Carbohydrates', value: '10.3g' },
    { item: 'Fat', value: '14.7g' },
    { item: 'Calcium', value: '10% DRI' },
    { item: 'Iron', value: '15% DV' },
  ],
  servingSuggestions: ['Fragrant basmati rice', 'Crispy kale', 'Fried greens such as bok choy or broccoli'],
}

export default recipe
