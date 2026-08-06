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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-slate-950 border border-violet-900/50 rounded-3xl shadow-2xl flex flex-col overflow-hidden max-h-[80vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-violet-900/30 bg-slate-900/60">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-fuchsia-400" />
            <h2 className="text-base font-bold text-slate-100">Notifications</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onMarkAllRead}
              className="p-1 text-xs text-violet-400 hover:text-emerald-400 flex items-center gap-1 font-semibold"
              title="Mark all as read"
            >
              <CheckCheck className="w-4 h-4" /> Mark Read
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-white bg-slate-900"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="p-4 overflow-y-auto flex-1 custom-scrollbar space-y-2.5">
          {notifications.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500">
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
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex gap-3 ${
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

      </div>
    </div>
  );
};
