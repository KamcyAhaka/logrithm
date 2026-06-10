import { Suspense } from 'react';
import HomeClient from './_components/HomeClient';

// Login page requires Firebase at runtime — disable static prerender
export const dynamic = 'force-dynamic';

export default function LoginPage() {
  return (
    <Suspense>
      <HomeClient />
    </Suspense>
  );
}
