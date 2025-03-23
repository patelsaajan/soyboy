<template>
    <div class="w-full flex justify-center py-10">
        <NuxtImg
            :src="imgSrc"
            :alt="alt"
            width="400"
            height="400"
            class="rounded-xl"
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