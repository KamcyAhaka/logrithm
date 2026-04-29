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
exports.generateInsights = exports.fetchGitHubActivity = void 0;
const https_1 = require("firebase-functions/v2/https");
const admin = __importStar(require("firebase-admin"));
const fetchActivity_1 = require("./github/fetchActivity");
const generateInsights_1 = require("./insights/generateInsights");
admin.initializeApp();
exports.fetchGitHubActivity = (0, https_1.onCall)({
    region: 'us-central1',
    maxInstances: 10,
}, async (request) => {
    const data = request.data || {};
    if (!request.auth && !data.isDemoMode) {
        throw new https_1.HttpsError('unauthenticated', 'The function must be called while authenticated.');
    }
    let { token } = data;
    if (!token && request.auth && !data.isDemoMode) {
        const tokenDoc = await admin.firestore()
            .collection('users')
            .doc(request.auth.uid)
            .collection('tokens')
            .doc('github')
            .get();
        token = tokenDoc.data()?.accessToken;
    }
    if (!token && !data.isDemoMode) {
        throw new https_1.HttpsError('invalid-argument', 'GitHub token is missing or not authorized.');
    }
    try {
        return await (0, fetchActivity_1.fetchGitHubActivity)(token);
    }
    catch (error) {
        console.error('Fetch Activity Error:', error);
        throw new https_1.HttpsError('internal', error.message || 'Failed to fetch activity');
    }
});
exports.generateInsights = (0, https_1.onCall)({
    region: 'us-central1',
    maxInstances: 10,
    secrets: ['GEMINI_API_KEY'],
}, async (request) => {
    const data = request.data || {};
    if (!request.auth && !data.isDemoMode) {
        throw new https_1.HttpsError('unauthenticated', 'The function must be called while authenticated.');
    }
    const { activity, isDemoMode } = data;
    const uid = request.auth?.uid || 'demo-uid';
    try {
        return await (0, generateInsights_1.generateInsights)(activity, uid, isDemoMode);
    }
    catch (error) {
        console.error('Generate Insights Error:', error);
        throw new https_1.HttpsError('internal', error.message || 'Failed to generate insights');
    }
});
//# sourceMappingURL=index.js.map