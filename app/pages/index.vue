<template>
    <div 
        class="relative w-full flex flex-col justify-evenly"
        style="height: calc(100vh - 65px);"
    >
        <PartsScrollingWords :words="veganWords1" :fontSize="'8rem'" :direction="'left'" />
        <div class="container mx-auto">
            <div class="flex flex-col gap-y-6 justify-center">
                <span class="text-primary text-6xl w-full text-center">
                Welcome!
                </span>
                <span class="text-2xl w-full text-center max-w-[800px] mx-auto">
                    This is just a bunch of recipes I make from time to time and don’t want to forget. I figured I’d write them down somewhere easy to find and now they’re here if you ever want to give them a go.
                </span>
                <div class="flex flex-row gap-x-6 justify-center flex-wrap gap-y-6">
                    <UButton
                        color="primary"
                        variant="soft"
                        to="/recipes"
                        label="Recipes"
                        icon="uil:diary"
                    />
                    <UButton
                        color="primary"
                        variant="soft"
                        to="/about"
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
        <PartsScrollingWords :words="veganWords2" :fontSize="'8rem'" />
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

const veganWords1 = [
    "Tofu",
    "Soyboy",
    "Lentils",
    "Vegan",
    "Chickpeas",
    "Tempeh",
    "Beets",
    "Seitan",
    "Aubergine",
    "Falafel"
]

const veganWords2 = [
    "Hummus",
    "Plant-based",
    "Mushrooms",
    "Cumin",
    "Avocado",
    "Beans",
    "Peanuts",
    "Tomatoes",
    "Soyboy",
    "Garlic"
]
</script>

<style lang="scss" scoped>


</style>