import type { Recipe } from '~~/types/recipes';
import gochujangSatay from './gochujang-satay-sauce';
import lentilBolognese from './lentil-bolognese';
import aglioEOlio from './aglio-e-olio';
import spicyBeans from './baked-beans';
import infusedTofu from './infused-tofu';
import bananaBread from './banana-bread';

const recipes: Record<string, Recipe> = {
    'korean-satay-sauce': gochujangSatay,
    'lentil-bolognese': lentilBolognese,
    'aglio-e-olio': aglioEOlio,
    'baked-beans': spicyBeans,
    'infused-tofu': infusedTofu,
    'banana-bread': bananaBread,
};

export const allRecipes = Object.values(recipes);

export function getRecipeBySlug(slug: string): Recipe | undefined {
    return recipes[slug];
}

export default recipes;
