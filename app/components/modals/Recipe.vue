<template>
    <UModal
        :title="recipe.title"
        close-icon="i-lucide-arrow-right"
        :overlay='true'
        :dismissible="false"
        :close="{
            color: 'secondary',
            variant: 'solid',
            class: 'rounded-full',
            onClick: () => emit('close', false)
        }"
        :ui="{ 
            footer: 'justify-end',
            content: 'bg-neutral text-white',
        }"
    >
        <template #body>
            <div class="flex flex-col items-center w-full gap-y-8">
                <div class="flex justify-center">
                    <NuxtPicture 
                        format="jpg"
                        :src="`/imgs/recipes/${recipe.imgSrc}`"
                        alt="Recipe of the day"
                        width="250px"
                        height="250px"
                        :imgAttrs="{'class': 'rounded-lg'}"
                    />
                </div> 
                <span
                    v-if="resultRecipe && resultRecipe.description"
                >
                    {{ resultRecipe.description }}
                </span>
            </div>
        </template>

        <template #footer>
            <UButton
                label="Full Recipe" 
                icon="uil:diary"
                color="secondary"
                :onclick="() => emit('close', false)"
                :to="recipe.path"
            />
            <!-- <UButton label="Story"  icon="i-lucide-rocket" color="secondary" /> -->
        </template>
    </UModal>    
</template>

<script setup lang="ts">

const props = defineProps<{
    recipe: any; 
}>();

const { data: resultRecipe } = await useAsyncData('modal-recipe', () => {
  return queryCollection('recipes')
    .select('description')
    .path(props.recipe.path)
    .first()
})

const emit = defineEmits<{ close: [boolean]}>()



</script>

<style lang="scss" scoped>


</style>