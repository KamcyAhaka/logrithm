import { Suspense } from 'react';
import LoginClient from './_components/LoginClient';

// Login page requires Firebase at runtime — disable static prerender
export const dynamic = 'force-dynamic';

export default function LoginPage() {
  return (
    <Suspense>
      <LoginClient />
    </Suspense>
  );
}
