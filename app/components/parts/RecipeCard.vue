<template>
    <div class="max-w-[400px] mx-auto">
        <UCard
                variant="soft"
                class="bg-neutral border-1 "
                @click="modal.open()"
            >
            <template #header>
                <NuxtImg
                    :src="`/imgs/recipes/${ recipe.imgSrc }`"
                    :alt="recipe.title"
                    class="rounded-xl"
                />
            </template>
                <div
                    class="flex flex-col"
                >
                    <span class="text-sub-heading text-primary text-2xl font-bold">{{ recipe.cuisine }}</span>
                    <span class="text-sub-heading font-bold">{{ recipe.title }}</span>
                    <div class="flex flex-row justify-between mt-4">
                        <UBadge
                            trailing-icon="material-symbols:timer-outline-rounded" 
                            class="bg-base p-0" 
                            :label="recipe.time"
                            size="xl"
                        />
                        <UBadge
                            trailing-icon="ic:round-people"
                            class="bg-main p-0"
                            :label="recipe.serves"
                            size="xl"
                        />
                    </div>
                </div>

        </UCard>
    </div>
</template>

<script lang="ts" setup>
import { ModalsRecipe } from '#components';

const overlay = useOverlay()

const props = defineProps<{
    recipe: any; 
}>();

const modal = overlay.create(ModalsRecipe, {
   props: {
    recipe: props.recipe,
   }
});




</script>

<style lang="scss" scoped>


</style>