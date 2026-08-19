import React from 'react';
import { NotificationItem } from '../types';
import { X, Bell, ArrowBigUp, MessageSquare, Award, CheckCheck } from 'lucide-react';

interface NotificationsModalProps {
  notifications: NotificationItem[];
  onClose: () => void;
  onMarkAllRead: () => void;
  onSelectNotification: (notif: NotificationItem) => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  notifications,
  onClose,
  onMarkAllRead,
  onSelectNotification,
}) => {
  return (
    <div className="fixed inset-0 z-50 w-full h-full min-h-screen bg-slate-950 flex flex-col overflow-hidden m-0 p-0 rounded-none border-none">
      {/* Full-width Header */}
      <header className="flex items-center justify-between px-4 sm:px-8 py-3.5 border-b border-violet-900/40 bg-slate-950/95 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-2.5">
          <Bell className="w-5 h-5 text-fuchsia-400" />
          <h2 className="text-sm sm:text-base font-bold text-slate-100">Notifications</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onMarkAllRead}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-violet-900/40 text-xs text-violet-300 hover:text-emerald-400 flex items-center gap-1.5 font-semibold transition-colors"
            title="Mark all as read"
          >
            <CheckCheck className="w-4 h-4" /> Mark Read
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Scrollable List */}
      <main className="flex-1 w-full overflow-y-auto custom-scrollbar bg-slate-950">
        <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-2.5">
          {notifications.length === 0 ? (
            <div className="text-center py-16 text-xs text-slate-500">
              No notifications yet.
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => {
                  onSelectNotification(n);
                  onClose();
                }}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex gap-3 ${
                  n.read
                    ? 'bg-slate-900/50 border-violet-900/20 text-slate-400'
                    : 'bg-violet-950/60 border-violet-700/60 text-slate-100 font-medium'
                }`}
              >
                <div className="p-2 rounded-xl bg-slate-950 border border-violet-900/40 text-violet-400 h-fit">
                  {n.type === 'upvote' && <ArrowBigUp className="w-4 h-4 text-fuchsia-400" />}
                  {n.type === 'reply' && <MessageSquare className="w-4 h-4 text-emerald-400" />}
                  {n.type === 'badge' && <Award className="w-4 h-4 text-amber-400" />}
                </div>

                <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span>{n.title}</span>
                    <span className="text-[10px] text-slate-500 font-normal">{n.timestamp}</span>
                  </div>
                  <p className="text-xs leading-relaxed">{n.message}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
};
