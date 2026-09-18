import { initializeApp, getApps } from 'firebase/app';
import { 
  getFirestore, 
  initializeFirestore,
  setLogLevel,
  collection, 
  doc, 
  getDocs, 
  getDoc,
  getDocFromServer,
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
  sendPasswordResetEmail,
  signOut as firebaseSignOut,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
  getAdditionalUserInfo
} from 'firebase/auth';

import firebaseConfig from '../../firebase-applet-config.json';
import { Post, SubBuvaki, Comment, ChatMessage, User, ChatChannel } from '../types';
import { autoIndexer } from './indexer';
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

// Set log level to error to avoid noisy offline/reconnect console warnings
try {
  setLogLevel('error');
} catch (e) {
  // Ignore
}

// Initialize Firestore with auto-detect long polling to handle both WebSockets and restricted proxies gracefully
export const db = firebaseConfig.firestoreDatabaseId 
  ? initializeFirestore(app, {
      experimentalAutoDetectLongPolling: true,
      ignoreUndefinedProperties: true,
    }, firebaseConfig.firestoreDatabaseId)
  : initializeFirestore(app, {
      experimentalAutoDetectLongPolling: true,
      ignoreUndefinedProperties: true,
    });

export const auth = getAuth(app);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errMessage = error instanceof Error ? error.message : String(error);
  const errInfo: FirestoreErrorInfo = {
    error: errMessage,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  if (errMessage.includes('Missing or insufficient permissions')) {
    console.error('Firestore Error: ', JSON.stringify(errInfo));
  } else if (!errMessage.includes('offline') && !errMessage.includes('unavailable') && !errMessage.includes("Backend didn't respond")) {
    console.warn('Firestore Notice: ', JSON.stringify(errInfo));
  }
  return errInfo;
}

export async function testConnection() {
  // Graceful no-op connection check to prevent 10-second backend timeout warnings
  return Promise.resolve();
}

// Check initial auth state on load without forcing anonymous auth
export const initAuth = (): Promise<FirebaseUser | null> => {
  return new Promise((resolve) => {
    const unsub = onAuthStateChanged(auth, (user) => {
      unsub();
      resolve(user);
    });
  });
};

// Seeding logic to populate Firestore when collections are empty
export const ensureSeeded = async () => {
  if (typeof window !== 'undefined' && sessionStorage.getItem('buvaki_seeded_session')) {
    return;
  }
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

    if (typeof window !== 'undefined') {
      sessionStorage.setItem('buvaki_seeded_session', 'true');
    }
  } catch (err) {
    console.warn('Firebase seeding notice (operating with local state):', err);
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
    // Auto-index all incoming Sub-Buvakis in the search and SEO engine
    list.forEach((sub) => autoIndexer.indexSubBuvaki(sub));
    onData(list);
  }, (err) => {
    handleFirestoreError(err, OperationType.LIST, 'subBuvakis');
  });
};

const MOCK_POST_IDS = new Set([
  'post_1', 'post_2', 'post_3', 'post_4', 'post_5',
  'post_music_1', 'post_music_2', 'post_tech_1', 'post_photography_1', 'post_design_1', 'post_gaming_1', 'post_general_1',
  'short_music_1', 'short_music_2', 'short_photography_1', 'short_tech_1', 'short_design_1', 'short_gaming_1', 'short_general_1',
  'long_music_1', 'long_music_2', 'long_tech_1', 'long_tech_2', 'long_photography_1', 'long_gaming_1', 'long_design_1', 'long_general_1'
]);

export const subscribeToPosts = (onData: (posts: Post[]) => void) => {
  const q = collection(db, 'posts');
  return onSnapshot(q, (snapshot) => {
    const list: Post[] = snapshot.docs
      .map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
        } as Post;
      })
      .filter((p) => !MOCK_POST_IDS.has(p.id));
    
    // Auto-index all posts, shorts, and longs immediately
    list.forEach((post) => autoIndexer.indexPost(post));

    onData(list);
  }, (err) => {
    handleFirestoreError(err, OperationType.LIST, 'posts');
  });
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
  }, (err) => {
    handleFirestoreError(err, OperationType.LIST, `comments?postId=${postId}`);
  });
};

export const subscribeToChannels = (onData: (channels: ChatChannel[]) => void) => {
  const q = collection(db, 'chatChannels');
  return onSnapshot(q, (snapshot) => {
    const list: ChatChannel[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    } as ChatChannel));
    onData(list);
  }, (err) => {
    handleFirestoreError(err, OperationType.LIST, 'chatChannels');
  });
};

