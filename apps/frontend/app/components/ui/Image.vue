<template>
    <div class="relative overflow-hidden" :class="containerClass">
        <Transition name="skeleton-fade">
            <div v-if="!loaded" class="absolute inset-0 animate-pulse bg-skeleton" />
        </Transition>
        <NuxtImg
            format="auto"
            :alt="alt"
            :sizes="sizes"
            :loading="priority ? 'eager' : 'lazy'"
            :fetchpriority="priority ? 'high' : 'auto'"
            :preload="priority || undefined"
            decoding="async"
            v-bind="$attrs"
            class="w-full h-full transition-opacity duration-300"
            :class="loaded ? 'opacity-100' : 'opacity-0'"
            @load="loaded = true"
        />
    </div>
</template>

<script setup lang="ts">
defineOptions({ inheritAttrs: false })

withDefaults(defineProps<{
    containerClass?: string
    /**
     * Required for meaningful images. NuxtImg does not default `alt`, so
     * omitting it emits an <img> with no alt attribute at all — not even an
     * empty one. Pass alt="" explicitly for decorative images.
     */
    alt?: string
    /**
     * Was hard-coded to 100vw at every breakpoint, which made a 96px thumbnail
     * request the 1536w candidate and silently negated the Cloudflare
     * Transformations resizing. Pass the real rendered box size at each call
     * site.
     */
    sizes?: string
    /** Set on the LCP image only: eager + high fetchpriority + preload. */
    priority?: boolean
}>(), {
    containerClass: '',
    alt: '',
    sizes: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
    priority: false,
})

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
