<template>
    <div
        ref="elementRef"
        class="sm:container sm:mx-auto opacity-0 translate-y-20"
    >
        <div class="w-full h-full flex gap-20 flex-col">
            <div class="grid grid-cols-12 px-4 sm:px-0">
                <UiHoverText
                    :text="features.title"
                    container-class="text-4xl md:text-6xl font-bold tracking-tight mb-4 font-sans col-span-12 lg:col-span-7 gap-x-4"
                />
                <span
                    v-if="features.description"
                    class="text-lg text-gray-300 max-w-2xl col-span-12 lg:col-span-5 mt-4 lg:mt-0"
                >
                    {{ features.description }}
                </span>
            </div>

            <div class="bg-primary/40 p-4 sm:p-8 sm:rounded-2xl shadow-lg border-3 border-primary/40">
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <!-- Feature items on the left -->
                    <div class="flex flex-col justify-between row-span-1 gap-4">
                        <div
                            v-for="item in features.items"
                            :key="item.id"
                            class="flex items-center gap-4 backdrop-blur-sm rounded-2xl px-6 py-4 transition-colors cursor-pointer"
                            :class="selectedItem?.id === item.id ? 'bg-primary' : 'bg-primary/40 hover:bg-primary/60'"
                            @click="selectItem(item)"
                        >
                            <div class="flex-shrink-0 size-16 bg-primary/80 rounded-full flex items-center justify-center">
                                <Icon
                                    :name="item.icon"
                                    class="size-8 text-white"
                                />
                            </div>
                            <span class="text-white font-medium text-2xl font-sans">
                                {{ item.label }}
                            </span>
                        </div>
                    </div>

                    <!-- Title card on the right -->
                    <div
                        class="bg-background rounded-2xl p-8 shadow-lg flex flex-col overflow-hidden row-span-1"
                    >
                        <h2
                            ref="cardTitleRef"
                            class="text-3xl lg:text-4xl font-bold text-primary mb-4 font-sans text-left"
                        >
                            {{ selectedItem?.title }}
                        </h2>
                        <p
                            ref="cardDescRef"
                            class="text-white leading-relaxed"
                        >
                            {{ selectedItem?.desc }}
                        </p>
                        <div
                            v-if="selectedItem"
                            class="mt-6 cursor-none flex-1 flex items-center justify-center min-h-0"
                            @mouseenter="(e) => cursorMarqueeRef?.show(selectedItem?.hoverLabel || '', e)"
                            @mouseleave="cursorMarqueeRef?.hide()"
                        >
                            <NuxtImg
                                ref="cardImageRef"
                                :src="`${selectedItem.image}`"
                                alt="Feature Image"
                                class="rounded-lg object-cover w-auto aspect-square h-80"
                            />
                        </div>
                    </div>

                    <UiCursorMarquee ref="cursorMarqueeRef" />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { ComponentPublicInstance } from 'vue';
import gsap from 'gsap';
import type { FeatureListProps, FeatureItem, CursorMarqueeExpose } from '~/types';

const props = defineProps<FeatureListProps>();

const selectedItem = ref<FeatureItem | null>(props.features.items[0] || null);
const cardTitleRef = ref<HTMLElement | null>(null);
const cardDescRef = ref<HTMLElement | null>(null);
const cardImageRef = ref<ComponentPublicInstance | null>(null);
const cursorMarqueeRef = ref<CursorMarqueeExpose | null>(null);
const isAnimating = ref(false);

const { elementRef } = useScrollEntrance({
    threshold: 0.3,
    onEnter: () => {
        if (elementRef.value) {
            gsap.to(elementRef.value, {
                opacity: 1,
                y: 0,
                duration: 1,
                ease: 'power2.out',
            });
        }
    },
});

async function selectItem(item: FeatureItem) {
    if (isAnimating.value || selectedItem.value?.id === item.id) return;
    isAnimating.value = true;

    // Slide out current content to the right
    await gsap.to([cardTitleRef.value, cardDescRef.value, cardImageRef.value?.$el], {
        opacity: 0,
        x: 50,
        duration: 0.2,
        ease: 'power2.in',
    });

    // Update the selected item
    selectedItem.value = item;

    // Wait for Vue to update the DOM
    await nextTick();

    // Wait for the new image to load
    const imgEl = cardImageRef.value?.$el as HTMLImageElement | undefined;
    if (imgEl && !imgEl.complete) {
        await new Promise<void>((resolve) => {
            imgEl.onload = () => resolve();
            imgEl.onerror = () => resolve();
        });
    }

    // Set starting position to the left
    gsap.set([cardTitleRef.value, cardDescRef.value, cardImageRef.value?.$el], {
        x: -50,
        opacity: 0,
    });

    // Slide in new content from the left
    await gsap.to([cardTitleRef.value, cardDescRef.value, cardImageRef.value?.$el], {
        opacity: 1,
        x: 0,
        duration: 0.3,
        ease: 'power2.out',
    });

    isAnimating.value = false;
}

</script>
