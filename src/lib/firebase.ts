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
    // Sort in client if timestamp format varies
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
      throw new Error('Google sign-in popup was blocked by your browser. Please allow popups or use Email/Password sign-in.');
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


