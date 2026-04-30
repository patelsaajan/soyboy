import { gsap } from 'gsap';

interface UseLetterHoverOptions {
    primaryColor?: string;
    baseColor?: string;
    maxDistance?: number;
    selector?: string;
    duration?: number;
}

export function useLetterHover(options: UseLetterHoverOptions = {}) {
    const {
        primaryColor = '#d20a2e',
        baseColor = '#ffffff',
        maxDistance = 200,
        selector = '.letter',
        duration = 0.15,
    } = options;

    function onMouseMove(event: MouseEvent) {
        const target = event.currentTarget as HTMLElement;
        if (!target) return;
        const letterElements = target.querySelectorAll(selector);

        letterElements.forEach((el) => {
            const rect = el.getBoundingClientRect();
            const letterCenterX = rect.left + rect.width / 2;
            const letterCenterY = rect.top + rect.height / 2;

            const distance = Math.sqrt(
                Math.pow(event.clientX - letterCenterX, 2) +
                Math.pow(event.clientY - letterCenterY, 2)
            );

            const intensity = Math.max(0, 1 - distance / maxDistance);

            if (intensity > 0) {
                gsap.to(el, {
                    color: gsap.utils.interpolate(baseColor, primaryColor, intensity),
                    duration,
                });
            } else {
                gsap.to(el, { color: baseColor, duration });
            }
        });
    }

    function onMouseLeave(event: MouseEvent) {
        const target = event.currentTarget as HTMLElement;
        if (!target) return;
        const letterElements = target.querySelectorAll(selector);

        gsap.to(letterElements, { color: baseColor, duration: 0.3 });
    }

    return {
        onMouseMove,
        onMouseLeave,
    };
}
