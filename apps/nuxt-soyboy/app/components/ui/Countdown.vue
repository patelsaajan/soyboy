<template>
    <div
        ref="elementRef"
        class="container mx-auto opacity-0 translate-y-10"
    >
        <div class="flex flex-col gap-20 w-full">
            <UiHoverText
                    v-if="title"
                    :text="title"
                    container-class="text-4xl md:text-6xl font-bold tracking-tight mb-4 font-sans col-span-12 lg:col-span-7 gap-x-4"
                />
            <div class="flex flex-wrap gap-6 md:gap-12 lg:gap-20 justify-center">
            <CoreStatisitc
                :number="years"
                statistic="Years"
                :padding="1"
            />
            <CoreStatisitc
                :number=days
                statistic="Days"
            />
            <CoreStatisitc
                :number=hours
                statistic="Hours"
            />
            <CoreStatisitc
                :number=minutes
                statistic="Minutes"
            />
            <CoreStatisitc
                :number=seconds
                statistic="Seconds"
            />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { gsap } from 'gsap';

const years = ref(0);
const days = ref(0);
const hours = ref(0);
const minutes = ref(0);
const seconds = ref(0);

const props = defineProps<{
        title?: string;
        date: Date;
    }>();

const { elementRef } = useScrollEntrance({
    threshold: 0.5,
    onEnter: () => {
        if (elementRef.value) {
            gsap.to(elementRef.value, {
                opacity: 1,
                y: 0,
                duration: 0.8,
                ease: 'power2.out',
            });
        }
        startCountdown();
    },
});

function updateTime() {
    const now = new Date();
    const diff = now.getTime() - props.date.getTime();

    years.value = Math.floor(diff / (1000 * 60 * 60 * 24 * 365));
    days.value = Math.floor((diff % (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24));
    hours.value = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    minutes.value = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    seconds.value = Math.floor((diff % (1000 * 60)) / 1000);
}

let interval: ReturnType<typeof setInterval> | null = null;

function startCountdown() {
    updateTime();
    interval = setInterval(updateTime, 1000);
}

onMounted(() => {
    updateTime(); // Initialize values immediately so they're correct before any animations
});

onUnmounted(() => {
    if (interval) clearInterval(interval);
});
</script>
