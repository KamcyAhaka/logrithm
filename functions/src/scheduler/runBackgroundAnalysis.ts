// Phase 2: onSchedule('every 1 hours')
// Loop users with uid-based slot allocation — each user processed
// once per day regardless of total user count:
//   const slot = parseInt(uid.slice(-2), 16) % 24;
//   if (slot !== new Date().getHours()) return;
//
// Per user:
//   1. Skip if today's snapshot already exists
//   2. Fetch GitHub activity
//   3. Call Gemini only if meaningful change detected:
//      5+ new commits, new repo, or 20%+ language shift
//   4. Write to insights/latest AND insights/history/{YYYY-MM}
//   5. Write raw activity to snapshots/{YYYY-MM-DD}
//   Pro users only when plan gating is added in Phase 2.

export const scheduledAnalysis = null; // Phase 2
