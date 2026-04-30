<template>

    <div
        class="container mx-auto my-12 px-4 lg:px-0"
    >
        <div
            class="grid grid-cols-1 lg:grid-cols-12 gap-8"
        >
            <!-- LEFT COLUMN - main content of the recipe pages -->
            <div
                class="flex flex-col gap-12 lg:gap-20 lg:col-span-8"
            >

            <!-- TOP RECIPES -->
            <div ref="topRecipesSection" class="flex flex-col gap-4">
                <h2>Highlights</h2>
                <!-- Mobile: single column stacked cards -->
                <div class="grid grid-cols-2 gap-4 lg:hidden">
                    <RecipeCard
                        v-for="r in recipes"
                        :key="`top-mobile-${r.uri}`"
                        size="stacked"
                        :recipe="r"
                        :linkable="false"
                        :selected="selectedRecipe?.uri === r.uri"
                        @click="selectRecipe(r)"
                    />
                </div>
                <!-- Desktop: 2 column regular cards -->
                <div class="hidden lg:grid grid-cols-2 gap-4">
                    <RecipeCard
                        v-for="r in recipes"
                        :key="`top-desktop-${r.uri}`"
                        size="regular"
                        :recipe="r"
                        :linkable="false"
                        :selected="selectedRecipe?.uri === r.uri"
                        @click="selectRecipe(r)"
                    />
                </div>
            </div>

            <!-- RECENT RECIPES -->
            <div ref="recentRecipesSection" class="flex flex-col gap-4">
                <h2>Recent Recipes</h2>
                <!-- Mobile: stacked for featured, small 2-col grid for rest -->
                <div class="flex flex-col gap-4 lg:hidden">
                    <RecipeCard
                        :key="`recent-mobile-featured-${bananaBread.uri}`"
                        size="stacked"
                        :recipe="bananaBread"
                        :linkable="false"
                        :selected="selectedRecipe?.uri === bananaBread.uri"
                        @click="selectRecipe(bananaBread)"
                    />
                    <div class="grid grid-cols-2 gap-4">
                        <RecipeCard
                            v-for="r in recipes"
                            :key="`recent-mobile-${r.uri}`"
                            size="small"
                            class="aspect-square"
                            :recipe="r"
                            :linkable="false"
                            :selected="selectedRecipe?.uri === r.uri"
                            @click="selectRecipe(r)"
                        />
                    </div>
                </div>
                <!-- Desktop: large featured + regular grid -->
                <div class="hidden lg:grid grid-cols-2 grid-rows-2 gap-4">
                    <div class="row-span-2 col-span-2">
                        <RecipeCard
                            :key="`recent-desktop-featured-${bananaBread.uri}`"
                            size="large"
                            class="h-full"
                            :recipe="bananaBread"
                            :linkable="false"
                            :selected="selectedRecipe?.uri === bananaBread.uri"
                            @click="selectRecipe(bananaBread)"
                        />
                    </div>
                    <RecipeCard
                        v-for="r in recipes"
                        :key="`recent-desktop-${r.uri}`"
                        size="regular"
                        class="h-full"
                        :recipe="r"
                        :linkable="false"
                        :selected="selectedRecipe?.uri === r.uri"
                        @click="selectRecipe(r)"
                    />
                </div>
            </div>

            <!-- MORE RECIPES -->
            <div ref="moreRecipesSection" class="flex flex-col gap-4">
                <h2>More Recipes</h2>
                <!-- Mobile: 2 column small cards -->
                <div class="grid grid-cols-2 gap-4 lg:hidden">
                    <RecipeCard
                        v-for="r in recipes"
                        :key="`more-mobile-${r.uri}`"
                        size="small"
                        class="aspect-square"
                        :recipe="r"
                        :linkable="false"
                        :selected="selectedRecipe?.uri === r.uri"
                        @click="selectRecipe(r)"
                    />
                </div>
                <!-- Desktop: 4 column small cards -->
                <div class="hidden lg:grid grid-cols-4 gap-4">
                    <RecipeCard
                        v-for="r in recipes"
                        :key="`more-desktop-${r.uri}`"
                        size="small"
                        :recipe="r"
                        :linkable="false"
                        :selected="selectedRecipe?.uri === r.uri"
                        @click="selectRecipe(r)"
                    />
                </div>
            </div>

            </div>

            <!-- RIGHT COLUMN - sticky div that shows the current select recipe / im feeling lucky button if none selected -->
            <div
                ref="rightColumn"
                class="hidden lg:flex col-span-4 h-full pt-13"
            >

                <div
                    v-if="selectedRecipe"
                    ref="recipePreview"
                    class="flex flex-col p-6 gap-6 h-fit sticky bg-surface rounded-md top-10 bottom-0"
                >
                    <NuxtImg
                        :src="`/imgs/food/${selectedRecipe.imgSrc}`"
                        class="bg-white aspect-square w-full object-cover rounded-md"
                    />

                    <h3 class="font-sans">{{ selectedRecipe.title }}</h3>

                    <div class="flex gap-3">
                        <RecipeMeta :recipe="selectedRecipe" />
                    </div>

                    <p class="text-white/80 text-sm">
                        {{ selectedRecipe.description }}
                    </p>

                    <div class="flex flex-col gap-3">
                        <button
                            class="flex items-center justify-between w-full text-left group"
                            @click="ingredientsOpen = !ingredientsOpen"
                        >
                            <h4 class="font-sans text-sm text-white/60 group-hover:text-white transition-colors">Ingredients</h4>
                            <Icon
                                name="ph:caret-down"
                                class="w-6 h-6 text-white/60 group-hover:text-white transition-all"
                                :class="{ 'rotate-180': ingredientsOpen }"
                            />
                        </button>
                        <div
                            ref="ingredientsContainer"
                            class="overflow-hidden"
                            :class="{ 'h-0': !ingredientsOpen }"
                        >
                            <RecipeCalculator :key="selectedRecipe.uri" :ingredients="selectedRecipe.ingredients" />
                        </div>
                    </div>

                    <CoreButton
                        :to="`/recipes/${selectedRecipe.uri}`"
                        color="primary"
                        icon="ph:arrow-right"
                        icon-position="right"
                    >
                        View Recipe
                    </CoreButton>

                </div>

                <div
                    v-else
                    class="flex flex-col items-center justify-center p-6 gap-4 text-center h-fit sticky bg-surface rounded-md top-10"
                >
                    <Icon
                        name="ph:bowl-food"
                        class="w-16 h-16 text-white/40"
                    />
                    <h3 class="font-sans">Hungry but indecisive?</h3>
                    <p class="text-white/60 text-sm">
                        Let fate decide your next meal. Click below and we'll pick something delicious for you.
                    </p>
                    <CoreButton
                        color="primary"
                        icon="ph:shuffle"
                        @click="selectRandomRecipe"
                    >
                        I'm Feeling Hungry
                    </CoreButton>
                </div>
            </div>
            <!-- END OF RIGHT COLUMN -->

        </div>
    </div>

    <!-- Mobile Drawer -->
    <UDrawer v-model:open="drawerOpen" class="lg:hidden">
        <template #content>
            <div v-if="selectedRecipe" class="flex flex-col max-h-[80vh]">
                <div class="p-6 flex flex-col gap-4 overflow-y-auto flex-1">
                    <NuxtImg
                        :src="`/imgs/food/${selectedRecipe.imgSrc}`"
                        class="bg-white aspect-square w-full object-cover rounded-md"
                    />

                    <h3 class="font-sans">{{ selectedRecipe.title }}</h3>

                    <div class="flex flex-wrap gap-3">
                        <RecipeMeta :recipe="selectedRecipe" />
                    </div>

                    <p class="text-white/80 text-sm">
                        {{ selectedRecipe.description }}
                    </p>

                    <CoreButton
                        :to="`/recipes/${selectedRecipe.uri}`"
                        color="primary"
                        icon="ph:arrow-right"
                        icon-position="right"
                        class="w-full my-2 shrink-0"
                    >
                        View Recipe
                    </CoreButton>

                    <div class="flex flex-col gap-3 pt-2">
                        <h4 class="font-sans text-sm text-white/60">Ingredients</h4>
                        <RecipeCalculator :ingredients="selectedRecipe.ingredients" />
                    </div>
                </div>
            </div>
        </template>
    </UDrawer>
