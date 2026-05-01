<template>
    <div
        ref="elementRef"
        class="relative py-8 w-full overflow-hidden"
    >
        <div ref="contentRef">
            <Swiper
                ref="swiperRef"
                :modules="[Autoplay]"
                :slides-per-view="1"
                :space-between="16"
                :loop="true"
                :speed="1000"
                :autoplay="{
                    delay: 1500,
                    disableOnInteraction: false,
                    pauseOnMouseEnter: true,
                }"
                :breakpoints="{
                    768: { slidesPerView: 'auto', spaceBetween: 40 },
                }"
                @swiper="onSwiper"
                class="w-full"
            >
                <SwiperSlide
                    v-for="(slide, index) in slides"
                    :key="index"
                    class="md:w-auto! flex! items-center!"
                >
                    <div
                        class="slide-image w-full md:w-80 rounded-2xl bg-primary bg-cover bg-center md:cursor-none mx-4"
                        :style="{
                            backgroundImage: `url(${slide.image})`,
                            ...getSlideHeight(slide.height),
                        }"
                        @mouseenter="(e) => cursorMarqueeRef?.show(slide.location, e)"
                        @mouseleave="cursorMarqueeRef?.hide()"
                    />
                </SwiperSlide>
            </Swiper>

            <UiCursorMarquee ref="cursorMarqueeRef" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Autoplay } from 'swiper/modules';
import { gsap } from 'gsap';
import type { CarouselSlide, CursorMarqueeExpose } from '~/types';

const cursorMarqueeRef = ref<CursorMarqueeExpose | null>(null);
const contentRef = ref<HTMLElement | null>(null);

let swiperInstance: any = null;

const onSwiper = (swiper: any) => {
    swiperInstance = swiper;
    // Stop autoplay immediately - we'll start it after the entrance animation
    swiperInstance.autoplay.stop();
};

const startAutoplay = () => {
    if (swiperInstance) {
        swiperInstance.autoplay.start();
    }
};

const update = () => {
    if (swiperInstance) {
        swiperInstance.update();
    }
};

defineExpose({ startAutoplay, update });

const { elementRef } = useScrollEntrance({
    threshold: 0.7,
    onEnter: () => {
        if (contentRef.value) {
            gsap.to(contentRef.value, {
                opacity: 1,
                x: 0,
                duration: 1,
                ease: 'power2.out',
                onComplete: () => {
                    update();
                    startAutoplay();
                },
            });
        }
    },
});

onMounted(() => {
    if (contentRef.value) {
        gsap.set(contentRef.value, { opacity: 0, x: '100%' });
    }
});

const getSlideHeight = (desktopHeight: string) => {
    return {
        '--desktop-height': desktopHeight,
    };
};

const slides: CarouselSlide[] = [
    { image: '/imgs/carousel/image10.jpg', height: '320px', location: 'Casablanca, Morocco' },
    { image: '/imgs/carousel/image13.jpg', height: '440px', location: 'Da Nang, Vietnam' },
    { image: '/imgs/carousel/image1.jpg', height: '480px', location: 'Pai, Thailand' },
    { image: '/imgs/carousel/image4.jpg', height: '340px', location: 'Phuket, Thailand' },
    { image: '/imgs/carousel/image2.jpg', height: '450px', location: 'Da Nang, Vietnam' },
    { image: '/imgs/carousel/image3.jpg', height: '360px', location: 'Phnom Penh, Cambodia' },
    { image: '/imgs/carousel/image18.jpg', height: '430px', location: 'Norwich, UK' },
    { image: '/imgs/carousel/image6.jpg', height: '470px', location: 'Phuket, Thailand' },
    { image: '/imgs/carousel/image7.jpg', height: '330px', location: 'Pai, Thailand' },
    { image: '/imgs/carousel/image8.jpg', height: '420px', location: 'Thorpe Park, UK' },
    { image: '/imgs/carousel/image5.jpg', height: '350px', location: 'Rome, Italy' },
    { image: '/imgs/carousel/image9.jpg', height: '460px', location: 'Malta' },
    { image: '/imgs/carousel/image12.jpg', height: '370px', location: 'Athens, Greece' },
    { image: '/imgs/carousel/image11.jpg', height: '480px', location: 'Casablanca, Morocco' },
    { image: '/imgs/carousel/image14.jpg', height: '340px', location: 'Artic Circle, Sweden' },
    { image: '/imgs/carousel/image19.jpg', height: '430px', location: 'Delhi, India' },
    { image: '/imgs/carousel/image15.jpg', height: '470px', location: 'Ho Chi Minh, Vietnam' },
    { image: '/imgs/carousel/image16.jpg', height: '360px', location: 'Sicily, Italy' },
    { image: '/imgs/carousel/image17.jpg', height: '430px', location: 'Athens, Greece' },
];

</script>

<style scoped>
:deep(.swiper-wrapper) {
    align-items: center;
}

.slide-image {
    height: 280px;
}

@media (min-width: 768px) {
    .slide-image {
        height: var(--desktop-height);
    }
}
</style>
