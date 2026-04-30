export interface CarouselSlide {
    image: string;
    height: string;
    location: string;
}

export interface CarouselImagesExpose {
    startAutoplay: () => void;
    update: () => void;
}
