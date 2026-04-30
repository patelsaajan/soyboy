interface UseScrollEntranceOptions {
    threshold?: number;
    onEnter?: () => void;
    once?: boolean;
}

export function useScrollEntrance(options: UseScrollEntranceOptions = {}) {
    const { threshold = 0.5, onEnter, once = true } = options;

    const elementRef = ref<HTMLElement | null>(null);
    const hasEntered = ref(false);

    onMounted(() => {
        if (!elementRef.value) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && !hasEntered.value) {
                        hasEntered.value = true;
                        onEnter?.();

                        if (once) {
                            observer.disconnect();
                        }
                    } else if (!entry.isIntersecting && !once) {
                        hasEntered.value = false;
                    }
                });
            },
            { threshold }
        );

        observer.observe(elementRef.value);

        onUnmounted(() => {
            observer.disconnect();
        });
    });

    return { elementRef, hasEntered };
}
