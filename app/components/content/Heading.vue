<template>
    <component :is="'h' + headingNum" class="font-bold text-main">
        <slot />
    </component>
</template>

<script lang="ts" setup>

const props = defineProps<{
    headingNum: number;
}>();

</script>

<style lang="scss" scoped>


</style>