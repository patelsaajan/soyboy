<template>
     <NuxtMarquee
     :direction="direction"   
     >
        <span 
            v-for="word in words" 
            :key="word" 
            :class="`w-content  md:text-[8rem] text-[4rem] ml-20`"
            >
              {{ word }}
          </span>
        </NuxtMarquee>
</template>

<script lang="ts" setup>

const props = defineProps({
    words: {
        type: Array as PropType<string[]>,
        required: true
    },
    direction: {
        type: String as PropType<'left' | 'right' | 'up' | 'down'>,
        default: 'right'
    }
})




</script>

<style lang="scss" scoped>


</style>