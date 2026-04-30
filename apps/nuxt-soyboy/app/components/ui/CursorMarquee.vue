<template>
    <ClientOnly>
        <Teleport to="body">
            <div
                v-show="cursorBanner.isVisible.value"
                class="fixed pointer-events-none z-50 bg-white font-sans text-black py-1.5 rounded-md text-sm font-medium shadow-lg overflow-hidden w-80"
                :style="{
                    left: `${cursorBanner.x.value}px`,
                    top: `${cursorBanner.y.value}px`,
                }"
            >
                <UMarquee
                    gap="1"
                    :ui="{
                        root: 'before:from-white after:from-white'
                    }"
                >
                    <span
                        v-for="n in 3"
                        :key="n"
                    >
                        {{ cursorBanner.text.value }}
                    </span>
                </UMarquee>
            </div>
        </Teleport>
    </ClientOnly>
</template>

<script setup lang="ts">
const cursorBanner = useCursorBanner();

defineExpose({
    show: cursorBanner.show,
    hide: cursorBanner.hide,
});
</script>
