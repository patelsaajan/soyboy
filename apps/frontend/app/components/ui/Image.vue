<template>
    <div class="relative overflow-hidden" :class="containerClass">
        <Transition name="skeleton-fade">
            <div v-if="!loaded" class="absolute inset-0 animate-pulse bg-white/8" />
        </Transition>
        <NuxtImg
            format="auto"
            sizes="xs:100vw sm:100vw md:100vw lg:100vw xl:100vw xxl:100vw"
            v-bind="$attrs"
            class="w-full h-full transition-opacity duration-300"
            :class="loaded ? 'opacity-100' : 'opacity-0'"
            @load="loaded = true"
        />
    </div>
</template>

<script setup lang="ts">
defineOptions({ inheritAttrs: false })

defineProps<{
    containerClass?: string
}>()

const loaded = ref(false)
</script>

<style scoped>
.skeleton-fade-leave-active {
    transition: opacity 0.3s ease;
}
.skeleton-fade-leave-to {
    opacity: 0;
}
</style>
