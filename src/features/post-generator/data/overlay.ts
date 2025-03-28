export interface ThumbnailOverlayData {
    type: string;
    overlay: string;
}

export const ThumbnailOverlay: Record<string, Record<string, ThumbnailOverlayData>> = {
    single: {
        new: {
            type: 'new',
            overlay: 'assets/post-generator/overlay/thumbnail/new/overlay_new_1.webp'
        },
        drop: {
            type: 'drop',
            overlay: 'assets/post-generator/overlay/thumbnail/drop/overlay_drop_1.webp'
        },
        repost: {
            type: 'repost',
            overlay: 'assets/post-generator/overlay/thumbnail/repost/overlay_repost_1.webp'
        }
    },
    double: {
        new: {
            type: 'new',
            overlay: 'assets/post-generator/overlay/thumbnail/new/overlay_new_2.webp'
        },
        drop: {
            type: 'drop',
            overlay: 'assets/post-generator/overlay/thumbnail/drop/overlay_drop_2.webp'
        },
        repost: {
            type: 'repost',
            overlay: 'assets/post-generator/overlay/thumbnail/repost/overlay_repost_2.webp'
        }
    },
    all: {
        new: {
            type: 'new',
            overlay: 'assets/post-generator/overlay/thumbnail/new/overlay_new_all.webp'
        },
        drop: {
            type: 'drop',
            overlay: 'assets/post-generator/overlay/thumbnail/drop/overlay_drop_all.webp'
        },
        repost: {
            type: 'repost',
            overlay: 'assets/post-generator/overlay/thumbnail/repost/overlay_repost_all.webp'
        }
    }
};

export const DetailsOverlay: Record<string, ThumbnailOverlayData> = {
    char: {
        type: 'char',
        overlay: 'assets/post-generator/overlay/details/char.webp'
    },
    const: {
        type: 'const',
        overlay: 'assets/post-generator/overlay/details/const.webp'
    },
    item: {
        type: 'item',
        overlay: 'assets/post-generator/overlay/details/item.webp'
    },
    info: {
        type: 'info',
        overlay: 'assets/post-generator/overlay/details/info.webp'
    },
    other: {
        type: 'other',
        overlay: 'assets/post-generator/overlay/details/other.webp'
    }
}
