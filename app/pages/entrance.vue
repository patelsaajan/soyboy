<template>
    <div class="flex h-lvh w-full items-center justify-between overflow-hidden">
        <div v-if="boxNumber" v-for="(box, index) in boxNumber" :key="index" :class="['box', index % 2 === 0 ? 'box-even' : 'box-odd', 'block', 'bg-neutral', 'w-28', 'h-28', 'rounded-xl', 'md:w-40', 'md:h-40']"></div>
    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, nextTick } from 'vue';
import { gsap } from "gsap";

const boxNumber = ref(0);

onMounted(async () => {
    const screenWidth = window.innerWidth;
    boxNumber.value = screenWidth < 768 ? Math.floor(screenWidth / 100) : Math.floor(screenWidth / 200);
    const boxes = Array.from({ length: boxNumber.value }, (_, i) => i);
    console.log('boxNumber', boxes);

    await nextTick(); // Wait for the DOM to be updated

    let tl = gsap.timeline();

    gsap.set(".box", { backgroundColor: "white" });

    tl.to(".box", { 
        duration: 1,
        backgroundColor: "#031726", // Assuming this is the primary color
        rotation: 360,
        opacity: 1, 
        ease: "sine.out",
        stagger: 0.2,
        force3D: true,
    });

    tl.to(".box-odd", { 
        duration: 4,
        y: screenWidth*3,
        delay: 1, 
        ease: "sine.out", 
        force3D: true,
    });

    tl.to(".box-even", { 
        duration: 4,
        y: -screenWidth*3,  
        ease: "sine.out", 
        force3D: true,
    } , "<");
});

definePageMeta({
  layout: false
})

</script>

<style lang="scss" scoped>
</style>