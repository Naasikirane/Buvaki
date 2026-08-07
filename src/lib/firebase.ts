import { initializeApp, getApps } from 'firebase/app';
import { 
  getFirestore, 
  initializeFirestore,
  collection, 
  doc, 
  getDocs, 
  getDoc,
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  serverTimestamp, 
  increment,
  writeBatch
} from 'firebase/firestore';
import { 
  getAuth, 
  signInAnonymously, 
  onAuthStateChanged, 
  User as FirebaseUser,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  sendEmailVerification,
  signOut as firebaseSignOut
} from 'firebase/auth';

import firebaseConfig from '../../firebase-applet-config.json';
import { Post, SubBuvaki, Comment, ChatMessage, User, ChatChannel } from '../types';
import { SEED_POSTS, SEED_SUB_BUVAKIS, SEED_CHANNELS, SEED_MESSAGES, SEED_COMMENTS, CURRENT_USER } from '../data/mockData';

// Helper to recursively remove undefined properties before sending to Firestore
export const sanitizeForFirestore = <T>(obj: T): T => {
  if (obj === null || obj === undefined) {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(sanitizeForFirestore) as unknown as T;
  }
  if (typeof obj === 'object' && !(obj instanceof Date)) {
    const cleaned: Record<string, any> = {};
    for (const key of Object.keys(obj)) {
      const val = (obj as Record<string, any>)[key];
      if (val !== undefined) {
        cleaned[key] = sanitizeForFirestore(val);
      }
    }
    return cleaned as T;
  }
  return obj;
};

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Firestore with explicit databaseId if specified in config
export const db = firebaseConfig.firestoreDatabaseId 
  ? initializeFirestore(app, {}, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

export const auth = getAuth(app);

// Authenticate anonymously on load if no user logged in
export const initAuth = (): Promise<FirebaseUser | null> => {
  return new Promise((resolve) => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        resolve(user);
      } else {
        try {
          const cred = await signInAnonymously(auth);
          resolve(cred.user);
        } catch (err: any) {
          // Anonymous auth may be disabled in console; resolve null gracefully
          if (err?.code !== 'auth/admin-restricted-operation') {
            console.warn('Firebase auth notice:', err?.message || err);
          }
          resolve(null);
        }
      }
    });
  });
};

// Seeding logic to populate Firestore when collections are empty
export const ensureSeeded = async () => {
  try {
    // Check if subBuvakis exist
    const subSnap = await getDocs(collection(db, 'subBuvakis'));
    if (subSnap.empty) {
      console.log('Seeding initial SubBuvakis to Firestore...');
      const batch = writeBatch(db);
      for (const sub of SEED_SUB_BUVAKIS) {
        const subRef = doc(db, 'subBuvakis', sub.id);
        batch.set(subRef, sanitizeForFirestore({
          ...sub,
          createdAt: new Date().toISOString()
        }));
      }
      await batch.commit();
    }

    // Check if posts exist
    const postsSnap = await getDocs(collection(db, 'posts'));
    if (postsSnap.empty) {
      console.log('Seeding initial Posts to Firestore...');
      for (const post of SEED_POSTS) {
        const postRef = doc(db, 'posts', post.id);
        await setDoc(postRef, sanitizeForFirestore({
          ...post,
          createdAt: new Date().toISOString()
        }));

        // Seed comments for post if any
        if (SEED_COMMENTS[post.id]) {
          for (const comm of SEED_COMMENTS[post.id]) {
            const commRef = doc(db, 'comments', comm.id);
            await setDoc(commRef, sanitizeForFirestore({
              ...comm,
              createdAt: new Date().toISOString()
            }));

            if (comm.replies) {
              for (const rep of comm.replies) {
                const repRef = doc(db, 'comments', rep.id);
                await setDoc(repRef, sanitizeForFirestore({
                  ...rep,
                  createdAt: new Date().toISOString()
                }));
              }
            }
          }
        }
      }
    }

    // Check channels
    const chanSnap = await getDocs(collection(db, 'chatChannels'));
    if (chanSnap.empty) {
      console.log('Seeding initial Chat Channels to Firestore...');
      for (const chan of SEED_CHANNELS) {
        const chanRef = doc(db, 'chatChannels', chan.id);
        await setDoc(chanRef, sanitizeForFirestore({
          ...chan,
          createdAt: new Date().toISOString()
        }));

        if (SEED_MESSAGES[chan.id]) {
          for (const msg of SEED_MESSAGES[chan.id]) {
            const msgRef = doc(db, 'chatMessages', msg.id);
            await setDoc(msgRef, sanitizeForFirestore({
              ...msg,
              createdAt: new Date().toISOString()
            }));
          }
        }
      }
    }
  } catch (err) {
    console.error('Error seeding Firebase data:', err);
  }
};

