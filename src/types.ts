export type ViewMode = 'feed' | 'shorts' | 'longs' | 'chat' | 'split' | 'you';
export type FilterSort = 'hot' | 'new' | 'top' | 'discussed';
export type Theme = 'dark' | 'light' | 'stealth';

export interface SupportedLanguage {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: SupportedLanguage[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇦🇪' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili', flag: '🇰🇪' },
];

export interface CountryCode {
  code: string;
  country: string;
  flag: string;
}

export const COUNTRY_CODES: CountryCode[] = [
  { code: '+1', country: 'United States / Canada', flag: '🇺🇸' },
  { code: '+44', country: 'United Kingdom', flag: '🇬🇧' },
  { code: '+254', country: 'Kenya', flag: '🇰🇪' },
  { code: '+256', country: 'Uganda', flag: '🇺🇬' },
  { code: '+255', country: 'Tanzania', flag: '🇹🇿' },
  { code: '+250', country: 'Rwanda', flag: '🇷🇼' },
  { code: '+234', country: 'Nigeria', flag: '🇳🇬' },
  { code: '+27', country: 'South Africa', flag: '🇿🇦' },
  { code: '+91', country: 'India', flag: '🇮🇳' },
  { code: '+33', country: 'France', flag: '🇫🇷' },
  { code: '+49', country: 'Germany', flag: '🇩🇪' },
  { code: '+81', country: 'Japan', flag: '🇯🇵' },
  { code: '+55', country: 'Brazil', flag: '🇧🇷' },
  { code: '+86', country: 'China', flag: '🇨🇳' },
  { code: '+61', country: 'Australia', flag: '🇦🇺' },
  { code: '+971', country: 'UAE', flag: '🇦🇪' },
  { code: '+966', country: 'Saudi Arabia', flag: '🇸🇦' },
];

export interface User {
  id: string;
  username: string;
  handle: string;
  avatar: string;
  bio: string;
  karma: number;
  badges: string[];
  joinedDate: string;
  status: 'online' | 'idle' | 'dnd' | 'offline';
  statusText?: string;
  gender?: 'male' | 'female' | 'prefer_not_to_say' | string;
  dob?: string;
  schooling?: string;
  interests?: string[];
  bestColor?: string;
  petName?: string;
  occupation?: string;
  niche?: string;
  phoneNumber?: string;
  authProvider?: 'google' | 'email' | 'phone';
}

export interface PollOption {
  id: string;
  text: string;
  votes: number;
}

export interface Poll {
  question: string;
  options: PollOption[];
  totalVotes: number;
  userVotedOptionId?: string;
}

export interface Comment {
  id: string;
  postId: string;
  author: User;
  content: string;
  timestamp: string;
  createdAt?: string;
  createdAtEpoch?: number;
  score: number;
  userVote: 'up' | 'down' | null;
  parentId?: string | null;
  replies?: Comment[];
}

export interface Post {
  id: string;
  subBuvakiId: string;
  subBuvakiName: string; // e.g., 'b/privacy'
  author: User;
  title: string;
  content: string;
  type: 'text' | 'image' | 'link' | 'poll' | 'short' | 'video' | 'long';
  imageUrl?: string;
  images?: string[];
  videoUrl?: string;
  duration?: string;
  viewsCount?: number;
  isShort?: boolean;
  isLong?: boolean;
  linkUrl?: string;
  poll?: Poll;
  flair?: string;
  score: number;
  userVote: 'up' | 'down' | null;
  commentCount: number;
  timestamp: string;
  createdAt?: string;
  createdAtEpoch?: number;
  isPinned?: boolean;
  isSaved?: boolean;
  isSubscribed?: boolean;
  tags: string[];
}

export interface SubBuvaki {
  id: string;
  name: string; // 'privacy'
  displayName: string; // 'b/privacy'
  description: string;
  memberCount: number;
  icon: string;
  imageUrl?: string;
  isDefault?: boolean;
  bannerColor: string;
  category: 'tech' | 'privacy' | 'gaming' | 'general' | 'creative';
  isJoined?: boolean;
}

export interface ChatMessage {
  id: string;
  channelId: string;
  author: User;
  content: string;
  timestamp: string;
  attachments?: string[];
  reactions: { emoji: string; count: number; users: string[] }[];
  replyToId?: string;
}

export interface ChatChannel {
  id: string;
  subBuvakiId?: string;
  name: string;
  topic: string;
  type: 'text' | 'voice';
  unreadCount?: number;
  activeVoiceUsers?: User[];
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'upvote' | 'reply' | 'mention' | 'badge';
  targetPostId?: string;
}
