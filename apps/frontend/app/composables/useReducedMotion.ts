/**
 * Tracks the user's reduced-motion preference.
 *
 * Starts `false` on the server so SSR output is stable, then syncs on mount.
 * Consumers should treat a `true` value as "skip the animation and show the
 * final state", never as "hide the content".
 */
export function useReducedMotion() {
  const reduced = ref(false)

  onMounted(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    reduced.value = query.matches

    const onChange = (event: MediaQueryListEvent) => {
      reduced.value = event.matches
    }
    query.addEventListener('change', onChange)
    onUnmounted(() => query.removeEventListener('change', onChange))
  })

  return reduced
}