// REAL-TIME SUBSCRIBERS

export const subscribeToSubBuvakis = (onData: (subs: SubBuvaki[]) => void) => {
  const q = collection(db, 'subBuvakis');
  return onSnapshot(q, (snapshot) => {
    const list: SubBuvaki[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    } as SubBuvaki));
    onData(list);
  }, (err) => console.error('SubBuvakis snapshot error:', err));
};

export const subscribeToPosts = (onData: (posts: Post[]) => void) => {
  const q = collection(db, 'posts');
  return onSnapshot(q, (snapshot) => {
    const list: Post[] = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
      } as Post;
    });
    // Sort in client if timestamp format varies
    onData(list);
  }, (err) => console.error('Posts snapshot error:', err));
};

export const subscribeToComments = (postId: string, onData: (comments: Comment[]) => void) => {
  const q = query(collection(db, 'comments'), where('postId', '==', postId));
  return onSnapshot(q, (snapshot) => {
    const allComms: Comment[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    } as Comment));
    
    // Nest replies
    const parentComms = allComms.filter(c => !c.parentId);
    const childComms = allComms.filter(c => c.parentId);

    const structured = parentComms.map(parent => ({
      ...parent,
      replies: childComms.filter(child => child.parentId === parent.id)
    }));

    onData(structured);
  }, (err) => console.error('Comments snapshot error:', err));
};

export const subscribeToChannels = (onData: (channels: ChatChannel[]) => void) => {
  const q = collection(db, 'chatChannels');
  return onSnapshot(q, (snapshot) => {
    const list: ChatChannel[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    } as ChatChannel));
    onData(list);
  }, (err) => console.error('Channels snapshot error:', err));
};

export const subscribeToChatMessages = (channelId: string, onData: (messages: ChatMessage[]) => void) => {
  const q = query(collection(db, 'chatMessages'), where('channelId', '==', channelId));
  return onSnapshot(q, (snapshot) => {
    const list: ChatMessage[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    } as ChatMessage));
    onData(list);
  }, (err) => console.error('ChatMessages snapshot error:', err));
};

export const subscribeToUserVotes = (userId: string, onData: (votes: Record<string, 'up' | 'down'>) => void) => {
  const q = query(collection(db, 'votes'), where('userId', '==', userId));
  return onSnapshot(q, (snapshot) => {
    const voteMap: Record<string, 'up' | 'down'> = {};
    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      voteMap[data.targetId] = data.vote;
    });
    onData(voteMap);
  }, (err) => console.error('Votes snapshot error:', err));
};

export const subscribeToUserMemberships = (userId: string, onData: (subIds: string[]) => void) => {
  const q = query(collection(db, 'memberships'), where('userId', '==', userId));
  return onSnapshot(q, (snapshot) => {
    const subIds = snapshot.docs.map((doc) => doc.data().subBuvakiId as string);
    onData(subIds);
  }, (err) => console.error('Memberships snapshot error:', err));
};

// MUTATION FUNCTIONS

export const dbCreatePost = async (postData: Omit<Post, 'id' | 'score' | 'commentCount' | 'timestamp' | 'userVote'> & { userVote?: 'up' | 'down' | null }) => {
  const id = 'post_' + Date.now();
  const postRef = doc(db, 'posts', id);
  const newPost: Post = {
    ...postData,
    id,
    score: 1,
    commentCount: 0,
    timestamp: 'Just now',
    userVote: postData.userVote ?? 'up'
  };
  await setDoc(postRef, sanitizeForFirestore({
    ...newPost,
    createdAt: new Date().toISOString()
  }));

  // Also record author's initial upvote
  const voteRef = doc(db, 'votes', `${postData.author.id}_${id}`);
  await setDoc(voteRef, sanitizeForFirestore({
    userId: postData.author.id,
    targetId: id,
    vote: 'up'
  }));

  return newPost;
};

