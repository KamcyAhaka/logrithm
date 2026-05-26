import { onSchedule } from 'firebase-functions/v2/scheduler';
import { db } from '../lib/firebase';
import { getLatestSnapshot, saveSnapshot } from '../lib/firestoreService';
import { fetchActivityInternal } from '../github/fetchActivity';
import { generateInsightsInternal } from '../insights/generateInsights';
import { buildSnapshot } from '../lib/snapshotBuilder';

export const scheduledAnalysis = onSchedule('every 1 hours', async (event) => {
  try {
    // const currentHour = new Date().getHours();
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const profilesSnap = await db.collectionGroup('profile').get();

    for (const doc of profilesSnap.docs) {
      const uid = doc.ref.parent.parent!.id;

      // Slot allocation logic
      // const hexSlice = uid.slice(-2);
      // const slot = parseInt(hexSlice, 16) % 24;

      // if (slot !== currentHour && !Number.isNaN(slot)) {
      //   continue;
      // }

      try {
        // 1. Skip if today's snapshot already exists
        const latestSnapshot = await getLatestSnapshot(uid);
        if (latestSnapshot) {
          // let capturedAt: Date;
          const capturedAtRaw = latestSnapshot.capturedAt;

          if (
            capturedAtRaw &&
            typeof (capturedAtRaw as FirebaseFirestore.Timestamp).toDate === 'function'
          ) {
            // capturedAt = (capturedAtRaw as FirebaseFirestore.Timestamp).toDate();
          } else {
            // capturedAt = new Date(capturedAtRaw as unknown as string);
          }

          // if (capturedAt >= todayStart) {
          //   console.log(`[scheduledAnalysis] Skipping ${uid}, snapshot already exists for today.`);
          //   continue;
          // }
        }

        // 2. Fetch GitHub activity
        const activity = await fetchActivityInternal(uid);

        // 3. Diff checking
        let shouldGenerateInsights = false;

        if (!latestSnapshot) {
          shouldGenerateInsights = true;
        } else {
          const newCommits = activity.totalCommitContributions - latestSnapshot.totalCommits;
          const newRepos =
            activity.totalRepositoriesWithContributedCommits - latestSnapshot.activeRepoCount;

          let languageShift = false;
          const currentTotals: Record<string, number> = {};
          for (const repo of activity.repositories) {
            if (repo.primaryLanguage && repo.primaryLanguage.name) {
              currentTotals[repo.primaryLanguage.name] =
                (currentTotals[repo.primaryLanguage.name] || 0) + repo.commitCount;
            }
          }

          for (const [lang, count] of Object.entries(currentTotals)) {
            const old = latestSnapshot.languageTotals[lang] || 0;
            if (old > 0 && Math.abs(count - old) / old >= 0.2) {
              languageShift = true;
              break;
            }
          }

          if (newCommits >= 5 || newRepos > 0 || languageShift) {
            shouldGenerateInsights = true;
          }
        }

        // 4. Generate Snapshot & save
        const snapshot = buildSnapshot(activity);
        await saveSnapshot(uid, snapshot);

        // 5. Generate Insights
        if (shouldGenerateInsights) {
          console.log(`[scheduledAnalysis] Threshold met for ${uid}, calling Gemini.`);
          await generateInsightsInternal(uid, activity, false, true);
        } else {
          console.log(`[scheduledAnalysis] Threshold not met for ${uid}, skipping Gemini.`);
        }
      } catch (err) {
        console.error(`[scheduledAnalysis] Failed to process ${uid}:`, err);
      }
    } // End of for loop
  } catch (err) {
    console.error('[scheduledAnalysis] FATAL UNHANDLED ERROR:', err);
  }
});
