<template>
    <div class="flex flex-col gap-12 md:gap-60 mt-10">
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
                        <p class="text-lg text-gray-300 mb-6 max-w-md text-justify">
                            Soyboy (noun) is a term used to describe a man perceived as lacking traditional masculine traits, often characterised as passive or "soft."
                        </p>
                        <div class="flex gap-4 justify-center lg:justify-start w-md ">
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
                <RecipeDaily ref="recipeDailyRef" :disable-entrance="true" class="mt-8 w-full" />
            </div>
        </div>
        <div
            class="w-full h-fit flex relative mt-20"
        >
             <div class="absolute inset-0 pointer-events-none z-10 flex justify-between">
                <div
                    class="overlay hidden md:block h-full w-60 bg-gradient-to-r from-background to-transparent"
                />
                <div
                    class="overlay hidden md:block h-full w-60 bg-gradient-to-l from-background to-transparent"
                />
            </div>
            <CarouselImages />
        </div>

        <div class="w-full">
            <UiFeatureList :features="features" />
        </div>

        <div class="w-full flex flex-col items-center gap-20">
            <UiCountdown
                title="How long i've been a soyboy?"
                :date="new Date('2020-06-16T20:10:29Z')"
            />
            <div
                ref="statsRef"
                class="container mx-auto opacity-0 translate-y-10"
            >
                <div
                    class="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 items-start"
                >
                    <CoreCard 
                        variant="outline"
                        class="mt-8"
                        title="CO2 Saved"
                        :number="veganDays * 9"
                        unit="kg"
                        color="#C77700"

                    />
                    <CoreCard 
                        variant="outline"
                        class="mt-8"
                        title="Water Saved"
                        :number="veganDays * 4160"
                        unit="liters"
                        color="#0D47A1"                        
                    />
                    <CoreCard 
                        variant="primary"
                        class="mt-8"
                        title="Animals Saved"
                        :number="veganDays * 1"
                        unit="lives"
                        
                    />
                    <CoreCard 
                        variant="outline"
                        class="mt-8"
                        title="Forest Saved"
                        :number="(veganDays * 2.8).toFixed(0)"
                        unit="m²"
                        color="#1B5E20"
                    />
                </div>
                <span
                    class="text-sm text-gray-400 mt-4 block text-center"
                >
                Statistics sourced from <a href="https://thevegancalculator.com/" target="_blank">Vegan Calculator</a>. Try it to calculate your own impact.</span>
            </div>

        </div>
        <div class="w-full mb-20">
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

        // Each letter appears in red, then fades to white
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

                    // After last letter, fade in content and recipe daily
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

const { elementRef: statsRef } = useScrollEntrance({
    threshold: 0.6,
    onEnter: () => {
        if (statsRef.value) {
            gsap.to(statsRef.value, {
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
</style
