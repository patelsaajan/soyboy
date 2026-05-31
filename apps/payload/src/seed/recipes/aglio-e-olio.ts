import type { SeedRecipe } from '../types'

const recipe: SeedRecipe = {
  title: 'Aglio e Olio',
  uri: 'aglio-e-olio',
  highlighted: true,
  cuisine: 'Italian',
  time: '15 minutes',
  serves: 3,
  description:
    'The ultimate minimalist pasta. Just garlic, olive oil, chili flakes, and spaghetti – simple ingredients transformed into something magical. This Roman classic proves that less really is more when you nail the technique.',
  imgSrc: 'aglio-e-olio.jpg',
  intro:
    "Garlic, olive oil, chilli, and pasta — what is there not to love. Throw in some bread to clean up the plate and you're in carbohydrate heaven.",
  ingredients: [
    { quantity: 500, unit: 'g', item: 'Spaghetti' },
    { quantity: 1, unit: 'bulb', item: 'Garlic, thinly sliced' },
    { quantity: 80, unit: 'ml', item: 'Extra virgin olive oil' },
    { quantity: 3, unit: 'tsp', item: 'Finger Chillis' },
    { quantity: 1, unit: 'handful', item: 'Fresh parsley, chopped' },
    { quantity: 0.5, unit: 'cup', item: 'Pasta water' },
  ],
  method: [
    { title: 'Boil the Pasta', text: "Bring a large pot of heavily salted water to boil. Cook the spaghetti according to package directions, but pull it out 1 minute early – it'll finish cooking in the sauce. Reserve a cup of pasta water before draining." },
    { title: 'Slice the Garlic', text: "While the pasta cooks, thinly slice the garlic. Paper thin is what you're after – it'll cook evenly and melt into the oil. Don't be tempted to mince it; slices give a better texture and help prevent the garlic burning." },
    { title: 'Infuse the Oil', text: 'In a large cold pan, add the olive oil, sliced garlic and chillis. Turn the heat to medium-low and let the garlic gently sizzle. Swirl the pan occasionally. You want it golden, not brown.' },
    { title: 'Bring It Together', text: 'Turn off the heat. Add the drained pasta directly to the pan along with a splash of pasta water. Toss vigorously – the starchy water emulsifies with the oil to create a silky sauce that clings to every strand.' },
    { title: 'Finish and Serve', text: "Add more pasta water if needed – you want it glossy, not dry. Throw in the fresh parsley, toss once more, and serve immediately. No cheese needed, though nutritional yeast is a nice touch." },
  ],
  nutritional: [
    { item: 'Calories', value: '181kcal' },
    { item: 'Protein', value: '5g' },
    { item: 'Carbohydrates', value: '25g' },
    { item: 'Fat', value: '7g' },
    { item: 'Fiber', value: '1g' },
    { item: 'Vitamin E', value: '5% DV' },
    { item: 'Manganese', value: '12% DV' },
  ],
  suggestions: [
    { title: 'Sundried Tomatoes', text: "Add sundried tomatoes when you're infusing the oil — they bring a nice savory, salty taste to it." },
    { title: 'Mushrooms', text: "Slice mushrooms and add them to a dry pan with a splash of water on high heat — this draws out the excess moisture. Once they've dried out, set them aside and add them back in just before the pasta goes in." },
  ],
}

export default recipe
