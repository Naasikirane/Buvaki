import { Post, SubBuvaki, ChatChannel, ChatMessage, User, NotificationItem, Comment } from '../types';

export const CURRENT_USER: User = {
  id: 'u_guest_creator',
  username: 'Buvaki Creator',
  handle: 'u/creator',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  bio: 'Creative creator on Buvaki.',
  karma: 100,
  badges: ['Founding Member'],
  joinedDate: 'August 2026',
  status: 'online',
  statusText: 'Creating content',
};

export const SEED_USERS: Record<string, User> = {};

export const SEED_SUB_BUVAKIS: SubBuvaki[] = [
  {
    id: 'photography',
    name: 'photography',
    displayName: 'b/photography',
    description: 'Share your best captures, camera gear recommendations, and visual stories from around the world.',
    memberCount: 1,
    icon: 'camera',
    isDefault: true,
    bannerColor: 'from-amber-950 via-amber-900 to-orange-950',
    category: 'creative',
    isJoined: true,
  },
  {
    id: 'tech',
    name: 'tech',
    displayName: 'b/tech',
    description: 'Latest innovations in software engineering, AI assistants, hardware, and web trends.',
    memberCount: 1,
    icon: 'cpu',
    isDefault: true,
    bannerColor: 'from-cyan-950 via-cyan-900 to-blue-950',
    category: 'tech',
    isJoined: true,
  },
  {
    id: 'design',
    name: 'design',
    displayName: 'b/design',
    description: 'UI/UX inspiration, typography, branding identities, and motion graphics showcases.',
    memberCount: 1,
    icon: 'palette',
    isDefault: true,
    bannerColor: 'from-pink-950 via-pink-900 to-purple-950',
    category: 'creative',
    isJoined: true,
  },
  {
    id: 'gaming',
    name: 'gaming',
    displayName: 'b/gaming',
    description: 'Indie game spotlights, esports highlights, retro classics, and gaming setup showcases.',
    memberCount: 1,
    icon: 'gamepad',
    isDefault: true,
    bannerColor: 'from-emerald-950 via-emerald-900 to-teal-950',
    category: 'gaming',
    isJoined: false,
  },
  {
    id: 'general',
    name: 'general',
    displayName: 'b/general',
    description: 'The global Buvaki lounge for daily conversations, Q&A, stories, and trending topics.',
    memberCount: 1,
    icon: 'message',
    isDefault: true,
    bannerColor: 'from-violet-950 via-violet-900 to-indigo-950',
    category: 'general',
    isJoined: true,
  },
  {
    id: 'music',
    name: 'music',
    displayName: 'b/music',
    description: 'Discover fresh tracks, share curated playlists, album reviews, and concert memories.',
    memberCount: 1,
    icon: 'music',
    isDefault: true,
    bannerColor: 'from-rose-950 via-rose-900 to-red-950',
    category: 'creative',
    isJoined: false,
  },
];

export const SEED_POSTS: Post[] = [];

export const SEED_COMMENTS: Record<string, Comment[]> = {};

export const SEED_CHANNELS: ChatChannel[] = [
  {
    id: 'chan_general',
    name: 'general-lounge',
    topic: 'Main community lounge — chat about trending topics, music, and daily life!',
    type: 'text',
    unreadCount: 0,
  },
  {
    id: 'chan_creative',
    subBuvakiId: 'design',
    name: 'creative-showcase',
    topic: 'Share design feedback, photography shots & creative works in progress',
    type: 'text',
    unreadCount: 0,
  },
  {
    id: 'chan_dev',
    subBuvakiId: 'tech',
    name: 'tech-talk',
    topic: 'Code snippets, tech news, gadget discussions & live Q&A',
    type: 'text',
    unreadCount: 0,
  },
  {
    id: 'chan_voice_1',
    name: 'Community Voice Lounge #1',
    topic: 'Open live voice room for community hangouts and weekend chats',
    type: 'voice',
    activeVoiceUsers: [],
  },
];

export const SEED_MESSAGES: Record<string, ChatMessage[]> = {};

export const SEED_NOTIFICATIONS: NotificationItem[] = [];
