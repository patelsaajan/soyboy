<template>

    <div
        class="container mx-auto my-16 lg:my-20 px-4 lg:px-0"
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
                        v-for="r in highlights"
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
                        v-for="r in highlights"
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
                <!-- Mobile: stacked first, small grid for rest -->
                <div v-if="featuredRecent" class="flex flex-col gap-4 lg:hidden">
                    <RecipeCard
                        :key="`recent-mobile-featured-${featuredRecent!.uri}`"
                        size="stacked"
                        :recipe="featuredRecent!"
                        :linkable="false"
                        :selected="selectedRecipe?.uri === featuredRecent!.uri"
                        @click="selectRecipe(featuredRecent!)"
                    />
                    <div class="grid grid-cols-2 gap-4">
                        <RecipeCard
                            v-for="r in otherRecent"
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
                <!-- Desktop: large first + 2-col grid for rest -->
                <div v-if="featuredRecent" class="hidden lg:flex lg:flex-col gap-4">
                    <RecipeCard
                        :key="`recent-desktop-featured-${featuredRecent!.uri}`"
                        size="large"
                        :recipe="featuredRecent!"
                        :linkable="false"
                        :selected="selectedRecipe?.uri === featuredRecent!.uri"
                        @click="selectRecipe(featuredRecent!)"
                    />
                    <div class="grid grid-cols-2 gap-4">
                        <RecipeCard
                            v-for="r in otherRecent"
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
            </div>

            <!-- MORE RECIPES -->
            <div ref="moreRecipesSection" class="flex flex-col gap-4">
                <h2>More Recipes</h2>
                <!-- Mobile: 2 column small cards -->
                <TransitionGroup tag="div" name="more-recipe" class="grid grid-cols-2 gap-4 lg:hidden">
                    <RecipeCard
                        v-for="(r, i) in visibleMoreRecipes"
                        :key="`more-mobile-${r.uri}`"
                        :style="{ '--stagger': i % LOAD_MORE_COUNT }"
                        size="small"
                        class="aspect-square"
                        :recipe="r"
                        :linkable="false"
                        :selected="selectedRecipe?.uri === r.uri"
                        @click="selectRecipe(r)"
                    />
                </TransitionGroup>
                <!-- Desktop: 4 column small cards -->
                <TransitionGroup tag="div" name="more-recipe" class="hidden lg:grid grid-cols-4 gap-4">
                    <RecipeCard
                        v-for="(r, i) in visibleMoreRecipes"
                        :key="`more-desktop-${r.uri}`"
                        :style="{ '--stagger': i % LOAD_MORE_COUNT }"
                        size="small"
                        :recipe="r"
                        :linkable="false"
                        :selected="selectedRecipe?.uri === r.uri"
                        @click="selectRecipe(r)"
                    />
                </TransitionGroup>
            </div>

            <!-- LOAD MORE -->
            <div v-if="canLoadMore" class="flex justify-center pt-4">
                <CoreButton
                    color="secondary"
                    icon="ph:arrow-down"
                    icon-position="right"
                    @click="loadMore"
                >
                    Load More
                </CoreButton>
            </div>

            </div>

            <!-- RIGHT COLUMN - sticky div that shows the current select recipe / im feeling lucky button if none selected -->
            <div
                ref="rightColumn"
                class="hidden lg:flex col-span-4 h-full pt-12"
            >

                <div
                    v-if="selectedRecipe"
                    ref="recipePreview"
                    class="flex flex-col p-6 gap-6 h-fit sticky bg-surface rounded-md top-10 bottom-0"
                >
                    <UiImage
                        :key="selectedRecipe.uri"
                        :src="selectedRecipe.imgSrc"
                        container-class="aspect-square w-full rounded-md"
                        class="object-cover"
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
                    <UiImage
                        :key="`drawer-${selectedRecipe.uri}`"
                        :src="selectedRecipe.imgSrc"
                        container-class="aspect-square w-full rounded-md"
                        class="object-cover"
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
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const { data: allRecipes } = await useAllRecipes()

const highlights = computed(() =>
    [...(allRecipes.value ?? [])]
        .filter(r => r.highlighted)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 4)
)

const recentRecipes = computed(() =>
    [...(allRecipes.value ?? [])]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5)
)

const featuredRecent = computed(() => recentRecipes.value[0] ?? null)
const otherRecent = computed(() => recentRecipes.value.slice(1))

const excludedUris = computed(() => {
    const uris = new Set<string>()
    recentRecipes.value?.forEach(r => uris.add(r.uri))
    return uris
})

const moreRecipes = computed(() =>
    (allRecipes.value ?? []).filter(r => !excludedUris.value.has(r.uri))
)

const INITIAL_COUNT = 12
const LOAD_MORE_COUNT = 6

const shownCount = ref(INITIAL_COUNT)

const visibleMoreRecipes = computed(() =>
    moreRecipes.value.slice(0, shownCount.value)
)

const canLoadMore = computed(() =>
    shownCount.value < moreRecipes.value.length
)

function loadMore() {
    shownCount.value += LOAD_MORE_COUNT
}

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

watch(selectedRecipe, (newRecipe) => {
    if (!newRecipe) return;

    nextTick(() => {
        if (!recipePreview.value) return;

        gsap.fromTo(recipePreview.value,
            { opacity: 0, x: -30 },
            { opacity: 1, x: 0, duration: 0.35, ease: 'power2.out' }
        );
    });
});

