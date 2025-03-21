<template>
    <UModal
        :title="recipe.name"
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
            <div class="flex flex-col items-center w-full">
                <div class="flex flex-col font-bold gap-y-4 text-center">
                    {{ recipe.name }}
                </div>
                <div class="flex justify-center">
                    <NuxtPicture 
                        format="jpg"
                        src="/imgs/default-food.jpg"
                        alt="Recipe of the day"
                        width="250px"
                        height="250px"
                            :imgAttrs="{'class': 'rounded-lg'}"
                    />
                </div> 
            </div>
        </template>

        <template #footer>
            <UButton label="Full Recipe"  icon="uil:diary" color="secondary" />
            <UButton label="Story"  icon="i-lucide-rocket" color="secondary" />
        </template>
    </UModal>    
</template>

<script setup lang="ts">
import type IRecipes from '~~/types/recipes';

const props = defineProps({
    recipe: {
        type: Object as () => IRecipes,
        required: true
    },
})

const ingredients = {
    'onion': [1, 'whole'],
    'tinned-tomatoes': [1, 'tin'],
    'tofu': [1, 'block'],
    'soy-sauce': [1, 'tbsp'],
    'rice-vinegar': [1, 'tbsp'],
    'sesame-oil': [1, 'tbsp'],
    'garlic': [2, 'cloves'],
    'ginger': [1, 'inch'],
}

const instructions = [
 'Press the tofu and take out all the water',
 'Dice the onions to small chunks',
 'Mince the onion are garlic'
]

const emit = defineEmits<{ close: [boolean]}>()



</script>

<style lang="scss" scoped>


</style>