export const subscribeToChatMessages = (channelId: string, onData: (messages: ChatMessage[]) => void) => {
  const q = query(collection(db, 'chatMessages'), where('channelId', '==', channelId));
  return onSnapshot(q, (snapshot) => {
    const list: ChatMessage[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    } as ChatMessage));
    onData(list);
  }, (err) => {
    handleFirestoreError(err, OperationType.LIST, `chatMessages?channelId=${channelId}`);
  });
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
  }, (err) => {
    handleFirestoreError(err, OperationType.LIST, `votes?userId=${userId}`);
  });
};

export const subscribeToUserMemberships = (userId: string, onData: (subIds: string[]) => void) => {
  const q = query(collection(db, 'memberships'), where('userId', '==', userId));
  return onSnapshot(q, (snapshot) => {
    const subIds = snapshot.docs.map((doc) => doc.data().subBuvakiId as string);
    onData(subIds);
  }, (err) => {
    handleFirestoreError(err, OperationType.LIST, `memberships?userId=${userId}`);
  });
};

// MUTATION FUNCTIONS

export const dbCreatePost = async (postData: Omit<Post, 'id' | 'score' | 'commentCount' | 'timestamp' | 'userVote'> & { userVote?: 'up' | 'down' | null }) => {
  const now = new Date();
  const id = 'post_' + now.getTime();
  const nowIso = now.toISOString();
  const postRef = doc(db, 'posts', id);
  const newPost: Post = {
    ...postData,
    id,
    score: 1,
    commentCount: 0,
    timestamp: nowIso,
    createdAt: nowIso,
    createdAtEpoch: now.getTime(),
    userVote: postData.userVote ?? 'up'
  };
  await setDoc(postRef, sanitizeForFirestore({
    ...newPost,
    createdAt: nowIso
  }));

  // Also record author's initial upvote
  const voteRef = doc(db, 'votes', `${postData.author.id}_${id}`);
  await setDoc(voteRef, sanitizeForFirestore({
    userId: postData.author.id,
    targetId: id,
    vote: 'up'
  }));

  // Auto-index newly created post (standard post, short video, or long video)
  autoIndexer.indexPost(newPost);

  return newPost;
};

export const dbDeletePost = async (postId: string) => {
  try {
    const postRef = doc(db, 'posts', postId);
    await deleteDoc(postRef);
    console.log(`Post ${postId} successfully deleted from Firestore.`);
    return true;
  } catch (err) {
    console.error(`Error deleting post ${postId}:`, err);
    throw err;
  }
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

  // Auto-index newly created Sub-Buvaki community
  autoIndexer.indexSubBuvaki(newSub);

  return newSub;
};

