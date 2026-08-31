import { Post, SubBuvaki, ChatChannel, ChatMessage, User, NotificationItem, Comment } from '../types';

export const CURRENT_USER: User = {
  id: 'u_guest_creator',
  username: 'Buvaki Creator',
  handle: '@creator',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  bio: 'Creative creator on Buvaki.',
  karma: 100,
  badges: ['Founding Member'],
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

export const SEED_POSTS: Post[] = [
  {
    id: 'post_animefans_single',
    subBuvakiId: 'general',
    subBuvakiName: 'Zdak Community',
    author: SEED_USERS.animefans,
    title: '',
    content: '',
    type: 'image',
    imageUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=900&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=900&auto=format&fit=crop&q=80'
    ],
    score: 417,
    userVote: null,
    commentCount: 1,
    timestamp: '5 days ago',
    createdAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
    createdAtEpoch: Date.now() - 5 * 24 * 3600 * 1000,
    isPinned: false,
    isSaved: false,
    isSubscribed: true,
    tags: ['#anime', '#character', '#art']
  },
  {
    id: 'post_visualstories_gion',
    subBuvakiId: 'general',
    subBuvakiName: 'Zdak Community',
    author: SEED_USERS.visualstories,
    title: '',
    content: "Spent the evening chasing the evening glow through Gion alleys. Captured on 35mm f/1.4. Which angle hits hardest? 📸✨\n#photography #japan #goldenhour #cinematic",
    type: 'image',
    imageUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80'
    ],
    score: 3900,
    userVote: null,
    commentCount: 29,
    timestamp: '3d ago',
    createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    createdAtEpoch: Date.now() - 3 * 24 * 3600 * 1000,
    isPinned: false,
    isSaved: false,
    isSubscribed: true,
    tags: ['#photography', '#japan', '#goldenhour', '#cinematic']
  },
  {
    id: 'post_novacine_marvel',
    subBuvakiId: 'general',
    subBuvakiName: 'Zdak Community',
    author: SEED_USERS.novacine,
    title: '',
    content: "Marvel has always done a good job of hiding the plot of their movies in trailers vs the actual movie...",
    type: 'image',
    imageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=800&auto=format&fit=crop&q=80'
    ],
    score: 31000,
    userVote: null,
    commentCount: 445,
    timestamp: '2 days ago',
    createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    createdAtEpoch: Date.now() - 2 * 24 * 3600 * 1000,
    isPinned: false,
    isSaved: false,
    isSubscribed: true,
    tags: ['#marvel', '#cinema', '#trailers']
  },
  {
    id: 'post_ojisan_brothers',
    subBuvakiId: 'general',
    subBuvakiName: 'Zdak Community',
    author: SEED_USERS.ojisan,
    title: "they're good brother",
    content: "they're good brother",
    type: 'image',
    imageUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=800&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1563089145-599997674d42?w=800&auto=format&fit=crop&q=80'
    ],
    score: 48,
    userVote: null,
    commentCount: 1,
    timestamp: '9 hours ago',
    createdAt: new Date(Date.now() - 9 * 3600 * 1000).toISOString(),
    createdAtEpoch: Date.now() - 9 * 3600 * 1000,
    isPinned: false,
    isSaved: false,
    isSubscribed: true,
    tags: ['#anime', '#rengoku', '#ace']
  },
  {
    id: 'post_mohamed_dragonball',
    subBuvakiId: 'general',
    subBuvakiName: 'Zdak Community',
    author: SEED_USERS.mohamed,
    title: 'Dragon ball',
    content: 'Dragon ball',
    type: 'text',
    score: 12,
    userVote: null,
    commentCount: 4,
    timestamp: '1 month ago',
    createdAt: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
    createdAtEpoch: Date.now() - 30 * 24 * 3600 * 1000,
    isPinned: false,
    isSaved: false,
    tags: ['#dragonball', '#anime']
  },
  {
    id: 'post_nothing_wrestler',
    subBuvakiId: 'general',
    subBuvakiName: 'Zdak Community',
    author: SEED_USERS.nothing,
    title: '',
    content: "First place again let's go 🥳🥇💪 🥺✌️🥀",
    type: 'image',
    imageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=1000&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=1000&auto=format&fit=crop&q=80'
    ],
    score: 1000,
    userVote: null,
    commentCount: 25,
    timestamp: '4 hours ago',
    createdAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    createdAtEpoch: Date.now() - 4 * 3600 * 1000,
    isPinned: false,
    isSaved: false,
    isSubscribed: true,
    tags: ['#memes', '#comedy', '#firstplace']
  },
  {
    id: 'post_yuji_fight',
    subBuvakiId: 'general',
    subBuvakiName: 'Zdak Community',
    author: SEED_USERS.yuji,
    title: 'Who wins in a fight?',
    content: 'Who wins in a fight?',
    type: 'image',
    imageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=80'
    ],
    score: 13,
    userVote: null,
    commentCount: 17,
    timestamp: '18 hours ago',
    createdAt: new Date(Date.now() - 18 * 3600 * 1000).toISOString(),
    createdAtEpoch: Date.now() - 18 * 3600 * 1000,
    isPinned: false,
    isSaved: false,
    tags: ['#anime', '#powerscaling', '#goku']
  },
  {
    id: 'post_eachgen_ama',
    subBuvakiId: 'general',
    subBuvakiName: 'Zdak Community',
    author: SEED_USERS.eachgen,
    title: 'Ask me anything 🙂',
    content: 'Ask me anything 🙂',
    type: 'text',
    score: 274,
    userVote: null,
    commentCount: 365,
    timestamp: '1 day ago',
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    createdAtEpoch: Date.now() - 24 * 3600 * 1000,
    isPinned: false,
    isSaved: false,
    tags: ['#ama', '#qna', '#creator']
  },
  {
    id: 'post_manhwa_rec',
    subBuvakiId: 'general',
    subBuvakiName: 'Zdak Community',
    author: SEED_USERS.anidong,
    title: 'Different genre Manhwa recommendation',
    content: 'Swipe through to discover top-tier stories with incredible world building and character growth! 📖✨ Which one is your all-time favorite? Let me know in the comments! #manhwa #webtoon #recommendations #comics',
    type: 'image',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1000&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1563089145-599997674d42?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=1000&auto=format&fit=crop&q=80'
    ],
    score: 7240,
    userVote: null,
    commentCount: 42,
    timestamp: '2 days ago',
    createdAt: '2026-08-28T10:00:00.000Z',
    createdAtEpoch: Date.now() - 172800000,
    isPinned: true,
    isSaved: false,
    isSubscribed: true,
    tags: ['#manhwa', '#webtoon', '#recommendations']
  }
];

