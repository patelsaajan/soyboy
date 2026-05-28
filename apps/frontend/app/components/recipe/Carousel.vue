<template>
    <div class="relative w-full overflow-hidden">
        <div class="container mx-auto">
            <div class="absolute inset-0 pointer-events-none z-10 flex justify-between">
                <div
                    class="overlay hidden md:block h-full w-10 lg:w-60 bg-linear-to-r from-background to-transparent"
                />
                <div
                    class="overlay hidden md:block h-full w-10 lg:w-60 bg-linear-to-l from-background to-transparent"
                />
            </div>
            <div ref="swiperEl" class="swiper">
                <div class="flex items-center justify-between mb-6">
                <div class="flex items-baseline gap-4 z-20">
                    <h2 class="font-sans text-2xl md:text-3xl font-bold leading-none tracking-tight">
                        Saajan's Specials
                    </h2>
                </div>
                 <div class="swiper-button swiper-button-prev" />
                <div class="swiper-button swiper-button-next" />
            </div>
                <div class="swiper-wrapper">
                    <div
                        v-for="(recipe, index) in recipes"
                        :key="recipe.uri || index"
                        class="swiper-slide"
                    >
                        <RecipeCard
                            size="stacked"
                            :recipe="recipe"
                            :linkable="true"
                        />
                    </div>
                </div>
                <div class="swiper-pagination" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import Swiper from 'swiper';
import type { SwiperOptions } from 'swiper/types';
import { Navigation, Pagination } from 'swiper/modules';

import lentilBolognese from '~~/content/recipes/lentil-bolognese';
import aglioEOlio from '~~/content/recipes/aglio-e-olio';
import spicyBeans from '~~/content/recipes/baked-beans';
import infusedTofu from '~~/content/recipes/infused-tofu';
import bananaBread from '~~/content/recipes/banana-bread';

const recipes = [
    lentilBolognese,
    aglioEOlio,
    spicyBeans,
    infusedTofu,
    bananaBread,
];

const swiperEl = ref<HTMLElement | null>(null);
const activeIndex = ref(0);

const swiperConfig: SwiperOptions = {
    modules: [ Navigation, Pagination ],
    slidesPerView: 1.3,
    slidesPerGroup: 1,
    spaceBetween: 20,
    speed: 500,
    navigation: {
    nextEl: ".swiper-button-next",
    prevEl: ".swiper-button-prev"
    },
    pagination: {
        el: ".swiper-pagination",
        type: 'bullets'
    },
    breakpoints: {
        480: { slidesPerView: 2.1 },
        768: { slidesPerView: 2.8 },
        1024: { slidesPerView: 3.3 },
    },
    on: {
        slideChange(instance) {
            activeIndex.value = instance.activeIndex;
        },
    },
};

let swiperInstance: Swiper | null = null;

onMounted(() => {
    if (swiperEl.value) {
        swiperInstance = new Swiper(swiperEl.value, swiperConfig);
    }
});

onUnmounted(() => {
    swiperInstance?.destroy();
});
</script>

<style scoped>
:deep(.swiper) {
    overflow: visible;
    z-index: unset;
    margin-bottom: 100px;
}

:deep(.swiper-slide) {
    height: auto;
}

:deep(.swiper-button) {
    position: absolute;
    top: 22px;
    right: 0 !important;
    background-color: var(--color-primary);
    padding: 12px;
    border-radius: var(--radius-md);
    color: white;
    z-index: 15;

    @media screen and (max-width: 768px) {    
        display: none !important;
    }
}

:deep(.swiper-button-prev) { 
    left: auto;
    margin-right: 66px;
}

:deep(.swiper-pagination) {
    top: unset;
    bottom: -50px;
}

:deep(.swiper-pagination-bullet) {
        background-color: grey;
}

:deep(.swiper-pagination-bullet-active) {
    background-color: var(--color-primary);
}



</style>
