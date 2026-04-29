import type { Config } from 'payload'

export type RecipesPluginConfig = {
  disabled?: boolean
}

export const recipesPlugin =
  (pluginOptions: RecipesPluginConfig) =>
  (config: Config): Config => {
    if (!config.collections) {
      config.collections = []
    }

    if (pluginOptions.disabled) {
      return config
    }

    return config
  }
