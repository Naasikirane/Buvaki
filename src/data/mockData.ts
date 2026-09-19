import { Post, SubBuvaki, ChatChannel, ChatMessage, User, NotificationItem, Comment } from '../types';

export const CURRENT_USER: User = {
  id: 'u_buvaki_story',
  username: 'Buvaki story',
  handle: '@buvaki',
  avatar: '/src/assets/images/buvaki_avatar_1789246881670.jpg',
  bio: 'Welcome to Buvaki Story! Here, we bring you just fragments of most things. The main are anime, fantasy tales, manga adaptations, and original universe lore.',
  karma: 1250,
  badges: ['Creator', 'Verified'],
  joinedDate: 'August 2026',
  status: 'online',
  statusText: 'Creating content',
};

export const SEED_USERS: Record<string, User> = {
  animefans: {
    id: 'u_animefans',
    username: 'ANIMEFANS',
    handle: '@ANIMEFANS',
    avatar: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=150&auto=format&fit=crop&q=80',
    bio: 'Anime artwork, character reviews, and daily manga updates.',
    karma: 15400,
    badges: ['Creator'],
    joinedDate: 'Jan 2025',
    status: 'online',
  },
  novacine: {
    id: 'u_novacine',
    username: 'NovaCine',
    handle: '@NovaCine',
    avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
    bio: 'Cinema reviews, marvel breakdowns, and movie trailers.',
    karma: 41200,
    badges: ['Top Creator', 'Verified'],
    joinedDate: 'Jan 2025',
    status: 'online',
  },
  visualstories: {
    id: 'u_visualstories',
    username: 'VisualStories',
    handle: '@VisualStories',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    bio: 'Cinematic travel, street photography, and golden hour captures.',
    karma: 28900,
    badges: ['Creator'],
    joinedDate: 'Feb 2025',
    status: 'online',
  },
  ojisan: {
    id: 'u_ojisan',
    username: 'Ojisan',
    handle: '@ojisan',
    avatar: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=150&auto=format&fit=crop&q=80',
    bio: 'Anime creator and meme curator.',
    karma: 34200,
    badges: ['Top Creator'],
    joinedDate: 'Jan 2025',
    status: 'online',
  },
  mohamed: {
    id: 'u_mohamed',
    username: 'Mohamed Ismaaciil',
    handle: '@mohamed_ismaaciil',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    bio: 'Anime & gaming community member.',
    karma: 1200,
    badges: [],
    joinedDate: 'Jan 2026',
    status: 'online',
  },
  nothing: {
    id: 'u_nothing',
    username: 'NothingButStillNothing',
    handle: '@NothingButStillNothing',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    bio: 'Posting daily memes and highlights.',
    karma: 24000,
    badges: ['Creator'],
    joinedDate: 'Jan 2025',
    status: 'online',
  },
  yuji: {
    id: 'u_yuji',
    username: 'Yuji itadori',
    handle: '@yuji_itadori',
    avatar: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=150&auto=format&fit=crop&q=80',
    bio: 'Jujutsu discussions, anime comparisons, and power-scaling polls.',
    karma: 8400,
    badges: ['Verified'],
    joinedDate: 'Feb 2025',
    status: 'online',
  },
  eachgen: {
    id: 'u_eachgen',
    username: 'eachgen ☣️🥩',
    handle: '@eachgen',
    avatar: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=150&auto=format&fit=crop&q=80',
    bio: 'Animator, game developer, and indie creator.',
    karma: 19200,
    badges: ['Top Creator'],
    joinedDate: 'March 2025',
    status: 'online',
  },
  anidong: {
    id: 'u_anidong',
    username: 'Anidong_Manhwa',
    handle: '@Anidong_Manhwa',
    avatar: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=150&auto=format&fit=crop&q=80',
    bio: 'Curating the greatest Webtoons, Manhwa, and Manga stories.',
    karma: 14500,
    badges: ['Top Creator', 'Verified'],
    joinedDate: 'Jan 2025',
    status: 'online',
  },
  tech_chronicles: {
    id: 'u_tech',
    username: 'TechChronicles',
    handle: '@TechChronicles',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    bio: 'Exploring cutting edge hardware, AI workflows, and minimalist desks.',
    karma: 8900,
    badges: ['Verified'],
    joinedDate: 'March 2025',
    status: 'online',
  }
};

export const SEED_SUB_BUVAKIS: SubBuvaki[] = [
  {
    id: 'general',
    name: 'general',
    displayName: 'Zdak Community',
    description: 'Community posts, photos, polls, and discussions.',
    memberCount: 12500,
    icon: 'message',
    isDefault: true,
    bannerColor: 'from-violet-950 via-violet-900 to-indigo-950',
    category: 'general',
    isJoined: true,
  }
];

// Pure empty seed posts and comments - real data is loaded dynamically from Firestore
export const SEED_POSTS: Post[] = [];
export const SEED_COMMENTS: Record<string, Comment[]> = {};

export const SEED_CHANNELS: ChatChannel[] = [
  {
    id: 'chan_general',
    name: 'general-lounge',
    topic: 'Main community lounge — chat about trending topics, music, and daily life!',
    type: 'text',
    unreadCount: 0,
  }
];

export const SEED_MESSAGES: Record<string, ChatMessage[]> = {};
export const SEED_NOTIFICATIONS: NotificationItem[] = [];
