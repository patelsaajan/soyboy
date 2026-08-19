<template>
    <div class="flex flex-col gap-4">
        <div class="flex gap-2" role="group" aria-label="Scale ingredient quantities">
            <button
                v-for="option in multiplierOptions"
                :key="option"
                type="button"
                :aria-pressed="multiplier === option"
                class="px-4 py-2 rounded-full border-2 cursor-pointer font-sans text-sm transition-colors duration-300"
                :class="multiplier === option
                    ? 'bg-primary border-primary text-white'
                    : 'border-white/45 text-white/80 hover:border-white hover:text-white'"
                @click="multiplier = option"
            >
                {{ option }}x
            </button>
        </div>
        <p class="sr-only" aria-live="polite">Quantities scaled to {{ multiplier }}x</p>
        <!-- dl/dt/dd so each amount is programmatically tied to its ingredient. -->
        <dl class="flex flex-col gap-3">
            <div
                v-for="(ingredient, index) in ingredients"
                :key="index"
                class="flex items-center justify-between py-2 border-b border-white/10"
            >
                <dt class="text-white">{{ ingredient.item }}</dt>
                <dd class="text-white/60 font-mono">
                    {{ formatQuantity(ingredient.quantity * multiplier) }}{{ ingredient.unit }}
                </dd>
            </div>
        </dl>
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