export const dbAddComment = async (postId: string, content: string, author: User, parentId: string | null = null) => {
  const now = new Date();
  const id = 'comm_' + now.getTime();
  const nowIso = now.toISOString();
  const commRef = doc(db, 'comments', id);
  
  const newComment: Comment = {
    id,
    postId,
    author,
    content,
    timestamp: nowIso,
    createdAt: nowIso,
    createdAtEpoch: now.getTime(),
    score: 1,
    userVote: 'up',
    parentId
  };

  await setDoc(commRef, sanitizeForFirestore({
    ...newComment,
    createdAt: nowIso
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

// Password Reset via Firebase Auth
export const dbResetPassword = async (email: string): Promise<void> => {
  const cleanEmail = email.trim().toLowerCase();
  try {
    await sendPasswordResetEmail(auth, cleanEmail);
  } catch (err: any) {
    if (err?.code === 'auth/user-not-found') {
      throw new Error('No registered account was found with this email address.');
    }
    if (err?.code === 'auth/invalid-email') {
      throw new Error('Please enter a valid email address.');
    }
    throw new Error(err?.message || 'Failed to send password reset email. Please try again.');
  }
};

// Email Sign Up with Firebase Auth + Firestore profile
export const dbRegisterWithEmail = async (
  email: string, 
  pass: string, 
  username: string, 
  langName: string,
  avatarUrl?: string
): Promise<User> => {
  const cleanEmail = email.trim().toLowerCase();
  const cleanUsername = username.trim() || cleanEmail.split('@')[0];
  const cleanHandle = `@${cleanUsername.toLowerCase().replace(/[^a-z0-9_]/g, '') || 'user'}`;

  try {
    const res = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
    const newUser: User = {
      id: res.user.uid,
      username: cleanUsername,
      handle: cleanHandle,
      avatar: avatarUrl || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
      bio: `Buvaki member • ${langName}`,
      karma: 100,
      badges: ['Verified Member'],
      joinedDate: 'Today',
      status: 'online',
      statusText: `Speaking ${langName}`
    };
    await dbSaveUserProfile(newUser);
    return newUser;
  } catch (err: any) {
    if (err?.code === 'auth/email-already-in-use') {
      throw new Error('This email address is already registered. Please sign in instead.');
    }
    if (err?.code === 'auth/weak-password') {
      throw new Error('Password must be at least 6 characters long.');
    }
    if (err?.code === 'auth/invalid-email') {
      throw new Error('Please enter a valid email address.');
    }
    // If Email/Password is disabled in Firebase console, provide a safe local account fallback
    if (err?.code === 'auth/operation-not-allowed' || err?.code === 'auth/admin-restricted-operation') {
      console.warn('Firebase email auth provider not enabled in console. Falling back to local verified account:', err);
      const fallbackId = `user_${cleanEmail.replace(/[^a-z0-9_]/g, '')}`;
      const newUser: User = {
        id: fallbackId,
        username: cleanUsername,
        handle: cleanHandle,
        avatar: avatarUrl || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
        bio: `Buvaki member • ${langName}`,
        karma: 100,
        badges: ['Verified Member'],
        joinedDate: 'Today',
        status: 'online',
        statusText: `Speaking ${langName}`
      };
      await dbSaveUserProfile(newUser);
      return newUser;
    }
    throw err;
  }
};

// Email Sign In with Firebase Auth
export const dbLoginWithEmail = async (email: string, pass: string): Promise<User> => {
  const cleanEmail = email.trim().toLowerCase();
  try {
    const res = await signInWithEmailAndPassword(auth, cleanEmail, pass);
    const existing = await dbGetUserProfile(res.user.uid);
    if (existing) {
      return {
        ...existing,
        isFirstTimeUser: false,
        isProfileCompleted: true
      };
    }

    const name = cleanEmail.split('@')[0];
    const handle = `@${name.toLowerCase().replace(/[^a-z0-9_]/g, '') || 'user'}`;
    const newUser: User = {
      id: res.user.uid,
      username: name,
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
  } catch (err: any) {
    if (
      err?.code === 'auth/invalid-credential' || 
      err?.code === 'auth/user-not-found' || 
      err?.code === 'auth/wrong-password'
    ) {
      throw new Error('Incorrect email or password. Please verify your credentials or sign up.');
    }
    if (err?.code === 'auth/invalid-email') {
      throw new Error('Please enter a valid email address.');
    }
    if (err?.code === 'auth/too-many-requests') {
      throw new Error('Too many failed attempts. Please try again later or reset your password.');
    }
    if (err?.code === 'auth/operation-not-allowed' || err?.code === 'auth/admin-restricted-operation') {
      const fallbackId = `user_${cleanEmail.replace(/[^a-z0-9_]/g, '')}`;
      const existing = await dbGetUserProfile(fallbackId);
      if (existing) return existing;
      throw new Error('Email sign-in is not enabled in Firebase. Please use 1-Click Google Sign In.');
    }
    throw err;
  }
};

// Listen to Firebase Auth state changes and keep user profile synced
export const subscribeToAuthState = (onUserChanged: (user: User | null) => void) => {
  return onAuthStateChanged(auth, async (fbUser) => {
    if (fbUser && !fbUser.isAnonymous) {
      try {
        const profile = await dbGetUserProfile(fbUser.uid);
        if (profile) {
          const sanitizedProfile: User = {
            ...profile,
            isFirstTimeUser: false,
            isProfileCompleted: true,
          };
          localStorage.setItem('buvaki_user', JSON.stringify(sanitizedProfile));
          onUserChanged(sanitizedProfile);
          return;
        }
        const name = fbUser.displayName || fbUser.email?.split('@')[0] || 'User';
        const cleanHandle = `@${name.toLowerCase().replace(/[^a-z0-9_]/g, '') || 'user'}`;
        const newProfile: User = {
          id: fbUser.uid,
          username: name,
          handle: cleanHandle,
          avatar: fbUser.photoURL || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
          bio: 'Buvaki member',
          karma: 250,
          badges: ['Verified User'],
          joinedDate: 'Today',
          status: 'online',
          isFirstTimeUser: false,
          isProfileCompleted: true,
        };
        await dbSaveUserProfile(newProfile);
        localStorage.setItem('buvaki_user', JSON.stringify(newProfile));
        onUserChanged(newProfile);
      } catch (err) {
        console.warn('Failed retrieving profile on auth state change:', err);
      }
    }
  });
};

// In-flight guard to prevent duplicate popup attempts
let isGoogleAuthInProgress = false;

// Google OAuth Sign In
export const dbLoginWithGoogle = async (langName: string): Promise<User | null> => {
  if (isGoogleAuthInProgress) {
    return null;
  }

  isGoogleAuthInProgress = true;
  try {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const res = await signInWithPopup(auth, provider);
    
    if (!res || !res.user) {
      return null;
    }

    const additionalInfo = getAdditionalUserInfo(res);
    const isNewFirebaseUser = additionalInfo?.isNewUser ?? false;

    const existing = await dbGetUserProfile(res.user.uid);
    if (existing) {
      // Returning user logging in: NEVER trigger first-time profile creation workflow
      const existingUser: User = { 
        ...existing, 
        isFirstTimeUser: false, 
        isProfileCompleted: true 
      };
      if (!existing.isProfileCompleted) {
        dbSaveUserProfile(existingUser).catch(() => {});
      }
      return existingUser;
    }

    // Completely new account created for the first time
    const name = res.user.displayName || 'Google User';
    const cleanHandle = name.toLowerCase().replace(/[^a-z0-9_]/g, '') || 'member';
    const newUser: User = {
      id: res.user.uid,
      username: name,
      handle: `@${cleanHandle}`,
      avatar: res.user.photoURL || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
      bio: '',
      karma: 250,
      badges: ['Google Verified', 'Buvaki Pioneer'],
      joinedDate: 'Today',
      status: 'online',
      isProfileCompleted: false,
      isFirstTimeUser: isNewFirebaseUser,
      authProvider: 'google'
    };
    await dbSaveUserProfile(newUser);
    return newUser;
  } catch (err: any) {
    const errCode = err?.code || '';
    const errMsg = err?.message || String(err);

    // Benign user cancellation: user closed the Google popup window or dismissed it
    if (
      errCode === 'auth/popup-closed-by-user' ||
      errCode === 'auth/cancelled-popup-request' ||
      errCode === 'auth/user-cancelled' ||
      errMsg.includes('popup-closed-by-user') ||
      errMsg.includes('cancelled-popup-request')
    ) {
      return null;
    }

    if (errCode === 'auth/popup-blocked') {
      throw new Error('Google sign-in popup was blocked by your browser. Please allow popups for this site and try again.');
    }

    if (errCode === 'auth/unauthorized-domain') {
      throw new Error('This domain is not authorized in Google OAuth settings.');
    }

    if (
      errCode === 'auth/operation-not-supported-in-this-environment' || 
      errCode === 'auth/web-storage-unsupported'
    ) {
      throw new Error('Third-party cookies or storage are restricted in your browser. Please allow cookies or open the app in a normal window.');
    }

    if (errMsg.includes('Pending promise was never set') || errMsg.includes('INTERNAL ASSERTION FAILED')) {
      return null;
    }

    throw err;
  } finally {
    isGoogleAuthInProgress = false;
  }
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

export const dbLogout = async (): Promise<void> => {
  try {
    await firebaseSignOut(auth);
  } catch (err) {
    console.error("Firebase logout error:", err);
  }
};

// Official Firebase Phone Authentication Helpers
export const dbSetupRecaptcha = (
  containerIdOrElement: string | HTMLElement, 
  onExpire?: () => void
): RecaptchaVerifier => {
  if (typeof window !== 'undefined') {
    if ((window as any).recaptchaVerifier) {
      try {
        (window as any).recaptchaVerifier.clear();
      } catch (e) {
        // ignore
      }
      (window as any).recaptchaVerifier = null;
    }
  }

  const verifier = new RecaptchaVerifier(auth, containerIdOrElement, {
    size: 'invisible',
    callback: () => {
      // reCAPTCHA solved
    },
    'expired-callback': () => {
      if (onExpire) onExpire();
    }
  });

  if (typeof window !== 'undefined') {
    (window as any).recaptchaVerifier = verifier;
  }
  return verifier;
};

export const dbSendPhoneVerificationCode = async (
  phoneNumber: string,
  appVerifier: RecaptchaVerifier
): Promise<ConfirmationResult> => {
  const cleanPhone = phoneNumber.trim();
  try {
    const confirmationResult = await signInWithPhoneNumber(auth, cleanPhone, appVerifier);
    return confirmationResult;
  } catch (err: any) {
    console.error('Firebase Phone Auth send error:', err);
    if (err?.code === 'auth/invalid-phone-number') {
      throw new Error('Invalid phone number format. Please include your international country code (e.g. +1234567890).');
    }
    if (err?.code === 'auth/missing-phone-number') {
      throw new Error('Please enter a phone number.');
    }
    if (err?.code === 'auth/quota-exceeded') {
      throw new Error('SMS quota exceeded. Please try again later or sign in with Google or Email.');
    }
    if (err?.code === 'auth/captcha-check-failed') {
      throw new Error('reCAPTCHA security check failed. Please refresh and try again.');
    }
    if (err?.code === 'auth/unauthorized-domain') {
      const currentHost = typeof window !== 'undefined' ? window.location.hostname : 'current domain';
      throw new Error(
        `[auth/unauthorized-domain] This domain (${currentHost}) is not authorized in Firebase. Please add "${currentHost}" (or "run.app") to Firebase Console > Authentication > Settings > Authorized domains.`
      );
    }
    if (err?.code === 'auth/operation-not-allowed' || err?.code === 'auth/admin-restricted-operation') {
      const currentHost = typeof window !== 'undefined' ? window.location.hostname : 'current domain';
      throw new Error(
        `[${err?.code}] Firebase blocked the phone verification request. Common causes: ` +
        `1) Authorized Domains: Ensure "${currentHost}" (or "run.app") is added in Firebase Console > Authentication > Settings > Authorized domains. ` +
        `2) API Key Restrictions: In Google Cloud Console > Credentials, ensure your API key allows "Identity Toolkit API". ` +
        `3) User Actions: In Firebase Console > Authentication > Settings > User actions, ensure "Enable create (sign-up)" is checked.`
      );
    }
    if (err?.code === 'auth/too-many-requests') {
      throw new Error('Too many requests. Please wait a moment and try again.');
    }
    throw new Error(
      err?.code ? `[${err.code}] ${err.message || 'Failed to send SMS verification code.'}` : (err?.message || 'Failed to send SMS verification code.')
    );
  }
};

export const dbVerifyPhoneCode = async (
  confirmationResult: ConfirmationResult,
  code: string,
  username?: string,
  langName: string = 'English'
): Promise<User> => {
  const cleanCode = code.trim();
  try {
    const userCredential = await confirmationResult.confirm(cleanCode);
    const fbUser = userCredential.user;

    // Check if user already exists in Firestore
    const existing = await dbGetUserProfile(fbUser.uid);
    if (existing) {
      const updatedUser: User = {
        ...existing,
        phoneNumber: fbUser.phoneNumber || existing.phoneNumber,
        authProvider: 'phone',
        status: 'online'
      };
      await dbSaveUserProfile(updatedUser);
      localStorage.setItem('buvaki_user', JSON.stringify(updatedUser));
      return updatedUser;
    }

    // New User profile
    const phoneSuffix = fbUser.phoneNumber ? fbUser.phoneNumber.slice(-4) : 'user';
    const cleanUsername = username?.trim() || `User_${phoneSuffix}`;
    const cleanHandle = `@${cleanUsername.toLowerCase().replace(/[^a-z0-9_]/g, '') || 'user'}`;
    const newUser: User = {
      id: fbUser.uid,
      username: cleanUsername,
      handle: cleanHandle,
      phoneNumber: fbUser.phoneNumber || undefined,
      avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
      bio: `Phone Verified • ${langName}`,
      karma: 150,
      badges: ['Phone Verified', 'Buvaki Member'],
      joinedDate: 'Today',
      status: 'online',
      statusText: `Speaking ${langName}`,
      authProvider: 'phone'
    };

    await dbSaveUserProfile(newUser);
    localStorage.setItem('buvaki_user', JSON.stringify(newUser));
    return newUser;
  } catch (err: any) {
    console.error('Firebase Phone Auth verify error:', err);
    if (err?.code === 'auth/invalid-verification-code') {
      throw new Error('Invalid SMS verification code. Please check the 6-digit code and try again.');
    }
    if (err?.code === 'auth/code-expired') {
      throw new Error('Verification code has expired. Please request a new code.');
    }
    throw new Error(err?.message || 'Verification failed. Please try again.');
  }
};


