export interface FooterData {
    type: string;
    footer: string;
}

export const Footer: Record<string, FooterData> = {
    "new": {
        type: "new",
        footer: "/assets/post-generator/footer/footer_new.webp"
    },
    'drop': {
        type: 'drop',
        footer: '/assets/post-generator/footer/footer_drop.webp'
    },
    'repost': {
        type: 'repost',
        footer: '/assets/post-generator/footer/footer_repost.webp'
    }
}