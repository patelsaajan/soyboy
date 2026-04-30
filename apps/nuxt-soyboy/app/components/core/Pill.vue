<template>
    <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border-3 border-white/60 text-white text-xs font-sans uppercase tracking-wide cursor-default">
        <Icon
            v-if="icon"
            :name="icon"
            class="w-3.5 h-3.5"
        />
        <slot />
    </span>
</template>

<script setup lang="ts">
defineProps<{
    icon?: string;
}>();
</script>
