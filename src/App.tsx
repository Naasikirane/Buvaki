import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { MobileNav } from './components/MobileNav';
import { PostCard } from './components/PostCard';
import { PostDetailModal } from './components/PostDetailModal';
import { CreatePostModal } from './components/CreatePostModal';
import { CreateSubModal } from './components/CreateSubModal';
import { LiveChatView } from './components/LiveChatView';
import { VoiceRoomBar } from './components/VoiceRoomBar';
import { UserProfileModal } from './components/UserProfileModal';
import { NotificationsModal } from './components/NotificationsModal';
import { LanguageSelectorModal } from './components/LanguageSelectorModal';
import { OnboardingFlow, OnboardingStep } from './components/OnboardingFlow';

import { 
  Post, 
  SubBuvaki, 
  ChatChannel, 
  ChatMessage, 
  Comment, 
  User, 
  NotificationItem, 
  ViewMode, 
  FilterSort, 
  Theme,
  SUPPORTED_LANGUAGES,
  SupportedLanguage
} from './types';
import { getTranslation, isRTL } from './lib/translations';

import { 
  CURRENT_USER, 
  SEED_SUB_BUVAKIS, 
  SEED_POSTS, 
  SEED_COMMENTS, 
  SEED_CHANNELS, 
  SEED_MESSAGES, 
  SEED_NOTIFICATIONS, 
  SEED_USERS 
} from './data/mockData';

import { 
  initAuth, 
  ensureSeeded, 
  dbCheckAndCompleteEmailLinkSignIn,
  dbLogout,
  subscribeToSubBuvakis, 
  subscribeToPosts, 
  subscribeToComments, 
  subscribeToChannels, 
  subscribeToChatMessages, 
  subscribeToUserVotes, 
  subscribeToUserMemberships,
  dbCreatePost, 
  dbCreateSubBuvaki, 
  dbAddComment, 
  dbVote, 
  dbVotePoll, 
  dbSendChatMessage, 
  dbToggleJoinSub,
  dbSaveUserProfile
} from './lib/firebase';

import { Flame, Sparkles, TrendingUp, MessageSquare, Compass, Radio, ShieldCheck } from 'lucide-react';