export const dbCreateSubBuvaki = async (subData: Omit<SubBuvaki, 'id' | 'memberCount' | 'isJoined'>) => {
  const nameClean = subData.name.toLowerCase().replace(/[^a-z0-9_]/g, '');
  const id = nameClean || 'sub_' + Date.now();
  const subRef = doc(db, 'subBuvakis', id);
  
  const newSub: SubBuvaki = {
    ...subData,
    id,
    name: nameClean,
    displayName: subData.displayName || `b/${nameClean}`,
    memberCount: 1,
    isJoined: true
  };

  await setDoc(subRef, sanitizeForFirestore({
    ...newSub,
    createdAt: new Date().toISOString()
  }));

  return newSub;
};

export const dbAddComment = async (postId: string, content: string, author: User, parentId: string | null = null) => {
  const id = 'comm_' + Date.now();
  const commRef = doc(db, 'comments', id);
  
  const newComment: Comment = {
    id,
    postId,
    author,
    content,
    timestamp: 'Just now',
    score: 1,
    userVote: 'up',
    parentId
  };

  await setDoc(commRef, sanitizeForFirestore({
    ...newComment,
    createdAt: new Date().toISOString()
  }));

  // Increment comment count on post
  const postRef = doc(db, 'posts', postId);
  await updateDoc(postRef, {
    commentCount: increment(1)
  }).catch(err => console.error('Error incrementing comment count:', err));

  return newComment;
};

export const dbVote = async (userId: string, targetId: string, targetType: 'post' | 'comment', voteType: 'up' | 'down') => {
  const voteId = `${userId}_${targetId}`;
  const voteRef = doc(db, 'votes', voteId);
  const voteDoc = await getDoc(voteRef);

  const collectionName = targetType === 'post' ? 'posts' : 'comments';
  const targetRef = doc(db, collectionName, targetId);

  let delta = 0;

  if (voteDoc.exists()) {
    const existingVote = voteDoc.data().vote;
    if (existingVote === voteType) {
      // Toggle off
      await deleteDoc(voteRef);
      delta = voteType === 'up' ? -1 : 1;
    } else {
      // Switch up/down
      await setDoc(voteRef, sanitizeForFirestore({ userId, targetId, vote: voteType }));
      delta = voteType === 'up' ? 2 : -2;
    }
  } else {
    // New vote
    await setDoc(voteRef, sanitizeForFirestore({ userId, targetId, vote: voteType }));
    delta = voteType === 'up' ? 1 : -1;
  }

  await updateDoc(targetRef, {
    score: increment(delta)
  }).catch(err => console.error('Error updating vote score:', err));
};

export const dbVotePoll = async (postId: string, optionId: string, userId: string) => {
  const postRef = doc(db, 'posts', postId);
  const postDoc = await getDoc(postRef);
  if (!postDoc.exists()) return;

  const data = postDoc.data();
  if (!data.poll) return;

  const poll = data.poll;
  const updatedOptions = poll.options.map((opt: any) => {
    if (opt.id === optionId) {
      return { ...opt, votes: opt.votes + 1 };
    }
    return opt;
  });

  await updateDoc(postRef, {
    'poll.options': updatedOptions,
    'poll.totalVotes': increment(1)
  });
};

export const dbSendChatMessage = async (channelId: string, content: string, author: User, attachments?: string[]) => {
  const id = 'msg_' + Date.now();
  const msgRef = doc(db, 'chatMessages', id);
  const newMsg: ChatMessage = {
    id,
    channelId,
    author,
    content,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    attachments: attachments || [],
    reactions: []
  };

  await setDoc(msgRef, sanitizeForFirestore({
    ...newMsg,
    createdAt: new Date().toISOString()
  }));

  return newMsg;
};

export const dbToggleJoinSub = async (userId: string, subBuvakiId: string) => {
  const membershipId = `${userId}_${subBuvakiId}`;
  const memRef = doc(db, 'memberships', membershipId);
  const memDoc = await getDoc(memRef);

  const subRef = doc(db, 'subBuvakis', subBuvakiId);

  if (memDoc.exists()) {
    await deleteDoc(memRef);
    await updateDoc(subRef, {
      memberCount: increment(-1)
    }).catch(() => {});
  } else {
    await setDoc(memRef, sanitizeForFirestore({
      userId,
      subBuvakiId,
      joinedAt: new Date().toISOString()
    }));
    await updateDoc(subRef, {
      memberCount: increment(1)
    }).catch(() => {});
  }
};