</template>

<script lang="ts" setup>
import type { Recipe } from '~~/types/recipes';
import { allRecipes } from '~~/content/recipes';
import gochujangSatay from '~~/content/recipes/gochujang-satay-sauce';
import lentilBolognese from '~~/content/recipes/lentil-bolognese';
import aglioEOlio from '~~/content/recipes/aglio-e-olio';
import spicyBeans from '~~/content/recipes/baked-beans';
import infusedTofu from '~~/content/recipes/infused-tofu';
import bananaBread from '~~/content/recipes/banana-bread';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const recipes = [lentilBolognese, aglioEOlio, spicyBeans, infusedTofu];

const selectedRecipe = ref<Recipe | null>(null);
const drawerOpen = ref(false);

// Refs for animations
const topRecipesSection = ref<HTMLElement | null>(null);
const recentRecipesSection = ref<HTMLElement | null>(null);
const moreRecipesSection = ref<HTMLElement | null>(null);
const rightColumn = ref<HTMLElement | null>(null);
const recipePreview = ref<HTMLElement | null>(null);
const ingredientsContainer = ref<HTMLElement | null>(null);
const ingredientsOpen = ref(false);

// Animate ingredients toggle
watch(ingredientsOpen, (isOpen) => {
    if (!ingredientsContainer.value) return;

    if (isOpen) {
        gsap.fromTo(ingredientsContainer.value,
            { height: 0, opacity: 0 },
            { height: 'auto', opacity: 1, duration: 0.3, ease: 'power2.out' }
        );
    } else {
        gsap.to(ingredientsContainer.value, {
            height: 0,
            opacity: 0,
            duration: 0.25,
            ease: 'power2.in'
        });
    }
});

