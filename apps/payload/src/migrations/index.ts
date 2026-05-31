import * as migration_20260430_163009_recipe_migration from './20260430_163009_recipe_migration';
import * as migration_20260531_193742_recipes from './20260531_193742_recipes';
import * as migration_20260531_200903_highlighted_recipes from './20260531_200903_highlighted_recipes';

export const migrations = [
  {
    up: migration_20260430_163009_recipe_migration.up,
    down: migration_20260430_163009_recipe_migration.down,
    name: '20260430_163009_recipe_migration',
  },
  {
    up: migration_20260531_193742_recipes.up,
    down: migration_20260531_193742_recipes.down,
    name: '20260531_193742_recipes',
  },
  {
    up: migration_20260531_200903_highlighted_recipes.up,
    down: migration_20260531_200903_highlighted_recipes.down,
    name: '20260531_200903_highlighted_recipes'
  },
];
