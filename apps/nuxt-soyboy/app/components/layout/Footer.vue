<template>
    <footer 
        ref="elementRef"
        class="container mx-auto mb-16 opacity-0 translate-y-10"
    >
        <div class="grid grid-cols-6 gap-6">
            <div
                v-for="section in footerSections"
                :key="section.title"
                class="rounded-xl border-2 border-white/20 overflow-hidden"
                :class="section.colSpan"
            >
                <div class="border-b border-white/20 p-4">
                    <h3 class="text-xl font-bold font-sans">{{ section.title }}</h3>
                </div>
                <ul class="p-4 flex flex-col gap-3">
                    <li v-for="link in section.links" :key="link.to">
                        <NuxtLink
                            :to="link.to"
                            :target="link.external ? '_blank' : undefined"
                            class="text-white/60! transition-colors"
                        >
                            {{ link.label }}
                        </NuxtLink>
                    </li>
                </ul>
            </div>
        </div>

        <!-- Logo & Social Links -->
        <div class="mt-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <UiLogo stacked size="sm" />
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <CoreButton
                    v-for="social in socialLinks"
                    :key="social.to"
                    :to="social.to"
                    :color="social.color"
                    :icon="social.icon"
                >
                    {{ social.label }}
                </CoreButton>
            </div>
        </div>

        <!-- Copyright -->
        <div class="mt-6 pt-6 border-t border-white/20 text-center">
            <p class="text-gray-400 text-sm">
                &copy; {{ new Date().getFullYear() }} Soyboy Saajan. Built with plants and code.
            </p>
        </div>
    </footer>
</template>

<script setup lang="ts">
import { gsap } from 'gsap';
import { footerSections, socialLinks } from '../../../content/footer';

const { elementRef } = useScrollEntrance({
    threshold: 0.4,
    onEnter: () => {
        if (elementRef.value) {
            gsap.to(elementRef.value, {
                opacity: 1,
                y: 0,
                duration: 1,
                ease: 'power2.out',
            });
        }
    },
});
</script>
