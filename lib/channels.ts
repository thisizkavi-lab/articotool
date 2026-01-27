// Preset channels for the Explore page
export interface Channel {
    id: string;
    name: string;
    handle: string;
    description: string;
    thumbnail?: string;
}

export const PRESET_CHANNELS: Channel[] = [
    {
        id: 'UCh5m8L08IblqKy0OEum9Akw',
        name: 'Tyson Liberto',
        handle: '@tysonliberto',
        description: 'Speaking & presentation skills',
    },
    {
        id: 'UCCrl9a26fDCZvofnCnA5A8g',
        name: 'Johnathan Bi',
        handle: '@bi.johnathan',
        description: 'Philosophy & ideas',
    },
];

export interface VideoItem {
    id: string;
    title: string;
    thumbnail: string;
    publishedAt: string;
    channelName: string;
}
