<template>
    <NuxtLink to="/" class="inline-block">
        <!-- Stacked layout (two lines) -->
        <span
            v-if="stacked"
            class="flex flex-col leading-tight font-bold font-sans"
            :class="sizeClass"
            @mousemove="onMouseMove"
            @mouseleave="onMouseLeave"
        >
            <span class="flex">
                <span
                    v-for="(_letter, index) in 'SOYBOY'"
                    :key="'first-' + index"
                    class="logo-letter inline-block"
                >
                    {{ 'SOYBOY'[index] }}
                </span>
            </span>
            <span class="flex">
                <span
                    v-for="(_letter, index) in 'SAAJAN'"
                    :key="'second-' + index"
                    class="logo-letter inline-block"
                >
                    {{ 'SAAJAN'[index] }}
                </span>
            </span>
        </span>

        <!-- Inline layout (single line) -->
        <UiHoverText
            v-else
            text="SOYBOY SAAJAN"
            :container-class="`font-bold font-sans tracking-tight ${sizeClass}`"
            :max-distance="150"
            base-color="#ffffff"
            primary-color="#d20a2e"
        />
    </NuxtLink>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
    size?: 'sm' | 'md' | 'lg';
    stacked?: boolean;
}>(), {
    size: 'md',
    stacked: false,
});

const sizeClass = computed(() => {
    const sizes = {
        sm: 'text-xl',
        md: 'text-2xl md:text-3xl',
        lg: 'text-3xl md:text-4xl',
    };
    return sizes[props.size];
});

const { onMouseMove, onMouseLeave } = useLetterHover({
    maxDistance: 75,
    selector: '.logo-letter',
    baseColor: '#ffffff',
    primaryColor: '#d20a2e',
});
</script>
