<template>
    <div
        class="flex flex-row items-center gap-x-5"
    >
        <UNavigationMenu
            color="primary" 
            variant="pill"
            :items="items" 
            class="w-full"
        />
    </div>
</template>

<script lang="ts" setup>

const route = useRouter()

console.log(route.currentRoute.value.path.split('/')[1])

const items = ref([
    [
        {
            label: 'Home',
            icon: 'i-lucide-home',
            to: '/',
            active: route.currentRoute.value.path === '/',
        },
        {
            label: 'About Me',
            icon: 'i-lucide-user',
            to: '/about'
        },
        {
            label: 'Recipes',
            icon: 'uil:diary',
            to: '/',
            active: computed(() => route.currentRoute.value.path.split('/')[1] === 'recipes')
        }
    ],
])

</script>

<style lang="scss" scoped>


</style>