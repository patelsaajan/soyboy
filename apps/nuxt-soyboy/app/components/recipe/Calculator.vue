<template>
    <div class="flex flex-col gap-4">
        <div class="flex gap-2">
            <button
                v-for="option in multiplierOptions"
                :key="option"
                class="px-4 py-2 rounded-full border-2 cursor-pointer font-sans text-sm transition-colors duration-300"
                :class="multiplier === option
                    ? 'bg-primary border-primary text-white'
                    : 'border-white/30 text-white/80 hover:border-white hover:text-white'"
                @click="multiplier = option"
            >
                {{ option }}x
            </button>
        </div>
        <div class="flex flex-col gap-3">
            <div
                v-for="(ingredient, index) in ingredients"
                :key="index"
                class="flex items-center justify-between py-2 border-b border-white/10"
            >
                <span class="text-white">{{ ingredient.item }}</span>
                <span class="text-white/60 font-mono">
                    {{ formatQuantity(ingredient.quantity * multiplier) }}{{ ingredient.unit }}
                </span>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Ingredient {
    quantity: number
    unit: string
    item: string
}

defineProps<{
    ingredients: Ingredient[]
}>()

const multiplierOptions = [1, 2, 4]
const multiplier = ref(1)

function formatQuantity(value: number): string {
    if (value % 1 === 0) {
        return value.toString()
    }
    return value.toFixed(1)
}
</script>
