'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    // Reset scroll position immediately on path change
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
