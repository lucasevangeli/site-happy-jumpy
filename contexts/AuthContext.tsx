"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

interface UserProfile {
  fullName: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  ticketCount: number;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  refreshTicketCount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  profile: null, 
  ticketCount: 0, 
  loading: true, 
  refreshProfile: async () => {},
  refreshTicketCount: async () => {} 
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [ticketCount, setTicketCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (firebaseUser: User) => {
    try {
      const token = await firebaseUser.getIdToken();
      const response = await fetch('/api/user/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching profile in context:', error);
    }
  };

  const fetchTicketCount = async (firebaseUser: User) => {
    try {
      const ticketsRef = collection(db, 'tickets');
      const q = query(
        ticketsRef, 
        where('userId', '==', firebaseUser.uid),
        where('validated', '==', false)
      );
      const snapshot = await getDocs(q);
      
      // Filtrar expirados localmente também para ser preciso
      const activeTickets = snapshot.docs.filter(doc => {
        const data = doc.data();
        if (data.expiresAt) {
          return new Date(data.expiresAt) > new Date();
        }
        return true;
      });

      setTicketCount(activeTickets.length);
    } catch (error) {
      console.error('Error fetching ticket count:', error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        await Promise.all([
          fetchProfile(firebaseUser),
          fetchTicketCount(firebaseUser)
        ]);
      } else {
        setProfile(null);
        setTicketCount(0);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const refreshProfile = async () => {
    if (user) await fetchProfile(user);
  };

  const refreshTicketCount = async () => {
    if (user) await fetchTicketCount(user);
  };

  return (
    <AuthContext.Provider value={{ user, profile, ticketCount, loading, refreshProfile, refreshTicketCount }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
