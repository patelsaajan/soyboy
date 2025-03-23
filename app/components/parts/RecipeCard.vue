<template>
    <div class="max-w-[400px] mx-auto">
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