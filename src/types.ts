export type ViewMode = 'feed' | 'chat' | 'split';
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
  type: 'text' | 'image' | 'link' | 'poll';
  imageUrl?: string;
  linkUrl?: string;
  poll?: Poll;
  flair?: string;
  score: number;
  userVote: 'up' | 'down' | null;
  commentCount: number;
  timestamp: string;
  isPinned?: boolean;
  isSaved?: boolean;
  tags: string[];
}

export interface SubBuvaki {
  id: string;
  name: string; // 'privacy'
  displayName: string; // 'b/privacy'
  description: string;
  memberCount: number;
  icon: string;
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
