<template>
    <div class="w-full flex justify-center my-10">
        <NuxtImg
            :src="imgSrc"
            :alt="alt"
            width="400"
            height="400"
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