<template>
    <CorePill icon="ph:users-three">
        Serves {{ recipe.serves }}
    </CorePill>
    <span class="inline-flex items-center gap-1.5 text-white/80 text-sm font-sans">
        <Icon
            name="ph:clock"
            class="w-4 h-4"
        />
        {{ recipe.time }}
    </span>
</template>

<script setup lang="ts">
defineProps<{
    recipe: {
        cuisine: string;
        serves: number | string;
        time: string;
    };
}>();
</script>
