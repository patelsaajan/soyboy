import type { SeedRecipe } from '../types'

const recipe: SeedRecipe = {
  title: 'Infused Tofu (Marinated)',
  uri: 'infused-tofu-marinated',
  cuisine: 'Korean-inspired',
  time: '10 minutes',
  serves: 3,
  description:
    'A deeply flavourful tofu dish inspired by Korean marinated eggs. The tofu absorbs all the umami goodness over several days in soy sauce, garlic, and chilli — an intensely seasoned, no-cook protein.',
  imgSrc: 'infused-tofu.jpg',
  intro:
    "This recipe isn't just tasty — it's a flavour bomb packed with plant-based protein, healthy fats, and gut-friendly ingredients. Since it marinates over time, every bite is deeply infused with umami goodness.",
  ingredients: [
    { quantity: 400, unit: 'g', item: 'Firm tofu' },
    { quantity: 2, unit: 'tbsp', item: 'Light soy sauce' },
    { quantity: 0.5, unit: 'bulb', item: 'Garlic' },
    { quantity: 3, unit: '', item: 'Finger chilis' },
    { quantity: 2, unit: 'stems', item: 'Green onions' },
    { quantity: 0.5, unit: '', item: 'Onion' },
    { quantity: 1, unit: 'to taste', item: 'Sesame seeds' },
  ],
  method: [
    { title: 'Prepare the Tofu', text: 'Drain the tofu well and pat dry. Cut into cubes or strips.' },
    { title: 'Chop the Aromatics', text: 'Thinly slice the green onions, garlic, and chilis. Dice the onion finely.' },
    { title: 'Assemble the Marinade', text: 'In an airtight container, combine soy sauce and water in a 1:1 ratio. Add all the aromatics and mix well.' },
    { title: 'Add the Tofu', text: "Place the tofu into the marinade, ensuring it's submerged. Sprinkle sesame seeds on top." },
    { title: 'Let it Infuse', text: 'Cover and refrigerate for at least 5 days, stirring every couple of days. The longer it sits, the more flavourful it becomes.' },
  ],
  nutritional: [
    { item: 'Calories', value: '180kcal' },
    { item: 'Protein', value: '15g' },
    { item: 'Carbohydrates', value: '6g' },
    { item: 'Fat', value: '10g' },
    { item: 'Iron', value: '15% DV' },
    { item: 'Calcium', value: '30% DV' },
  ],
  servingSuggestions: ['Steamed rice', 'Noodle bowls or salads', 'Ramen toppings'],
}

export default recipe
