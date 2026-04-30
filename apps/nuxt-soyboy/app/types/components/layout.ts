export interface NavItem {
    label: string;
    icon: string;
    to: string;
    active?: boolean | (() => boolean);
}
