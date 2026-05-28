<template>
    <div class="p-6 rounded-xl bg-primary/20 border border-primary/30 flex flex-col gap-4">
        <h3>{{ title }}</h3>
        <p class="text-white/80">
            {{ description }}
        </p>
        <CoreButton
            :to="buttonLink"
            color="primary"
            :icon="buttonIcon"
        >
            {{ buttonText }}
        </CoreButton>
    </div>
</template>

<script setup lang="ts">
defineProps<{
    title: string
    description: string
    buttonText: string
    buttonLink: string
    buttonIcon?: string
}>()
</script>
