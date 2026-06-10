import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

function generateBadgeSvg(score: string | number): string {
  // SVG Badge Design:
  // - Left segment: dark background (#1a1a1a), white monospace text "logrithm" with a small ⬡ or similar icon prefix
  // - Right segment: green background (#1d9e75), dark text "score: [score]"
  // - Height: 20px, rounded corners (border-radius: 3px)
  // - Font: monospace, font-size 11px
  // - Total width: approximately 160px (left 90px, right 70px)
  // - Add a subtle 1px border using a slightly lighter shade of each segment color for definition (#2d2d2d and #26b687)
  return `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="20" viewBox="0 0 160 20">
  <clipPath id="r">
    <rect width="160" height="20" rx="3" />
  </clipPath>
  <g clip-path="url(#r)">
    <!-- Backgrounds -->
    <rect width="90" height="20" fill="#1a1a1a" />
    <rect x="90" width="70" height="20" fill="#1d9e75" />
    
    <!-- Outer borders for definition (drawn inside clip path) -->
    <rect x="0.5" y="0.5" width="89.5" height="19" fill="none" stroke="#2d2d2d" stroke-width="1" />
    <rect x="90" y="0.5" width="69.5" height="19" fill="none" stroke="#26b687" stroke-width="1" />
    
    <!-- Icon (Hexagon ⬡) -->
    <polygon points="12,6 15.5,8 15.5,12 12,14 8.5,12 8.5,8" fill="none" stroke="#1d9e75" stroke-width="1.2" />
    
    <!-- Left Text -->
    <text x="22" y="14" fill="#ffffff" font-family="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" font-size="11" font-weight="bold">logrithm</text>
    
    <!-- Right Text -->
    <text x="125" y="14" fill="#0a0a0a" font-family="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" font-size="11" font-weight="bold" text-anchor="middle">score: ${score}</text>
  </g>
</svg>`;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;
  let score: string | number = '—';

  // Support demo mode or local testing for 'demo-dev'
  if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true' || username === 'demo-dev') {
    score = 82;
  } else {
    try {
      const adminDb = await getAdminDb();
      if (adminDb) {
        // Step 1: Look up uid from slugs collection first
        const slugDoc = await adminDb.doc(`slugs/${username}`).get();
        let uid = '';

        if (slugDoc.exists) {
          uid = slugDoc.data()?.uid;
        } else {
          // Fallback: search profile/data by githubLogin (case-sensitive)
          const profileSnap = await adminDb
            .collectionGroup('profile')
            .where('githubLogin', '==', username)
            .limit(1)
            .get();

          if (!profileSnap.empty) {
            uid = profileSnap.docs[0].ref.parent.parent!.id;
          }
        }

        if (uid) {
          // Step 2: Get the latest insights
          const insightDoc = await adminDb.doc(`users/${uid}/insights/latest`).get();
          if (insightDoc.exists) {
            const insightData = insightDoc.data() as { data?: { activityScore?: number } };
            const activityScore = insightData.data?.activityScore;
            if (typeof activityScore === 'number') {
              score = activityScore;
            }
          }
        }
      }
    } catch (err) {
      console.error(`[Badge API] Failed to fetch score for ${username}:`, err);
      // Graceful fallback to '—'
    }
  }

  const svg = generateBadgeSvg(score);

  return new NextResponse(svg, {
    status: 200,
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  });
}
