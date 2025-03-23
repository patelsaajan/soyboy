<template>
    <div class="max-w-[400px]">
        <UCard
                variant="soft"
                class="bg-neutral"
            >
            <template #header>
                <NuxtImg
                    :src="`/imgs/${ recipe.imgSrc }`"
                    :alt="recipe.title"
                    class="rounded-t-lg"
                />
            </template>
                <div
                    class="flex flex-col"
                >
                    <span class="text-sub-heading text-main">{{ recipe.cuisine }}</span>
                    <span class="text-sub-heading font-bold">{{ recipe.title }}</span>
                    <div class="flex flex-row gap-6">
                        <span class="flex flex-row items-center gap-x-2"> <Icon name="material-symbols:timer-outline-rounded" size="1.5rem"/>  {{ recipe.time }} minutes</span>
                        <span class="flex flex-row items-center gap-x-2 "><Icon name="ic:round-people" size="1.5rem"/>  {{ recipe.serves }} servings</span>
                    </div>
                </div>

        </UCard>
    </div>
</template>

<script lang="ts" setup>

const overlay = useOverlay()

const props = defineProps<{
    recipe: any; 
}>();
console.log('recipe', props.recipe)

// const modal = overlay.create(ModalsRecipe, {
//    props: {
//     recipe: props.recipe,
//    }
// });

// function openRecipeModal() {
//     modal.open()
// }

</script>

<style lang="scss" scoped>


</style>