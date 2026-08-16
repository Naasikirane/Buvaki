import React, { useState } from 'react';
import { 
  Camera, 
  Zap, 
  Cpu, 
  Palette, 
  Gamepad2, 
  MessageSquare, 
  Music, 
  Shield, 
  Terminal, 
  Smile, 
  Flame, 
  Sparkles, 
  Compass, 
  Film, 
  Radio, 
  Layers, 
  Globe, 
  Code, 
  Coffee, 
  BookOpen, 
  Headphones,
  Atom,
  LucideIcon
} from 'lucide-react';
import { SubBuvaki } from '../types';

export const ICON_MAP: Record<string, LucideIcon> = {
  camera: Camera,
  photography: Camera,
  photo: Camera,
  zap: Zap,
  tech: Cpu,
  cpu: Cpu,
  ai: Atom,
  palette: Palette,
  design: Palette,
  art: Palette,
  creative: Palette,
  gamepad: Gamepad2,
  gaming: Gamepad2,
  games: Gamepad2,
  message: MessageSquare,
  general: MessageSquare,
  chat: MessageSquare,
  lounge: MessageSquare,
  music: Music,
  audio: Headphones,
  shield: Shield,
  privacy: Shield,
  security: Shield,
  terminal: Terminal,
  cyberpunk: Terminal,
  code: Code,
  dev: Code,
  smile: Smile,
  memes: Smile,
  flame: Flame,
  hot: Flame,
  sparkles: Sparkles,
  compass: Compass,
  film: Film,
  radio: Radio,
  layers: Layers,
  globe: Globe,
  coffee: Coffee,
  book: BookOpen,
};

export interface PersonalityPalette {
  container: string;
  iconColor: string;
  glowColor: string;
}

