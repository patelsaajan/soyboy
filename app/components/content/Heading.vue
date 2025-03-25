<template>
    <div 
    class="font-bold text-primary mt-6 "
    :class="textSize"
    >
        <slot  mdc-unwrap="p" />
    </div>
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