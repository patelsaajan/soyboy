import type { Config } from 'payload'

import { Categories } from './collections/Categories'
import { Recipes } from './collections/Recipes'

export type RecipesPluginConfig = {
  disabled?: boolean
}

export const recipesPlugin =
  (pluginOptions: RecipesPluginConfig) =>
  (config: Config): Config => {
    if (!config.collections) {
      config.collections = []
    }

    config.collections.push(Categories, Recipes)

    if (pluginOptions.disabled) {
      return config
    }

    return config
  }