// Distinct personality color themes for default sub-buvakis
export const getSubPersonality = (
  subId?: string,
  name?: string,
  category?: string,
  icon?: string
): PersonalityPalette => {
  const cleanId = (subId || '').toLowerCase().trim();
  const cleanName = (name || '').toLowerCase().replace(/^b\//, '').trim();
  const cleanIcon = (icon || '').toLowerCase().trim();
  const cleanCat = (category || '').toLowerCase().trim();

  // 1. Photography / Camera -> Warm Golden Amber
  if (cleanId === 'photography' || cleanName.includes('photo') || cleanIcon === 'camera') {
    return {
      container: 'bg-amber-950/85 border-amber-500/50 text-amber-300 shadow-amber-950/40',
      iconColor: 'text-amber-300',
      glowColor: 'from-amber-500/20 to-orange-500/20',
    };
  }

  // 2. Tech / AI / Hardware -> Electric Cyan & Blue
  if (cleanId === 'tech' || cleanName.includes('tech') || cleanIcon === 'cpu' || cleanCat === 'tech') {
    return {
      container: 'bg-cyan-950/85 border-cyan-500/50 text-cyan-300 shadow-cyan-950/40',
      iconColor: 'text-cyan-300',
      glowColor: 'from-cyan-500/20 to-blue-500/20',
    };
  }

  // 3. Design / UI/UX / Art -> Vibrant Fuchsia & Pink
  if (cleanId === 'design' || cleanName.includes('design') || cleanIcon === 'palette' || cleanName.includes('art')) {
    return {
      container: 'bg-pink-950/85 border-pink-500/50 text-pink-300 shadow-pink-950/40',
      iconColor: 'text-pink-300',
      glowColor: 'from-pink-500/20 to-purple-500/20',
    };
  }

  // 4. Gaming / Esports -> Emerald & Neon Lime Green
  if (cleanId === 'gaming' || cleanName.includes('game') || cleanIcon === 'gamepad' || cleanCat === 'gaming') {
    return {
      container: 'bg-emerald-950/85 border-emerald-500/50 text-emerald-300 shadow-emerald-950/40',
      iconColor: 'text-emerald-300',
      glowColor: 'from-emerald-500/20 to-teal-500/20',
    };
  }

  // 5. Music / Audio -> Ruby Rose & Coral
  if (cleanId === 'music' || cleanName.includes('music') || cleanIcon === 'music' || cleanName.includes('audio')) {
    return {
      container: 'bg-rose-950/85 border-rose-500/50 text-rose-300 shadow-rose-950/40',
      iconColor: 'text-rose-300',
      glowColor: 'from-rose-500/20 to-red-500/20',
    };
  }

  // 6. Privacy / Security / Tor -> Mint Teal & Shield Blue
  if (cleanId === 'privacy' || cleanName.includes('privacy') || cleanName.includes('security') || cleanIcon === 'shield') {
    return {
      container: 'bg-teal-950/85 border-teal-500/50 text-teal-300 shadow-teal-950/40',
      iconColor: 'text-teal-300',
      glowColor: 'from-teal-500/20 to-cyan-500/20',
    };
  }

  // 7. Cyberpunk / Hacker / Terminal -> Matrix Lime
  if (cleanId === 'cyberpunk' || cleanName.includes('cyber') || cleanIcon === 'terminal' || cleanName.includes('terminal')) {
    return {
      container: 'bg-lime-950/85 border-lime-500/50 text-lime-300 shadow-lime-950/40',
      iconColor: 'text-lime-300',
      glowColor: 'from-lime-500/20 to-emerald-500/20',
    };
  }

  // 8. Memes / Humor -> Vivid Sun Orange
  if (cleanId === 'memes' || cleanName.includes('meme') || cleanIcon === 'smile' || cleanName.includes('funny')) {
    return {
      container: 'bg-orange-950/85 border-orange-500/50 text-orange-300 shadow-orange-950/40',
      iconColor: 'text-orange-300',
      glowColor: 'from-orange-500/20 to-amber-500/20',
    };
  }

  // 9. General / Lounge -> Deep Regal Violet
  if (cleanId === 'general' || cleanName.includes('general') || cleanIcon === 'message') {
    return {
      container: 'bg-violet-950/85 border-violet-500/50 text-violet-300 shadow-violet-950/40',
      iconColor: 'text-violet-300',
      glowColor: 'from-violet-500/20 to-indigo-500/20',
    };
  }

  // Fallback -> Indigo
  return {
    container: 'bg-indigo-950/85 border-indigo-500/50 text-indigo-300 shadow-indigo-950/40',
    iconColor: 'text-indigo-300',
    glowColor: 'from-indigo-500/20 to-violet-500/20',
  };
};

export const getVectorIcon = (
  icon?: string, 
  subId?: string, 
  name?: string, 
  category?: string
): LucideIcon => {
  const cleanIcon = (icon || '').toLowerCase().trim();
  if (ICON_MAP[cleanIcon]) return ICON_MAP[cleanIcon];

  const cleanId = (subId || '').toLowerCase().trim();
  if (ICON_MAP[cleanId]) return ICON_MAP[cleanId];

  const cleanName = (name || '').toLowerCase().replace(/^b\//, '').trim();
  if (ICON_MAP[cleanName]) return ICON_MAP[cleanName];

  // Specific keyword detection
  if (cleanName.includes('photo') || cleanId.includes('photo')) return Camera;
  if (cleanName.includes('tech') || cleanId.includes('tech')) return Cpu;
  if (cleanName.includes('design') || cleanId.includes('design')) return Palette;
  if (cleanName.includes('game') || cleanId.includes('game')) return Gamepad2;
  if (cleanName.includes('music') || cleanId.includes('music')) return Music;
  if (cleanName.includes('privacy') || cleanId.includes('privacy')) return Shield;
  if (cleanName.includes('cyber') || cleanId.includes('cyber')) return Terminal;
  if (cleanName.includes('meme') || cleanId.includes('meme')) return Smile;
  if (cleanName.includes('code') || cleanId.includes('dev')) return Code;
  if (cleanName.includes('general') || cleanId.includes('lounge')) return MessageSquare;

  const cleanCat = (category || '').toLowerCase().trim();
  if (cleanCat === 'tech') return Cpu;
  if (cleanCat === 'gaming') return Gamepad2;
  if (cleanCat === 'creative') return Palette;
  if (cleanCat === 'general') return MessageSquare;

  return Sparkles;
};

interface CommunityIconProps {
  sub?: Partial<SubBuvaki>;
  imageUrl?: string;
  icon?: string;
  subId?: string;
  name?: string;
  category?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  containerClassName?: string;
  disableBorder?: boolean;
}

export const CommunityIcon: React.FC<CommunityIconProps> = ({
  sub,
  imageUrl: directImageUrl,
  icon: directIcon,
  subId: directSubId,
  name: directName,
  category: directCategory,
  size = 'sm',
  className = '',
  containerClassName = '',
  disableBorder = false,
}) => {
  const [imageError, setImageError] = useState(false);

  const effectiveImageUrl = directImageUrl || sub?.imageUrl;
  const effectiveIcon = directIcon || sub?.icon;
  const effectiveSubId = directSubId || sub?.id;
  const effectiveName = directName || sub?.displayName || sub?.name;
  const effectiveCategory = directCategory || sub?.category;

  const IconComponent = getVectorIcon(effectiveIcon, effectiveSubId, effectiveName, effectiveCategory);
  const personality = getSubPersonality(effectiveSubId, effectiveName, effectiveCategory, effectiveIcon);

  const sizeStyles = {
    xs: {
      container: 'w-6 h-6 rounded-lg text-xs',
      icon: 'w-3.5 h-3.5',
    },
    sm: {
      container: 'w-7 h-7 rounded-xl text-sm',
      icon: 'w-4 h-4',
    },
    md: {
      container: 'w-9 h-9 rounded-xl text-base',
      icon: 'w-5 h-5',
    },
    lg: {
      container: 'w-12 h-12 rounded-2xl text-xl',
      icon: 'w-6 h-6',
    },
    xl: {
      container: 'w-16 h-16 rounded-3xl text-2xl',
      icon: 'w-8 h-8',
    },
  };

  const style = sizeStyles[size] || sizeStyles.sm;

  // Render user's custom uploaded image if available
  if (effectiveImageUrl && !imageError) {
    return (
      <div
        className={`shrink-0 overflow-hidden relative flex items-center justify-center bg-slate-950 ${
          disableBorder ? '' : 'border border-violet-700/40 shadow-sm'
        } ${style.container} ${containerClassName}`}
      >
        <img
          src={effectiveImageUrl}
          alt={effectiveName || 'Community'}
          className="w-full h-full object-cover rounded-[inherit]"
          referrerPolicy="no-referrer"
          onError={() => setImageError(true)}
        />
      </div>
    );
  }

  // Render default sub-buvaki with distinctive personality color theme
  return (
    <div
      className={`shrink-0 flex items-center justify-center shadow-md transition-all ${
        disableBorder ? '' : personality.container
      } ${style.container} ${containerClassName}`}
    >
      <IconComponent className={`${style.icon} ${className || personality.iconColor}`} />
    </div>
  );
};
