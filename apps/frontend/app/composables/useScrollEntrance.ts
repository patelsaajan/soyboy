import type { Ref } from 'vue';

interface UseScrollEntranceOptions {
    threshold?: number;
    onEnter?: () => void;
    once?: boolean;
    /**
     * Supply an existing ref instead of having one created. Needed when the
     * caller must declare the ref before a top-level `await` (defineExpose is
     * forbidden after one).
     */
    elementRef?: Ref<HTMLElement | null>;
}

export function useScrollEntrance(options: UseScrollEntranceOptions = {}) {
    const { threshold = 0.5, onEnter, once = true } = options;

    const elementRef = options.elementRef ?? ref<HTMLElement | null>(null);
    const hasEntered = ref(false);

    let observer: IntersectionObserver | null = null;

    // watch rather than onMounted: if the element is null at mount (v-if, async
    // data) the observer would never be created and the entrance animation
    // would silently never fire, leaving opacity-0 content invisible.
    watch(elementRef, (el) => {
        observer?.disconnect();
        observer = null;
        if (!el) return;

        observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && !hasEntered.value) {
                        hasEntered.value = true;
                        onEnter?.();

                        if (once) {
                            observer?.disconnect();
                            observer = null;
                        }
                    } else if (!entry.isIntersecting && !once) {
                        hasEntered.value = false;
                    }
                });
            },
            { threshold }
        );

        observer.observe(el);
    }, { immediate: true, flush: 'post' });

    onScopeDispose(() => {
        observer?.disconnect();
        observer = null;
    });

    return { elementRef, hasEntered };
}
