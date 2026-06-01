<template>
    <component
        :is="linkable ? NuxtLink : 'div'"
        :to="linkable ? recipeLink : undefined"
        :class="containerClasses"
    >
        <!-- LARGE: Horizontal with 40/60 split -->
        <template v-if="size === 'large'">
            <div class="relative z-10 flex gap-6 h-full">
                <UiImage
                    v-if="imageSrc"
                    :src="imageSrc"
                    container-class="w-2/5 h-full rounded-md shrink-0"
                    class="object-cover"
                />
                <div
                    v-else
                    class="w-2/5 h-full rounded-md bg-primary shrink-0"
                />
                <div class="flex flex-col justify-center gap-4 py-4 w-3/5">
                    <span class="font-bold text-white text-2xl">{{ recipe.title }}</span>
                    <p v-if="recipe.description" class="text-white/60 text-sm line-clamp-4">
                        {{ recipe.description }}
                    </p>
                    <div class="flex flex-row flex-wrap gap-2">
                        <RecipeMeta :recipe="recipe" />
                    </div>
                </div>
            </div>
        </template>

        <!-- REGULAR: Horizontal rectangle with image left, text right -->
        <template v-else-if="size === 'regular'">
            <div class="relative z-10 flex gap-6 h-full">
                <UiImage
                    v-if="imageSrc"
                    :src="imageSrc"
                    container-class="w-40 h-full rounded-md shrink-0"
                    class="object-cover"
                />
                <div
                    v-else
                    class="w-40 h-full rounded-md bg-primary shrink-0"
                />
                <div class="flex flex-col justify-center gap-3 py-2">
                    <span class="font-bold text-white text-lg">{{ recipe.title }}</span>
                    <p v-if="recipe.description" class="text-white/60 text-sm! line-clamp-3">
                        {{ recipe.description }}
                    </p>
                    <div class="flex flex-row flex-wrap gap-2">
                        <RecipeMeta :recipe="recipe" />
                    </div>
                </div>
            </div>
        </template>

        <!-- SMALL: Image with title overlay at bottom -->
        <template v-else-if="size === 'small'">
            <div class="relative z-10 h-full w-full">
                <UiImage
                    v-if="imageSrc"
                    :src="imageSrc"
                    container-class="w-full h-full rounded-md"
                    class="object-cover"
                />
                <div
                    v-else
                    class="w-full h-full bg-primary rounded-md"
                />
                <div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent rounded-b-md p-3 pt-8">
                    <span class="font-bold text-white text-base">{{ recipe.title }}</span>
                </div>
            </div>
        </template>

        <!-- STACKED: Vertical layout with image on top, text below -->
        <template v-else-if="size === 'stacked'">
            <div class="relative z-10 flex flex-col gap-3">
                <UiImage
                    v-if="imageSrc"
                    :src="imageSrc"
                    container-class="w-full aspect-square rounded-md"
                    class="object-cover"
                />
                <div
                    v-else
                    class="w-full aspect-video rounded-md bg-primary"
                />
                <div class="flex flex-col gap-2">
                    <span class="font-bold text-white">{{ recipe.title }}</span>
                    <div class="flex gap-4 flex-wrap">
                        <RecipeMeta :recipe="recipe" />
                    </div>
                </div>
            </div>
        </template>

        <!-- COMPACT: Current design - small image with title and pills -->
        <template v-else>
            <div class="relative z-10 p-3">
                <div class="flex gap-4">
                    <UiImage
                        v-if="imageSrc"
                        :src="imageSrc"
                        container-class="w-24 h-24 rounded-md shrink-0"
                        class="object-cover"
                    />
                    <div
                        v-else
                        class="w-24 h-24 rounded-md bg-primary shrink-0"
                    />
                    <div class="flex flex-col justify-center gap-2">
                        <span class="font-bold text-white">{{ recipe.title }}</span>
                        <div class="flex flex-row flex-wrap gap-2">
                            <RecipeMeta :recipe="recipe" />
                        </div>
                    </div>
                </div>
            </div>
        </template>

    </component>
</template>


<script setup lang="ts">
import type { Recipe } from '~~/types/recipes';

const NuxtLink = resolveComponent('NuxtLink');

type CardSize = 'large' | 'regular' | 'small' | 'stacked' | 'compact';

const props = withDefaults(defineProps<{
    recipe: Recipe;
    size?: CardSize;
    linkable?: boolean;
    selected?: boolean;
}>(), {
    size: 'compact',
    linkable: true,
    selected: false
});

const imageSrc = computed(() => {
    return props.recipe.imgSrc || null;
});

const recipeLink = computed(() => {
    return props.recipe.uri ? `/recipes/${props.recipe.uri}` : undefined;
});

const containerClasses = computed(() => {
    const base = 'relative overflow-hidden cursor-pointer transition-colors duration-300 block';
    const selectedBorder = props.selected ? 'border-primary' : 'border-white/30 hover:border-white';

    switch (props.size) {
        case 'large':
            return `${base} bg-card rounded-lg shadow-sm p-4 border-3 ${selectedBorder}`;
        case 'regular':
            return `${base} bg-card rounded-lg shadow-sm p-4 border-3 ${selectedBorder}`;
        case 'small':
            return `${base} rounded-md border-3 ${selectedBorder}`;
        case 'stacked':
            return `${base} bg-card rounded-lg shadow-sm p-3 border-3 ${selectedBorder}`;
        case 'compact':
        default:
            return `${base} bg-card rounded-lg shadow-sm border-3 ${selectedBorder}`;
    }
});
</script>
