<template>
    <div
        ref="containerRef"
        class="flex flex-col gap-4 md:gap-10 justify-center items-center font-sans font-bold"
    >
        <span
            class="text-4xl md:text-6xl lg:text-[80px] inline-block text-center"
            :style="{ minWidth: `${padding * 1.2}em` }"
        >
            {{ String(displayNumber).padStart(padding, '0') }}
        </span>
        <span class="text-lg md:text-2xl lg:text-[40px]">{{ statistic }}</span>
    </div>
</template>

<script setup lang="ts">
import gsap from 'gsap';

const props = withDefaults(defineProps<{
    number: number;
    statistic: string;
    padding?: number;
}>(), {
    padding: 2,
});

const containerRef = ref<HTMLElement | null>(null);
const displayNumber = ref(0);
const hasAnimated = ref(false);

function animateNumber() {
    if (hasAnimated.value) return;
    hasAnimated.value = true;

    gsap.to(displayNumber, {
        value: props.number,
        duration: 1.5,
        ease: 'power2.out',
        roundModifier: true,
        snap: { value: 1 },
    });
}

watch(() => props.number, (newVal) => {
    if (hasAnimated.value) {
        gsap.to(displayNumber, {
            value: newVal,
            duration: 0.5,
            ease: 'power2.out',
            snap: { value: 1 },
        });
    }
});

onMounted(() => {
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    animateNumber();
                    observer.disconnect();
                }
            });
        },
        { threshold: 0.5 }
    );

    if (containerRef.value) {
        observer.observe(containerRef.value);
    }

    onUnmounted(() => observer.disconnect());
});
</script>