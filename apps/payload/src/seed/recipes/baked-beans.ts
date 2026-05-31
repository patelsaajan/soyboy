import type { SeedRecipe } from '../types'

const recipe: SeedRecipe = {
  title: 'Baked Beans',
  uri: 'baked-beans',
  highlighted: true,
  cuisine: 'Mexican',
  time: '30 minutes',
  serves: 4,
  description:
    'Smoky, spicy, and incredibly satisfying. These Mexican-inspired beans are loaded with cumin, smoked paprika, and a kick of chipotle. Perfect as a main with rice, a taco filling, or a hearty side dish.',
  imgSrc: 'baked-beans.jpeg',
  intro:
    "I used to have a tin of baked beans every single day, until I actually looked at the sugar content. That's when I started making my own from scratch. Cheap, quick, and packed with flavour.",
  ingredients: [
    { quantity: 1, unit: 'can', item: 'Haricot beans' },
    { quantity: 0.5, unit: 'can', item: 'Butter beans' },
    { quantity: 600, unit: 'g', item: 'Chopped tomatoes' },
    { quantity: 1, unit: '', item: 'Onion, diced' },
    { quantity: 1, unit: 'stick', item: 'Celery, diced' },
    { quantity: 1, unit: '', item: 'Carrot, diced' },
    { quantity: 4, unit: 'cloves', item: 'Garlic, minced' },
    { quantity: 2, unit: '', item: 'Green chillies, sliced' },
    { quantity: 1, unit: '', item: 'Red bell pepper, diced' },
    { quantity: 2, unit: 'tbsp', item: 'Balsamic vinegar' },
    { quantity: 2, unit: 'tsp', item: 'Cumin' },
    { quantity: 1, unit: 'tsp', item: 'Smoked paprika' },
    { quantity: 1, unit: 'tsp', item: 'Dried parsley' },
    { quantity: 1, unit: '', item: 'Lime, juiced' },
    { quantity: 2, unit: 'tbsp', item: 'Olive oil' },
  ],
  method: [
    { title: 'Sweat the base', text: 'Add the diced carrot, onion, and celery to a pan with a pinch of salt and a little water. Stir regularly and sweat on a low heat for at least 30 minutes. The longer you go, the better it tastes.' },
    { title: 'Deglaze and build flavour', text: 'Add the balsamic vinegar to deglaze the pan, then add the minced garlic and chillies. Leave to cook for a further 5 minutes.' },
    { title: 'Add the pepper, herbs and spices', text: 'Add the diced red pepper, cumin, smoked paprika, and dried parsley. Stir everything together and cook for another 2-3 minutes until the spices are fragrant.' },
    { title: 'Add the tomatoes and beans', text: 'Tip in the chopped tomatoes and stir well, then add the haricot and butter beans. If you want a creamier texture, mash a few beans against the side of the pan.' },
    { title: 'Simmer', text: 'Bring to a simmer and let it bubble away for 15-20 minutes, stirring occasionally, until the sauce thickens and the beans are coated.' },
    { title: 'Finish and serve', text: 'Remove from the heat and stir in the lime juice. Taste and adjust the seasoning. Top with fresh coriander and serve.' },
  ],
  nutritional: [
    { item: 'Calories', value: '64kcal' },
    { item: 'Protein', value: '3g' },
    { item: 'Carbohydrates', value: '9g' },
    { item: 'Fat', value: '1g' },
    { item: 'Fiber', value: '3g' },
    { item: 'Iron', value: '4% DV' },
    { item: 'Potassium', value: '4% DV' },
  ],
}

export default recipe
