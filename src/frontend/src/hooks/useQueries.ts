import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Video, Category, Quiz, QuizQuestion, QuizResult, SettingsData, UserProfile, AdminConfig, Theme, HomepageVisuals, DashboardVisuals } from '../backend';
import { Principal } from '@dfinity/principal';
import { ExternalBlob } from '../backend';

export function useGetSettingsData() {
  const { actor, isFetching } = useActor();

  return useQuery<SettingsData>({
    queryKey: ['settingsData'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getSettingsData();
    },
    enabled: !!actor && !isFetching,
    retry: false, // Disable automatic retries so errors surface promptly
  });
}

export function useGetVideos() {
  const { actor, isFetching } = useActor();

  return useQuery<Video[]>({
    queryKey: ['videos'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getVideos();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetCategories() {
  const { actor, isFetching } = useActor();

  return useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCategories();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddCategory() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (category: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addCategory(category);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['settingsData'] });
    },
  });
}

export function useDeleteCategory() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (category: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteCategory(category);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['settingsData'] });
    },
  });
}

export function useAddVideo() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { id: string; title: string; category: string; url: string; thumbnail: ExternalBlob }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addVideo(params.id, params.title, params.category, params.url, params.thumbnail);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videos'] });
      queryClient.invalidateQueries({ queryKey: ['settingsData'] });
    },
  });
}

export function useUpdateVideo() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { id: string; title: string; category: string; url: string; thumbnail: ExternalBlob }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateVideo(params.id, params.title, params.category, params.url, params.thumbnail);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videos'] });
      queryClient.invalidateQueries({ queryKey: ['settingsData'] });
    },
  });
}

export function useDeleteVideo() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteVideo(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videos'] });
      queryClient.invalidateQueries({ queryKey: ['settingsData'] });
    },
  });
}

export function useUpdateDonationLink() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (link: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateDonationLink(link);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settingsData'] });
    },
  });
}

export function useUpdateHomePageText() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (text: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateHomePageText(text, '', '');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settingsData'] });
    },
  });
}

export function useUpdateHomePageTextExtended() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      homeHeroHeading: string;
      homePageSubText: string;
      homeHeroSupportingText: string;
      featuredVideosHeading: string;
      noCategoriesMessage: string;
      noVideosMessage: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      const currentConfig = await actor.getSettingsData();
      const config = currentConfig.adminConfig;
      
      await actor.updateAdminConfig({
        ...config,
        homeHeroHeading: params.homeHeroHeading,
        homePageSubText: params.homePageSubText,
        homeHeroSupportingText: params.homeHeroSupportingText,
        homePageText: params.featuredVideosHeading,
        emptyStateTitle: params.noCategoriesMessage,
        emptyStateMessage: params.noVideosMessage,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settingsData'] });
    },
  });
}

export function useUpdateTheme() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (theme: Theme) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateTheme(theme);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settingsData'] });
    },
  });
}

export function useUpdateAdminConfig() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (config: AdminConfig) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateAdminConfig(config);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settingsData'] });
    },
  });
}

export function useUpdateHomepageVisuals() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (visuals: HomepageVisuals) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateHomepageVisuals(visuals);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settingsData'] });
    },
  });
}

export function useUpdateDashboardVisuals() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (visuals: DashboardVisuals) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateDashboardVisuals(visuals);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settingsData'] });
    },
  });
}

export function useUpdateLogo() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (logo: ExternalBlob | null) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateLogo(logo);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settingsData'] });
    },
  });
}

export function useGetAllQuizzes() {
  const { actor, isFetching } = useActor();

  return useQuery<Quiz[]>({
    queryKey: ['allQuizzes'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAllQuizzes();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetQuizzesByVideo(videoId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Quiz[]>({
    queryKey: ['quizzes', videoId],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getQuizzesByVideo(videoId);
    },
    enabled: !!actor && !isFetching && !!videoId,
  });
}

export function useCreateQuiz() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { id: string; videoId: string; questions: QuizQuestion[] }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createQuiz(params.id, params.videoId, params.questions);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allQuizzes'] });
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
    },
  });
}

export function useUpdateQuiz() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { id: string; videoId: string; questions: QuizQuestion[] }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateQuiz(params.id, params.videoId, params.questions);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allQuizzes'] });
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
    },
  });
}

export function useDeleteQuiz() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteQuiz(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allQuizzes'] });
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
    },
  });
}

export function useTakeQuiz() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { quizId: string; answers: bigint[] }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.takeQuiz(params.quizId, params.answers);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
      queryClient.invalidateQueries({ queryKey: ['myQuizResults'] });
    },
  });
}

export function useGetLeaderboard() {
  const { actor, isFetching } = useActor();

  return useQuery<QuizResult[]>({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getLeaderboard();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetMyQuizResults() {
  const { actor, isFetching } = useActor();

  return useQuery<QuizResult[]>({
    queryKey: ['myQuizResults'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getMyQuizResults();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllUsers() {
  const { actor, isFetching } = useActor();

  return useQuery<[Principal, UserProfile][]>({
    queryKey: ['allUsers'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAllUsers();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUpdateUserStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { user: Principal; status: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateUserStatus(params.user, params.status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
    },
  });
}

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}
