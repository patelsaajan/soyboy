<template>
    <NuxtLink
        v-if="to"
        :to="to"
        class="app-button relative overflow-hidden"
        :class="buttonClasses"
        @mouseenter="onMouseEnter"
        @mouseleave="onMouseLeave"
    >
        <span class="relative z-10 flex items-center justify-center gap-2">
            <Icon v-if="icon && iconPosition === 'left'" :name="icon" class="size-5 flex-shrink-0" />
            <slot />
            <Icon v-if="icon && iconPosition === 'right'" :name="icon" class="size-5 flex-shrink-0" />
        </span>
        <span
            v-if="!unstyled"
            class="fill-element absolute rounded-full pointer-events-none"
            :class="color === 'primary' ? 'bg-white' : 'bg-primary'"
        />
        <slot v-else name="fill">
            <span class="fill-element absolute rounded-full pointer-events-none bg-primary" />
        </slot>
    </NuxtLink>
    <button
        v-else
        class="app-button relative overflow-hidden"
        :class="buttonClasses"
        @mouseenter="onMouseEnter"
        @mouseleave="onMouseLeave"
    >
        <span class="relative z-10 flex items-center justify-center gap-2">
            <Icon v-if="icon && iconPosition === 'left'" :name="icon" class="size-5 flex-shrink-0" />
            <slot />
            <Icon v-if="icon && iconPosition === 'right'" :name="icon" class="size-5 flex-shrink-0" />
        </span>
        <span
            v-if="!unstyled"
            class="fill-element absolute rounded-full pointer-events-none"
            :class="color === 'primary' ? 'bg-white' : 'bg-primary'"
        />
        <slot v-else name="fill">
            <span class="fill-element absolute rounded-full pointer-events-none bg-primary" />
        </slot>
    </button>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { gsap } from 'gsap';

const props = withDefaults(defineProps<{
    to?: string;
    color?: 'primary' | 'secondary';
    unstyled?: boolean;
    icon?: string;
    iconPosition?: 'left' | 'right';
}>(), {
    iconPosition: 'left',
});

const buttonClasses = computed(() => {
    if (props.unstyled) return '';

    const base = 'px-8 py-3 rounded-full border-3 cursor-pointer inline-block text-center font-sans transition-colors duration-300';

    if (props.color === 'secondary') {
        return `${base} border-white text-white hover:text-white`;
    }

    // primary (default)
    return `${base} bg-primary text-white border-primary hover:text-primary`;
});

function onMouseEnter(event: MouseEvent) {
    const target = event.currentTarget as HTMLElement;
    const fill = target.querySelector('.fill-element') as HTMLElement;
    if (!fill) return;

    const rect = target.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Size needs to be large enough to cover the button from any entry point
    const size = Math.max(rect.width, rect.height) * 2.5;

    gsap.set(fill, {
        width: size,
        height: size,
        left: x - size / 2,
        top: y - size / 2,
        scale: 0,
    });

    gsap.to(fill, {
        scale: 1,
        duration: 0.4,
        ease: 'power2.out',
    });
}

function onMouseLeave(event: MouseEvent) {
    const target = event.currentTarget as HTMLElement;
    const fill = target.querySelector('.fill-element') as HTMLElement;
    if (!fill) return;

    const rect = target.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const size = Math.max(rect.width, rect.height) * 2.5;

    // Move to exit position and shrink
    gsap.to(fill, {
        left: x - size / 2,
        top: y - size / 2,
        scale: 0,
        duration: 0.4,
        ease: 'power2.out',
    });
}
</script>

<style scoped>
.app-button {
    transition: color 0.3s ease;
}

.fill-element {
    transform: scale(0);
}
</style>
