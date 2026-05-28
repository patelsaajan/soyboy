<template>
    <div class="flex flex-col gap-12 md:gap-60 mt-10 md:mb-40">
        <div class="container mx-auto px-4 md:px-0">
            <div class="flex flex-col gap-12 md:gap-40 justify-center mt-12 md:mt-60">
                <div class="grid grid-cols-12 gap-8 items-end">
                    <!-- Title on the left -->
                    <div class="col-span-12 lg:col-span-7 flex flex-col items-center lg:items-start">
                        <span
                            @mousemove="handleMouseMove"
                            @mouseleave="handleMouseLeave"
                        >
                            <h1 ref="titleRef" class="font-sans flex flex-col leading-none">
                                <span class="flex">
                                    <span
                                        v-for="(_letter, index) in firstWord"
                                        :key="'first-' + index"
                                        class="letter inline-block opacity-0 text-[60px] sm:text-[90px] lg:text-[120px] xl:text-[180px] cursor-default leading-none"
                                    >
                                        {{ firstWord[index] }}
                                    </span>
                                </span>
                                <span class="flex">
                                    <span
                                        v-for="(_letter, index) in secondWord"
                                        :key="'second-' + index"
                                        class="letter inline-block opacity-0 text-[60px] sm:text-[90px] lg:text-[120px] xl:text-[180px] cursor-default leading-none"
                                    >
                                        {{ secondWord[index] }}
                                    </span>
                                </span>
                            </h1>
                        </span>
                    </div>

                    <!-- Text and buttons on the right -->
                    <div ref="contentRef" class="col-span-12 lg:col-span-5 pb-6 opacity-0 flex flex-col items-center">
                        <p class="text-lg text-gray-300 mb-6 max-w-md">
                            Soyboy (noun) is a term used to describe a man perceived as lacking traditional masculine traits, often characterised as passive or "soft."
                        </p>
                        <div class="flex gap-4 justify-center lg:justify-start">
                            <CoreButton
                                color="primary"
                                to="/recipes"
                            >
                                Recipes
                            </CoreButton>
                            <CoreButton
                                color="secondary"
                                to="https://www.instagram.com/soyboysaajan/"
                                icon="ph:instagram-logo"
                            >
                                Instagram
                            </CoreButton>
                        </div>
                    </div>
                </div>
                <RecipeDaily ref="recipeDailyRef" :disable-entrance="true" class="w-full" />
            </div>
        </div>

        <div class="w-full h-fit flex relative">
            <CarouselImages />
        </div>

        <div class="container mx-auto flex flex-col gap-30">
            <!-- Story + Countdown side by side -->
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">
                  <UiHoverText
                    text="How long I've been a soyboy?"
                    container-class="text-4xl md:text-6xl font-bold tracking-tight mb-4 font-sans lg:col-span-7 gap-x-4"
                />
                <p class="lg:col-span-5 text-white/60 text-lg leading-relaxed">
                    I grew up vegetarian, so going fully vegan was never the leap most people assume. In 2018 I started eating mostly plant-based, letting myself one cheat meal a month. Every single time, I paid for it the next day. Sluggish, heavy, slow. The last one was my sister's birthday. A Chinese takeaway, usually one of my favourites, that just didn't hit the same. I couldn't justify it anymore. That was 16 June 2020.
                </p>
            </div>

            <div class="lg:col-span-12">
                <UiCountdown
                    :date="new Date('2020-06-16T20:10:29Z')"
                />
            </div>

            <UiImpactLedger
                heading="What those days added up to?!"
                :items="[
                    { value: veganDays, title: 'animals', subtitle: 'no longer harmed', color: 'oklch(0.44 0.22 25)', prefix: '~' },
                    { value: Math.round(veganDays * 4160 / 1000), title: 'water', subtitle: 'not consumed', color: 'oklch(0.60 0.12 228)', unit: 'k L' },
                    { value: veganDays * 9, title: 'CO₂', subtitle: 'kept from the atmosphere', color: 'oklch(0.74 0.15 68)', unit: 'kg' },
                    { value: Math.round(veganDays * 2.8), title: 'forest', subtitle: 'still standing', color: 'oklch(0.58 0.13 145)', unit: 'm²' },
                ]"
            >
                <span class="text-xs text-white/20 text-right">
                    Stats via <a href="https://thevegancalculator.com/" target="_blank" class="underline hover:text-white/40 transition-colors">Vegan Calculator</a>
                </span>
            </UiImpactLedger>
        </div>

        <div class="w-full">
            <UiFeatureList :features="features" />
        </div>

        <div class="w-full h-fit flex relative">
            <div class="absolute inset-0 pointer-events-none z-10 flex justify-between">
                <div
                    class="overlay hidden md:block h-full w-60 bg-linear-to-r from-background to-transparent"
                />
                <div
                    class="overlay hidden md:block h-full w-60 bg-linear-to-l from-background to-transparent"
                />
            </div>
            <RecipeCarousel />
        </div>

        <div class="w-full">
            <UiAccordion
                title="Frequently Asked Questions"
                :questions="questions"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
import type { ComponentPublicInstance } from 'vue';
import { gsap } from 'gsap';
import { features } from '../../content/home';
import { questions } from '../../content/home';

const firstWord = "SOYBOY";
const secondWord = "SAAJAN";
const allLetters = firstWord + secondWord;
const titleRef = ref<HTMLElement | null>(null);
const contentRef = ref<HTMLElement | null>(null);
const recipeDailyRef = ref<ComponentPublicInstance | null>(null);

const primaryColor = '#d20a2e';
const baseColor = '#ffffff';
const isIntroComplete = ref(false);

const veganDays = computed(() => {
    const startDate = new Date('2020-06-16T20:10:29Z');
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - startDate.getTime());
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
});

const { onMouseMove, onMouseLeave } = useLetterHover({
    maxDistance: 200,
    selector: '.letter',
});

function handleMouseMove(event: MouseEvent) {
    if (!isIntroComplete.value) return;
    onMouseMove(event);
}

function handleMouseLeave(event: MouseEvent) {
    if (!isIntroComplete.value) return;
    onMouseLeave(event);
}

onMounted(() => {
    if (titleRef.value) {
        const letterElements = titleRef.value.querySelectorAll('.letter');

        gsap.set(letterElements, { color: primaryColor });

        letterElements.forEach((el, index) => {
            gsap.to(el, {
                opacity: 1,
                duration: 0.1,
                delay: index * 0.1,
                onComplete: () => {
                    gsap.to(el, {
                        color: baseColor,
                        duration: 0.6,
                        ease: 'power2.out',
                    });

                    if (index === allLetters.length - 1) {
                        const tl = gsap.timeline({ delay: 0.3 });
                        tl.to(contentRef.value, {
                            opacity: 1,
                            y: 0,
                            duration: 0.6,
                            ease: 'power2.inOut',
                        })
                            .to(recipeDailyRef.value?.$el, {
                                opacity: 1,
                                y: 0,
                                duration: 0.6,
                                ease: 'power2.out',
                            })
                            .call(() => {
                                isIntroComplete.value = true;
                            });
                    }
                },
            });
        });
    }
});

</script>

<style scoped>
</style>