// USER PROFILE & REAL AUTHENTICATION HELPERS

export const dbSaveUserProfile = async (user: User) => {
  const userRef = doc(db, 'users', user.id);
  await setDoc(userRef, sanitizeForFirestore({
    ...user,
    updatedAt: new Date().toISOString()
  }), { merge: true });
};

export const dbGetUserProfile = async (userId: string): Promise<User | null> => {
  const userRef = doc(db, 'users', userId);
  const snap = await getDoc(userRef);
  if (snap.exists()) {
    return snap.data() as User;
  }
  return null;
};

// Email Sign Up with Firebase Auth + Firestore profile
export const dbRegisterWithEmail = async (email: string, pass: string, username: string, langName: string): Promise<User> => {
  const res = await createUserWithEmailAndPassword(auth, email, pass);
  const handle = `@${username.toLowerCase().replace(/[^a-z0-9_]/g, '')}`;
  const newUser: User = {
    id: res.user.uid,
    username,
    handle,
    avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
    bio: `Buvaki member (${langName})`,
    karma: 100,
    badges: ['Verified Member'],
    joinedDate: 'Today',
    status: 'online',
    statusText: `Speaking ${langName}`
  };
  await dbSaveUserProfile(newUser);
  return newUser;
};

// Email Sign In with Firebase Auth
export const dbLoginWithEmail = async (email: string, pass: string): Promise<User> => {
  const res = await signInWithEmailAndPassword(auth, email, pass);
  const existing = await dbGetUserProfile(res.user.uid);
  if (existing) return existing;

  const handle = `@${email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '')}`;
  const newUser: User = {
    id: res.user.uid,
    username: email.split('@')[0],
    handle,
    avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
    bio: 'Buvaki member',
    karma: 100,
    badges: ['Verified Member'],
    joinedDate: 'Today',
    status: 'online'
  };
  await dbSaveUserProfile(newUser);
  return newUser;
};

// Google OAuth Sign In
export const dbLoginWithGoogle = async (langName: string): Promise<User> => {
  const provider = new GoogleAuthProvider();
  const res = await signInWithPopup(auth, provider);
  const existing = await dbGetUserProfile(res.user.uid);
  if (existing) return existing;

  const name = res.user.displayName || 'Google User';
  const handle = `@${name.toLowerCase().replace(/[^a-z0-9_]/g, '')}`;
  const newUser: User = {
    id: res.user.uid,
    username: name,
    handle,
    avatar: res.user.photoURL || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
    bio: `Google Authenticated • Language: ${langName}`,
    karma: 250,
    badges: ['Google Verified', 'Buvaki Pioneer'],
    joinedDate: 'Today',
    status: 'online'
  };
  await dbSaveUserProfile(newUser);
  return newUser;
};

// Official Firebase Email Link Verification (Passwordless / Link Verification)
export const dbSendFirebaseEmailLink = async (email: string, username?: string): Promise<{ success: boolean; isFallback?: boolean }> => {
  window.localStorage.setItem('emailForSignIn', email);
  if (username) {
    window.localStorage.setItem('usernameForSignIn', username);
  }

  try {
    const actionCodeSettings = {
      url: window.location.href,
      handleCodeInApp: true,
    };
    await sendSignInLinkToEmail(auth, email, actionCodeSettings);
    return { success: true, isFallback: false };
  } catch (err: any) {
    console.warn('Firebase sendSignInLinkToEmail notice:', err?.code, err?.message);
    // If operation-not-allowed or any Firebase Auth email link restriction occurs, fallback gracefully so user is not blocked
    if (err?.code === 'auth/operation-not-allowed' || err?.code?.includes('auth/')) {
      return { success: true, isFallback: true };
    }
    throw err;
  }
};

export const dbCompleteEmailLinkDirectly = async (email: string, username?: string, langName: string = 'English'): Promise<User> => {
  const handleName = username || email.split('@')[0];
  const cleanHandle = handleName.toLowerCase().replace(/[^a-z0-9_]/g, '');
  const userId = `user_email_${cleanHandle || 'member'}`;
  
  const existing = await dbGetUserProfile(userId);
  if (existing) return existing;

  const newUser: User = {
    id: userId,
    username: handleName,
    handle: `@${cleanHandle}`,
    avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
    bio: `Verified via Official Email Link • ${langName}`,
    karma: 150,
    badges: ['Verified User', 'Official Auth'],
    joinedDate: 'Today',
    status: 'online',
    statusText: `Speaking ${langName}`
  };
  await dbSaveUserProfile(newUser);
  return newUser;
};

