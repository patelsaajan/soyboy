<template>
    <div
        :class="classes"
        @mouseenter="onMouseEnter"
        @mouseleave="onMouseLeave"
    >
        <div class="relative z-10">
            <span v-if="title" class="text-2xl font-bold mb-4 block">{{ title }}</span>
            <div class="flex flex-col gap-1">
                <span v-if="number !== undefined" class="text-4xl font-bold block">{{ String( number ) }} </span><span class="text-lg font-normal">{{ unit }}</span>
            </div>
            <slot />
        </div>
        <span
            class="fill-element absolute rounded-full pointer-events-none"
            :class="!props.color && (props.variant === 'primary' ? 'bg-white' : 'bg-primary/80')"
            :style="props.color ? { backgroundColor: props.color } : undefined"
        />
    </div>
</template>


<script setup lang="ts">
import { gsap } from 'gsap';

const props = defineProps<{
    title?: string;
    number?: number | string;
    unit?: string;
    variant?: 'primary' | 'outline';
    color?: string;
}>();

const classes = computed(() => {
    const baseClasses = 'bg-card rounded-lg shadow-sm p-8 border-3 relative overflow-hidden cursor-default transition-colors duration-300';
    const variantClasses: Record<'primary' | 'outline', string> = {
        primary: 'bg-primary/60 text-primary-foreground text-white border-primary/60 hover:text-primary',
        outline: 'border-white hover:text-white',
    };

    const variantClass = props.variant ? variantClasses[props.variant] : '';
    return `${baseClasses} ${variantClass}`.trim();
});

function onMouseEnter(event: MouseEvent) {
    const target = event.currentTarget as HTMLElement;
    const fill = target.querySelector('.fill-element') as HTMLElement;
    if (!fill) return;

    const rect = target.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

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
.fill-element {
    transform: scale(0);
}
</style>
