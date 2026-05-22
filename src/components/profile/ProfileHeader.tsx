import Link from 'next/link';
import Image from 'next/image';

interface ProfileHeaderProps {
  login: string;
  avatarUrl: string;
  displayName: string;
}

export function ProfileHeader({ login, avatarUrl, displayName }: ProfileHeaderProps) {
  return (
    <div className="flex flex-col items-center text-center">
      <Image
        src={avatarUrl}
        alt={`@${login}`}
        width={64}
        height={64}
        className="mb-4 rounded-full border-2 border-[#1D9E75]/40"
      />
      <h1 className="mb-1 text-2xl font-semibold text-white">{displayName || `@${login}`}</h1>
      <p className="mb-3 font-mono text-sm text-white/40">@{login}</p>

      <div className="flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-[#1D9E75]" />
        <p className="font-mono text-xs text-white/40">
          Analysed by{' '}
          <Link href="/" className="text-[#1D9E75] hover:underline">
            logrithm
          </Link>
        </p>
      </div>
    </div>
  );
}
