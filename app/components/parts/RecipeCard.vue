<template>
    <div class="max-w-[400px]">
        <UCard
                class="bg-neutral"
                :ui="{ 
                    header: 'p-0',
                    
                }"
                variant="soft"
                @click="openRecipeModal"
            >
            <template #header>
                <NuxtImg
                    :src="recipe.image"
                    :alt="recipe.name"
                    class="rounded-t-lg"
                />
            </template>
                <div
                    class="flex flex-col"
                >
                    <span class="text-sub-heading text-main">{{ recipe.cuisine }}</span>
                    <span class="text-sub-heading font-bold">{{ recipe.name }}</span>
                    <div class="flex flex-row gap-6">
                        <span class="flex flex-row items-center gap-x-2"> <Icon name="material-symbols:timer-outline-rounded" size="1.5rem"/>  {{ recipe.preparationTime }} minutes</span>
                        <span class="flex flex-row items-center gap-x-2 "><Icon name="ic:round-people" size="1.5rem"/>  {{ recipe.servings }} servings</span>
                    </div>
                </div>

        </UCard>
    </div>
</template>

<script lang="ts" setup>
import type IRecipes from '~~/types/recipes';
import { ModalsRecipe } from '#components';

const overlay = useOverlay()


const props = defineProps<{
    recipe: IRecipes; 
}>();

const modal = overlay.create(ModalsRecipe, {
   props: {
    recipe: props.recipe,
   }
});

function openRecipeModal() {
    modal.open()
}

</script>

<style lang="scss" scoped>


</style>