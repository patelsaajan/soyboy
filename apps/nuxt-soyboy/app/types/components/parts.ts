export interface Recipe {
    id?: string | number;
    title: string;
    cuisine: string;
    time: string;
    serves: number | string;
    imgSrc: string;
    description?: string;
}

export interface RecipeCardProps {
    recipe: Recipe;
}

export interface ScrollingWordsProps {
    words: string[];
    direction?: 'left' | 'right' | 'up' | 'down';
}

export interface ImageProps {
    imgSrc: string;
    alt: string;
}

export type ImagedRoundCenterProps = ImageProps;
export type ImgSingleProps = ImageProps;
