<template>
    <div class="max-w-[400px] mx-auto">
        <UCard
                variant="soft"
                class="bg-neutral border-1 "
                @click="modal.open()"
            >
            <template #header>
                <div class="relative">
                    <USkeleton v-if="!isImageLoaded" class="bg-skeleton rounded-xl h-[250px] w-[250px]" />
                    <NuxtImg
                        v-if="isImageLoaded"
                        :src="`/imgs/recipes/${ recipe.imgSrc }`"
                        :alt="recipe.title"
                        class="rounded-xl relative"
                        width="250"
                        height="250"
                        loading="lazy"
                    />
                </div>
            </template>
                <div
                    class="flex flex-col"
                >
                    <span class="text-sub-heading text-primary text-lg font-bold">{{ recipe.cuisine }}</span>
                    <span class="text-sub-heading font-bold text-2xl block truncate w-[200px]">{{ recipe.title }}</span>
                    <div class="flex flex-row justify-between mt-4">
                        <UBadge
                            trailing-icon="material-symbols:timer-outline-rounded" 
                            class="bg-base p-0" 
                            :label="recipe.time"
                            size="xl"
                        />
                        <UBadge
                            trailing-icon="ic:round-people"
                            class="bg-main p-0"
                            :label="recipe.serves"
                            size="xl"
                        />
                    </div>
                </div>

        </UCard>
    </div>
</template>

<script lang="ts" setup>
import { ModalsRecipe } from '#components'

const overlay = useOverlay()
const isImageLoaded = ref(false);

const props = defineProps<{
    recipe: any; 
}>();

const loadImage = () => {
    const img = new Image();
    img.src = `/imgs/recipes/${props.recipe.imgSrc}`;
    img.onload = () => {
        isImageLoaded.value = true;
    };
};

onMounted(() => {
    loadImage();
});

const modal = overlay.create(ModalsRecipe, {
   props: {
    recipe: props.recipe,
   }
});




</script>

<style lang="scss" scoped>


</style>