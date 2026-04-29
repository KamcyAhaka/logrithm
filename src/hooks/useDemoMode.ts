'use client'

import { useSearchParams } from 'next/navigation';
import { useAuth } from './useAuth';

export const useDemoMode = () => {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  
  // 1. Force Demo if ?demo is in URL
  if (searchParams.get('demo') !== null) return true;
  
  // 2. Otherwise, demo mode is disabled by default
  return false;
};