function selectRecipe(recipe: Recipe) {
    animateOutAndSelect(recipe);
}

// GSAP transition when recipe changes
watch(selectedRecipe, (newRecipe) => {
    if (!newRecipe) return;

    nextTick(() => {
        if (!recipePreview.value) return;

        // Slide in from left (works for first selection and switching)
        gsap.fromTo(recipePreview.value,
            { opacity: 0, x: -30 },
            { opacity: 1, x: 0, duration: 0.35, ease: 'power2.out' }
        );
    });
});

// Animate out before recipe changes
function animateOutAndSelect(recipe: Recipe) {
    const isMobile = window.innerWidth < 1024;

    // If same recipe is clicked, just reopen drawer on mobile if closed
    if (selectedRecipe.value?.uri === recipe.uri) {
        if (isMobile && !drawerOpen.value) {
            drawerOpen.value = true;
        }
        return;
    }

    // Only open drawer on mobile
    if (isMobile) {
        drawerOpen.value = true;
        selectedRecipe.value = recipe;
        return;
    }

    if (recipePreview.value && selectedRecipe.value) {
        const tl = gsap.timeline({
            onComplete: () => {
                selectedRecipe.value = recipe;
            }
        });

        // First close ingredients if open
        if (ingredientsOpen.value && ingredientsContainer.value) {
            tl.to(ingredientsContainer.value, {
                height: 0,
                opacity: 0,
                duration: 0.2,
                ease: 'power2.in',
                onComplete: () => {
                    ingredientsOpen.value = false;
                }
            });
        }

        // Then fade out sidebar
        tl.to(recipePreview.value, {
            opacity: 0,
            x: 30,
            duration: 0.25,
            deplay: 0.2,
            ease: 'power2.in'
        });
    } else {
        selectedRecipe.value = recipe;
    }
}

