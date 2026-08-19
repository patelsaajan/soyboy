<template>
    <component
        :is="as"
        ref="containerRef"
        class="cursor-default flex flex-wrap"
        :class="containerClass"
        @mousemove="onMouseMove"
        @mouseleave="onMouseLeave"
    >
        <span
            v-for="(word, wordIndex) in words"
            :key="wordIndex"
            class="whitespace-nowrap"
        >
            <span
                v-for="(letter, letterIndex) in word"
                :key="`${wordIndex}-${letterIndex}`"
                class="letter inline-block"
                :class="letterClass"
            >{{ letter }}</span>
        </span>
    </component>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
    text: string;
    /**
     * Element to render as. Defaults to a span, but these are used as section
     * headings throughout the site — pass as="h2" there so they appear in the
     * heading outline.
     */
    as?: string;
    containerClass?: string;
    letterClass?: string;
    primaryColor?: string;
    baseColor?: string;
    maxDistance?: number;
}>(), {
    as: 'span',
    containerClass: '',
    letterClass: 'text-primary',
    primaryColor: '#ffffff',
    baseColor: '#d20a2e',
    maxDistance: 200,
});

const containerRef = ref<HTMLElement | null>(null);

const words = computed(() => {
    return props.text.split(' ').map((word, index, arr) => {
        // Add space after each word except the last
        return index < arr.length - 1 ? word + ' ' : word;
    });
});

const { onMouseMove, onMouseLeave } = useLetterHover({
    primaryColor: props.primaryColor,
    baseColor: props.baseColor,
    maxDistance: props.maxDistance,
    selector: '.letter',
});
</script>
