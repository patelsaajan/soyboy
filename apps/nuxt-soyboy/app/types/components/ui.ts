export interface AccordionQuestion {
    id: string | number;
    question: string;
    answer: string;
    dataName?: string;
    data?: {
        name: string;
        value: string;
    }[];
}

export interface AccordionProps {
    title: string;
    questions: AccordionQuestion[];
}

export interface LogoProps {
    size?: 'sm' | 'md' | 'lg';
    stacked?: boolean;
}

export interface HoverTextProps {
    text: string;
    containerClass?: string;
    letterClass?: string;
    primaryColor?: string;
    baseColor?: string;
    maxDistance?: number;
}

export interface FeatureItem {
    id: number;
    label: string;
    title: string;
    desc: string;
    icon: string;
    image: string;
    hoverLabel?: string;
}

export interface Features {
    title: string;
    description?: string;
    items: FeatureItem[];
}

export interface FeatureListProps {
    features: Features;
}

export interface CountdownProps {
    title: string;
    date: Date;
}

export interface CursorMarqueeExpose {
    show: (text: string, e: MouseEvent) => void;
    hide: () => void;
}