function animateOutAndSelect(recipe: Recipe) {
    const isMobile = window.innerWidth < 1024;

    if (selectedRecipe.value?.uri === recipe.uri) {
        if (isMobile && !drawerOpen.value) {
            drawerOpen.value = true;
        }
        return;
    }

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

        tl.to(recipePreview.value, {
            opacity: 0,
            x: 30,
            duration: 0.25,
            delay: 0.2,
            ease: 'power2.in'
        });
    } else {
        selectedRecipe.value = recipe;
    }
}

function selectRandomRecipe() {
    const all = allRecipes.value ?? []
    const randomIndex = Math.floor(Math.random() * all.length);
    selectedRecipe.value = all[randomIndex] ?? null;
}

onMounted(() => {
    const mm = gsap.matchMedia();
    const ease = 'power2.out';

    mm.add('(min-width: 1024px)', () => {
        // 1. Highlights
        if (topRecipesSection.value) {
            const heading = topRecipesSection.value.querySelector('h2');
            const cards = topRecipesSection.value.querySelectorAll('.hidden.lg\\:grid > *');
            gsap.timeline({ scrollTrigger: { trigger: topRecipesSection.value, start: 'top 82%', once: true } })
                .from(heading, { opacity: 0, y: 20, duration: 0.5, ease })
                .from(cards, { opacity: 0, y: 30, duration: 0.5, stagger: 0.1, ease }, '-=0.2');
        }

        // 2. Sidebar
        if (rightColumn.value) {
            gsap.from(rightColumn.value, {
                opacity: 0, x: 20, duration: 0.6, ease,
                scrollTrigger: { trigger: rightColumn.value, start: 'top 82%', once: true }
            });
        }

        // 3. Recent Recipes
        if (recentRecipesSection.value) {
            const heading = recentRecipesSection.value.querySelector('h2');
            const featuredCard = recentRecipesSection.value.querySelector('.hidden.lg\\:flex > *:first-child');
            const gridCards = recentRecipesSection.value.querySelectorAll('.hidden.lg\\:flex .grid > *');
            const tl = gsap.timeline({ scrollTrigger: { trigger: recentRecipesSection.value, start: 'top 82%', once: true } });
            tl.from(heading, { opacity: 0, y: 20, duration: 0.5, ease });
            if (featuredCard) tl.from(featuredCard, { opacity: 0, y: 30, duration: 0.5, ease }, '-=0.2');
            if (gridCards.length) tl.from(gridCards, { opacity: 0, y: 30, duration: 0.5, stagger: 0.1, ease }, '-=0.2');
        }

        // 4. More Recipes
        if (moreRecipesSection.value) {
            const heading = moreRecipesSection.value.querySelector('h2');
            const cards = moreRecipesSection.value.querySelectorAll('.hidden.lg\\:grid > *');
            gsap.timeline({ scrollTrigger: { trigger: moreRecipesSection.value, start: 'top 82%', once: true } })
                .from(heading, { opacity: 0, y: 20, duration: 0.5, ease })
                .from(cards, { opacity: 0, y: 30, duration: 0.5, stagger: 0.05, ease }, '-=0.2');
        }
    });

    mm.add('(max-width: 1023px)', () => {
        // 1. Highlights
        if (topRecipesSection.value) {
            const heading = topRecipesSection.value.querySelector('h2');
            const cards = topRecipesSection.value.querySelectorAll('.grid.grid-cols-2.gap-4.lg\\:hidden > *');
            gsap.timeline({ scrollTrigger: { trigger: topRecipesSection.value, start: 'top 82%', once: true } })
                .from(heading, { opacity: 0, y: 20, duration: 0.5, ease })
                .from(cards, { opacity: 0, y: 30, duration: 0.5, stagger: 0.1, ease }, '-=0.2');
        }

        // 2. Recent Recipes
        if (recentRecipesSection.value) {
            const heading = recentRecipesSection.value.querySelector('h2');
            const mobileContent = recentRecipesSection.value.querySelector('.flex.flex-col.gap-4.lg\\:hidden');
            const tl = gsap.timeline({ scrollTrigger: { trigger: recentRecipesSection.value, start: 'top 82%', once: true } });
            tl.from(heading, { opacity: 0, y: 20, duration: 0.5, ease });
            if (mobileContent) {
                const featuredCard = mobileContent.children[0];
                const gridCards = mobileContent.querySelectorAll('.grid > *');
                if (featuredCard) tl.from(featuredCard, { opacity: 0, y: 30, duration: 0.5, ease }, '-=0.2');
                if (gridCards.length) tl.from(gridCards, { opacity: 0, y: 30, duration: 0.5, stagger: 0.1, ease }, '-=0.3');
            }
        }

        // 3. More Recipes
        if (moreRecipesSection.value) {
            const heading = moreRecipesSection.value.querySelector('h2');
            const cards = moreRecipesSection.value.querySelectorAll('.grid.grid-cols-2.gap-4.lg\\:hidden > *');
            gsap.timeline({ scrollTrigger: { trigger: moreRecipesSection.value, start: 'top 82%', once: true } })
                .from(heading, { opacity: 0, y: 20, duration: 0.5, ease })
                .from(cards, { opacity: 0, y: 30, duration: 0.5, stagger: 0.05, ease }, '-=0.2');
        }
    });
});
</script>

<style scoped>
.more-recipe-enter-active {
    transition: opacity 0.4s ease, transform 0.4s ease;
    transition-delay: calc(var(--stagger, 0) * 60ms);
}

.more-recipe-enter-from {
    opacity: 0;
    transform: translateY(16px);
}
</style>
