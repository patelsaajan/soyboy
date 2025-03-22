<template>
    <div class="h-screen">
        <nav>
            <ul v-if="recipes">
                <li v-for="(item, index) in recipes" :key="index">
                <NuxtLink :to="item.path">{{ item.title }}</NuxtLink>
                </li>
            </ul>
        </nav>
    </div>
  </template>

<script lang="ts" setup>

const { data: recipes } = await useAsyncData('navigation', async () => {
    const data = await queryCollectionNavigation('recipes');
    return data[0]?.children;
})

</script>

<style lang="scss" scoped>


</style>