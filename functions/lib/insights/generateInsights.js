"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateInsights = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const generative_ai_1 = require("@google/generative-ai");
const getSecret_1 = require("../secrets/getSecret");
const DUMMY_INSIGHTS = {
    summary: "Demo Developer is a highly active full-stack engineer with a strong focus on TypeScript and React ecosystems. 847 commits across 12 repos show consistent, sustained contribution habits.",
    strengths: [
        "Consistent daily commit cadence with strong Mon-Thu activity peaks",
        "Broad language versatility across TypeScript, Python, and Dart",
        "High PR merge rate indicating clean, review-ready code submissions"
    ],
    improvements: [
        "Issue response time could improve — open issues go 7+ days without updates",
        "Weekend gaps suggest potential for async deep work sessions",
        "Consider consolidating smaller utility repos to reduce context switching"
    ],
    patterns: "Peak activity Tue-Wed 10am-2pm. Quarterly streaks of 14+ days followed by short recovery periods — a sprint-and-rest pattern.",
    topLanguages: ["TypeScript", "JavaScript", "Dart"],
    activityScore: 82,
    tags: ["typescript", "high output", "multi-repo", "pr focused", "full-stack"]
};
const generateInsights = async (activity, uid, isDemoMode) => {
    if (isDemoMode) {
        return DUMMY_INSIGHTS;
    }
    const db = admin.firestore();
    const cacheRef = db.collection('users').doc(uid).collection('insights').doc('latest');
    try {
        const cacheDoc = await cacheRef.get();
        if (cacheDoc.exists) {
            const data = cacheDoc.data();
            const generatedAt = new Date(data?.generatedAt);
            const today = new Date();
            if (generatedAt.toDateString() === today.toDateString() && data?.data?.tags) {
                return data?.data;
            }
        }
    }
    catch (error) {
        console.warn('Error checking cache:', error);
    }
    const apiKey = process.env.GEMINI_API_KEY || await (0, getSecret_1.getSecret)('GEMINI_API_KEY');
    if (!apiKey) {
        console.warn('GEMINI_API_KEY missing. Returning dummy.');
        return DUMMY_INSIGHTS;
    }
    try {
        const genAI = new generative_ai_1.GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const prompt = `
      Analyze this GitHub activity data for a developer and provide insights in JSON format.
      
      Activity Data:
      - Total Commits (12mo): ${activity.totalCommitContributions}
      - Total PRs (12mo): ${activity.totalPullRequestContributions}
      - Total Issues (12mo): ${activity.totalIssueContributions}
      - Active Repos: ${activity.totalRepositoriesWithContributedCommits}
      - Languages: ${activity.repositories.slice(0, 5).map((r) => r.primaryLanguage?.name).filter(Boolean).join(', ')}
      - Contribution Patterns: ${JSON.stringify(activity.contributionCalendar.weeks.slice(-4))}
      
      Return ONLY a valid JSON object with no markdown, no code blocks, no explanation:
      {
        "summary": "2-3 sentence summary of their developer persona",
        "strengths": ["strength 1", "strength 2", "strength 3"],
        "improvements": ["improvement 1", "improvement 2", "improvement 3"],
        "patterns": "paragraph about activity timing and consistency patterns",
        "topLanguages": ["language1", "language2", "language3"],
        "activityScore": <number between 1-100>,
        "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"]
      }

      Rules for tags:
      - 5 to 7 tags total
      - Max 2 words per tag, all lowercase, no punctuation
      - Derived from the data, not copied from strengths/improvements sentences
      - Examples: "typescript", "high output", "multi-repo", "pr focused", "vue specialist"
      
      Be intelligent, developer-native, and slightly witty.
    `;
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        let insights;
        try {
            insights = JSON.parse(cleaned);
        }
        catch {
            const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                console.error('Failed to parse JSON from Gemini. Raw response:', text);
                throw new Error('Could not parse JSON from Gemini response');
            }
            insights = JSON.parse(jsonMatch[0]);
        }
        if (!Array.isArray(insights.tags) || insights.tags.length === 0) {
            insights.tags = insights.topLanguages
                .map((l) => l.toLowerCase())
                .slice(0, 3);
        }
        insights.tags = insights.tags
            .map((t) => t.replace(/[^a-z0-9\s]/gi, '').toLowerCase().trim())
            .filter(Boolean)
            .slice(0, 7);
        await cacheRef.set({
            data: insights,
            generatedAt: new Date().toISOString()
        });
        return insights;
    }
    catch (error) {
        console.error('Gemini Error:', error?.message || error);
        throw new functions.https.HttpsError('internal', `Gemini Analysis failed: ${error?.message || 'Unknown error'}`);
    }
};
exports.generateInsights = generateInsights;
//# sourceMappingURL=generateInsights.js.map