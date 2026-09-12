import React, { useState, useEffect, useRef } from 'react';
import { ChatChannel, ChatMessage, User, SupportedLanguage } from '../types';
import { getTranslation } from '../lib/translations';
import { formatRealTimestamp, formatFullExactDateTime } from '../lib/timeUtils';
import { 
  Hash, 
  Volume2, 
  Send, 
  Smile, 
  Paperclip, 
  Code, 
  Users, 
  Radio, 
  Sparkles,
  PhoneCall,
  Mic,
  MicOff
} from 'lucide-react';

interface LiveChatViewProps {
  channel: ChatChannel;
  messages: ChatMessage[];
  currentUser: User | null;
  onlineMembers: User[];
  onSendMessage: (channelId: string, content: string) => void;
  onAddReaction: (messageId: string, emoji: string) => void;
  isInVoiceRoom: boolean;
  onToggleVoiceRoom: () => void;
  selectedLanguage?: SupportedLanguage;
  onRequireAuth?: (promptReason?: string) => void;
}

export const LiveChatView: React.FC<LiveChatViewProps> = ({
  channel,
  messages,
  currentUser,
  onlineMembers,
  onSendMessage,
  onAddReaction,
  isInVoiceRoom,
  onToggleVoiceRoom,
  selectedLanguage,
  onRequireAuth,
}) => {
  const t = getTranslation(selectedLanguage?.code || 'en');
  const [inputText, setInputText] = useState('');
  const [showMembersList, setShowMembersList] = useState(true);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const EMOJI_OPTIONS = ['✨', '🔥', '❤️', '🚀', '💬', '🎉', '⚡', '👍'];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    if (!currentUser) {
      if (onRequireAuth) onRequireAuth('Sign in to chat in real-time channels');
      return;
    }
    onSendMessage(channel.id, inputText.trim());
    setInputText('');
  };

  const handleVoiceToggle = () => {
    if (!currentUser) {
      if (onRequireAuth) onRequireAuth('Sign in to join voice lounges');
      return;
    }
    onToggleVoiceRoom();
  };

  const handleReaction = (msgId: string, emoji: string) => {
    if (!currentUser) {
      if (onRequireAuth) onRequireAuth('Sign in to react to messages');
      return;
    }
    onAddReaction(msgId, emoji);
  };

  const handleEmojiClick = (emoji: string) => {
    setInputText((prev) => prev + ' ' + emoji);
    setShowEmojiPicker(false);
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-5rem)] rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-sm">
      
      {/* Channel Header Bar */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 bg-white border-b border-slate-200">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
            {channel.type === 'voice' ? (
              <Volume2 className="w-4 h-4 text-pink-600" />
            ) : (
              <Hash className="w-4 h-4 text-slate-700" />
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-sm sm:text-base truncate">
                {channel.name.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}]/gu, '').trim() || channel.name}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-mono flex items-center gap-1">
                <Radio className="w-2.5 h-2.5 animate-pulse" /> Live
              </span>
            </div>
            <span className="text-[11px] text-slate-500 truncate max-w-xs sm:max-w-md">
              {channel.topic}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          
          {/* Voice Channel Joint Button */}
          <button
            onClick={onToggleVoiceRoom}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              isInVoiceRoom
                ? 'bg-rose-600 hover:bg-rose-500 text-white animate-pulse'
                : 'bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            {isInVoiceRoom ? <MicOff className="w-3.5 h-3.5" /> : <PhoneCall className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isInVoiceRoom ? t.disconnectVoice : t.joinVoiceLounge}</span>
          </button>

          {/* Members Toggle */}
          <button
            onClick={() => setShowMembersList(!showMembersList)}
            className={`p-2 rounded-xl border text-xs font-semibold transition-all ${
              showMembersList
                ? 'bg-slate-900 border-slate-900 text-white'
                : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'
            }`}
            title="Toggle Members Sidebar"
          >
            <Users className="w-4 h-4" />
          </button>

        </div>
      </div>

      {/* Main Chat Content Area */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        
        {/* Messages Stream */}
        <div className="flex-1 flex flex-col p-4 overflow-y-auto space-y-4 custom-scrollbar bg-white">
          
          {/* Welcome Banner */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col gap-1 my-2">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
              <Sparkles className="w-4 h-4 text-amber-500" /> Welcome to #{channel.name}!
            </div>
            <p className="text-xs text-slate-500">
              This is the start of the #{channel.name} channel. Realtime messaging and active discussions for the community.
            </p>
          </div>

          {messages.map((msg) => (
            <div key={msg.id} className="flex gap-3 group hover:bg-slate-50 p-2 rounded-xl transition-colors">
              <img
                src={msg.author.avatar}
                alt={msg.author.username}
                className="w-9 h-9 rounded-xl object-cover ring-1 ring-slate-200"
                referrerPolicy="no-referrer"
              />

              <div className="flex-1 min-w-0 flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-slate-900">
                    {msg.author.handle}
                  </span>
                  <span 
                    className="text-[10px] text-slate-400 hover:text-slate-600 transition-colors cursor-help"
                    title={formatFullExactDateTime(msg.timestamp)}
                  >
                    {formatRealTimestamp(msg.timestamp)}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-800 leading-relaxed break-words">
                  {msg.content}
                </p>

                {/* Reactions Bar */}
                <div className="flex flex-wrap items-center gap-1.5 mt-1">
                  {msg.reactions.map((react, i) => (
                    <button
                      key={i}
                      onClick={() => onAddReaction(msg.id, react.emoji)}
                      className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-50 border border-slate-200 hover:border-slate-300 text-[11px] text-slate-700 transition-colors"
                    >
                      <span>{react.emoji}</span>
                      <span className="font-mono text-[10px] font-bold text-slate-800">{react.count}</span>
                    </button>
                  ))}

                  {/* Quick Reaction Adder */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                    {EMOJI_OPTIONS.slice(0, 4).map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => onAddReaction(msg.id, emoji)}
                        className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-xs"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          ))}

          <div ref={messagesEndRef} />
        </div>

        {/* Online Members Sidebar */}
        {showMembersList && (
          <div className="w-56 hidden lg:flex flex-col gap-3 p-4 bg-slate-50/70 border-l border-slate-200 overflow-y-auto">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              {t.online} ({onlineMembers.length})
            </span>

            <div className="flex flex-col gap-2">
              {onlineMembers.map((m) => (
                <div key={m.id} className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-100">
                  <div className="relative">
                    <img
                      src={m.avatar}
                      alt={m.username}
                      className="w-7 h-7 rounded-lg object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-slate-800 truncate">{m.username}</span>
                    <span className="text-[10px] text-slate-500 truncate">{m.statusText || 'Online'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Message Sender Box */}
      <div className="p-3 sm:p-4 bg-white border-t border-slate-200 relative">
        
        {/* Emoji Selector Popup */}
        {showEmojiPicker && (
          <div className="absolute bottom-16 left-4 z-20 p-2.5 rounded-2xl bg-white border border-slate-200 shadow-xl flex items-center gap-2">
            {EMOJI_OPTIONS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleEmojiClick(emoji)}
                className="p-2 text-lg hover:bg-slate-100 rounded-xl transition-transform hover:scale-125"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}

        <form onSubmit={handleSend} className="flex items-center gap-2 bg-slate-50 rounded-2xl p-2 border border-slate-200 focus-within:border-slate-400 shadow-inner">
          
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-2 text-slate-500 hover:text-slate-800 transition-colors"
            title="Emoji Picker"
          >
            <Smile className="w-5 h-5" />
          </button>

          <input
            type="text"
            value={inputText || ''}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`${t.typeMessage} #${channel.name}...`}
            className="flex-1 bg-transparent text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
          />

          <button
            type="submit"
            disabled={!inputText.trim()}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white font-bold transition-all shadow-sm active:scale-95"
          >
            <Send className="w-4 h-4" />
          </button>

        </form>

      </div>

    </div>
  );
};
