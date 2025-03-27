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
        'Kafka': {
            name: 'Kafka',
            images: [
                '/assets/post-generator/characters/hsr/kafka/kafka_1.webp',
                '/assets/post-generator/characters/hsr/kafka/kafka_2.webp',
                '/assets/post-generator/characters/hsr/kafka/kafka_3.webp',
            ],
        },
        
    },
    'zzz': {
        'Jane Doe': {
            name: 'Jane Doe',
            images: [
                '/assets/post-generator/characters/zzz/jane_doe/jane_doe_1.webp',
                '/assets/post-generator/characters/zzz/jane_doe/jane_doe_2.webp',
                '/assets/post-generator/characters/zzz/jane_doe/jane_doe_3.webp',
            ],
        },
    },
};