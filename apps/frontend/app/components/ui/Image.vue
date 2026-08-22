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
     *
     * NOTE: this is @nuxt/image's `screenKey:size` syntax, NOT the native HTML
     * `sizes` syntax. A key is a breakpoint name (sm/md/lg/xl/2xl) or a raw
     * pixel number; the value is the rendered box at that breakpoint. Native
     * media-query syntax parses without error and produces nonsense — `(max-
     * width: 640px) 100vw, ..., 33vw` collapsed to a single `33vw` entry keyed
     * on a 1px screen, i.e. a candidate of `round(33/100 * 1) = 0`, which the
     * browser rejects as an invalid `w` descriptor and discards the whole
     * srcset. Every image then loaded at full size.
     *
     * The media boundary @nuxt/image emits for a key is the *next* key's
     * screen width, so the first key sets the smallest candidate rather than
     * the first breakpoint. Hence the leading raw-pixel key below.
     */
    sizes?: string
    /** Set on the LCP image only: eager + high fetchpriority + preload. */
    priority?: boolean
}>(), {
    containerClass: '',
    alt: '',
    // 100vw below 640, 50vw below 1024, 33vw above. The trailing 2xl key only
    // widens the candidate ladder (33vw of 1536 = 507, so 1014 at 2x) — without
    // it the largest candidate is 676w and retina desktops soften.
    sizes: '320:100vw sm:50vw lg:33vw 2xl:33vw',
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
