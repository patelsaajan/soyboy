import type { SeedRecipe } from '../types'

const recipe: SeedRecipe = {
  title: 'Cosy Potato Salad',
  uri: 'cosy-potato-salad',
  cuisine: 'Summer',
  time: '45 minutes',
  serves: 4,
  description:
    'A creamy, comforting twist on classic potato salad — packed with texture, freshness, and warmth. Perfect for summer meals, picnics, or as a side dish that shines on its own.',
  imgSrc: 'cosy-potato-salad.jpg',
  intro:
    "This isn't your average potato salad. Baked skins, creamy avocado, herby dill, and beans all coming together into something genuinely special.",
  ingredients: [
    { quantity: 4, unit: '', item: 'Baking potatoes' },
    { quantity: 1, unit: '', item: 'Avocado' },
    { quantity: 1, unit: '', item: 'Onion' },
    { quantity: 0.5, unit: 'tin', item: 'Sweetcorn' },
    { quantity: 1, unit: 'clove', item: 'Garlic' },
    { quantity: 1, unit: 'handful', item: 'Plum tomatoes' },
    { quantity: 1, unit: 'tin', item: 'Beans' },
    { quantity: 1, unit: 'handful', item: 'Dill' },
    { quantity: 1, unit: 'cup', item: 'Mayo' },
    { quantity: 1, unit: 'garnish', item: 'Spring onions' },
  ],
  method: [
    { title: 'Roast the Potatoes', text: 'Preheat oven to 200°C. Rub the potatoes with olive oil, salt, and pepper. Bake for around 45 minutes until crisp outside and soft through.' },
    { title: 'Prep the Mix', text: 'Dice the onion, avocado, garlic, and tomatoes into a large bowl with the drained beans, sweetcorn, and roughly chopped dill.' },
    { title: 'Dress It Up', text: 'Add the mayo, a drizzle of olive oil, lemon juice, salt, and pepper. Stir gently to combine.' },
    { title: 'Scoop the Potato', text: 'Scoop the fluffy potato insides into the salad mix and fold everything together. Keep the skins.' },
    { title: 'Serve and Garnish', text: 'Reheat the empty potato skins until crisp. Spoon the salad back into the skins and top with Sriracha mayo and spring onions.' },
  ],
  nutritional: [
    { item: 'Calories', value: '370kcal' },
    { item: 'Protein', value: '9.5g' },
    { item: 'Carbohydrates', value: '42g' },
    { item: 'Healthy Fats', value: '18g' },
    { item: 'Fiber', value: '9g' },
    { item: 'Vitamin C', value: '45% DV' },
  ],
}

export default recipe
