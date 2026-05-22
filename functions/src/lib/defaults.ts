import { PrivacySettingsDocument } from '../types/github';

export const defaultPrivacySettings: Omit<PrivacySettingsDocument, 'updatedAt'> = {
  analysis: {
    includePrivatePersonal: true,
    includeOrgRepos: false,
  },
  display: {
    showPrivateRepoNames: false,
    showOrgRepoNames: false,
    shareCardDataScope: 'public_only',
  },
  profile: {
    showScore: true,
    showLanguages: true,
    showRepoList: true,
  },
};
