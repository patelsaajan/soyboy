import type { FooterSection, SocialLink } from '~/types';

export const footerSections: FooterSection[] = [
    {
        title: 'Top Recipes',
        colSpan: 'col-span-6 sm:col-span-3 lg:col-span-2',
        links: [
            { label: 'Lentil Bolognese', to: '/recipes/lentil-bolognese' },
            { label: 'Gochujang Satay Sauce', to: '/recipes/korean-satay-sauce' },
            { label: 'Aglio e Olio', to: '/recipes/aglio-e-olio' },
            { label: 'Spicy Beans', to: '/recipes/baked-beans' },
            { label: 'Infused Tofu', to: '/recipes/infused-tofu' },
        ],
    },
    {
        title: 'Explore',
        colSpan: 'col-span-6 sm:col-span-3 lg:col-span-2',
        links: [
            { label: 'Vegan Korean', to: 'https://thekoreanvegan.com/' },
            { label: 'Gaz Oakley', to: 'https://www.gazoakleychef.com/' },
            { label: 'Yeung Man Cooking', to: 'https://yeungmancooking.com/' },
            { label: 'Roxy and Ben', to: 'https://sovegan.komi.io/' },
            { label: 'Saajan Patel', to: 'https://saajanpatel.co.uk' },
        ],
    },
    {
        title: 'Other Resources',
        colSpan: 'col-span-6 lg:col-span-2',
        links: [
            { label: 'Vegan Calculator', to: 'https://thevegancalculator.com', external: true },
            { label: 'Viva Charity', to: 'https://viva.org.uk/', external: true },
            { label: 'NutritionFacts', to: 'https://nutritionfacts.org', external: true },
            { label: 'Veganuary', to: 'https://veganuary.com', external: true },
            { label: 'HappyCow', to: 'https://happycow.net', external: true },
        ],
    },
];

export const socialLinks: SocialLink[] = [
    { label: 'Instagram', to: 'https://www.instagram.com/soyboysaajan/', icon: 'mdi:instagram', color: 'secondary' },
    { label: 'GitHub', to: 'https://github.com/patelsaajan', icon: 'mdi:github', color: 'secondary' },
    { label: 'LinkedIn', to: 'https://linkedin.com/in/patelsaajan', icon: 'mdi:linkedin', color: 'secondary' },
    { label: 'Me', to: 'https://saajanpatel.co.uk', icon: 'lucide:globe', color: 'primary' },
];