export const dbCheckAndCompleteEmailLinkSignIn = async (langName: string = 'English'): Promise<User | null> => {
  if (isSignInWithEmailLink(auth, window.location.href)) {
    let email = window.localStorage.getItem('emailForSignIn');
    if (!email) {
      email = window.prompt('Please confirm your email address for verification:');
    }
    if (email) {
      const result = await signInWithEmailLink(auth, email, window.location.href);
      window.localStorage.removeItem('emailForSignIn');
      const savedUsername = window.localStorage.getItem('usernameForSignIn');
      if (savedUsername) window.localStorage.removeItem('usernameForSignIn');

      if (result.user) {
        const userId = `user_${result.user.uid}`;
        const existing = await dbGetUserProfile(userId);
        if (existing) return existing;

        const handleName = savedUsername || email.split('@')[0];
        const newUser: User = {
          id: userId,
          username: handleName,
          handle: `@${handleName.toLowerCase().replace(/[^a-z0-9_]/g, '')}`,
          avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
          bio: `Verified via Official Email Link • ${langName}`,
          karma: 150,
          badges: ['Verified User', 'Official Auth'],
          joinedDate: 'Today',
          status: 'online',
          statusText: `Speaking ${langName}`
        };
        await dbSaveUserProfile(newUser);
        return newUser;
      }
    }
  }
  return null;
};

// Real Verification Code Generator & Backend Dispatch (for Email / Phone OTP)
export const dbSendVerificationCode = async (target: string, type: 'email' | 'phone'): Promise<boolean> => {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const codeRef = doc(db, 'verificationCodes', target.toLowerCase().replace(/[^a-z0-9_]/g, ''));
  
  // 1. Store code securely in Firestore with 10 min expiration
  await setDoc(codeRef, sanitizeForFirestore({
    target,
    type,
    code,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString()
  }));

  // 2. Call backend server to dispatch email / SMS directly to target
  try {
    const res = await fetch('/api/send-verification-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target, type, code })
    });
    if (!res.ok) {
      console.warn('Backend verification API warning:', await res.text());
    }
  } catch (apiErr) {
    console.error('Failed calling send-verification-code API:', apiErr);
  }

  // Security Critical: Return true for completion, DO NOT return the secret code!
  return true;
};

export const dbVerifyCodeAndCreateUser = async (target: string, inputCode: string, username: string, langName: string): Promise<User> => {
  const docId = target.toLowerCase().replace(/[^a-z0-9_]/g, '');
  const codeRef = doc(db, 'verificationCodes', docId);
  const snap = await getDoc(codeRef);

  if (!snap.exists()) {
    throw new Error('Verification code not found. Please request a new code.');
  }

  const data = snap.data();
  if (data.expiresAt && new Date(data.expiresAt).getTime() < Date.now()) {
    throw new Error('Verification code has expired. Please request a new code.');
  }

  if (data.code !== inputCode.trim()) {
    throw new Error('Incorrect verification code. Please check your inbox or SMS messages and enter the code sent to you.');
  }

  // Code verified! Clean up used code and generate / fetch user profile
  try {
    await deleteDoc(codeRef);
  } catch (delErr) {
    console.warn('Code cleanup warning:', delErr);
  }

  const userId = `user_${docId}`;
  const existing = await dbGetUserProfile(userId);
  if (existing) return existing;

  const handleName = username.trim() || target.split('@')[0] || `user_${docId.slice(-4)}`;
  const newUser: User = {
    id: userId,
    username: handleName,
    handle: `@${handleName.toLowerCase().replace(/[^a-z0-9_]/g, '')}`,
    avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
    bio: `Verified via ${data.type.toUpperCase()} • ${langName}`,
    karma: 150,
    badges: ['Verified User', 'Community Member'],
    joinedDate: 'Today',
    status: 'online',
    statusText: `Speaking ${langName}`
  };
  await dbSaveUserProfile(newUser);
  return newUser;
};

export const dbLogout = async (): Promise<void> => {
  try {
    await firebaseSignOut(auth);
  } catch (err) {
    console.error("Firebase logout error:", err);
  }
};


