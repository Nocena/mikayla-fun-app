
export interface Fan {
    id: string;
    name: string;
    avatarUrl: string;
    isOnline: boolean;
    totalSpent: number;
    lastSeen: string;
    tags: string[];
}

export interface MessageMedia {
    id: string;
    type: 'photo' | 'gif' | 'video' | 'audio';
    thumbnailUrl: string;
    fullUrl?: string;
}

export interface Message {
    id: string;
    sender: 'fan' | 'model' | 'ai';
    content: string;
    timestamp: string;
    media?: MessageMedia[];
    price: number;
    canPurchase?: boolean;
    lockedText?: boolean;
    isFree?: boolean;
}

export interface Conversation {
    id:string;
    fan: Fan;
    messages: Message[];
    unreadCount: number;
    lastMessage: string;
    lastMessageTimestamp: string;
    accountId?: string; // ID of the social account this conversation belongs to
}

export type AIMode = 'suggest' | 'autocomplete' | 'automated';

export interface Personality {
    id: string;
    name: string;
    description: string;
    prompt: string;
    icon: string; // e.g., 'emoji' or 'icon-name'
}

// FIX: Add AnalysisData interface to resolve import error in AnalysisResultDisplay.tsx
export interface AnalysisData {
    text: string;
    sources?: {
        web?: {
            uri?: string;
            title?: string;
        };
    }[];
}
