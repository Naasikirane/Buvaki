import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { MobileNav } from './components/MobileNav';
import { PostCard } from './components/PostCard';
import { RightCommentsSidebar } from './components/RightCommentsSidebar';
import { PostDetailModal } from './components/PostDetailModal';
import { CreatePostModal } from './components/CreatePostModal';
import { CommentsDrawer } from './components/CommentsDrawer';
import { ShareDrawer } from './components/ShareDrawer';
import { ShortsFeed } from './components/ShortsFeed';
import { LongsFeed } from './components/LongsFeed';
import { YouPage } from './components/YouPage';
import { UserProfileModal } from './components/UserProfileModal';
import { NotificationsModal } from './components/NotificationsModal';
import { LanguageSelectorModal } from './components/LanguageSelectorModal';
import { AuthModal } from './components/AuthModal';

import { 
  Post, 
  SubBuvaki, 
  ChatChannel, 
  Comment, 
  User, 
  NotificationItem, 
  ViewMode, 
  FilterSort, 
  Theme,
  SUPPORTED_LANGUAGES,
  SupportedLanguage
} from './types';
import { getTranslation } from './lib/translations';

import { 
  CURRENT_USER,
  SEED_SUB_BUVAKIS, 
  SEED_POSTS,
  SEED_COMMENTS,
  SEED_NOTIFICATIONS 
} from './data/mockData';

const MOCK_POST_IDS = new Set([
  'post_1', 'post_2', 'post_3', 'post_4', 'post_5'
]);

import { 
  initAuth, 
  ensureSeeded, 
  dbLogout,
  subscribeToPosts, 
  subscribeToComments, 
  dbCreatePost, 
  dbDeletePost,
  dbAddComment, 
  dbVote, 
  dbVotePoll, 
  dbSaveUserProfile
} from './lib/firebase';
import { getTimestampEpoch } from './lib/timeUtils';
import { autoIndexer } from './lib/indexer';

import { Flame, Sparkles, TrendingUp, MessageSquare, Compass, Check, SquarePen } from 'lucide-react';

