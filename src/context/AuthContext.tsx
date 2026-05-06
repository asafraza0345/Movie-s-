import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User, signInWithPopup, signOut } from "firebase/auth";
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import { auth, db, googleProvider } from "../firebase";
import { UserProfile } from "../types";

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

interface AuthContextType {
  user: UserProfile | null;
  firebaseUser: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateWatchlist: (movieId: string, action: "add" | "remove") => Promise<void>;
  togglePremium: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (fUser) => {
      setFirebaseUser(fUser);
      if (fUser) {
        // Sync with Firestore
        const path = `users/${fUser.uid}`;
        const userDocRef = doc(db, "users", fUser.uid);
        let userDoc;
        try {
          userDoc = await getDoc(userDocRef);
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, path);
          return;
        }

        if (!userDoc.exists()) {
          const newUser: UserProfile = {
            uid: fUser.uid,
            email: fUser.email || "",
            displayName: fUser.displayName || "Anonymous",
            photoURL: fUser.photoURL || "",
            isPremium: false,
            watchlist: [],
            createdAt: new Date().toISOString(),
          };
          try {
            await setDoc(userDocRef, newUser);
          } catch (error) {
            handleFirestoreError(error, OperationType.WRITE, path);
          }
          setUser(newUser);
        } else {
          // Listen for real-time updates
          const unsubDoc = onSnapshot(userDocRef, (doc) => {
            if (doc.exists()) {
              setUser(doc.data() as UserProfile);
            }
          }, (error) => {
             handleFirestoreError(error, OperationType.GET, path);
          });
          return () => unsubDoc();
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribeAuth();
  }, []);

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const updateWatchlist = async (movieId: string, action: "add" | "remove") => {
    if (!user) return;
    const path = `users/${user.uid}`;
    const userDocRef = doc(db, "users", user.uid);
    let newWatchlist = [...user.watchlist];
    if (action === "add") {
      if (!newWatchlist.includes(movieId)) newWatchlist.push(movieId);
    } else {
      newWatchlist = newWatchlist.filter(id => id !== movieId);
    }
    try {
      await setDoc(userDocRef, { ...user, watchlist: newWatchlist }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const togglePremium = async () => {
    if (!user) return;
    const path = `users/${user.uid}`;
    const userDocRef = doc(db, "users", user.uid);
    try {
      await setDoc(userDocRef, { isPremium: !user.isPremium }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  return (
    <AuthContext.Provider value={{ user, firebaseUser, loading, signInWithGoogle, logout, updateWatchlist, togglePremium }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
