import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  sendPasswordResetEmail 
} from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export async function loginWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    console.error("Google Sign-In error:", error);
    if (error.code === 'auth/popup-blocked') {
      throw new Error("Sign-in popup was blocked. Please enable popups in your browser and try again.");
    }
    throw error;
  }
}

export async function signUpWithEmail(email: string, password: string) {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error: any) {
    console.error("Email sign-up error:", error);
    if (error.code === 'auth/email-already-in-use') {
      throw new Error("This email is already registered. Please login instead.");
    } else if (error.code === 'auth/weak-password') {
      throw new Error("Password is too weak. Please use at least 6 characters.");
    } else if (error.code === 'auth/invalid-email') {
      throw new Error("Invalid email address format.");
    }
    throw error;
  }
}

export async function loginWithEmail(email: string, password: string) {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error: any) {
    console.error("Email sign-in error:", error);
    if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
      throw new Error("Incorrect email or password. Please verify your credentials.");
    } else if (error.code === 'auth/invalid-email') {
      throw new Error("Invalid email address format.");
    }
    throw error;
  }
}

export async function forgotPassword(email: string) {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
    console.error("Forgot password error:", error);
    if (error.code === 'auth/user-not-found') {
      throw new Error("No user found with this email address.");
    } else if (error.code === 'auth/invalid-email') {
      throw new Error("Invalid email address format.");
    }
    throw error;
  }
}

export async function logoutUser() {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Sign-out error:", error);
    throw error;
  }
}

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
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
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
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// "Validate Connection to Firestore" - CRITICAL CONSTRAINT: when initialized, call getFromServer
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration. Client is offline.");
    }
  }
}

testConnection();
