import React, { useState } from 'react';
import { User } from '../types';
import { Mic, MicOff, PhoneOff, Volume2, Radio } from 'lucide-react';

interface VoiceRoomBarProps {
  activeVoiceUsers: User[];
  onDisconnect: () => void;
}

export const VoiceRoomBar: React.FC<VoiceRoomBarProps> = ({
  activeVoiceUsers,
  onDisconnect,
}) => {
  const [isMuted, setIsMuted] = useState(false);

  return (
    <div className="fixed bottom-16 sm:bottom-6 right-4 sm:right-6 z-40 p-3 sm:p-4 rounded-2xl bg-white/95 border border-emerald-500/40 shadow-xl backdrop-blur-xl flex items-center gap-4 max-w-md border-l-4 border-l-emerald-500">
      <div className="flex items-center gap-2">
        <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200">
          <Volume2 className="w-4 h-4 text-emerald-600 animate-pulse" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-bold text-emerald-800 flex items-center gap-1">
            <Radio className="w-3 h-3 text-emerald-600" /> Voice Lounge Active
          </span>
          <span className="text-[10px] text-slate-500 font-mono">
            {activeVoiceUsers.length} active speakers
          </span>
        </div>
      </div>

      {/* Avatars */}
      <div className="flex -space-x-2 overflow-hidden">
        {activeVoiceUsers.map((u) => (
          <img
            key={u.id}
            src={u.avatar}
            alt={u.username}
            className="inline-block h-6 w-6 rounded-full ring-2 ring-emerald-500 object-cover"
            referrerPolicy="no-referrer"
          />
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2 ml-auto">
        <button
          onClick={() => setIsMuted(!isMuted)}
          className={`p-2 rounded-xl transition-colors ${
            isMuted
              ? 'bg-rose-50 text-rose-600 border border-rose-200'
              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
          }`}
          title={isMuted ? 'Unmute Mic' : 'Mute Mic'}
        >
          {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>

        <button
          onClick={onDisconnect}
          className="p-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition-colors"
          title="Disconnect Voice"
        >
          <PhoneOff className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
