'use client'

import { useState, useEffect, createContext, useContext } from 'react';
import { 
  signInWithPopup, 
  GithubAuthProvider, 
  signOut, 
  onAuthStateChanged, 
  User 
} from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async () => {
    const provider = new GithubAuthProvider();
    provider.addScope('read:user');
    provider.addScope('repo');
    
    try {
      console.log('Starting GitHub Sign-In...');
      const result = await signInWithPopup(auth, provider);
      const credential = GithubAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken;

      console.log('Auth Success, UID:', result.user.uid);

      if (token && result.user) {
        const { doc, setDoc, getDoc, serverTimestamp } = await import('firebase/firestore');
        const { getAdditionalUserInfo } = await import('firebase/auth');
        const { db } = await import('@/lib/firebase');
        
        const additionalInfo = getAdditionalUserInfo(result);
        const githubUsername = additionalInfo?.username;

        console.log('Writing token to Firestore...');
        await setDoc(doc(db, 'users', result.user.uid, 'tokens', 'github'), {
          accessToken: token,
          updatedAt: serverTimestamp(),
        });
        
        console.log('Checking existing profile...');
        const profileRef = doc(db, 'users', result.user.uid, 'profile', 'latest');
        const profileSnap = await getDoc(profileRef);

        const profileData: any = {
          githubLogin: githubUsername || result.user.displayName,
          displayName: result.user.displayName,
          avatarUrl: result.user.photoURL,
          updatedAt: serverTimestamp(),
        };

        if (!profileSnap.exists()) {
          console.log('Initializing new profile with free plan...');
          profileData.plan = 'free';
          profileData.planUpdatedAt = serverTimestamp();
        }
        
        await setDoc(profileRef, profileData, { merge: true });
        console.log('Firestore update complete.');
      }
    } catch (error) {
      console.error('Sign-in or Firestore error:', error);
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
