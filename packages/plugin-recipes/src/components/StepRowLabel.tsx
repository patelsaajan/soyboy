'use client'
import { useRowLabel } from '@payloadcms/ui'

export const StepRowLabel = () => {
  const { data, rowNumber } = useRowLabel<{ title?: string }>()
  return <span>{data?.title || `Step ${(rowNumber ?? 0) + 1}`}</span>
}
