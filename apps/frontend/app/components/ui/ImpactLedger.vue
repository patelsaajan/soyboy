<template>
    <div
        ref="elementRef"
        class="flex flex-col gap-10 opacity-0 translate-y-10"
    >
        <h2 v-if="heading">{{ heading }}</h2>
        <div class="flex flex-col border-t border-white/10">
            <div
                v-for="(item, i) in items"
                :key="i"
                class="flex items-end justify-between gap-6 py-8 md:py-10 border-b border-white/10"
            >
                <span
                    class="font-sans tabular-nums leading-none text-[clamp(2.5rem,7vw,5rem)]"
                    :style="{ color: item.color }"
                >
                    {{ item.prefix }}{{ Math.round(animatedValues[i]!.value).toLocaleString() }}<span v-if="item.unit" class="text-[0.4em] ml-1">{{ item.unit }}</span>
                </span>
                <div class="text-right">
                    <span class="block font-sans text-white text-lg md:text-2xl leading-tight">{{ item.title }}</span>
                    <span class="block text-white/40 text-xs uppercase tracking-widest mt-1">{{ item.subtitle }}</span>
                </div>
            </div>
        </div>
        <slot />
    </div>
</template>

<script setup lang="ts">
import { gsap } from 'gsap';

export interface LedgerItem {
    value: number;
    title: string;
    subtitle: string;
    color: string;
    unit?: string;
    prefix?: string;
}

const props = defineProps<{
    items: LedgerItem[];
    heading?: string;
}>();

const animatedValues = reactive(props.items.map(() => ({ value: 0 })));

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
        props.items.forEach((item, i) => {
            gsap.to(animatedValues[i]!, {
                value: item.value,
                duration: 2,
                ease: 'power2.out',
                delay: 0.2 + i * 0.15,
            });
        });
    },
});
</script>
