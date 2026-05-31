import type { SeedRecipe } from '../types'

const recipe: SeedRecipe = {
  title: 'Banana Bread',
  uri: 'banana-bread',
  cuisine: 'Baking',
  time: '45 minutes',
  serves: 8,
  description:
    'A soft, moist banana bread packed with warm spices, chocolate chips, and crunchy walnuts. Naturally sweetened with maple syrup and perfect for a comforting snack or breakfast.',
  imgSrc: 'banana-bread.png',
  intro:
    'This banana bread is one of those reliable recipes you can throw together with overripe bananas and pantry staples. The maple syrup adds a gentle sweetness, while cinnamon and nutmeg bring warmth.',
  ingredients: [
    { quantity: 4, unit: '', item: 'Ripe bananas, mashed' },
    { quantity: 75, unit: 'g', item: 'Butter' },
    { quantity: 4, unit: 'tbsp', item: 'Maple syrup' },
    { quantity: 4, unit: 'tbsp', item: 'Milk' },
    { quantity: 2, unit: 'tsp', item: 'Vanilla extract' },
    { quantity: 1, unit: 'tsp', item: 'Apple cider vinegar' },
    { quantity: 225, unit: 'g', item: 'Plain or oat flour' },
    { quantity: 1, unit: 'tsp', item: 'Baking powder' },
    { quantity: 1, unit: 'tsp', item: 'Bicarbonate of soda' },
    { quantity: 2, unit: 'tbsp', item: 'Cinnamon' },
    { quantity: 0.5, unit: 'tsp', item: 'Nutmeg' },
    { quantity: 0.5, unit: 'tsp', item: 'Salt' },
    { quantity: 100, unit: 'g', item: 'Chocolate chips' },
    { quantity: 100, unit: 'g', item: 'Crushed walnuts' },
  ],
  method: [
    { title: 'Preheat and prepare', text: 'Preheat the oven to 180°C (350°F). Line or grease a loaf tin.' },
    { title: 'Mix wet ingredients', text: 'In a large bowl, mash the bananas. Add the butter, maple syrup, milk, vanilla extract, and apple cider vinegar. Stir well until combined.' },
    { title: 'Add dry ingredients', text: 'Add the flour, baking powder, bicarbonate of soda, cinnamon, nutmeg, and salt. Mix until just combined, being careful not to overmix.' },
    { title: 'Fold in add-ins', text: 'Gently fold in the chocolate chips and crushed walnuts.' },
    { title: 'Bake', text: 'Pour the mixture into the loaf tin and bake for approximately 45 minutes, or until a knife inserted into the centre comes out clean.' },
    { title: 'Cool', text: 'Leave the bread in the tin for 15 minutes, then transfer to a wire rack to cool completely.' },
  ],
  nutritional: [
    { item: 'Protein', value: '4g' },
    { item: 'Carbohydrates', value: '38g' },
    { item: 'Fat', value: '14g' },
    { item: 'Fibre', value: '3g' },
    { item: 'Sugar', value: '18g' },
  ],
}

export default recipe
