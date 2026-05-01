<template>
    <ClientOnly>
        <Teleport to="body">
            <!-- Precision dot at exact mouse position -->
            <div
                v-show="cursorBanner.isVisible.value"
                class="fixed pointer-events-none z-50 rounded-full -translate-x-1/2 -translate-y-1/2"
                :style="{
                    left: `${cursorBanner.rawX.value}px`,
                    top: `${cursorBanner.rawY.value}px`,
                    width: '7px',
                    height: '7px',
                    background: '#d20a2e',
                    boxShadow: '0 0 0 2px #F0ECD9',
                }"
            />
            <!-- Marquee label -->
            <div
                v-show="cursorBanner.isVisible.value"
                class="fixed pointer-events-none z-50 overflow-hidden"
                :style="{
                    left: `${cursorBanner.x.value}px`,
                    top: `${cursorBanner.y.value}px`,
                    background: '#111520',
                    border: '1px solid #d20a2e',
                    borderRadius: '3px',
                    width: '224px',
                }"
            >
                <UMarquee
                    gap="1"
                    :ui="{
                        root: 'before:from-[#111520] after:from-[#111520]'
                    }"
                >
                    <span
                        v-for="n in 3"
                        :key="n"
                        class="font-sans uppercase"
                        style="font-size: 0.68rem; color: #F0ECD9; padding: 5px 20px 5px 0; letter-spacing: 0.1em;"
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
