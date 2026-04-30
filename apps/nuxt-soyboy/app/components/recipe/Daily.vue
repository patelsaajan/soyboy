<template>
    <div
        ref="elementRef"
        class="relative w-full grid grid-cols-12 opacity-0 translate-y-10"
    >

        <CoreButton
            :unstyled="true"
            class="col-start-2 col-span-6 md:col-start-2 md:col-span-3 border-3 border-white text-white text-sm font-sans uppercase rounded-t-md p-2 border-b-0 cursor-pointer transition-colors duration-300"
            @click="toggleRecipe"
        >
            Recipe of the Day
        </CoreButton>

        <div
            ref="recipeCard"
            class="recipe-card relative grid grid-cols-1 md:grid-cols-12 col-span-12 border-white border-b-0 gap-4 md:gap-8 rounded-t-md"
            :class="isOpen ? 'p-4 md:p-8 border-3' : 'p-0 border-0'"
        >
            <NuxtImg
                :src="`/imgs/food/${recipe.imgSrc}`"
                class="bg-white aspect-square w-full object-cover rounded-md md:col-span-3">
                Image
            </NuxtImg>
            <div class="md:col-span-6 flex flex-col justify-between">
                <h2 class="text-xl md:text-2xl font-bold mb-2 text-white font-sans">{{ recipe.title }}</h2>
                <p class="text-gray-300 text-sm md:text-base mb-4">{{ recipe.description }}</p>

                <div class="flex flex-wrap items-center gap-4">
                    <CorePill icon="ph:globe">
                        {{ recipe.cuisine }}
                    </CorePill>
                    <CorePill icon="ph:users-three">
                        Serves {{ recipe.serves }}
                    </CorePill>
                    <span class="inline-flex items-center gap-1.5 text-white/80 text-sm font-sans">
                        <Icon
                            name="ph:clock"
                            class="w-4 h-4"
                        />
                        {{ recipe.time }}
                    </span>
                </div>
                <CoreButton
                    color="primary"
                    :to="`/recipes/${recipe.uri}`"
                    class="text-sm px-4 py-2 mt-2 w-fit"
                >
                    View Recipe
                </CoreButton>
            </div>
        </div>

        <div
            class="flex items-center border-3 border-white h-16 col-span-12 rounded-b-md"
            :class="isOpen ? 'rounded-t-none' : 'rounded-t-md'"
        >
            <UMarquee
                class="cursor-pointer"
                @click="toggleRecipe"
                 :ui="{
                        root: 'before:from-background after:from-background'
                    }"
            >
                <span
                    v-for="n in 4"
                    :key="n"
                    class="text-white text-2xl font-sans">
                        {{isOpen ? recipe.title : "Go on, you know you're curious!"}}
                </span>
            </UMarquee>
        </div>

    </div>
</template>

<script setup lang="ts">
import { gsap } from 'gsap';
import { getRecipeBySlug } from '../../../content/recipes';

const props = defineProps<{
    disableEntrance?: boolean;
}>();

const isOpen = ref(false);
const recipeCard = ref<HTMLElement | null>(null);
const isAnimating = ref(false);

const recipe = getRecipeBySlug('korean-satay-sauce')!;

const { elementRef } = useScrollEntrance({
    threshold: 0.5,
    onEnter: () => {
        if (props.disableEntrance) return;
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

onMounted(() => {
    if (recipeCard.value) {
        gsap.set(recipeCard.value, {
            height: 0,
            overflow: 'hidden',
        });
    }
});

function toggleRecipe() {
    if (isAnimating.value) return;
    isAnimating.value = true;

    if (!isOpen.value) {
        openRecipe();
    } else {
        closeRecipe();
    }
}

function openRecipe() {
    if (!recipeCard.value) return;

    isOpen.value = true;

    gsap.to(recipeCard.value, {
        height: 'auto',
        duration: 0.8,
        ease: 'power2.out',
        onComplete: () => {
            isAnimating.value = false;
        },
    });
}

function closeRecipe() {
    if (!recipeCard.value) return;

    gsap.to(recipeCard.value, {
        height: 0,
        duration: 0.5,
        ease: 'power3.in',
        onComplete: () => {
            isOpen.value = false;
            isAnimating.value = false;
        },
    });
}

defineExpose({
    el: elementRef,
});
</script>

<style scoped>
.shaped-card {
    min-height: 400px;
}
</style>
