'use client';

import { useEffect, useState } from 'react';
import { watchAuth, type User } from './client';

type AuthState = {
  user: User | null;
  loading: boolean;
  idToken: string | null;
};

export function useFirebaseAuth(): AuthState {
  const [state, setState] = useState<AuthState>({ user: null, loading: true, idToken: null });

  useEffect(() => {
    const unsub = watchAuth(async (user) => {
      if (user) {
        const token = await user.getIdToken();
        setState({ user, loading: false, idToken: token });
      } else {
        setState({ user: null, loading: false, idToken: null });
      }
    });
    return () => unsub();
  }, []);

  return state;
}
