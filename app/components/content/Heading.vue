<template>
    <span 
    class="font-bold text-primary"
    :class="textSize"
    >
        <slot />
    </span>
</template>

<script lang="ts" setup>

const props = defineProps<{
    size: string;
}>();

const textSize = computed(() => {
    return `text-${props.size}`;
});

</script>

<style lang="scss" scoped>


</style>