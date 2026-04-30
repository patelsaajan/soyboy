'use client'
import { useRowLabel } from '@payloadcms/ui'

export const IngredientRowLabel = () => {
  const { data, rowNumber } = useRowLabel<{ item?: string }>()
  return <span>{data?.item || `Ingredient ${(rowNumber ?? 0) + 1}`}</span>
}
