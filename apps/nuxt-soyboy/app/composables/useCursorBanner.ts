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

    function onMouseMove(event: MouseEvent) {
        x.value = event.clientX + offsetX;
        y.value = event.clientY + offsetY;
    }

    function show(bannerText: string, event?: MouseEvent) {
        text.value = bannerText;
        if (event) {
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
        show,
        hide,
    };
}