export default function App() {
  // Persistence state initialized from localStorage with fallback to SEED data
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem('buvaki_user');
    return saved ? JSON.parse(saved) : CURRENT_USER;
  });

  const [posts, setPosts] = useState<Post[]>(() => {
    const saved = localStorage.getItem('buvaki_posts');
    return saved ? JSON.parse(saved) : SEED_POSTS;
  });

  const [subBuvakis, setSubBuvakis] = useState<SubBuvaki[]>(() => {
    const saved = localStorage.getItem('buvaki_subs');
    return saved ? JSON.parse(saved) : SEED_SUB_BUVAKIS;
  });

  const [commentsMap, setCommentsMap] = useState<Record<string, Comment[]>>(() => {
    const saved = localStorage.getItem('buvaki_comments');
    return saved ? JSON.parse(saved) : SEED_COMMENTS;
  });

  const [channels, setChannels] = useState<ChatChannel[]>(() => {
    const saved = localStorage.getItem('buvaki_channels');
    return saved ? JSON.parse(saved) : SEED_CHANNELS;
  });

  const [messagesMap, setMessagesMap] = useState<Record<string, ChatMessage[]>>(() => {
    const saved = localStorage.getItem('buvaki_messages');
    return saved ? JSON.parse(saved) : SEED_MESSAGES;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem('buvaki_notifs');
    return saved ? JSON.parse(saved) : SEED_NOTIFICATIONS;
  });

  // UI state
  const [onboardingStep, setOnboardingStep] = useState<OnboardingStep | 'app'>(() => {
    const hasCompleted = localStorage.getItem('buvaki_onboarding_completed');
    return hasCompleted ? 'app' : 'splash';
  });

  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>(() => {
    const savedLangCode = localStorage.getItem('buvaki_selected_lang');
    if (savedLangCode) {
      const found = SUPPORTED_LANGUAGES.find(l => l.code === savedLangCode);
      if (found) return found;
    }
    return SUPPORTED_LANGUAGES[0]; // default English
  });

  const [viewMode, setViewMode] = useState<ViewMode>('feed');
  const [theme, setTheme] = useState<Theme>('dark');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSubBuvakiId, setActiveSubBuvakiId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterSort>('hot');
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  const [activeChannelId, setActiveChannelId] = useState<string>('chan_general');

  const handleSelectLanguage = (lang: SupportedLanguage) => {
    setSelectedLanguage(lang);
    localStorage.setItem('buvaki_selected_lang', lang.code);
  };

  const handleCompleteAuth = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('buvaki_user', JSON.stringify(user));
    localStorage.setItem('buvaki_onboarding_completed', 'true');
    setOnboardingStep('app');
  };

  const handleLogout = async () => {
    await dbLogout();
    localStorage.removeItem('buvaki_user');
    localStorage.removeItem('buvaki_onboarding_completed');
    setCurrentUser(CURRENT_USER);
    setIsProfileOpen(false);
    setOnboardingStep('splash');
  };

  // Modal states
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [isCreateSubOpen, setIsCreateSubOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isInVoiceRoom, setIsInVoiceRoom] = useState(false);

  // Firebase initialization and real-time synchronization
  useEffect(() => {
    let unsubSubs: () => void;
    let unsubPosts: () => void;
    let unsubChannels: () => void;
    let unsubVotes: () => void;
    let unsubMemberships: () => void;

    const setupFirebase = async () => {
      await initAuth();
      await ensureSeeded();

      // Check if user clicked a cost-free Firebase Email Link
      try {
        const linkUser = await dbCheckAndCompleteEmailLinkSignIn(selectedLanguage.name);
        if (linkUser) {
          handleCompleteAuth(linkUser);
        }
      } catch (linkErr) {
        console.warn('Email link sign in check:', linkErr);
      }

      unsubSubs = subscribeToSubBuvakis((data) => {
        if (data.length > 0) setSubBuvakis(data);
      });

      unsubPosts = subscribeToPosts((data) => {
        if (data.length > 0) setPosts(data);
      });

      unsubChannels = subscribeToChannels((data) => {
        if (data.length > 0) setChannels(data);
      });

      unsubVotes = subscribeToUserVotes(currentUser.id, (voteMap) => {
        setPosts((prev) =>
          prev.map((p) => ({
            ...p,
            userVote: voteMap[p.id] || null,
          }))
        );
      });

      unsubMemberships = subscribeToUserMemberships(currentUser.id, (joinedSubIds) => {
        setSubBuvakis((prev) =>
          prev.map((s) => ({
            ...s,
            isJoined: joinedSubIds.includes(s.id),
          }))
        );
      });
    };

    setupFirebase();

    return () => {
      if (unsubSubs) unsubSubs();
      if (unsubPosts) unsubPosts();
      if (unsubChannels) unsubChannels();
      if (unsubVotes) unsubVotes();
      if (unsubMemberships) unsubMemberships();
    };
  }, [currentUser.id]);

  // Subscribe to comments for selected post
  useEffect(() => {
    if (!selectedPost) return;
    const unsub = subscribeToComments(selectedPost.id, (comments) => {
      setCommentsMap((prev) => ({
        ...prev,
        [selectedPost.id]: comments,
      }));
    });
    return () => unsub();
  }, [selectedPost?.id]);

  // Subscribe to live chat messages for active channel
  useEffect(() => {
    if (!activeChannelId) return;
    const unsub = subscribeToChatMessages(activeChannelId, (msgs) => {
      setMessagesMap((prev) => ({
        ...prev,
        [activeChannelId]: msgs,
      }));
    });
    return () => unsub();
  }, [activeChannelId]);

  // Handle Post Voting
  const handleVotePost = (postId: string, direction: 'up' | 'down') => {
    dbVote(currentUser.id, postId, 'post', direction);

    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;

        let scoreDiff = 0;
        let newVote: 'up' | 'down' | null = direction;

        if (p.userVote === direction) {
          // Toggle off
          newVote = null;
          scoreDiff = direction === 'up' ? -1 : 1;
        } else if (p.userVote === null) {
          scoreDiff = direction === 'up' ? 1 : -1;
        } else {
          // Switched from up to down or vice versa
          scoreDiff = direction === 'up' ? 2 : -2;
        }

        return {
          ...p,
          score: p.score + scoreDiff,
          userVote: newVote,
        };
      })
    );

    if (selectedPost && selectedPost.id === postId) {
      setSelectedPost((prev) => {
        if (!prev) return null;
        const currentVote = prev.userVote;
        let diff = 0;
        let nextVote: 'up' | 'down' | null = direction;
        if (currentVote === direction) {
          nextVote = null;
          diff = direction === 'up' ? -1 : 1;
        } else if (currentVote === null) {
          diff = direction === 'up' ? 1 : -1;
        } else {
          diff = direction === 'up' ? 2 : -2;
        }
        return {
          ...prev,
          score: prev.score + diff,
          userVote: nextVote,
        };
      });
    }
  };

  // Toggle Save Post
  const handleToggleSavePost = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, isSaved: !p.isSaved } : p))
    );
    if (selectedPost && selectedPost.id === postId) {
      setSelectedPost((prev) => (prev ? { ...prev, isSaved: !prev.isSaved } : null));
    }
  };

  // Vote on Poll
  const handleVotePoll = (postId: string, optionId: string) => {
    dbVotePoll(postId, optionId, currentUser.id);

    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId || !p.poll) return p;
        if (p.poll.userVotedOptionId === optionId) return p; // Already voted

        const previousVotedId = p.poll.userVotedOptionId;
        const updatedOptions = p.poll.options.map((opt) => {
          if (opt.id === optionId) {
            return { ...opt, votes: opt.votes + 1 };
          }
          if (opt.id === previousVotedId) {
            return { ...opt, votes: Math.max(0, opt.votes - 1) };
          }
          return opt;
        });

        const totalVotes = previousVotedId
          ? p.poll.totalVotes
          : p.poll.totalVotes + 1;

        return {
          ...p,
          poll: {
            ...p.poll,
            options: updatedOptions,
            totalVotes,
            userVotedOptionId: optionId,
          },
        };
      })
    );
  };

  // Add Comment
  const handleAddComment = (postId: string, content: string, parentId?: string) => {
    dbAddComment(postId, content, currentUser, parentId || null);

    const newComment: Comment = {
      id: `c_${Date.now()}`,
      postId,
      author: currentUser,
      content,
      timestamp: 'Just now',
      score: 1,
      userVote: 'up',
      parentId: parentId || null,
      replies: [],
    };

    setCommentsMap((prevMap) => {
      const list = prevMap[postId] || [];

      if (!parentId) {
        return { ...prevMap, [postId]: [newComment, ...list] };
      }

      // Helper to add recursively
      const addNested = (arr: Comment[]): Comment[] => {
        return arr.map((item) => {
          if (item.id === parentId) {
            return {
              ...item,
              replies: [newComment, ...(item.replies || [])],
            };
          }
          if (item.replies && item.replies.length > 0) {
            return {
              ...item,
              replies: addNested(item.replies),
            };
          }
          return item;
        });
      };

      return { ...prevMap, [postId]: addNested(list) };
    });

    // Update comment count on post
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, commentCount: p.commentCount + 1 } : p))
    );
    if (selectedPost && selectedPost.id === postId) {
      setSelectedPost((prev) => (prev ? { ...prev, commentCount: prev.commentCount + 1 } : null));
    }
  };

  // Comment Vote
  const handleVoteComment = (commentId: string, direction: 'up' | 'down') => {
    if (!selectedPost) return;
    const postId = selectedPost.id;

    dbVote(currentUser.id, commentId, 'comment', direction);

    setCommentsMap((prevMap) => {
      const list = prevMap[postId] || [];

      const updateRecursive = (arr: Comment[]): Comment[] => {
        return arr.map((c) => {
          if (c.id === commentId) {
            let diff = 0;
            let nextVote: 'up' | 'down' | null = direction;
            if (c.userVote === direction) {
              nextVote = null;
              diff = direction === 'up' ? -1 : 1;
            } else if (c.userVote === null) {
              diff = direction === 'up' ? 1 : -1;
            } else {
              diff = direction === 'up' ? 2 : -2;
            }
            return {
              ...c,
              score: c.score + diff,
              userVote: nextVote,
            };
          }
          if (c.replies && c.replies.length > 0) {
            return { ...c, replies: updateRecursive(c.replies) };
          }
          return c;
        });
      };

      return { ...prevMap, [postId]: updateRecursive(list) };
    });
  };

  // Publish New Post
  const handlePublishPost = async (postData: Partial<Post>) => {
    const postPayload = {
      subBuvakiId: postData.subBuvakiId || 'general',
      subBuvakiName: postData.subBuvakiName || 'b/general',
      author: currentUser,
      title: postData.title || 'Untitled Post',
      content: postData.content || '',
      type: postData.type || 'text',
      imageUrl: postData.imageUrl,
      linkUrl: postData.linkUrl,
      poll: postData.poll,
      flair: postData.flair || 'Discussion',
      tags: postData.tags || [],
      isSaved: false,
    };

    const created = await dbCreatePost(postPayload);
    setPosts((prev) => [created, ...prev.filter(p => p.id !== created.id)]);
    setCurrentUser((u) => ({ ...u, karma: u.karma + 10 }));
  };

  // Create Sub Buvaki
  const handleCreateSubBuvaki = async (newSub: SubBuvaki) => {
    const created = await dbCreateSubBuvaki({
      name: newSub.name,
      displayName: newSub.displayName,
      description: newSub.description,
      icon: newSub.icon,
      bannerColor: newSub.bannerColor,
      category: newSub.category
    });
    setSubBuvakis((prev) => [...prev, created]);
    setActiveSubBuvakiId(created.id);
  };

  // Chat Send Message
  const handleSendMessage = (channelId: string, content: string) => {
    dbSendChatMessage(channelId, content, currentUser);

    const newMsg: ChatMessage = {
      id: `m_${Date.now()}`,
      channelId,
      author: currentUser,
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      reactions: [],
    };

    setMessagesMap((prev) => ({
      ...prev,
      [channelId]: [...(prev[channelId] || []), newMsg],
    }));
  };

  // Add Reaction
  const handleAddReaction = (messageId: string, emoji: string) => {
    setMessagesMap((prevMap) => {
      const channelMsgs = prevMap[activeChannelId] || [];
      const updated = channelMsgs.map((m) => {
        if (m.id !== messageId) return m;
        const exists = m.reactions.find((r) => r.emoji === emoji);
        let updatedReactions = [];
        if (exists) {
          updatedReactions = m.reactions.map((r) =>
            r.emoji === emoji ? { ...r, count: r.count + 1 } : r
          );
        } else {
          updatedReactions = [...m.reactions, { emoji, count: 1, users: [currentUser.id] }];
        }
        return { ...m, reactions: updatedReactions };
      });
      return { ...prevMap, [activeChannelId]: updated };
    });
  };

  // Filter & Search Logic
  const filteredPosts = posts.filter((p) => {
    if (showSavedOnly && !p.isSaved) return false;
    if (activeSubBuvakiId && p.subBuvakiId !== activeSubBuvakiId) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = p.title.toLowerCase().includes(q);
      const matchContent = p.content.toLowerCase().includes(q);
      const matchSub = p.subBuvakiName.toLowerCase().includes(q);
      const matchTags = p.tags.some((t) => t.toLowerCase().includes(q));
      return matchTitle || matchContent || matchSub || matchTags;
    }
    return true;
  });

  // Sorting
  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (activeFilter === 'hot') return b.score - a.score;
    if (activeFilter === 'new') return b.id.localeCompare(a.id);
    if (activeFilter === 'top') return b.score - a.score;
    if (activeFilter === 'discussed') return b.commentCount - a.commentCount;
    return 0;
  });

  const activeChannel = channels.find((c) => c.id === activeChannelId) || channels[0];
  const activeChannelMessages = messagesMap[activeChannelId] || [];
  const currentPostComments = selectedPost ? commentsMap[selectedPost.id] || [] : [];
  const userPublishedPosts = posts.filter((p) => p.author.id === currentUser.id);
  const userSavedPosts = posts.filter((p) => p.isSaved);
  const activeSubObj = subBuvakis.find((s) => s.id === activeSubBuvakiId);

  // Theme Wrapper Classes
  const themeClasses = {
    dark: 'bg-slate-950 text-slate-100 selection:bg-violet-600 selection:text-white',
    stealth: 'bg-black text-emerald-100 selection:bg-emerald-600 selection:text-white',
    light: 'bg-slate-50 text-slate-900 selection:bg-violet-500 selection:text-white',
  }[theme];

  if (onboardingStep !== 'app') {
    return (
      <OnboardingFlow
        currentStep={onboardingStep}
        setStep={(step) => setOnboardingStep(step)}
        selectedLanguage={selectedLanguage}
        onSelectLanguage={handleSelectLanguage}
        onCompleteAuth={handleCompleteAuth}
        onSkipToApp={() => {
          localStorage.setItem('buvaki_onboarding_completed', 'true');
          setOnboardingStep('app');
        }}
      />
    );
  }

  const t = getTranslation(selectedLanguage.code);

  return (
    <div 
      dir={isRTL(selectedLanguage.code) ? 'rtl' : 'ltr'} 
      className={`min-h-screen font-sans ${themeClasses} transition-colors duration-300 pb-16 md:pb-0`}
    >
      
      {/* Top Header */}
      <Navbar
        viewMode={viewMode}
        setViewMode={setViewMode}
        theme={theme}
        setTheme={setTheme}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        currentUser={currentUser}
        selectedLanguage={selectedLanguage}
        onOpenCreatePost={() => setIsCreatePostOpen(true)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenLanguage={() => setIsLanguageModalOpen(true)}
        onOpenAuth={() => setOnboardingStep('signin')}
        notifications={notifications}
        activeSubBuvakiName={activeSubObj?.displayName}
        onToggleMobileSidebar={() => setIsMobileSidebarOpen(true)}
      />

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-2 sm:px-6 flex gap-6">
        
        {/* Desktop Sidebar (Left Navigation) */}
        <Sidebar
          subBuvakis={subBuvakis}
          activeSubBuvakiId={activeSubBuvakiId}
          onSelectSubBuvaki={setActiveSubBuvakiId}
          activeFilter={activeFilter}
          onChangeFilter={setActiveFilter}
          showSavedOnly={showSavedOnly}
          onToggleSavedOnly={setShowSavedOnly}
          channels={channels}
          activeChannelId={activeChannelId}
          onSelectChannel={setActiveChannelId}
          onOpenCreateSub={() => setIsCreateSubOpen(true)}
          viewMode={viewMode}
          setViewMode={setViewMode}
          selectedLanguage={selectedLanguage}
        />

        {/* Center Main Stage */}
        <main className="flex-1 min-w-0 py-2 sm:py-3 flex flex-col gap-3">
          
          {/* Sub-Buvaki Banner Header if a specific community is active */}
          {activeSubObj && (
            <div className={`p-6 rounded-3xl bg-gradient-to-r ${activeSubObj.bannerColor} border border-violet-800/40 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative overflow-hidden`}>
              <div className="flex items-center gap-4 z-10">
                <span className="text-4xl p-3 rounded-2xl bg-slate-950/80 border border-violet-600/40 shadow-md">
                  {activeSubObj.icon}
                </span>
                <div className="flex flex-col">
                  <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                    {activeSubObj.displayName}
                  </h1>
                  <p className="text-xs text-slate-300 max-w-xl leading-relaxed mt-1">
                    {activeSubObj.description}
                  </p>
                  <span className="text-[11px] text-emerald-400 font-mono mt-1 font-bold">
                    {(activeSubObj.memberCount).toLocaleString()} {t.activeMembers}
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  dbToggleJoinSub(currentUser.id, activeSubObj.id);
                  setSubBuvakis(
                    subBuvakis.map((s) =>
                      s.id === activeSubObj.id ? { ...s, isJoined: !s.isJoined } : s
                    )
                  );
                }}
                className={`px-5 py-2.5 rounded-xl font-bold text-xs z-10 transition-all ${
                  activeSubObj.isJoined
                    ? 'bg-slate-950 text-slate-300 border border-violet-800 hover:border-rose-500 hover:text-rose-400'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg'
                }`}
              >
                {activeSubObj.isJoined ? t.joined : t.joinCommunity}
              </button>
            </div>
          )}

          {/* VIEW MODE: FEED OR SPLIT */}
          {(viewMode === 'feed' || viewMode === 'split') && (
            <div className="flex flex-col gap-4">
              
              {/* Feed Control Bar: Sort Tabs */}
              <div className="flex items-center justify-between p-2 rounded-2xl bg-slate-900/60 border border-violet-900/30">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setActiveFilter('hot')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      activeFilter === 'hot'
                        ? 'bg-violet-950 text-violet-300 border border-violet-700/60 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Flame className="w-3.5 h-3.5 text-orange-400" /> {t.hot}
                  </button>
                  <button
                    onClick={() => setActiveFilter('new')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      activeFilter === 'new'
                        ? 'bg-violet-950 text-violet-300 border border-violet-700/60 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> {t.newFilter}
                  </button>
                  <button
                    onClick={() => setActiveFilter('top')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      activeFilter === 'top'
                        ? 'bg-violet-950 text-violet-300 border border-violet-700/60 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <TrendingUp className="w-3.5 h-3.5 text-fuchsia-400" /> {t.topFilter}
                  </button>
                  <button
                    onClick={() => setActiveFilter('discussed')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      activeFilter === 'discussed'
                        ? 'bg-violet-950 text-violet-300 border border-violet-700/60 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-violet-400" /> {t.discussed}
                  </button>
                </div>

                <span className="text-[11px] font-mono text-slate-400 px-2">
                  {sortedPosts.length} {t.postsCount}
                </span>
              </div>

              {/* Dual View Split Container or Standard Feed */}
              <div className={`grid gap-4 ${viewMode === 'split' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
                
                {/* Posts List */}
                <div className="flex flex-col gap-4">
                  {sortedPosts.length === 0 ? (
                    <div className="p-12 text-center rounded-3xl bg-slate-900/40 border border-violet-900/30 flex flex-col items-center gap-3">
                      <Compass className="w-8 h-8 text-violet-400" />
                      <span className="text-sm font-bold text-slate-300">{t.noPostsFound}</span>
                      <button
                        onClick={() => setIsCreatePostOpen(true)}
                        className="mt-2 px-4 py-2 rounded-xl bg-violet-600 text-white font-bold text-xs"
                      >
                        {t.createFirstThread}
                      </button>
                    </div>
                  ) : (
                    sortedPosts.map((post) => (
                      <PostCard
                        key={post.id}
                        post={post}
                        currentUser={currentUser}
                        selectedLanguage={selectedLanguage}
                        onVote={handleVotePost}
                        onSelectPost={(p) => setSelectedPost(p)}
                        onToggleSave={handleToggleSavePost}
                        onVotePoll={handleVotePoll}
                      />
                    ))
                  )}
                </div>

                {/* Right side in Dual View Mode */}
                {viewMode === 'split' && (
                  <div className="sticky top-20 h-[calc(100vh-6rem)]">
                    <LiveChatView
                      channel={activeChannel}
                      messages={activeChannelMessages}
                      currentUser={currentUser}
                      onlineMembers={Object.values(SEED_USERS)}
                      onSendMessage={handleSendMessage}
                      onAddReaction={handleAddReaction}
                      isInVoiceRoom={isInVoiceRoom}
                      onToggleVoiceRoom={() => setIsInVoiceRoom(!isInVoiceRoom)}
                      selectedLanguage={selectedLanguage}
                    />
                  </div>
                )}

              </div>

            </div>
          )}

          {/* VIEW MODE: CHAT ONLY */}
          {viewMode === 'chat' && (
            <LiveChatView
              channel={activeChannel}
              messages={activeChannelMessages}
              currentUser={currentUser}
              onlineMembers={Object.values(SEED_USERS)}
              onSendMessage={handleSendMessage}
              onAddReaction={handleAddReaction}
              isInVoiceRoom={isInVoiceRoom}
              onToggleVoiceRoom={() => setIsInVoiceRoom(!isInVoiceRoom)}
              selectedLanguage={selectedLanguage}
            />
          )}

        </main>

      </div>

      {/* Mobile Bottom Navigation & Slide-over Drawer */}
      <MobileNav
        viewMode={viewMode}
        setViewMode={setViewMode}
        onOpenCreatePost={() => setIsCreatePostOpen(true)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        notifications={notifications}
        isMobileSidebarOpen={isMobileSidebarOpen}
        onCloseMobileSidebar={() => setIsMobileSidebarOpen(false)}
        subBuvakis={subBuvakis}
        activeSubBuvakiId={activeSubBuvakiId}
        onSelectSubBuvaki={setActiveSubBuvakiId}
        channels={channels}
        activeChannelId={activeChannelId}
        onSelectChannel={setActiveChannelId}
        onOpenCreateSub={() => setIsCreateSubOpen(true)}
        showSavedOnly={showSavedOnly}
        onToggleSavedOnly={setShowSavedOnly}
        selectedLanguage={selectedLanguage}
      />

      {/* Voice Channel Floating Controller Bar */}
      {isInVoiceRoom && (
        <VoiceRoomBar
          activeVoiceUsers={[currentUser, SEED_USERS.u1, SEED_USERS.u2]}
          onDisconnect={() => setIsInVoiceRoom(false)}
        />
      )}

      {/* Modal Dialogs */}
      {selectedPost && (
        <PostDetailModal
          post={selectedPost}
          comments={currentPostComments}
          currentUser={currentUser}
          selectedLanguage={selectedLanguage}
          onClose={() => setSelectedPost(null)}
          onVotePost={handleVotePost}
          onVoteComment={handleVoteComment}
          onAddComment={handleAddComment}
          onToggleSave={handleToggleSavePost}
          onVotePoll={handleVotePoll}
        />
      )}

      {isCreatePostOpen && (
        <CreatePostModal
          subBuvakis={subBuvakis}
          selectedSubId={activeSubBuvakiId}
          onClose={() => setIsCreatePostOpen(false)}
          onSubmitPost={handlePublishPost}
        />
      )}

      {isCreateSubOpen && (
        <CreateSubModal
          onClose={() => setIsCreateSubOpen(false)}
          onCreateSub={handleCreateSubBuvaki}
        />
      )}

      {isProfileOpen && (
        <UserProfileModal
          user={currentUser}
          savedPosts={userSavedPosts}
          userPosts={userPublishedPosts}
          onClose={() => setIsProfileOpen(false)}
          onUpdateBio={(newBio) => {
            const updated = { ...currentUser, bio: newBio };
            setCurrentUser(updated);
            dbSaveUserProfile(updated).catch(console.error);
          }}
          onUpdateAvatar={(newAvatar) => {
            const updated = { ...currentUser, avatar: newAvatar };
            setCurrentUser(updated);
            dbSaveUserProfile(updated).catch(console.error);
          }}
          onSelectPost={(p) => setSelectedPost(p)}
          onLogout={handleLogout}
        />
      )}

      <LanguageSelectorModal
        isOpen={isLanguageModalOpen}
        selectedLanguage={selectedLanguage}
        onSelectLanguage={handleSelectLanguage}
        onClose={() => setIsLanguageModalOpen(false)}
      />

      {isNotificationsOpen && (
        <NotificationsModal
          notifications={notifications}
          onClose={() => setIsNotificationsOpen(false)}
          onMarkAllRead={() =>
            setNotifications(notifications.map((n) => ({ ...n, read: true })))
          }
          onSelectNotification={(n) => {
            if (n.targetPostId) {
              const target = posts.find((p) => p.id === n.targetPostId);
              if (target) setSelectedPost(target);
            }
          }}
        />
      )}

    </div>
  );
}
