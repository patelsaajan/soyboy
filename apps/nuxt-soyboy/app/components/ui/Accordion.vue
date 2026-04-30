<template>
    <div 
        ref="elementRef"
        class="container mx-auto opacity-0 translate-y-10"
    >
        <UiHoverText
            :text="title"
            container-class="text-4xl md:text-6xl font-bold tracking-tight mb-8 font-sans col-span-12 lg:col-span-7 gap-x-4"
        />
        <div class="flex flex-col gap-4 w-full">
            <div
                v-for="item in questions"
                :key="item.id"
                class="border-2 border-primary rounded-lg overflow-hidden"
            >
                <button
                    class="w-full flex justify-between items-center p-6 text-left bg-primary/20 hover:bg-primary/40 transition-colors duration-300 cursor-pointer"
                    @click="toggle(item.id)"
                >
                    <span class="text-xl font-bold">{{ item.question }}</span>
                    <span
                        class="text-2xl transition-transform duration-300"
                        :class="{ 'rotate-45': openId === item.id }"
                    >
                        +
                    </span>
                </button>
                <div
                    :ref="(el) => setItemRef(item.id, el as HTMLElement)"
                    class="overflow-hidden"
                    :style="{ height: openId === item.id ? heights[item.id] + 'px' : '0px' }"
                >
                    <div class="p-8 bg-primary/10 flex flex-col gap-6">
                        <p class="text-gray-300">{{ item.answer }}</p>
                        <div v-if="item.data?.length" class="flex flex-col gap-2">
                            <p class="text-gray-400 font-semibold">{{ item.dataName }}</p>
                            <ul class="list-disc list-inside space-y-1">
                                <li
                                    v-for="dataItem in item.data"
                                    :key="dataItem.name"
                                    class="text-gray-300"
                                >
                                    <span class="font-medium">{{ dataItem.name }}:</span> {{ dataItem.value }}
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { gsap } from 'gsap';
import type { AccordionProps } from '~/types';

defineProps<AccordionProps>();

const openId = ref<string | number | null>(null);
const itemRefs = ref<Record<string | number, HTMLElement | null>>({});
const heights = ref<Record<string | number, number>>({});

function setItemRef(id: string | number, el: HTMLElement | null) {
    itemRefs.value[id] = el;
    if (el) {
        heights.value[id] = el.scrollHeight;
    }
}

function toggle(id: string | number) {
    if (openId.value === id) {
        openId.value = null;
    } else {
        openId.value = id;
        nextTick(() => {
            const el = itemRefs.value[id];
            if (el) {
                heights.value[id] = el.scrollHeight;
            }
        });
    }
}

const { elementRef } = useScrollEntrance({
    threshold: 0.6,
    onEnter: () => {
        if (elementRef.value) {
            gsap.to(elementRef.value, {
                opacity: 1,
                y: 0,
                duration: 0.8,
                ease: 'power2.out',
            });
        }
    },
});
</script>

<style scoped>
div[style*="height"] {
    transition: height 0.3s ease;
}
</style>
