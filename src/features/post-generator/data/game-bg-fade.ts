export interface GameImageData {
    type: string;
    background: string;
}

export const GameBackground: Record<string, Record<string, GameImageData>> = {
    single: {
        genshin: {
            type: 'gi',
            background: 'assets/post-generator/game_bg/single/gi_bg.webp'
        },
        hsr: {
            type: 'hsr',
            background: 'assets/post-generator/game_bg/single/hsr_bg.webp'
        },
        zzz: {
            type: 'zzz',
            background: 'assets/post-generator/game_bg/single/zzz_bg.webp'
        }
    },
    double: {
        genshin_hsr: {
            type: 'gi_hsr',
            background: 'assets/post-generator/game_bg/double/gi_hsr_bg.webp'
        },
        genshin_zzz: {
            type: 'gi_zzz',
            background: 'assets/post-generator/game_bg/double/gi_zzz_bg.webp'
        },
        hsr_zzz: {
            type: 'hsr_zzz',
            background: 'assets/post-generator/game_bg/double/hsr_zzz_bg.webp'
        }
    },
    all: {
        all: {
            type: 'all',
            background: 'assets/post-generator/game_bg/all_bg.webp'
        }
    }
}

export const GameFade: Record<string, Record<string, GameImageData>> = {
    single: {
        genshin: {
            type: 'gi',
            background: 'assets/post-generator/game_fade/single/gi_fade.webp'
        },
        hsr: {
            type: 'hsr',
            background: 'assets/post-generator/game_fade/single/hsr_fade.webp'
        },
        zzz: {
            type: 'zzz',
            background: 'assets/post-generator/game_fade/single/zzz_fade.webp'
        }
    },
    double: {
        genshin_hsr: {
            type: 'gi_hsr',
            background: 'assets/post-generator/game_fade/double/gi_hsr_fade.webp'
        },
        genshin_zzz: {
            type: 'gi_zzz',
            background: 'assets/post-generator/game_fade/double/gi_zzz_fade.webp'
        },
        hsr_zzz: {
            type: 'hsr_zzz',
            background: 'assets/post-generator/game_fade/double/hsr_zzz_fade.webp'
        }
    },
    all: {
        all: {
            type: 'all',
            background: 'assets/post-generator/game_fade/all_fade.webp'
        }
    }
}