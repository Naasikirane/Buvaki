import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { MobileNav } from './components/MobileNav';
import { PostCard } from './components/PostCard';
import { PostDetailModal } from './components/PostDetailModal';
import { CreatePostModal } from './components/CreatePostModal';
import { CreateSubModal } from './components/CreateSubModal';
import { LiveChatView } from './components/LiveChatView';
import { ShortsFeed } from './components/ShortsFeed';
import { LongsFeed } from './components/LongsFeed';
import { VoiceRoomBar } from './components/VoiceRoomBar';
import { UserProfileModal } from './components/UserProfileModal';
import { NotificationsModal } from './components/NotificationsModal';
import { LanguageSelectorModal } from './components/LanguageSelectorModal';
import { AuthModal } from './components/AuthModal';
import { CommunityIcon } from './components/CommunityIcon';

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
  SEED_SUB_BUVAKIS, 
  SEED_CHANNELS 
} from './data/mockData';

const MOCK_POST_IDS = new Set([
  'post_1', 'post_2', 'post_3', 'post_4', 'post_5',
  'post_music_1', 'post_music_2', 'post_tech_1', 'post_photography_1', 'post_design_1', 'post_gaming_1', 'post_general_1',
  'short_music_1', 'short_music_2', 'short_photography_1', 'short_tech_1', 'short_design_1', 'short_gaming_1', 'short_general_1',
  'long_music_1', 'long_music_2', 'long_tech_1', 'long_tech_2', 'long_photography_1', 'long_gaming_1', 'long_design_1', 'long_general_1'
]);

import { 
  initAuth, 
  ensureSeeded, 
  testConnection,
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
  dbDeletePost,
  dbCreateSubBuvaki, 
  dbAddComment, 
  dbVote, 
  dbVotePoll, 
  dbSendChatMessage, 
  dbToggleJoinSub,
  dbSaveUserProfile
} from './lib/firebase';
import { getTimestampEpoch } from './lib/timeUtils';

import { Flame, Sparkles, TrendingUp, MessageSquare, Compass, Radio, ShieldCheck } from 'lucide-react';

