import { ref, onMounted, onUnmounted } from 'vue';

interface UseCursorBannerOptions {
    offsetX?: number;
    offsetY?: number;
}

export function useCursorBanner(options: UseCursorBannerOptions = {}) {
    const { offsetX = 15, offsetY = 15 } = options;

    const isVisible = ref(false);
    const text = ref('');
    const x = ref(0);
    const y = ref(0);
    const rawX = ref(0);
    const rawY = ref(0);

    function onMouseMove(event: MouseEvent) {
        rawX.value = event.clientX;
        rawY.value = event.clientY;
        x.value = event.clientX + offsetX;
        y.value = event.clientY + offsetY;
    }

    function show(bannerText: string, event?: MouseEvent) {
        text.value = bannerText;
        if (event) {
            rawX.value = event.clientX;
            rawY.value = event.clientY;
            x.value = event.clientX + offsetX;
            y.value = event.clientY + offsetY;
        }
        isVisible.value = true;
        window.addEventListener('mousemove', onMouseMove);
    }

    function hide() {
        isVisible.value = false;
        window.removeEventListener('mousemove', onMouseMove);
    }

    onUnmounted(() => {
        window.removeEventListener('mousemove', onMouseMove);
    });

    return {
        isVisible,
        text,
        x,
        y,
        rawX,
        rawY,
        show,
        hide,
    };
}
