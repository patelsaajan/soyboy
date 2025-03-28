<template>
    <div class="box block bg-green-600 w-40 h-40"></div>
</template>

<script lang="ts" setup>
import { gsap } from "gsap";

onMounted(() => {
  gsap.to(".box", { 
    x: 200,
  });
});
</script>

<style scoped>
</style>