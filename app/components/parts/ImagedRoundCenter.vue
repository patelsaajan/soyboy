<template>
    <div class="w-full flex justify-center">
        <NuxtImg
            :src="imgSrc"
            :alt="alt"
            width="100"
            height="100"
            class="rounded-full"
        />
    </div>
</template>

<script lang="ts" setup>

const props = defineProps<{
    imgSrc: string;
    alt: string;
}>();

</script>

<style lang="scss" scoped>


</style>