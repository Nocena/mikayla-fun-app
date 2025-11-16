import {Conversation, Fan, Personality} from "../types/chat";

export const mockFans: Record<string, Fan> = {
  'fan-1': {
    id: 'fan-1',
    name: 'TopFan_Alex',
    avatarUrl: 'https://i.pravatar.cc/150?u=fan1',
    isOnline: true,
    totalSpent: 2450.75,
    lastSeen: 'Online',
    tags: ['Whale', 'Loves Feet Pics', 'Regular'],
  },
  'fan-2': {
    id: 'fan-2',
    name: 'Mike22',
    avatarUrl: 'https://i.pravatar.cc/150?u=fan2',
    isOnline: false,
    totalSpent: 320.50,
    lastSeen: '2h ago',
    tags: ['New Subscriber'],
  },
  'fan-3': {
    id: 'fan-3',
    name: 'ShyGuy',
    avatarUrl: 'https://i.pravatar.cc/150?u=fan3',
    isOnline: true,
    totalSpent: 890.00,
    lastSeen: 'Online',
    tags: ['Lurker', 'Emotional Buyer'],
  },
};

export const mockPersonalities: Personality[] = [
  {
    id: 'p-1',
    name: 'Girlfriend',
    description: 'Sweet, caring, and loving. Aims for emotional connection.',
    prompt: 'You are a sweet and caring girlfriend. Your goal is to make the fan feel loved, special, and emotionally connected. Use loving emojis and pet names.',
    icon: '❤️',
  },
  {
    id: 'p-2',
    name: 'Slutty',
    description: 'Teasing, seductive, and direct. Aims for arousal and quick sales.',
    prompt: 'You are a teasing, seductive, and slutty personality. Be direct, use suggestive language, and push for sales of explicit content. Use emojis like 😉, 😈, 💦.',
    icon: '😈',
  },
  {
    id: 'p-3',
    name: 'Dominant',
    description: 'Confident, in-control, and demanding. For fans who like to be told what to do.',
    prompt: 'You are a dominant and assertive personality. Take control of the conversation, give commands, and make the fan feel submissive. Use emojis like 👑, 🔥.',
    icon: '👑',
  },
    {
    id: 'p-4',
    name: 'Friendly',
    description: 'Casual, fun, and engaging. Builds rapport like a good friend.',
    prompt: 'You are a friendly and bubbly personality. Keep the conversation light, fun, and casual. Ask about their day and share "safe-for-work" anecdotes. Use emojis like 😊, 😂, 👋.',
    icon: '😊',
  },
];

export const mockConversations: Conversation[] = [
  {
    id: 'conv-1',
    fan: mockFans['fan-1'],
    unreadCount: 2,
    lastMessage: "Can't wait to see more! I just renewed my sub.",
    lastMessageTimestamp: '5m',
    messages: [
      { id: 'msg-1-1', sender: 'fan', content: "Hey! You have the best content on here.", timestamp: '1h ago' },
      { id: 'msg-1-2', sender: 'model', content: "Aww thank you so much Alex! I'm so glad you enjoy it ❤️", timestamp: '55m ago' },
      { id: 'msg-1-3', sender: 'fan', content: "Of course! My day is always better after seeing your posts.", timestamp: '30m ago' },
      { id: 'msg-1-4', sender: 'fan', content: "Can't wait to see more! I just renewed my sub.", timestamp: '5m ago' },
    ],
  },
  {
    id: 'conv-2',
    fan: mockFans['fan-2'],
    unreadCount: 0,
    lastMessage: "Thanks, I'll think about it.",
    lastMessageTimestamp: '45m',
    messages: [
      { id: 'msg-2-1', sender: 'fan', content: "hey, new here", timestamp: '1d ago' },
      { id: 'msg-2-2', sender: 'model', content: "Welcome Mike! So happy to have you here. Let me know if you have any special requests 😉", timestamp: '23h ago' },
      { id: 'msg-2-3', sender: 'ai', content: "Hey Mike, I just uploaded a new set you might like. It's on a special welcome discount for you!", timestamp: '1h ago' },
      { id: 'msg-2-4', sender: 'fan', content: "Thanks, I'll think about it.", timestamp: '45m ago' },
    ],
  },
    {
    id: 'conv-3',
    fan: mockFans['fan-3'],
    unreadCount: 5,
    lastMessage: "...",
    lastMessageTimestamp: '1m',
    messages: [
      { id: 'msg-3-1', sender: 'fan', content: "hi", timestamp: '10m ago' },
      { id: 'msg-3-2', sender: 'fan', content: "you there?", timestamp: '8m ago' },
      { id: 'msg-3-3', sender: 'fan', content: "I was just wondering...", timestamp: '5m ago' },
      { id: 'msg-3-4', sender: 'fan', content: "nvm", timestamp: '3m ago' },
      { id: 'msg-3-5', sender: 'fan', content: "...", timestamp: '1m ago' },
    ],
  },
];