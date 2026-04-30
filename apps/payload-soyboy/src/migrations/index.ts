import * as migration_20260430_163009_recipe_migration from './20260430_163009_recipe_migration';

export const migrations = [
  {
    up: migration_20260430_163009_recipe_migration.up,
    down: migration_20260430_163009_recipe_migration.down,
    name: '20260430_163009_recipe_migration'
  },
];
