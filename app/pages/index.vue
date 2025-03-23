<template>
    <div class="container mx-auto">
        <div class="flex flex-col gap-y-6 h-screen justify-center">
            <span class="text-primary text-4xl w-full text-center">
            Welcome
            </span>
            <span class=" text-2xl w-full text-center max-w-[800px] mx-auto">
                Take a look around and grab any ideas that catch your eye. Feel free to share what you create—I'd love to see how you make it your own.
            </span>
            <div class="flex flex-row gap-x-6 justify-center">
                <UButton
                    color="primary"
                    variant="soft"
                    to="/recipes"
                    label="Recipes"
                    icon="i-lucide-home"
                />
                <UButton
                    color="primary"
                    variant="soft"
                    to="/recipes"
                    icon="i-lucide-user"
                    label="About me"
                />
                <UButton
                    color="primary"
                    variant="solid"
                    icon="i-lucide-dice-5"
                    label="I'm Feeling Lucky"
                    @click="async () => await feelingLucky()"
                />
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
const route = useRouter()


// get all recipes 
async function getRandomRecipe() {
    const { data: randomRecipe } = await useAsyncData('random-recipe', async() => {
        const allRecipes = await queryCollection('recipes').select('path').all()
        console.log('uris', allRecipes)
        const randomIndex = Math.floor(Math.random() * allRecipes.length)
        return allRecipes[randomIndex]
    })
    return randomRecipe
}

const feelingLucky = async () => {
    const randomRecipe = await getRandomRecipe()
    console.log(randomRecipe)
    if (randomRecipe.value) {
        const uriRecipe = randomRecipe.value.path ?? ''
        console.log(uriRecipe)
        if (uriRecipe) {
            route.push(randomRecipe.value.path)
        }
    } else {
        console.error('randomRecipe.value is undefined')
    }
}


</script>

<style lang="scss" scoped>


</style>