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

const items = ref([
    [
        {
            label: 'Home',
            icon: 'i-lucide-home',
            to: '/',
            active: computed(() => route.currentRoute.value.path === '/'),
        },
        {
            label: 'About Me',
            icon: 'i-lucide-user',
            to: '/about'
        },
        {
            label: 'Recipes',
            icon: 'uil:diary',
            to: '/recipes',
            active: computed(() => route.currentRoute.value.path.split('/')[1] === 'recipes')
        }
    ],
])

</script>

<style lang="scss" scoped>


</style>