function selectRandomRecipe() {
    const randomIndex = Math.floor(Math.random() * allRecipes.length);
    selectedRecipe.value = allRecipes[randomIndex] ?? null;
}

onMounted(() => {
    const mm = gsap.matchMedia();

    // Desktop animations
    mm.add('(min-width: 1024px)', () => {
        const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });

        // Top recipes first
        if (topRecipesSection.value) {
            const heading = topRecipesSection.value.querySelector('h2');
            const cards = topRecipesSection.value.querySelectorAll('.hidden.lg\\:grid > *');

            tl.from(heading, { opacity: 0, y: 20, duration: 0.5 })
              .from(cards, { opacity: 0, y: 30, duration: 0.5, stagger: 0.1 }, '-=0.2');
        }

        // Right column fade in
        if (rightColumn.value) {
            tl.from(rightColumn.value, { opacity: 0, x: 20, duration: 0.6 }, '-=0.3');
        }

        // Recent recipes after a delay
        if (recentRecipesSection.value) {
            const heading = recentRecipesSection.value.querySelector('h2');
            const cards = recentRecipesSection.value.querySelectorAll('.hidden.lg\\:grid > *');

            tl.from(heading, { opacity: 0, y: 20, duration: 0.5 }, '-=0.2')
              .from(cards, { opacity: 0, y: 30, duration: 0.5, stagger: 0.1 }, '-=0.2');
        }

        // Scroll-triggered: More recipes
        if (moreRecipesSection.value) {
            const heading = moreRecipesSection.value.querySelector('h2');
            const cards = moreRecipesSection.value.querySelectorAll('.hidden.lg\\:grid > *');

            gsap.from(heading, {
                opacity: 0,
                y: 20,
                duration: 0.5,
                ease: 'power2.out',
                scrollTrigger: { trigger: moreRecipesSection.value, start: 'top 85%' }
            });

            gsap.from(cards, {
                opacity: 0,
                y: 30,
                duration: 0.5,
                stagger: 0.08,
                ease: 'power2.out',
                scrollTrigger: { trigger: moreRecipesSection.value, start: 'top 80%' }
            });
        }
    });

    // Mobile animations
    mm.add('(max-width: 1023px)', () => {
        const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });

        // Top recipes first
        if (topRecipesSection.value) {
            const heading = topRecipesSection.value.querySelector('h2');
            const cards = topRecipesSection.value.querySelectorAll('.grid.grid-cols-2.gap-4.lg\\:hidden > *');

            tl.from(heading, { opacity: 0, y: 20, duration: 0.5 })
              .from(cards, { opacity: 0, y: 30, duration: 0.5, stagger: 0.1 }, '-=0.2');
        }

        // Recent recipes after a delay
        if (recentRecipesSection.value) {
            const heading = recentRecipesSection.value.querySelector('h2');
            const mobileContent = recentRecipesSection.value.querySelector('.flex.flex-col.gap-4.lg\\:hidden');

            tl.from(heading, { opacity: 0, y: 20, duration: 0.5 }, '+=0.2');

            if (mobileContent) {
                tl.from(mobileContent.children, { opacity: 0, y: 30, duration: 0.5, stagger: 0.1 }, '-=0.2');
            }
        }

        // Scroll-triggered: More recipes
        if (moreRecipesSection.value) {
            const heading = moreRecipesSection.value.querySelector('h2');
            const cards = moreRecipesSection.value.querySelectorAll('.grid.grid-cols-2.gap-4.lg\\:hidden > *');

            gsap.from(heading, {
                opacity: 0,
                y: 20,
                duration: 0.5,
                ease: 'power2.out',
                scrollTrigger: { trigger: moreRecipesSection.value, start: 'top 85%' }
            });

            gsap.from(cards, {
                opacity: 0,
                y: 30,
                duration: 0.5,
                stagger: 0.08,
                ease: 'power2.out',
                scrollTrigger: { trigger: moreRecipesSection.value, start: 'top 80%' }
            });
        }
    });
});
</script>