export const SEED_COMMENTS: Record<string, Comment[]> = {
  post_visualstories_gion: [
    {
      id: 'c_vs_1',
      postId: 'post_visualstories_gion',
      author: {
        id: 'u_japan_traveler',
        username: 'KyotoWanderer',
        handle: '@KyotoWanderer',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
        bio: 'Travel photographer',
        karma: 890,
        badges: [],
        joinedDate: 'Jan 2026',
        status: 'online'
      },
      content: 'The first shot in the narrow alleyway with the lantern glow is pure perfection!',
      timestamp: '1d ago',
      createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
      createdAtEpoch: Date.now() - 24 * 3600 * 1000,
      score: 42,
      userVote: null,
      replies: []
    }
  ],
  post_novacine_marvel: [
    {
      id: 'c_marvel_1',
      postId: 'post_novacine_marvel',
      author: {
        id: 'u_mojang_fan',
        username: 'BedrockGamer',
        handle: '@BedrockGamer',
        avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=100&auto=format&fit=crop&q=80',
        bio: 'Marvel & gaming enthusiast',
        karma: 340,
        badges: [],
        joinedDate: 'Jan 2026',
        status: 'online'
      },
      content: 'FIX ANTI VIRAL SPIRAL BEDROCK BANWAVE MOJANG',
      timestamp: '1 day ago',
      createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
      createdAtEpoch: Date.now() - 24 * 3600 * 1000,
      score: 84,
      userVote: null,
      replies: []
    }
  ],
  post_ojisan_brothers: [
    {
      id: 'c_council',
      postId: 'post_ojisan_brothers',
      author: {
        id: 'u_gojo_fan',
        username: 'ShadowNinja',
        handle: '@ShadowNinja',
        avatar: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=100&auto=format&fit=crop&q=80',
        bio: 'Anime enthusiast',
        karma: 420,
        badges: [],
        joinedDate: 'Feb 2026',
        status: 'online'
      },
      content: 'NARUTO WILL TALK NO JUTSU YOU A COUNCIL MEMBER',
      timestamp: '7 hours ago',
      createdAt: new Date(Date.now() - 7 * 3600 * 1000).toISOString(),
      createdAtEpoch: Date.now() - 7 * 3600 * 1000,
      score: 15,
      userVote: null,
      replies: []
    }
  ],
  post_nothing_wrestler: [
    {
      id: 'c_ryan',
      postId: 'post_nothing_wrestler',
      author: {
        id: 'u_ryan',
        username: 'Ryan_G',
        handle: '@Ryan_G',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
        bio: 'Community member',
        karma: 320,
        badges: [],
        joinedDate: 'Jan 2026',
        status: 'online'
      },
      content: 'Holy comeback',
      timestamp: '3 hours ago',
      createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
      createdAtEpoch: Date.now() - 3 * 3600 * 1000,
      score: 48,
      userVote: null,
      replies: []
    }
  ],
  post_yuji_fight: [
    {
      id: 'c_mojang',
      postId: 'post_yuji_fight',
      author: {
        id: 'u_mojang',
        username: 'BedrockGamer',
        handle: '@BedrockGamer',
        avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=100&auto=format&fit=crop&q=80',
        bio: 'Pixel gamer',
        karma: 150,
        badges: [],
        joinedDate: 'March 2026',
        status: 'online'
      },
      content: 'FIX MOJANG BEDROCK',
      timestamp: '16 hours ago',
      createdAt: new Date(Date.now() - 16 * 3600 * 1000).toISOString(),
      createdAtEpoch: Date.now() - 16 * 3600 * 1000,
      score: 19,
      userVote: null,
      replies: []
    }
  ],
  post_eachgen_ama: [
    {
      id: 'c_anim',
      postId: 'post_eachgen_ama',
      author: {
        id: 'u_anim',
        username: 'PixelArtFan',
        handle: '@PixelArtFan',
        avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80',
        bio: 'Aspiring animator',
        karma: 890,
        badges: [],
        joinedDate: 'Feb 2026',
        status: 'online'
      },
      content: 'How long do your animation keyframes typically take per scene?',
      timestamp: '22 hours ago',
      createdAt: new Date(Date.now() - 22 * 3600 * 1000).toISOString(),
      createdAtEpoch: Date.now() - 22 * 3600 * 1000,
      score: 54,
      userVote: null,
      replies: []
    }
  ],
  post_manhwa_rec: [
    {
      id: 'c_mark',
      postId: 'post_manhwa_rec',
      author: {
        id: 'u_mark',
        username: 'Mark-j58',
        handle: '@Mark-j58',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
        bio: 'Avid reader',
        karma: 450,
        badges: [],
        joinedDate: 'Jan 2026',
        status: 'online'
      },
      content: 'Good',
      timestamp: '1 day ago',
      createdAt: '2026-08-29T11:00:00.000Z',
      createdAtEpoch: Date.now() - 82000000,
      score: 18,
      userVote: null,
      replies: []
    }
  ]
};

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
