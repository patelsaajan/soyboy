export interface ButtonProps {
    to?: string;
    color?: 'primary' | 'secondary';
    unstyled?: boolean;
    icon?: string;
    iconPosition?: 'left' | 'right';
}

export interface CardProps {
    title?: string;
    number?: number | string;
    unit?: string;
    variant?: 'primary' | 'outline';
    color?: string;
}

export interface PillProps {
    icon?: string;
}

export interface StatisticProps {
    number: number;
    statistic: string;
    padding?: number;
}
