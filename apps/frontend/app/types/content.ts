export interface FooterLink {
    label: string;
    to: string;
    external?: boolean;
}

export interface FooterSection {
    title: string;
    links: FooterLink[];
    colSpan?: string;
}

export interface SocialLink {
    label: string;
    to: string;
    icon: string;
    color: 'primary' | 'secondary';
}
