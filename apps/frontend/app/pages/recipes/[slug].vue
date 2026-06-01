<template>
    <div class="container mx-auto py-20">
        <div class="grid grid-cols-12 gap-6">
            <div ref="leftColumn" class="hidden lg:flex col-span-3 flex-col gap-6 sticky top-20 self-start">
               <RecipeCalculator :ingredients="recipe.ingredients"/>
                <div class="text-xl font-sans">
                    You might also like
                </div>
                <RecipeCard
                    v-for="r in relatedRecipes"
                    :key="r.uri"
                    :recipe="r"
                    size="compact"
                    :to="`/recipes/${r.uri}`"
                />
            </div>
            <div class="col-span-12 lg:col-span-6 flex flex-col gap-8">
                  <UiImage
                    ref="heroImage"
                    :src="recipeImage"
                    :alt="recipe.title"
                    container-class="aspect-square w-full rounded-md lg:col-span-3"
                    class="object-cover"
                />
                <h2 ref="title">{{ recipe.title }}</h2>
                <div ref="pills" class="flex gap-3">
                    <RecipeMeta :recipe="recipe" />
                </div>
                <p ref="intro" class="text-white/80">
                    {{ recipe.intro }}
                </p>
                <div ref="stepsContainer" class="flex flex-col gap-8 pt-2">
                    <div
                        v-for="(step, index) in recipe.method"
                        :key="index"
                        class="flex flex-col gap-2"
                    >
                        <h3>Step {{ index + 1 }}: {{ step.title }}</h3>
                        <p class="text-white/80">{{ step.text }}</p>
                    </div>
                </div>
                <div v-if="recipe.suggestions?.length" ref="suggestionsContainer" class="flex flex-col gap-6">
                    <h2>Variations</h2>
                    <div
                        v-for="(suggestion, index) in recipe.suggestions"
                        :key="index"
                        class="flex flex-col gap-2"
                    >
                        <h3>{{ suggestion.title }}</h3>
                        <p class="text-white/80">{{ suggestion.text }}</p>
                    </div>
                </div>
                <!-- Mobile Drawer -->
                <div class="lg:hidden sticky bottom-0 p-4 bg-background border-t border-white/10 -mx-4">
                    <UDrawer>
                        <CoreButton
                            color="primary"
                            icon="ph:calculator"
                            class="w-full"
                        >
                            Ingredients
                        </CoreButton>
                        <template #content>
                            <div class="p-6 max-h-[80vh] overflow-y-auto">
                                <div class="text-xl mb-4">Ingredients</div>
                                <RecipeCalculator :ingredients="recipe.ingredients"/>
                            </div>
                        </template>
                    </UDrawer>
                </div>
                <div ref="footerSection" class="flex flex-col gap-6 pt-4">
                    <span class="text-white/80 text-2xl font-sans">
                        Made this? Tag me on Instagram @soyboysaajan
                    </span>
                    <div class="flex flex-col gap-4">
                        <CoreButton
                            to="https://www.instagram.com/soyboysaajan/"
                            color="primary"
                            icon="ph:instagram-logo"
                            icon-position="right"
                        >
                            Share on Instagram
                        </CoreButton>
                        <CoreButton
                            to="/recipes"
                            color="secondary"
                            icon="ph:arrow-left"
                        >
                            All recipes
                        </CoreButton>
                    </div>
                </div>
            </div>
            <div ref="rightColumn" class="hidden lg:flex col-span-3 flex-col gap-6 sticky top-20 self-start">
                <div class="text-xl font-sans">
                    Nutritional Information (per 100g)
                </div>
                <div class="flex flex-col gap-3">
                    <div
                        v-for="(nutrient, index) in recipe.nutritional"
                        :key="index"
                        class="flex items-center justify-between py-2 border-b border-white/10"
                    >
                        <span class="text-white">{{ nutrient.item }}</span>
                        <span class="text-white/60 font-mono">{{ nutrient.value }}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import RecipeCalculator from '~/components/recipe/Calculator.vue';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { ComponentPublicInstance, Ref } from 'vue';
import type { Recipe } from '~~/types/recipes';

gsap.registerPlugin(ScrollTrigger);

const route = useRoute();
const slug = route.params.slug as string;

const { data: recipeData, error } = await useRecipeBySlug(slug)
const { data: allRecipes } = await useAllRecipes()

if (error.value || !recipeData.value) {
    throw createError({ statusCode: 404, statusMessage: 'Recipe not found' })
}

const recipe = recipeData as Ref<Recipe>
const recipeImage = computed(() => recipe.value.imgSrc);

const relatedRecipes = computed(() =>
    (allRecipes.value ?? []).filter(r => r.uri !== slug).slice(0, 2)
);

// Refs
const leftColumn = ref<HTMLElement | null>(null);
const rightColumn = ref<HTMLElement | null>(null);
const heroImage = ref<ComponentPublicInstance | null>(null);
const title = ref<HTMLElement | null>(null);
const pills = ref<HTMLElement | null>(null);
const intro = ref<HTMLElement | null>(null);
const stepsContainer = ref<HTMLElement | null>(null);
const suggestionsContainer = ref<HTMLElement | null>(null);
const footerSection = ref<HTMLElement | null>(null);

onMounted(() => {
    const scrollElements: HTMLElement[] = [];

    if (intro.value) scrollElements.push(intro.value);
    if (stepsContainer.value) {
        scrollElements.push(...Array.from(stepsContainer.value.children) as HTMLElement[]);
    }
    if (suggestionsContainer.value) {
        scrollElements.push(...Array.from(suggestionsContainer.value.children) as HTMLElement[]);
    }
    if (footerSection.value) scrollElements.push(footerSection.value);

    gsap.set(scrollElements, { opacity: 0, y: 20 });

    const setupScrollTriggers = () => {
        scrollElements.forEach((el) => {
            gsap.to(el, {
                opacity: 1,
                y: 0,
                duration: 0.5,
                ease: 'power2.out',
                scrollTrigger: { trigger: el, start: 'top 90%' }
            });
        });
    };

    const mm = gsap.matchMedia();

    mm.add('(min-width: 1024px)', () => {
        const tl = gsap.timeline({
            defaults: { ease: 'power2.out' },
            onComplete: setupScrollTriggers
        });

        tl.from(heroImage.value?.$el, { opacity: 0, scale: 1.02, duration: 0.6 })
          .from(title.value, { opacity: 0, y: 20, duration: 0.5 }, '-=0.3')
          .from(pills.value?.children ?? [], { opacity: 0, y: 15, duration: 0.4, stagger: 0.08 }, '-=0.2');

        tl.from(leftColumn.value, { opacity: 0, y: 20, duration: 0.6 })
          .from(rightColumn.value, { opacity: 0, y: 20, duration: 0.6 });
    });

    mm.add('(max-width: 1023px)', () => {
        const tl = gsap.timeline({
            defaults: { ease: 'power2.out' },
            onComplete: setupScrollTriggers
        });

        tl.from(heroImage.value?.$el, { opacity: 0, scale: 1.02, duration: 0.6 })
          .from(title.value, { opacity: 0, y: 20, duration: 0.5 }, '-=0.3')
          .from(pills.value?.children ?? [], { opacity: 0, y: 15, duration: 0.4, stagger: 0.08 }, '-=0.2');
    });
});
</script>