export default function App() {
  // Guest state by default; persists logged-in user if saved in localStorage
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('buvaki_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (err) {
        return null;
      }
    }
    return null; // Free guest access by default!
  });

  const [posts, setPosts] = useState<Post[]>(() => {
    const saved = localStorage.getItem('buvaki_posts');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter(p => !MOCK_POST_IDS.has(p.id));
        }
      } catch (err) {
        return [];
      }
    }
    return [];
  });

  const [subBuvakis, setSubBuvakis] = useState<SubBuvaki[]>(() => {
    const saved = localStorage.getItem('buvaki_subs');
    return saved ? JSON.parse(saved) : SEED_SUB_BUVAKIS;
  });

  const [commentsMap, setCommentsMap] = useState<Record<string, Comment[]>>(() => {
    const saved = localStorage.getItem('buvaki_comments');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const cleaned: Record<string, Comment[]> = {};
        for (const [k, v] of Object.entries(parsed)) {
          if (!MOCK_POST_IDS.has(k)) {
            cleaned[k] = v as Comment[];
          }
        }
        return cleaned;
      } catch (err) {
        return {};
      }
    }
    return {};
  });

  const [channels, setChannels] = useState<ChatChannel[]>(() => {
    const saved = localStorage.getItem('buvaki_channels');
    return saved ? JSON.parse(saved) : SEED_CHANNELS;
  });

  const [messagesMap, setMessagesMap] = useState<Record<string, ChatMessage[]>>(() => {
    const saved = localStorage.getItem('buvaki_messages');
    return saved ? JSON.parse(saved) : {};
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem('buvaki_notifs');
    return saved ? JSON.parse(saved) : [];
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

  // Auth Modal State for Guest Interception
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalPrompt, setAuthModalPrompt] = useState<string | undefined>(undefined);

  const handleRequireAuth = (promptReason?: string) => {
    setAuthModalPrompt(promptReason || 'Sign in or create an account to unlock all features on Buvaki');
    setIsAuthModalOpen(true);
  };

  const handleSelectLanguage = (lang: SupportedLanguage) => {
    setSelectedLanguage(lang);
    localStorage.setItem('buvaki_selected_lang', lang.code);
  };

  const handleCompleteAuth = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('buvaki_user', JSON.stringify(user));
    setIsAuthModalOpen(false);
  };

  const handleLogout = async () => {
    await dbLogout();
    localStorage.removeItem('buvaki_user');
    setCurrentUser(null);
    setIsProfileOpen(false);
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

  // Profile action guard
  const handleOpenProfile = () => {
    if (currentUser) {
      setIsProfileOpen(true);
    } else {
      handleRequireAuth('Sign in or create an account to access and customize your personal profile.');
    }
  };

  // Create Post guard
  const handleOpenCreatePost = () => {
    if (currentUser) {
      setIsCreatePostOpen(true);
    } else {
      handleRequireAuth('Sign in or create an account to create posts, upload videos, and share stories.');
    }
  };

  // Create Sub-Buvaki guard
  const handleOpenCreateSub = () => {
    if (currentUser) {
      setIsCreateSubOpen(true);
    } else {
      handleRequireAuth('Sign in or create an account to launch your own Sub-Buvaki community.');
    }
  };

  // Voice room guard
  const handleVoiceRoomToggle = () => {
    if (currentUser) {
      setIsInVoiceRoom(!isInVoiceRoom);
    } else {
      handleRequireAuth('Sign in or create an account to participate in live audio lounges.');
    }
  };

  // Firebase initialization and real-time synchronization
  useEffect(() => {
    let unsubSubs: () => void;
    let unsubPosts: () => void;
    let unsubChannels: () => void;
    let unsubVotes: () => void;
    let unsubMemberships: () => void;

    const setupFirebase = async () => {
      await testConnection();
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

      if (currentUser?.id) {
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
      }
    };

    setupFirebase();

    return () => {
      if (unsubSubs) unsubSubs();
      if (unsubPosts) unsubPosts();
      if (unsubChannels) unsubChannels();
      if (unsubVotes) unsubVotes();
      if (unsubMemberships) unsubMemberships();
    };
  }, [currentUser?.id]);

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
    if (!currentUser) {
      handleRequireAuth('Sign in or create an account to upvote or downvote posts.');
      return;
    }

    dbVote(currentUser.id, postId, 'post', direction);

    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;

        let scoreDiff = 0;
        let newVote: 'up' | 'down' | null = direction;

        if (p.userVote === direction) {
          newVote = null;
          scoreDiff = direction === 'up' ? -1 : 1;
        } else if (p.userVote === null) {
          scoreDiff = direction === 'up' ? 1 : -1;
        } else {
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
    if (!currentUser) {
      handleRequireAuth('Sign in or create an account to save posts to your collection.');
      return;
    }

    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, isSaved: !p.isSaved } : p))
    );
    if (selectedPost && selectedPost.id === postId) {
      setSelectedPost((prev) => (prev ? { ...prev, isSaved: !prev.isSaved } : null));
    }
  };

  // Vote on Poll
  const handleVotePoll = (postId: string, optionId: string) => {
    if (!currentUser) {
      handleRequireAuth('Sign in or create an account to vote in community polls.');
      return;
    }

    dbVotePoll(postId, optionId, currentUser.id);

    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId || !p.poll) return p;
        if (p.poll.userVotedOptionId === optionId) return p;

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
    if (!currentUser) {
      handleRequireAuth('Sign in or create an account to comment and join discussions.');
      return;
    }

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

    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, commentCount: p.commentCount + 1 } : p))
    );
    if (selectedPost && selectedPost.id === postId) {
      setSelectedPost((prev) => (prev ? { ...prev, commentCount: prev.commentCount + 1 } : null));
    }
  };

  // Comment Vote
  const handleVoteComment = (commentId: string, direction: 'up' | 'down') => {
    if (!currentUser) {
      handleRequireAuth('Sign in or create an account to upvote or downvote comments.');
      return;
    }
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
    if (!currentUser) {
      handleRequireAuth('Sign in or create an account to publish posts and videos.');
      return;
    }

    const postPayload = {
      subBuvakiId: postData.subBuvakiId || 'general',
      subBuvakiName: postData.subBuvakiName || 'b/general',
      author: currentUser,
      title: postData.title || 'Untitled Post',
      content: postData.content || '',
      type: postData.type || 'text',
      isShort: postData.isShort ?? (postData.type === 'short'),
      isLong: postData.isLong ?? (postData.type === 'long'),
      duration: postData.duration,
      imageUrl: postData.imageUrl,
      videoUrl: postData.videoUrl,
      linkUrl: postData.linkUrl,
      poll: postData.poll,
      flair: postData.flair || 'Discussion',
      tags: postData.tags || [],
      isSaved: false,
    };

    const created = await dbCreatePost(postPayload);
    setPosts((prev) => [created, ...prev.filter(p => p.id !== created.id)]);
    setCurrentUser((u) => u ? ({ ...u, karma: u.karma + 10 }) : null);
  };

  // Delete Post with Firestore and State synchronization
  const handleDeletePost = async (postId: string) => {
    try {
      await dbDeletePost(postId);
    } catch (err) {
      console.warn('Firestore post deletion note:', err);
    }
    
    // Update active memory state
    setPosts((prev) => {
      const updated = prev.filter((p) => p.id !== postId);
      localStorage.setItem('buvaki_posts', JSON.stringify(updated));
      return updated;
    });

    if (selectedPost && selectedPost.id === postId) {
      setSelectedPost(null);
    }
  };

  // Create Sub Buvaki
  const handleCreateSubBuvaki = async (newSub: SubBuvaki) => {
    if (!currentUser) {
      handleRequireAuth('Sign in or create an account to create Sub-Buvaki communities.');
      return;
    }

    const created = await dbCreateSubBuvaki({
      name: newSub.name,
      displayName: newSub.displayName,
      description: newSub.description,
      icon: newSub.icon,
      imageUrl: newSub.imageUrl,
      isDefault: false,
      bannerColor: newSub.bannerColor,
      category: newSub.category
    });
    setSubBuvakis((prev) => [...prev.filter(s => s.id !== created.id), created]);
    setActiveSubBuvakiId(created.id);
  };

  // Chat Send Message
  const handleSendMessage = (channelId: string, content: string) => {
    if (!currentUser) {
      handleRequireAuth('Sign in or create an account to chat with the community.');
      return;
    }

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
    if (!currentUser) {
      handleRequireAuth('Sign in or create an account to react to messages.');
      return;
    }

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
    // Strict separation: Feed contains items published under Posts (text, image, feed video, link, poll)
    // Exclude Shorts and Longs from Feed view (including by flag, type, flair, or tag)
    if (
      p.isShort === true || 
      p.isLong === true || 
      p.type === 'short' || 
      p.type === 'long' ||
      p.flair === 'Long Video' ||
      p.flair === 'Short Video' ||
      p.tags?.some(t => t.toLowerCase().includes('longvideo') || t.toLowerCase() === '#shorts' || t.toLowerCase() === '##shorts')
    ) {
      return false;
    }
    if (showSavedOnly && !p.isSaved) return false;
    if (activeSubBuvakiId && activeSubBuvakiId !== 'general' && p.subBuvakiId !== activeSubBuvakiId) return false;

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
    if (activeFilter === 'new') {
      return getTimestampEpoch(b.createdAt || b.timestamp) - getTimestampEpoch(a.createdAt || a.timestamp);
    }
    if (activeFilter === 'top') return b.score - a.score;
    if (activeFilter === 'discussed') return b.commentCount - a.commentCount;
    return 0;
  });

  const activeChannel = channels.find((c) => c.id === activeChannelId) || channels[0];
  const activeChannelMessages = messagesMap[activeChannelId] || [];
  const currentPostComments = selectedPost ? commentsMap[selectedPost.id] || [] : [];
  const userPublishedPosts = currentUser ? posts.filter((p) => p.author.id === currentUser.id) : [];
  const userSavedPosts = posts.filter((p) => p.isSaved);
  const activeSubObj = subBuvakis.find((s) => s.id === activeSubBuvakiId);

  // Theme Wrapper Classes
  const themeClasses = {
    dark: 'bg-slate-950 text-slate-100 selection:bg-violet-600 selection:text-white',
    stealth: 'bg-black text-emerald-100 selection:bg-emerald-600 selection:text-white',
    light: 'bg-slate-50 text-slate-900 selection:bg-violet-500 selection:text-white',
  }[theme];

  const t = getTranslation(selectedLanguage.code);

  return (
    <div 
      dir={isRTL(selectedLanguage.code) ? 'rtl' : 'ltr'} 
      className={`min-h-screen font-sans ${themeClasses} transition-colors duration-300 pb-16 lg:pb-0 ${viewMode === 'shorts' ? 'overflow-hidden bg-black' : ''}`}
    >
      
      {/* Top Header - Hidden in Shorts and Longs views */}
      {viewMode !== 'shorts' && viewMode !== 'longs' && (
        <Navbar
          viewMode={viewMode}
          setViewMode={setViewMode}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          currentUser={currentUser}
          selectedLanguage={selectedLanguage}
          onOpenCreatePost={handleOpenCreatePost}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          onOpenProfile={handleOpenProfile}
          onOpenAuth={() => handleRequireAuth('Sign in or create an account to access your profile and full features')}
          notifications={notifications}
          activeSubBuvakiName={activeSubObj?.displayName}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(true)}
        />
      )}

      {/* Main Container */}
      <div className={viewMode === 'shorts' ? 'w-full h-full p-0 m-0' : 'max-w-7xl mx-auto px-2 sm:px-6 flex gap-6'}>
        
        {/* Desktop Sidebar (Left Navigation) - Hidden in Shorts view */}
        {viewMode !== 'shorts' && (
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
            onOpenCreateSub={handleOpenCreateSub}
            viewMode={viewMode}
            setViewMode={setViewMode}
            selectedLanguage={selectedLanguage}
            onOpenLanguage={() => setIsLanguageModalOpen(true)}
            theme={theme}
            setTheme={setTheme}
          />
        )}

        {/* Center Main Stage */}
        <main className={viewMode === 'shorts' ? 'w-full h-full p-0 m-0 flex justify-center' : 'flex-1 min-w-0 py-2 sm:py-3 flex flex-col gap-3'}>
          
          {/* Sub-Buvaki Banner Header if a specific community is active */}
          {activeSubObj && viewMode !== 'shorts' && viewMode !== 'longs' && (
            <div className={`p-6 rounded-3xl bg-gradient-to-r ${activeSubObj.bannerColor} border border-violet-800/40 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative overflow-hidden`}>
              <div className="flex items-center gap-4 z-10">
                <CommunityIcon 
                  sub={activeSubObj}
                  size="xl" 
                  containerClassName="shadow-lg border-violet-500/40"
                />
                <div className="flex flex-col">
                  <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                    {activeSubObj.displayName}
                  </h1>
                  <p className="text-xs text-slate-300 max-w-xl leading-relaxed mt-1">
                    {activeSubObj.description}
                  </p>
                  <span className="text-[11px] text-pink-400 font-mono mt-1 font-bold">
                    {(activeSubObj.memberCount).toLocaleString()} {t.activeMembers}
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  if (!currentUser) {
                    handleRequireAuth('Sign in or create an account to join Sub-Buvaki communities.');
                    return;
                  }
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
                    : 'bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-600/20 active:scale-95'
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
                        onClick={handleOpenCreatePost}
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
                        onDeletePost={handleDeletePost}
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
                      onlineMembers={currentUser ? [currentUser] : []}
                      onSendMessage={handleSendMessage}
                      onAddReaction={handleAddReaction}
                      isInVoiceRoom={isInVoiceRoom}
                      onToggleVoiceRoom={handleVoiceRoomToggle}
                      selectedLanguage={selectedLanguage}
                      onRequireAuth={handleRequireAuth}
                    />
                  </div>
                )}

              </div>

            </div>
          )}

          {/* VIEW MODE: SHORTS */}
          {viewMode === 'shorts' && (
            <ShortsFeed
              posts={posts}
              currentUser={currentUser}
              selectedLanguage={selectedLanguage}
              activeSubBuvakiId={activeSubBuvakiId}
              subBuvakis={subBuvakis}
              onSelectSubBuvaki={setActiveSubBuvakiId}
              onOpenCreatePost={handleOpenCreatePost}
              onVote={handleVotePost}
              onToggleSave={handleToggleSavePost}
              onSelectPost={(p) => setSelectedPost(p)}
              onRequireAuth={handleRequireAuth}
            />
          )}

          {/* VIEW MODE: LONGS */}
          {viewMode === 'longs' && (
            <LongsFeed
              posts={posts}
              currentUser={currentUser}
              selectedLanguage={selectedLanguage}
              activeSubBuvakiId={activeSubBuvakiId}
              subBuvakis={subBuvakis}
              onSelectSubBuvaki={setActiveSubBuvakiId}
              onOpenCreatePost={handleOpenCreatePost}
              onVote={handleVotePost}
              onToggleSave={handleToggleSavePost}
              onSelectPost={(p) => setSelectedPost(p)}
              onRequireAuth={handleRequireAuth}
            />
          )}

          {/* VIEW MODE: CHAT ONLY */}
          {viewMode === 'chat' && (
            <LiveChatView
              channel={activeChannel}
              messages={activeChannelMessages}
              currentUser={currentUser}
              onlineMembers={currentUser ? [currentUser] : []}
              onSendMessage={handleSendMessage}
              onAddReaction={handleAddReaction}
              isInVoiceRoom={isInVoiceRoom}
              onToggleVoiceRoom={handleVoiceRoomToggle}
              selectedLanguage={selectedLanguage}
              onRequireAuth={handleRequireAuth}
            />
          )}

        </main>

      </div>

      {/* Mobile Bottom Navigation & Slide-over Drawer */}
      <MobileNav
        viewMode={viewMode}
        setViewMode={setViewMode}
        currentUser={currentUser}
        onOpenCreatePost={handleOpenCreatePost}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenProfile={handleOpenProfile}
        notifications={notifications}
        isMobileSidebarOpen={isMobileSidebarOpen}
        onCloseMobileSidebar={() => setIsMobileSidebarOpen(false)}
        subBuvakis={subBuvakis}
        activeSubBuvakiId={activeSubBuvakiId}
        onSelectSubBuvaki={setActiveSubBuvakiId}
        channels={channels}
        activeChannelId={activeChannelId}
        onSelectChannel={setActiveChannelId}
        onOpenCreateSub={handleOpenCreateSub}
        showSavedOnly={showSavedOnly}
        onToggleSavedOnly={setShowSavedOnly}
        selectedLanguage={selectedLanguage}
        onOpenLanguage={() => setIsLanguageModalOpen(true)}
        theme={theme}
        setTheme={setTheme}
      />

      {/* Voice Channel Floating Controller Bar */}
      {isInVoiceRoom && (
        <VoiceRoomBar
          activeVoiceUsers={currentUser ? [currentUser] : []}
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
          onDeletePost={handleDeletePost}
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

      {isProfileOpen && currentUser && (
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
          onDeletePost={handleDeletePost}
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

      {/* Guest Authentication Modal Interception */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onCompleteAuth={handleCompleteAuth}
        promptReason={authModalPrompt}
        selectedLanguage={selectedLanguage}
      />

    </div>
  );
}