export default function App() {
  // Guest state by default; persists logged-in user if saved in localStorage
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('buvaki_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (err) {
        return CURRENT_USER;
      }
    }
    return CURRENT_USER;
  });

  const [posts, setPosts] = useState<Post[]>(() => {
    const saved = localStorage.getItem('buvaki_posts');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const map = new Map<string, Post>();
          SEED_POSTS.forEach(p => map.set(p.id, p));
          parsed.forEach(p => {
            if (!MOCK_POST_IDS.has(p.id)) {
              map.set(p.id, p);
            }
          });
          return Array.from(map.values());
        }
      } catch (err) {
        return SEED_POSTS;
      }
    }
    return SEED_POSTS;
  });

  const [commentsMap, setCommentsMap] = useState<Record<string, Comment[]>>(() => {
    const saved = localStorage.getItem('buvaki_comments');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { ...SEED_COMMENTS, ...parsed };
      } catch (err) {
        return SEED_COMMENTS;
      }
    }
    return SEED_COMMENTS;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem('buvaki_notifs');
    return saved ? JSON.parse(saved) : SEED_NOTIFICATIONS;
  });

  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>(() => {
    const savedLangCode = localStorage.getItem('buvaki_selected_lang');
    if (savedLangCode) {
      const found = SUPPORTED_LANGUAGES.find(l => l.code === savedLangCode);
      if (found) return found;
    }
    return SUPPORTED_LANGUAGES[0];
  });

  const [viewMode, setViewMode] = useState<ViewMode>('feed');
  const [theme, setTheme] = useState<Theme>('light');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilterPill, setActiveFilterPill] = useState<string>('Top');
  const [activeFilter, setActiveFilter] = useState<FilterSort>('hot');
  const [showSavedOnly, setShowSavedOnly] = useState(false);

  // Active centered post for the right-side comment bar
  const [activeCenterPostId, setActiveCenterPostId] = useState<string | null>(null);
  const postElementsRef = useRef<Map<string, HTMLElement>>(new Map());
  const isAutoScrollingRef = useRef(false);
  const isNavigatingRef = useRef(false);
  const lastNavigationTimeRef = useRef(0);
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);

  // Subscribed creators tracking
  const [subscribedCreators, setSubscribedCreators] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('buvaki_subscribed_creators');
    return saved ? new Set(JSON.parse(saved)) : new Set(['u_anidong', '@Anidong_Manhwa']);
  });

  // Drawers for mobile & desktop interactions
  const [drawerCommentsPost, setDrawerCommentsPost] = useState<Post | null>(null);
  const [drawerSharePost, setDrawerSharePost] = useState<Post | null>(null);

  // Feedback Toast
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

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
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  // Auto-collapse left sidebar by default, matching YouTube's default mini guide rail
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);

  const handleToggleSidebar = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setIsMobileSidebarOpen((prev) => !prev);
    } else {
      setIsSidebarCollapsed((prev) => !prev);
    }
  };

  // Profile action guard
  const handleOpenProfile = () => {
    setShowSavedOnly(false);
    setViewMode('you');
  };

  // Open create post guard
  const handleOpenCreatePost = () => {
    if (!currentUser) {
      handleRequireAuth('Sign in or create an account to create posts and videos');
      return;
    }
    setIsCreatePostOpen(true);
  };

  // Initialize Auth & Seed on startup
  useEffect(() => {
    initAuth().catch(console.warn);
    ensureSeeded().catch(console.warn);
  }, []);

  // Save changes locally
  useEffect(() => {
    localStorage.setItem('buvaki_posts', JSON.stringify(posts));
  }, [posts]);

  useEffect(() => {
    localStorage.setItem('buvaki_comments', JSON.stringify(commentsMap));
  }, [commentsMap]);

  useEffect(() => {
    localStorage.setItem('buvaki_notifs', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('buvaki_subscribed_creators', JSON.stringify(Array.from(subscribedCreators)));
  }, [subscribedCreators]);

  // Subscribe to real-time posts from Firestore
  useEffect(() => {
    const unsub = subscribeToPosts((remotePosts) => {
      if (remotePosts && remotePosts.length > 0) {
        setPosts((prev) => {
          const map = new Map<string, Post>();
          SEED_POSTS.forEach((p) => map.set(p.id, p));
          prev.forEach((p) => map.set(p.id, p));
          remotePosts.forEach((p) => {
            if (!MOCK_POST_IDS.has(p.id)) {
              map.set(p.id, p);
            }
          });
          return Array.from(map.values());
        });
      }
    });
    return () => unsub();
  }, []);

  // Subscribe to real-time comments
  useEffect(() => {
    const unsubs = posts.map((p) =>
      subscribeToComments(p.id, (remoteComments) => {
        if (remoteComments && remoteComments.length > 0) {
          setCommentsMap((prev) => ({
            ...prev,
            [p.id]: remoteComments,
          }));
        }
      })
    );
    return () => unsubs.forEach((u) => u());
  }, [posts.length]);

  // SEO & Head Synchronization
  useEffect(() => {
    let title = 'Buvaki - The Modern Social & Video Platform';
    let desc = 'Explore trending posts, vertical shorts, widescreen videos, and creator updates on Buvaki.';

    if (viewMode === 'shorts') {
      title = 'Shorts | Buvaki';
      desc = 'Watch immersive vertical video shorts, reactions, and music loops on Buvaki.';
    } else if (viewMode === 'longs') {
      title = 'Longs | Buvaki';
      desc = 'Watch long-form widescreen videos, documentaries, and tech guides on Buvaki.';
    } else if (selectedPost) {
      title = `${selectedPost.title} | Buvaki`;
      desc = selectedPost.content.slice(0, 150) || selectedPost.title;
    }

    document.title = title;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', desc);
  }, [viewMode, selectedPost]);

  // Post Actions
  const handleVotePost = (postId: string, direction: 'up' | 'down') => {
    if (!currentUser) {
      handleRequireAuth('Sign in or create an account to upvote and support content.');
      return;
    }

    dbVote(currentUser.id, postId, 'post', direction);

    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        let diff = 0;
        let nextVote: 'up' | 'down' | null = direction;

        if (p.userVote === direction) {
          nextVote = null;
          diff = direction === 'up' ? -1 : 1;
        } else if (p.userVote === null) {
          diff = direction === 'up' ? 1 : -1;
        } else {
          diff = direction === 'up' ? 2 : -2;
        }

        return {
          ...p,
          score: p.score + diff,
          userVote: nextVote,
        };
      })
    );
  };

  const handleToggleSavePost = (postId: string) => {
    if (!currentUser) {
      handleRequireAuth('Sign in or create an account to save posts to your library.');
      return;
    }

    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, isSaved: !p.isSaved } : p))
    );
  };

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

  // Add Comment (works for drawer and modal)
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
  const handleVoteComment = (commentId: string, direction: 'up' | 'down', targetPostId?: string) => {
    if (!currentUser) {
      handleRequireAuth('Sign in or create an account to vote on comments.');
      return;
    }
    const postId = targetPostId || selectedPost?.id || drawerCommentsPost?.id || activeCenterPostId;
    if (!postId) return;

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

  // Delete Post
  const handleDeletePost = async (postId: string) => {
    await dbDeletePost(postId);
    setPosts((prev) => prev.filter((p) => p.id !== postId));
    if (selectedPost?.id === postId) setSelectedPost(null);
    if (drawerCommentsPost?.id === postId) setDrawerCommentsPost(null);
    if (drawerSharePost?.id === postId) setDrawerSharePost(null);
  };

  // Toggle Subscribe for creator handles
  const handleToggleSubscribe = (authorKey: string) => {
    if (!currentUser) {
      handleRequireAuth('Sign in to subscribe to creators.');
      return;
    }
    setSubscribedCreators((prev) => {
      const next = new Set(prev);
      if (next.has(authorKey)) {
        next.delete(authorKey);
      } else {
        next.add(authorKey);
      }
      return next;
    });
  };

  // Publish Post
  const handlePublishPost = async (postData: Partial<Post>) => {
    if (!currentUser) return;
    const authorUser = currentUser;

    const newPost: Post = {
      id: `post_${Date.now()}`,
      subBuvakiId: 'general',
      subBuvakiName: 'Buvaki Community',
      author: authorUser,
      title: postData.title || '',
      content: postData.content || '',
      type: postData.type || 'text',
      imageUrl: postData.imageUrl,
      images: postData.images,
      videoUrl: postData.videoUrl,
      linkUrl: postData.linkUrl,
      flair: postData.flair || 'Discussion',
      score: 1,
      userVote: 'up',
      commentCount: 0,
      timestamp: 'Just now',
      createdAt: new Date().toISOString(),
      createdAtEpoch: Date.now(),
      isPinned: false,
      isSaved: false,
      tags: postData.tags || [],
      poll: postData.poll,
      isShort: postData.isShort || false,
      isLong: postData.isLong || false,
      duration: postData.duration,
    };

    const createdPost = await dbCreatePost(newPost);
    if (createdPost?.id) newPost.id = createdPost.id;

    setPosts((prev) => [newPost, ...prev]);

    if (newPost.isShort) setViewMode('shorts');
    else if (newPost.isLong) setViewMode('longs');
    else setViewMode('feed');
  };

  // Filter & Search Logic
  const filteredPosts = posts.filter((p) => {
    // Separation: Feed contains items published under Posts (text, image, feed video, link, poll)
    if (
      p.isShort === true || 
      p.isLong === true || 
      p.type === 'short' || 
      p.type === 'long' ||
      p.flair === 'Long Video' ||
      p.flair === 'Short Video' ||
      p.tags?.some(t => t.toLowerCase().includes('longvideo') || t.toLowerCase() === '#shorts')
    ) {
      return false;
    }
    if (showSavedOnly && !p.isSaved) return false;

    // Filter by Pill (Matching Screenshot)
    if (activeFilterPill === 'Creator posts') {
      if (!p.author.badges || p.author.badges.length === 0) {
        if (!['ojisan', 'nothing', 'eachgen', 'anidong'].includes(p.author.id.replace('u_', ''))) return false;
      }
    } else if (activeFilterPill === 'Watched') {
      if (!p.userVote && !p.isSaved) return false;
    } else if (activeFilterPill === 'New to you') {
      if (currentUser && (p.author.id === currentUser.id || p.author.handle === currentUser.handle)) return false;
    } else if (activeFilterPill === 'Polls') {
      if (p.type !== 'poll' && !p.poll) return false;
    } else if (activeFilterPill === 'Images') {
      if (p.type !== 'image' && !p.imageUrl && (!p.images || p.images.length === 0)) return false;
    } else if (activeFilterPill === 'Discussions') {
      if (p.type !== 'text') return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = p.title.toLowerCase().includes(q);
      const matchContent = p.content.toLowerCase().includes(q);
      const matchAuthor = p.author.username.toLowerCase().includes(q) || p.author.handle.toLowerCase().includes(q);
      const matchTags = p.tags.some((t) => t.toLowerCase().includes(q));
      return matchTitle || matchContent || matchAuthor || matchTags;
    }
    return true;
  });

  // Sorting
  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (activeFilterPill === 'Newest' || activeFilter === 'new') {
      return getTimestampEpoch(b.createdAt || b.timestamp) - getTimestampEpoch(a.createdAt || a.timestamp);
    }
    if (activeFilterPill === 'Top' || activeFilterPill === 'Trending' || activeFilter === 'hot' || activeFilter === 'top') {
      return b.score - a.score;
    }
    if (activeFilter === 'discussed') return b.commentCount - a.commentCount;
    return 0;
  });

  const currentPostComments = selectedPost ? commentsMap[selectedPost.id] || [] : [];
  const drawerCommentsList = drawerCommentsPost ? commentsMap[drawerCommentsPost.id] || [] : [];
  const userPublishedPosts = currentUser ? posts.filter((p) => p.author.id === currentUser.id) : [];
  const userSavedPosts = posts.filter((p) => p.isSaved);

  const activeCenterPost = useMemo(() => {
    if (!sortedPosts.length) return null;
    if (activeCenterPostId) {
      const found = sortedPosts.find((p) => p.id === activeCenterPostId);
      if (found) return found;
    }
    return sortedPosts[0];
  }, [sortedPosts, activeCenterPostId]);

  const activeCenterComments = activeCenterPost ? commentsMap[activeCenterPost.id] || [] : [];

  // Exact auto-centering calculation for any post (even if short or tall)
  const scrollToPost = useCallback((postId: string) => {
    const el = postElementsRef.current.get(postId);
    if (!el) return;

    setActiveCenterPostId(postId);
    isAutoScrollingRef.current = true;

    const rect = el.getBoundingClientRect();
    const currentScrollY = window.scrollY || window.pageYOffset;
    const elTopDoc = rect.top + currentScrollY;
    const elHeight = rect.height;
    const elCenterDoc = elTopDoc + elHeight / 2;

    const navBarOffset = 56; // 56px fixed top navbar (h-14)
    const visibleHeight = window.innerHeight - navBarOffset;
    const visibleCenter = navBarOffset + visibleHeight / 2;

    let targetScrollY: number;
    // If post is taller than the visible viewport, comfortably align top below navbar
    if (elHeight > visibleHeight - 24) {
      targetScrollY = Math.max(0, elTopDoc - navBarOffset - 12);
    } else {
      // Auto-center vertically in the visible viewport
      targetScrollY = Math.max(0, elCenterDoc - visibleCenter);
    }

    window.scrollTo({
      top: targetScrollY,
      behavior: 'smooth',
    });

    setTimeout(() => {
      isAutoScrollingRef.current = false;
    }, 550);
  }, []);

  const handleFocusPost = (postId: string) => {
    scrollToPost(postId);
  };

  // Single-scroll post navigation & automatic vertical centering for Home feed
  useEffect(() => {
    if (viewMode !== 'feed' || sortedPosts.length === 0) return;

    if (!activeCenterPostId && sortedPosts[0]) {
      setActiveCenterPostId(sortedPosts[0].id);
    }

    // Keep activeCenterPostId in sync with viewport center during passive scrolling or dragging
    const onScroll = () => {
      if (isAutoScrollingRef.current) return;

      const viewportCenter = window.innerHeight / 2;
      let closestId: string | null = null;
      let minDistance = Infinity;

      postElementsRef.current.forEach((el, id) => {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const elCenter = rect.top + rect.height / 2;
        const dist = Math.abs(viewportCenter - elCenter);
        if (dist < minDistance) {
          minDistance = dist;
          closestId = id;
        }
      });

      if (closestId && closestId !== activeCenterPostId) {
        setActiveCenterPostId(closestId);
      }
    };

    // Single-scroll wheel navigation: scrolling once advances & auto-centers next/prev post
    const onWheel = (e: WheelEvent) => {
      if (viewMode !== 'feed' || sortedPosts.length <= 1) return;

      // Do not intercept if a modal, drawer, or dialog is active
      if (
        isAuthModalOpen ||
        selectedPost ||
        isCreatePostOpen ||
        isProfileOpen ||
        isNotificationsOpen ||
        isLanguageModalOpen ||
        drawerCommentsPost ||
        drawerSharePost
      ) {
        return;
      }

      // Do not intercept if the user is scrolling over the comments sidebar or an interactive field
      const target = e.target as HTMLElement | null;
      if (target) {
        if (
          target.closest('aside') ||
          target.closest('[role="dialog"]') ||
          target.closest('.modal') ||
          target.closest('input, textarea, select, [contenteditable="true"]')
        ) {
          return;
        }
      }

      // Ignore micro-jitters
      if (Math.abs(e.deltaY) < 16) return;

      const now = Date.now();
      // If currently navigating or within cooldown, prevent chaotic free-scrolling
      if (isAutoScrollingRef.current || isNavigatingRef.current || now - lastNavigationTimeRef.current < 550) {
        e.preventDefault();
        return;
      }

      // Determine current post index in sortedPosts
      let currentIndex = sortedPosts.findIndex((p) => p.id === activeCenterPostId);
      if (currentIndex === -1) {
        const viewportCenter = window.innerHeight / 2;
        let closestId: string | null = null;
        let minDistance = Infinity;
        postElementsRef.current.forEach((el, id) => {
          if (!el) return;
          const rect = el.getBoundingClientRect();
          const elCenter = rect.top + rect.height / 2;
          const dist = Math.abs(viewportCenter - elCenter);
          if (dist < minDistance) {
            minDistance = dist;
            closestId = id;
          }
        });
        currentIndex = closestId ? sortedPosts.findIndex((p) => p.id === closestId) : 0;
        if (currentIndex === -1) currentIndex = 0;
      }

      if (e.deltaY > 0) {
        // Scroll down once -> advance to next post and auto-center
        if (currentIndex < sortedPosts.length - 1) {
          e.preventDefault();
          const nextPost = sortedPosts[currentIndex + 1];
          isNavigatingRef.current = true;
          lastNavigationTimeRef.current = now;
          scrollToPost(nextPost.id);
          setTimeout(() => {
            isNavigatingRef.current = false;
          }, 550);
        }
      } else if (e.deltaY < 0) {
        // Scroll up once -> advance to previous post and auto-center
        if (currentIndex > 0) {
          e.preventDefault();
          const prevPost = sortedPosts[currentIndex - 1];
          isNavigatingRef.current = true;
          lastNavigationTimeRef.current = now;
          scrollToPost(prevPost.id);
          setTimeout(() => {
            isNavigatingRef.current = false;
          }, 550);
        } else if (currentIndex === 0 && window.scrollY > 0) {
          // At first post, scroll back to the very top
          e.preventDefault();
          isNavigatingRef.current = true;
          lastNavigationTimeRef.current = now;
          window.scrollTo({ top: 0, behavior: 'smooth' });
          setTimeout(() => {
            isNavigatingRef.current = false;
          }, 550);
        }
      }
    };

    // Touch swipe navigation for mobile / touchpads
    const onTouchStart = (e: TouchEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        isAuthModalOpen ||
        selectedPost ||
        isCreatePostOpen ||
        isProfileOpen ||
        drawerCommentsPost ||
        drawerSharePost ||
        target?.closest('aside') ||
        target?.closest('[role="dialog"]') ||
        target?.closest('input, textarea, select, [contenteditable="true"]')
      ) {
        touchStartXRef.current = null;
        touchStartYRef.current = null;
        return;
      }
      touchStartXRef.current = e.touches[0].clientX;
      touchStartYRef.current = e.touches[0].clientY;
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (touchStartYRef.current === null || sortedPosts.length <= 1) return;
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const deltaX = (touchStartXRef.current ?? touchEndX) - touchEndX;
      const deltaY = touchStartYRef.current - touchEndY;
      touchStartXRef.current = null;
      touchStartYRef.current = null;

      // Ignore horizontal swipes (e.g. image carousel navigation)
      if (Math.abs(deltaX) > Math.abs(deltaY)) return;
      if (Math.abs(deltaY) < 40) return;

      const now = Date.now();
      if (isAutoScrollingRef.current || isNavigatingRef.current || now - lastNavigationTimeRef.current < 550) {
        return;
      }

      let currentIndex = sortedPosts.findIndex((p) => p.id === activeCenterPostId);
      if (currentIndex === -1) currentIndex = 0;

      if (deltaY > 0) {
        // Swipe up gesture -> next post
        if (currentIndex < sortedPosts.length - 1) {
          const nextPost = sortedPosts[currentIndex + 1];
          isNavigatingRef.current = true;
          lastNavigationTimeRef.current = now;
          scrollToPost(nextPost.id);
          setTimeout(() => {
            isNavigatingRef.current = false;
          }, 550);
        }
      } else if (deltaY < 0) {
        // Swipe down gesture -> previous post
        if (currentIndex > 0) {
          const prevPost = sortedPosts[currentIndex - 1];
          isNavigatingRef.current = true;
          lastNavigationTimeRef.current = now;
          scrollToPost(prevPost.id);
          setTimeout(() => {
            isNavigatingRef.current = false;
          }, 550);
        } else if (currentIndex === 0 && window.scrollY > 0) {
          isNavigatingRef.current = true;
          lastNavigationTimeRef.current = now;
          window.scrollTo({ top: 0, behavior: 'smooth' });
          setTimeout(() => {
            isNavigatingRef.current = false;
          }, 550);
        }
      }
    };

    // Keyboard arrow keys / Page keys navigation
    const onKeyDown = (e: KeyboardEvent) => {
      if (viewMode !== 'feed' || sortedPosts.length <= 1) return;
      const target = e.target as HTMLElement | null;
      if (
        isAuthModalOpen ||
        selectedPost ||
        isCreatePostOpen ||
        target?.closest('input, textarea, select, [contenteditable="true"]') ||
        target?.closest('[role="dialog"]')
      ) {
        return;
      }

      if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === 'j') {
        e.preventDefault();
        const currentIndex = sortedPosts.findIndex((p) => p.id === activeCenterPostId);
        const currIdx = currentIndex === -1 ? 0 : currentIndex;
        if (currIdx < sortedPosts.length - 1) {
          scrollToPost(sortedPosts[currIdx + 1].id);
        }
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp' || e.key === 'k') {
        e.preventDefault();
        const currentIndex = sortedPosts.findIndex((p) => p.id === activeCenterPostId);
        const currIdx = currentIndex === -1 ? 0 : currentIndex;
        if (currIdx > 0) {
          scrollToPost(sortedPosts[currIdx - 1].id);
        } else if (currIdx === 0 && window.scrollY > 0) {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [
    viewMode,
    sortedPosts,
    activeCenterPostId,
    scrollToPost,
    isAuthModalOpen,
    selectedPost,
    isCreatePostOpen,
    isProfileOpen,
    isNotificationsOpen,
    isLanguageModalOpen,
    drawerCommentsPost,
    drawerSharePost,
  ]);

  const t = getTranslation(selectedLanguage.code);

  return (
    <div className="min-h-screen bg-white text-[#0f0f0f] font-sans transition-colors duration-200 antialiased pb-16 lg:pb-0">
      
      {/* Top Navbar */}
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
        onOpenAuth={() => handleRequireAuth()}
        notifications={notifications}
        onToggleSidebar={handleToggleSidebar}
        onToggleMobileSidebar={() => setIsMobileSidebarOpen(true)}
      />

      {/* Main Container */}
      <div className={`w-full flex pt-14 ${viewMode === 'shorts' ? 'h-screen overflow-hidden' : 'min-h-screen'}`}>
        
        {/* Desktop Sidebar (Left Navigation) */}
        <Sidebar
          activeFilter={activeFilter}
          onChangeFilter={setActiveFilter}
          showSavedOnly={showSavedOnly}
          onToggleSavedOnly={setShowSavedOnly}
          viewMode={viewMode}
          setViewMode={setViewMode}
          selectedLanguage={selectedLanguage}
          onOpenLanguage={() => setIsLanguageModalOpen(true)}
          theme={theme}
          setTheme={setTheme}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
        />

        {/* Center Main Stage */}
        <main className={
          viewMode === 'shorts'
            ? 'flex-1 min-w-0 h-full flex items-center justify-center overflow-hidden relative'
            : (viewMode === 'longs' || viewMode === 'you')
              ? 'flex-1 min-w-0 flex flex-col'
              : 'flex-1 min-w-0 py-2 sm:py-3 px-3 sm:px-4 lg:px-6 flex flex-col gap-3'
        }>
          
          {/* VIEW MODE: FEED */}
          {viewMode === 'feed' && (
            <div className="flex items-start gap-5 w-full justify-center">
              
              {/* Center Feed Column */}
              <div className="flex-1 min-w-0 flex flex-col gap-4 max-w-3xl xl:max-w-4xl">
                
                {/* TOP FILTER PILLS BAR (YouTube Chips Style) */}
                <div className="w-full flex items-center justify-between gap-2 overflow-x-auto no-scrollbar py-1">
                  <div className="flex items-center gap-2">
                    {['Top', 'Newest', 'Creator posts', 'Discussions', 'Polls', 'Images'].map((pill) => (
                      <button
                        key={pill}
                        onClick={() => setActiveFilterPill(pill)}
                        className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-colors ${
                          activeFilterPill === pill
                            ? 'bg-[#0f0f0f] text-white shadow-2xs'
                            : 'bg-[#0000000d] hover:bg-[#00000014] text-[#0f0f0f]'
                        }`}
                      >
                        {pill}
                      </button>
                    ))}
                  </div>

                  {/* Send Feedback text link on the right */}
                  <button
                    onClick={() => {
                      setFeedbackToast('Thank you for your feedback! Community feed has been upgraded.');
                      setTimeout(() => setFeedbackToast(null), 3000);
                    }}
                    className="text-xs font-medium text-[#065fd4] hover:underline whitespace-nowrap px-2 shrink-0 cursor-pointer"
                  >
                    Send feedback
                  </button>
                </div>

                {/* Toast confirmation */}
                {feedbackToast && (
                  <div className="p-2.5 rounded-xl bg-[#f2f2f2] border border-[#0000001a] text-xs text-[#0f0f0f] font-medium flex items-center gap-2 animate-in fade-in">
                    <Check className="w-4 h-4 text-[#065fd4]" />
                    <span>{feedbackToast}</span>
                  </div>
                )}

                {/* Community Posts Feed with Auto-Centering on Scroll */}
                <div className="flex flex-col gap-4">
                  {sortedPosts.length === 0 ? (
                    <div className="p-12 text-center rounded-2xl bg-slate-50 border border-slate-200 flex flex-col items-center gap-3">
                      <Compass className="w-8 h-8 text-slate-400" />
                      <span className="text-sm font-semibold text-slate-600">No community posts found</span>
                      <button
                        onClick={handleOpenCreatePost}
                        className="mt-2 px-4 py-2 rounded-full bg-slate-900 text-white font-bold text-xs hover:bg-slate-800"
                      >
                        Create the first post
                      </button>
                    </div>
                  ) : (
                    sortedPosts.map((post) => {
                      const isSub = subscribedCreators.has(post.author.id) || subscribedCreators.has(post.author.handle);
                      const postComments = commentsMap[post.id] || [];
                      const topComment = postComments[0] || null;
                      const isCenter = (activeCenterPostId || sortedPosts[0]?.id) === post.id;

                      return (
                        <div
                          key={post.id}
                          id={`post-${post.id}`}
                          ref={(el) => {
                            if (el) postElementsRef.current.set(post.id, el);
                            else postElementsRef.current.delete(post.id);
                          }}
                          className="scroll-mt-24 transition-transform duration-200"
                        >
                          <PostCard
                            post={post}
                            currentUser={currentUser}
                            selectedLanguage={selectedLanguage}
                            topComment={topComment}
                            comments={postComments}
                            onAddComment={handleAddComment}
                            onVote={handleVotePost}
                            onSelectPost={(p) => setSelectedPost(p)}
                            onToggleSave={handleToggleSavePost}
                            onVotePoll={handleVotePoll}
                            onDeletePost={handleDeletePost}
                            onOpenComments={(p) => {
                              handleFocusPost(p.id);
                              if (window.innerWidth < 1024) {
                                setDrawerCommentsPost(p);
                              }
                            }}
                            onOpenShare={(p) => setDrawerSharePost(p)}
                            onSubscribeToggle={(authorId) => handleToggleSubscribe(authorId)}
                            isSubscribed={isSub}
                            theme={theme}
                            isActiveCenter={isCenter}
                            onFocusPost={(p) => handleFocusPost(p.id)}
                          />
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Floating "Create a post" button */}
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 pointer-events-auto">
                  <button
                    onClick={handleOpenCreatePost}
                    className="flex items-center gap-2.5 px-6 py-3 rounded-full bg-slate-900 text-white font-bold text-sm shadow-xl hover:bg-slate-800 active:scale-95 transition-all cursor-pointer border border-slate-700"
                  >
                    <SquarePen className="w-4 h-4 text-white stroke-[2.5]" />
                    <span>Create a post</span>
                  </button>
                </div>

              </div>

              {/* Dedicated Right Comments Sidebar on Home Feed (Sticky, auto-updates to whichever post is in center) */}
              <RightCommentsSidebar
                activePost={activeCenterPost}
                comments={activeCenterComments}
                currentUser={currentUser}
                selectedLanguage={selectedLanguage}
                onVoteComment={(cId, dir) => handleVoteComment(cId, dir, activeCenterPost?.id)}
                onAddComment={handleAddComment}
                onRequireAuth={handleRequireAuth}
                theme={theme}
              />

            </div>
          )}

          {/* VIEW MODE: SHORTS */}
          {viewMode === 'shorts' && (
            <ShortsFeed
              posts={posts}
              currentUser={currentUser}
              selectedLanguage={selectedLanguage}
              onOpenCreatePost={handleOpenCreatePost}
              onVote={handleVotePost}
              onToggleSave={handleToggleSavePost}
              onSelectPost={(p) => setSelectedPost(p)}
              onRequireAuth={handleRequireAuth}
              onSubscribeToggle={handleToggleSubscribe}
              subscribedCreators={subscribedCreators}
            />
          )}

          {/* VIEW MODE: LONGS */}
          {viewMode === 'longs' && (
            <LongsFeed
              posts={posts}
              currentUser={currentUser}
              selectedLanguage={selectedLanguage}
              onOpenCreatePost={handleOpenCreatePost}
              onVote={handleVotePost}
              onToggleSave={handleToggleSavePost}
              onSelectPost={(p) => setSelectedPost(p)}
              onRequireAuth={handleRequireAuth}
              onSelectShort={() => setViewMode('shorts')}
            />
          )}

          {/* VIEW MODE: YOU (Matches You_expectations.png and You_expectations2.png) */}
          {viewMode === 'you' && (
            <YouPage
              currentUser={currentUser}
              onSelectPost={(p) => setSelectedPost(p)}
              onRequireAuth={handleRequireAuth}
              onNavigateToFeed={() => setViewMode('feed')}
            />
          )}

        </main>

      </div>

      {/* Mobile Bottom Navigation Bar (Screenshot 1) */}
      <MobileNav
        viewMode={viewMode}
        setViewMode={setViewMode}
        currentUser={currentUser}
        onOpenCreatePost={handleOpenCreatePost}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenProfile={handleOpenProfile}
        isMobileSidebarOpen={isMobileSidebarOpen}
        onCloseMobileSidebar={() => setIsMobileSidebarOpen(false)}
        showSavedOnly={showSavedOnly}
        onToggleSavedOnly={setShowSavedOnly}
        selectedLanguage={selectedLanguage}
        onOpenLanguage={() => setIsLanguageModalOpen(true)}
        theme={theme}
        setTheme={setTheme}
      />

      {/* BOTTOM-SHEET COMMENTS DRAWER (Matching Screenshot 2) */}
      {drawerCommentsPost && (
        <CommentsDrawer
          post={drawerCommentsPost}
          comments={drawerCommentsList}
          currentUser={currentUser}
          onClose={() => setDrawerCommentsPost(null)}
          onAddComment={(content, parentId) => handleAddComment(drawerCommentsPost.id, content, parentId)}
          onVoteComment={(commentId, dir) => handleVoteComment(commentId, dir, drawerCommentsPost.id)}
          onRequireAuth={handleRequireAuth}
        />
      )}

      {/* BOTTOM-SHEET SHARE DRAWER (Matching Screenshot 3) */}
      {drawerSharePost && (
        <ShareDrawer
          post={drawerSharePost}
          onClose={() => setDrawerSharePost(null)}
        />
      )}

      {/* Full Modal Post Detail Dialog */}
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

      {/* Creator Modal */}
      {isCreatePostOpen && (
        <CreatePostModal
          subBuvakis={SEED_SUB_BUVAKIS}
          onClose={() => setIsCreatePostOpen(false)}
          onSubmitPost={handlePublishPost}
        />
      )}

      {/* User Profile Modal */}
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

      {/* Language Selector Modal */}
      <LanguageSelectorModal
        isOpen={isLanguageModalOpen}
        selectedLanguage={selectedLanguage}
        onSelectLanguage={handleSelectLanguage}
        onClose={() => setIsLanguageModalOpen(false)}
      />

      {/* Notifications Modal */}
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
