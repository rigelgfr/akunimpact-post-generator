export interface CharacterData {
    name: string;
    images: string[];
}

export const Characters: Record<string, Record<string, CharacterData>> = {
    'genshin': {
        'Hu Tao': {
            name: 'Hu Tao',
            images: [
                '/assets/post-generator/characters/genshin/hu_tao/hu_tao_1.webp',
                '/assets/post-generator/characters/genshin/hu_tao/hu_tao_2.webp',
                '/assets/post-generator/characters/genshin/hu_tao/hu_tao_3.webp',
            ],
        },
    },
    'hsr': {
        'Acheron': {
            name: 'Acheron',
            images: [
                '/assets/post-generator/characters/honkai/kiana/kiana_1.webp',
                '/assets/post-generator/characters/honkai/kiana/kiana_2.webp',
                '/assets/post-generator/characters/honkai/kiana/kiana_3.webp',
            ],
        },
        
    },
    'zzz': {
        'Miyabi': {
            name: 'Miyabi',
            images: [
                '/assets/post-generator/characters/star_rail/march_7th/march_7th_1.webp',
                '/assets/post-generator/characters/star_rail/march_7th/march_7th_2.webp',
                '/assets/post-generator/characters/star_rail/march_7th/march_7th_3.webp',
            ],
        },
    },
};