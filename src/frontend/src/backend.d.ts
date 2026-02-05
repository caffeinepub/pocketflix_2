import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface Video {
    id: string;
    url: string;
    title: string;
    thumbnail: ExternalBlob;
    category: string;
}
export type Category = string;
export type Time = bigint;
export interface QuizQuestion {
    question: string;
    answers: Array<string>;
    correctAnswerIndex: bigint;
}
export interface Quiz {
    id: string;
    questions: Array<QuizQuestion>;
    videoId: string;
}
export interface SettingsData {
    categories: Array<Category>;
    adminConfig: AdminConfig;
    settings: Settings;
    videos: Array<Video>;
}
export interface QuizResult {
    user: string;
    score: bigint;
    timestamp: Time;
    quizId: string;
}
export interface UserApprovalInfo {
    status: ApprovalStatus;
    principal: Principal;
}
export interface Settings {
    donationLink: string;
    theme: Theme;
    siteName: string;
}
export interface HomepageVisuals {
    subtitleColor: string;
    headingColor: string;
    supportingTextColor: string;
    backgroundColorOverlay: string;
    heroBackgroundColor: string;
    buttonTextColor: string;
    cardBackgroundColor: string;
    heroImage?: ExternalBlob;
    buttonColor: string;
    bannerBackgroundColor: string;
    overlayOpacity: bigint;
    headingShadowColor: string;
    cardTextColor: string;
}
export interface AdminConfig {
    donationLink: string;
    homePageSubText: string;
    theme: Theme;
    homePageSupportingText: string;
    logo?: ExternalBlob;
    errorMessage: string;
    pageNotFoundTitle: string;
    emptyStateTitle: string;
    errorTitle: string;
    homeHeroHeading: string;
    dashboardVisuals: DashboardVisuals;
    homepageVisuals: HomepageVisuals;
    homePageText: string;
    homeHeroSupportingText: string;
    emptyStateMessage: string;
    pageNotFoundMessage: string;
}
export interface Theme {
    primaryColor: string;
    secondaryColor: string;
}
export interface DashboardVisuals {
    headingColor: string;
    gradientDefinition: string;
    backgroundColorOverlay: string;
    accentColor: string;
    cardAccentColor: string;
    headerBackgroundColor: string;
    cardBackgroundColor: string;
    graphCardBackground: string;
    overlayOpacity: bigint;
    secondaryHeadingColor: string;
    gradientTransform: string;
    cardTextColor: string;
}
export interface UserProfile {
    status: string;
    name: string;
    email: string;
}
export enum ApprovalStatus {
    pending = "pending",
    approved = "approved",
    rejected = "rejected"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addCategory(category: Category): Promise<void>;
    addVideo(id: string, title: string, category: string, url: string, thumbnail: ExternalBlob): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createQuiz(id: string, videoId: string, questions: Array<QuizQuestion>): Promise<void>;
    deleteCategory(category: Category): Promise<void>;
    deleteQuiz(id: string): Promise<void>;
    deleteVideo(id: string): Promise<void>;
    getAllQuizzes(): Promise<Array<Quiz>>;
    getAllUsers(): Promise<Array<[Principal, UserProfile]>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCategories(): Promise<Array<Category>>;
    getLeaderboard(): Promise<Array<QuizResult>>;
    getMyQuizResults(): Promise<Array<QuizResult>>;
    getQuiz(id: string): Promise<Quiz | null>;
    getQuizzesByVideo(videoId: string): Promise<Array<Quiz>>;
    getSettingsData(): Promise<SettingsData>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getVideos(): Promise<Array<Video>>;
    isCallerAdmin(): Promise<boolean>;
    isCallerApproved(): Promise<boolean>;
    listApprovals(): Promise<Array<UserApprovalInfo>>;
    requestApproval(): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setApproval(user: Principal, status: ApprovalStatus): Promise<void>;
    takeQuiz(quizId: string, answers: Array<bigint>): Promise<bigint>;
    updateAdminConfig(config: AdminConfig): Promise<void>;
    updateDashboardVisuals(visuals: DashboardVisuals): Promise<void>;
    updateDonationLink(link: string): Promise<void>;
    updateHomePageText(text: string, subText: string, supportingText: string): Promise<void>;
    updateHomepageVisuals(visuals: HomepageVisuals): Promise<void>;
    updateLogo(logo: ExternalBlob | null): Promise<void>;
    updateQuiz(id: string, videoId: string, questions: Array<QuizQuestion>): Promise<void>;
    updateSettings(newSettings: Settings): Promise<void>;
    updateTheme(theme: Theme): Promise<void>;
    updateUserStatus(user: Principal, status: string): Promise<void>;
    updateVideo(id: string, title: string, category: string, url: string, thumbnail: ExternalBlob): Promise<void>;
}
