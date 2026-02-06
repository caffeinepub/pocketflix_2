import Array "mo:core/Array";
import Text "mo:core/Text";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Map "mo:core/Map";
import List "mo:core/List";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Int "mo:core/Int";
import Runtime "mo:core/Runtime";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";
import UserApproval "user-approval/approval";

actor {
  public type Video = {
    id : Text;
    title : Text;
    category : Text;
    url : Text;
    thumbnail : Storage.ExternalBlob;
  };

  module Video {
    public func compare(v1 : Video, v2 : Video) : Order.Order {
      Text.compare(v1.id, v2.id);
    };
  };

  public type Category = Text;

  public type Theme = {
    primaryColor : Text;
    secondaryColor : Text;
  };

  public type HomepageVisuals = {
    heroBackgroundColor : Text;
    heroImage : ?Storage.ExternalBlob;
    backgroundColorOverlay : Text;
    overlayOpacity : Nat;
    headingColor : Text;
    supportingTextColor : Text;
    headingShadowColor : Text;
    subtitleColor : Text;
    cardBackgroundColor : Text;
    cardTextColor : Text;
    buttonColor : Text;
    buttonTextColor : Text;
    bannerBackgroundColor : Text;
  };

  public type DashboardVisuals = {
    headerBackgroundColor : Text;
    backgroundColorOverlay : Text;
    overlayOpacity : Nat;
    accentColor : Text;
    headingColor : Text;
    secondaryHeadingColor : Text;
    cardBackgroundColor : Text;
    cardTextColor : Text;
    cardAccentColor : Text;
    graphCardBackground : Text;
    gradientTransform : Text;
    gradientDefinition : Text;
  };

  public type Settings = {
    donationLink : Text;
    theme : Theme;
    siteName : Text;
  };

  public type AdminConfig = {
    donationLink : Text;
    homePageText : Text;
    homePageSubText : Text;
    homePageSupportingText : Text;
    emptyStateTitle : Text;
    emptyStateMessage : Text;
    errorTitle : Text;
    errorMessage : Text;
    pageNotFoundTitle : Text;
    pageNotFoundMessage : Text;
    homeHeroHeading : Text;
    homeHeroSupportingText : Text;
    theme : Theme;
    homepageVisuals : HomepageVisuals;
    dashboardVisuals : DashboardVisuals;
    logo : ?Storage.ExternalBlob; // Optional site logo
  };

  module AdminConfig {
    public func compare(c1 : AdminConfig, c2 : AdminConfig) : Order.Order {
      Text.compare(c1.donationLink, c2.donationLink);
    };
  };

  public type UserProfile = {
    name : Text;
    email : Text;
    status : Text;
  };

  public type QuizQuestion = {
    question : Text;
    answers : [Text];
    correctAnswerIndex : Nat;
  };

  module QuizQuestion {
    public func compare(q1 : QuizQuestion, q2 : QuizQuestion) : Order.Order {
      Text.compare(q1.question, q2.question);
    };
  };

  public type Quiz = {
    id : Text;
    questions : [QuizQuestion];
    videoId : Text;
  };

  public type QuizResult = {
    user : Text;
    score : Nat;
    timestamp : Time.Time;
    quizId : Text;
  };

  module QuizResult {
    public func compare(r1 : QuizResult, r2 : QuizResult) : Order.Order {
      Int.compare(r2.timestamp, r1.timestamp);
    };
  };

  public type SettingsData = {
    videos : [Video];
    categories : [Category];
    settings : Settings;
    adminConfig : AdminConfig;
  };

  let videos = Map.empty<Text, Video>();
  let categories = Map.empty<Text, Category>();
  let settingsStore = Map.empty<Text, Settings>();
  let adminConfigStore = Map.empty<Text, AdminConfig>();
  let quizzes = Map.empty<Text, Quiz>();
  var quizResults = List.empty<QuizResult>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  let approvalState = UserApproval.initState(accessControlState);

  public query ({ caller }) func isCallerApproved() : async Bool {
    AccessControl.hasPermission(accessControlState, caller, #admin) or UserApproval.isApproved(approvalState, caller);
  };

  public shared ({ caller }) func requestApproval() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can request approval");
    };
    UserApproval.requestApproval(approvalState, caller);
  };

  public shared ({ caller }) func setApproval(user : Principal, status : UserApproval.ApprovalStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    UserApproval.setApproval(approvalState, user, status);
  };

  public query ({ caller }) func listApprovals() : async [UserApproval.UserApprovalInfo] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    UserApproval.listApprovals(approvalState);
  };

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // User Management (Admin only)
  public query ({ caller }) func getAllUsers() : async [(Principal, UserProfile)] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view all users");
    };
    userProfiles.entries().toArray();
  };

  public shared ({ caller }) func updateUserStatus(user : Principal, status : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update user status");
    };
    switch (userProfiles.get(user)) {
      case (null) { Runtime.trap("User not found") };
      case (?profile) {
        let updatedProfile = {
          name = profile.name;
          email = profile.email;
          status = status;
        };
        userProfiles.add(user, updatedProfile);
      };
    };
  };

  func isUserBlocked(user : Principal) : Bool {
    switch (userProfiles.get(user)) {
      case (null) { false };
      case (?profile) { profile.status == "blocked" };
    };
  };

  // Video Management
  public shared ({ caller }) func addVideo(id : Text, title : Text, category : Text, url : Text, thumbnail : Storage.ExternalBlob) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can create videos");
    };
    let video : Video = {
      id;
      title;
      category;
      url;
      thumbnail;
    };
    videos.add(id, video);
  };

  public shared ({ caller }) func updateVideo(id : Text, title : Text, category : Text, url : Text, thumbnail : Storage.ExternalBlob) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update videos");
    };
    let video : Video = {
      id;
      title;
      category;
      url;
      thumbnail;
    };
    videos.add(id, video);
  };

  public shared ({ caller }) func deleteVideo(id : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can delete videos");
    };
    videos.remove(id);
  };

  public query func getVideos() : async [Video] {
    videos.values().toArray().sort();
  };

  // Category Management
  public shared ({ caller }) func addCategory(category : Category) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can create categories");
    };
    categories.add(category, category);
  };

  public shared ({ caller }) func deleteCategory(category : Category) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can delete categories");
    };
    categories.remove(category);
  };

  public query func getCategories() : async [Category] {
    categories.values().toArray();
  };

  // Settings Management
  public query func getSettingsData() : async SettingsData {
    let videoArray = videos.values().toArray().sort();
    let categoriesArray = categories.values().toArray();
    let defaultTheme = {
      primaryColor = "#fb8c00";
      secondaryColor = "#04032e";
    };
    let defaultSettings = {
      donationLink = "";
      theme = defaultTheme;
      siteName = "Video Learning Platform";
    };
    let defaultHomepageVisuals = {
      heroBackgroundColor = "linear-gradient(227deg, #ff9500 0%, #0e1c45 100%)";
      heroImage = null;
      backgroundColorOverlay = "#1A2C45";
      overlayOpacity = 80;
      headingColor = "#fff";
      supportingTextColor = "#ebecfe";
      headingShadowColor = "#1b3379";
      subtitleColor = "#eef2ff";
      cardBackgroundColor = "#fff";
      cardTextColor = "#333";
      buttonColor = "#fff";
      buttonTextColor = "#6d53ec";
      bannerBackgroundColor = "#f1e6fc";
    };
    let defaultDashboardVisuals = {
      headerBackgroundColor = "linear-gradient(180deg, #242662 0%, #3C268E 100%)";
      backgroundColorOverlay = "#1A2C45";
      overlayOpacity = 80;
      accentColor = "#6d53ec";
      headingColor = "#fff";
      secondaryHeadingColor = "#B5B0F8";
      cardBackgroundColor = "#fff";
      cardTextColor = "#333";
      cardAccentColor = "#6d53ec";
      graphCardBackground = "#f1e6fc";
      gradientTransform = "rotate(227deg)";
      gradientDefinition = "linear-gradient(227deg, #3c37db 0%, #244fc6 100%)";
    };

    let defaultAdminConfig = {
      donationLink = "";
      homePageText = "Welcome to our learning platform";
      homePageSubText = "Video-based learning for students and lifelong learners.";
      homePageSupportingText = "Expand your knowledge, grow your skills, and invest in your future. Start exploring videos and take advantage of all our features.";
      emptyStateTitle = "No Videos Available";
      emptyStateMessage = "Check back soon or browse other categories!";
      errorTitle = "Error Loading Videos";
      errorMessage = "We encountered an issue loading the videos. Please try again.";
      pageNotFoundTitle = "Page Not Found";
      pageNotFoundMessage = "The page you are looking for does not exist. Please check the URL and explore other parts of the site.";
      homeHeroHeading = "Learn on Your Terms";
      homeHeroSupportingText = "Short video lessons designed for busy people. No stress, just effective learning at your pace.";
      theme = defaultTheme;
      homepageVisuals = defaultHomepageVisuals;
      dashboardVisuals = defaultDashboardVisuals;
      logo = null;
    };
    {
      videos = videoArray;
      categories = categoriesArray;
      settings = switch (settingsStore.get("settings")) {
        case (null) { defaultSettings };
        case (?value) { value };
      };
      adminConfig = switch (adminConfigStore.get("adminConfig")) {
        case (null) { defaultAdminConfig };
        case (?value) { value };
      };
    };
  };

  public shared ({ caller }) func updateSettings(newSettings : Settings) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update settings");
    };
    settingsStore.add("settings", newSettings);
  };

  public shared ({ caller }) func updateAdminConfig(config : AdminConfig) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update admin config");
    };
    adminConfigStore.add("adminConfig", config);
  };

  public shared ({ caller }) func updateDonationLink(link : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update donation link");
    };
    switch (adminConfigStore.get("adminConfig")) {
      case (null) {
        let defaultTheme = {
          primaryColor = "#fb8c00";
          secondaryColor = "#04032e";
        };
        let config : AdminConfig = {
          donationLink = link;
          homePageText = "Welcome to our learning platform";
          homePageSubText = "Video-based learning for students and lifelong learners.";
          homePageSupportingText = "Expand your knowledge, grow your skills, and invest in your future. Start exploring videos and take advantage of all our features.";
          emptyStateTitle = "No Videos Available";
          emptyStateMessage = "Check back soon or browse other categories!";
          errorTitle = "Error Loading Videos";
          errorMessage = "We encountered an issue loading the videos. Please try again.";
          pageNotFoundTitle = "Page Not Found";
          pageNotFoundMessage = "The page you are looking for does not exist. Please check the URL and explore other parts of the site.";
          homeHeroHeading = "Learn on Your Terms";
          homeHeroSupportingText = "Short video lessons designed for busy people. No stress, just effective learning at your pace.";
          theme = defaultTheme;
          homepageVisuals = {
            heroBackgroundColor = "linear-gradient(227deg, #ff9500 0%, #0e1c45 100%)";
            heroImage = null;
            backgroundColorOverlay = "#1A2C45";
            overlayOpacity = 80;
            headingColor = "#fff";
            supportingTextColor = "#ebecfe";
            headingShadowColor = "#1b3379";
            subtitleColor = "#eef2ff";
            cardBackgroundColor = "#fff";
            cardTextColor = "#333";
            buttonColor = "#fff";
            buttonTextColor = "#6d53ec";
            bannerBackgroundColor = "#f1e6fc";
          };
          dashboardVisuals = {
            headerBackgroundColor = "linear-gradient(180deg, #242662 0%, #3C268E 100%)";
            backgroundColorOverlay = "#1A2C45";
            overlayOpacity = 80;
            accentColor = "#6d53ec";
            headingColor = "#fff";
            secondaryHeadingColor = "#B5B0F8";
            cardBackgroundColor = "#fff";
            cardTextColor = "#333";
            cardAccentColor = "#6d53ec";
            graphCardBackground = "#f1e6fc";
            gradientTransform = "rotate(227deg)";
            gradientDefinition = "linear-gradient(227deg, #3c37db 0%, #244fc6 100%)";
          };
          logo = null;
        };
        adminConfigStore.add("adminConfig", config);
      };
      case (?config) {
        let updatedConfig = {
          donationLink = link;
          homePageText = config.homePageText;
          homePageSubText = config.homePageSubText;
          homePageSupportingText = config.homePageSupportingText;
          emptyStateTitle = config.emptyStateTitle;
          emptyStateMessage = config.emptyStateMessage;
          errorTitle = config.errorTitle;
          errorMessage = config.errorMessage;
          pageNotFoundTitle = config.pageNotFoundTitle;
          pageNotFoundMessage = config.pageNotFoundMessage;
          homeHeroHeading = config.homeHeroHeading;
          homeHeroSupportingText = config.homeHeroSupportingText;
          theme = config.theme;
          homepageVisuals = config.homepageVisuals;
          dashboardVisuals = config.dashboardVisuals;
          logo = config.logo;
        };
        adminConfigStore.add("adminConfig", updatedConfig);
      };
    };
  };

  public shared ({ caller }) func updateHomePageText(text : Text, subText : Text, supportingText : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update home page text");
    };
    switch (adminConfigStore.get("adminConfig")) {
      case (null) {
        let defaultTheme = {
          primaryColor = "#fb8c00";
          secondaryColor = "#04032e";
        };
        let config : AdminConfig = {
          donationLink = "";
          homePageText = text;
          homePageSubText = subText;
          homePageSupportingText = supportingText;
          emptyStateTitle = "No Videos Available";
          emptyStateMessage = "Check back soon or browse other categories!";
          errorTitle = "Error Loading Videos";
          errorMessage = "We encountered an issue loading the videos. Please try again.";
          pageNotFoundTitle = "Page Not Found";
          pageNotFoundMessage = "The page you are looking for does not exist. Please check the URL and explore other parts of the site.";
          homeHeroHeading = "Learn on Your Terms";
          homeHeroSupportingText = "Short video lessons designed for busy people. No stress, just effective learning at your pace.";
          theme = defaultTheme;
          homepageVisuals = {
            heroBackgroundColor = "linear-gradient(227deg, #ff9500 0%, #0e1c45 100%)";
            heroImage = null;
            backgroundColorOverlay = "#1A2C45";
            overlayOpacity = 80;
            headingColor = "#fff";
            supportingTextColor = "#ebecfe";
            headingShadowColor = "#1b3379";
            subtitleColor = "#eef2ff";
            cardBackgroundColor = "#fff";
            cardTextColor = "#333";
            buttonColor = "#fff";
            buttonTextColor = "#6d53ec";
            bannerBackgroundColor = "#f1e6fc";
          };
          dashboardVisuals = {
            headerBackgroundColor = "linear-gradient(180deg, #242662 0%, #3C268E 100%)";
            backgroundColorOverlay = "#1A2C45";
            overlayOpacity = 80;
            accentColor = "#6d53ec";
            headingColor = "#fff";
            secondaryHeadingColor = "#B5B0F8";
            cardBackgroundColor = "#fff";
            cardTextColor = "#333";
            cardAccentColor = "#6d53ec";
            graphCardBackground = "#f1e6fc";
            gradientTransform = "rotate(227deg)";
            gradientDefinition = "linear-gradient(227deg, #3c37db 0%, #244fc6 100%)";
          };
          logo = null;
        };
        adminConfigStore.add("adminConfig", config);
      };
      case (?config) {
        let updatedConfig = {
          donationLink = config.donationLink;
          homePageText = text;
          homePageSubText = subText;
          homePageSupportingText = supportingText;
          emptyStateTitle = config.emptyStateTitle;
          emptyStateMessage = config.emptyStateMessage;
          errorTitle = config.errorTitle;
          errorMessage = config.errorMessage;
          pageNotFoundTitle = config.pageNotFoundTitle;
          pageNotFoundMessage = config.pageNotFoundMessage;
          homeHeroHeading = config.homeHeroHeading;
          homeHeroSupportingText = config.homeHeroSupportingText;
          theme = config.theme;
          homepageVisuals = config.homepageVisuals;
          dashboardVisuals = config.dashboardVisuals;
          logo = config.logo;
        };
        adminConfigStore.add("adminConfig", updatedConfig);
      };
    };
  };

  public shared ({ caller }) func updateTheme(theme : Theme) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update theme");
    };
    switch (adminConfigStore.get("adminConfig")) {
      case (null) {
        let config : AdminConfig = {
          donationLink = "";
          homePageText = "Welcome to our learning platform";
          homePageSubText = "Video-based learning for students and lifelong learners.";
          homePageSupportingText = "Expand your knowledge, grow your skills, and invest in your future. Start exploring videos and take advantage of all our features.";
          emptyStateTitle = "No Videos Available";
          emptyStateMessage = "Check back soon or browse other categories!";
          errorTitle = "Error Loading Videos";
          errorMessage = "We encountered an issue loading the videos. Please try again.";
          pageNotFoundTitle = "Page Not Found";
          pageNotFoundMessage = "The page you are looking for does not exist. Please check the URL and explore other parts of the site.";
          homeHeroHeading = "Learn on Your Terms";
          homeHeroSupportingText = "Short video lessons designed for busy people. No stress, just effective learning at your pace.";
          theme = theme;
          homepageVisuals = {
            heroBackgroundColor = "linear-gradient(227deg, #ff9500 0%, #0e1c45 100%)";
            heroImage = null;
            backgroundColorOverlay = "#1A2C45";
            overlayOpacity = 80;
            headingColor = "#fff";
            supportingTextColor = "#ebecfe";
            headingShadowColor = "#1b3379";
            subtitleColor = "#eef2ff";
            cardBackgroundColor = "#fff";
            cardTextColor = "#333";
            buttonColor = "#fff";
            buttonTextColor = "#6d53ec";
            bannerBackgroundColor = "#f1e6fc";
          };
          dashboardVisuals = {
            headerBackgroundColor = "linear-gradient(180deg, #242662 0%, #3C268E 100%)";
            backgroundColorOverlay = "#1A2C45";
            overlayOpacity = 80;
            accentColor = "#6d53ec";
            headingColor = "#fff";
            secondaryHeadingColor = "#B5B0F8";
            cardBackgroundColor = "#fff";
            cardTextColor = "#333";
            cardAccentColor = "#6d53ec";
            graphCardBackground = "#f1e6fc";
            gradientTransform = "rotate(227deg)";
            gradientDefinition = "linear-gradient(227deg, #3c37db 0%, #244fc6 100%)";
          };
          logo = null;
        };
        adminConfigStore.add("adminConfig", config);
      };
      case (?config) {
        let updatedConfig = {
          donationLink = config.donationLink;
          homePageText = config.homePageText;
          homePageSubText = config.homePageSubText;
          homePageSupportingText = config.homePageSupportingText;
          emptyStateTitle = config.emptyStateTitle;
          emptyStateMessage = config.emptyStateMessage;
          errorTitle = config.errorTitle;
          errorMessage = config.errorMessage;
          pageNotFoundTitle = config.pageNotFoundTitle;
          pageNotFoundMessage = config.pageNotFoundMessage;
          homeHeroHeading = config.homeHeroHeading;
          homeHeroSupportingText = config.homeHeroSupportingText;
          theme = theme;
          homepageVisuals = config.homepageVisuals;
          dashboardVisuals = config.dashboardVisuals;
          logo = config.logo;
        };
        adminConfigStore.add("adminConfig", updatedConfig);
      };
    };
  };

  // Homepage Visuals Update
  public shared ({ caller }) func updateHomepageVisuals(visuals : HomepageVisuals) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update homepage visuals");
    };
    switch (adminConfigStore.get("adminConfig")) {
      case (null) { Runtime.trap("Admin config not found") };
      case (?config) {
        let updatedConfig = {
          donationLink = config.donationLink;
          homePageText = config.homePageText;
          homePageSubText = config.homePageSubText;
          homePageSupportingText = config.homePageSupportingText;
          emptyStateTitle = config.emptyStateTitle;
          emptyStateMessage = config.emptyStateMessage;
          errorTitle = config.errorTitle;
          errorMessage = config.errorMessage;
          pageNotFoundTitle = config.pageNotFoundTitle;
          pageNotFoundMessage = config.pageNotFoundMessage;
          homeHeroHeading = config.homeHeroHeading;
          homeHeroSupportingText = config.homeHeroSupportingText;
          theme = config.theme;
          homepageVisuals = visuals;
          dashboardVisuals = config.dashboardVisuals;
          logo = config.logo;
        };
        adminConfigStore.add("adminConfig", updatedConfig);
      };
    };
  };

  // Dashboard Visuals Update
  public shared ({ caller }) func updateDashboardVisuals(visuals : DashboardVisuals) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update dashboard visuals");
    };
    switch (adminConfigStore.get("adminConfig")) {
      case (null) { Runtime.trap("Admin config not found") };
      case (?config) {
        let updatedConfig = {
          donationLink = config.donationLink;
          homePageText = config.homePageText;
          homePageSubText = config.homePageSubText;
          homePageSupportingText = config.homePageSupportingText;
          emptyStateTitle = config.emptyStateTitle;
          emptyStateMessage = config.emptyStateMessage;
          errorTitle = config.errorTitle;
          errorMessage = config.errorMessage;
          pageNotFoundTitle = config.pageNotFoundTitle;
          pageNotFoundMessage = config.pageNotFoundMessage;
          homeHeroHeading = config.homeHeroHeading;
          homeHeroSupportingText = config.homeHeroSupportingText;
          theme = config.theme;
          homepageVisuals = config.homepageVisuals;
          dashboardVisuals = visuals;
          logo = config.logo;
        };
        adminConfigStore.add("adminConfig", updatedConfig);
      };
    };
  };

  // Logo Update (New Feature)
  public shared ({ caller }) func updateLogo(logo : ?Storage.ExternalBlob) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update logo");
    };
    switch (adminConfigStore.get("adminConfig")) {
      case (null) { Runtime.trap("Admin config not found") };
      case (?config) {
        let updatedConfig = {
          donationLink = config.donationLink;
          homePageText = config.homePageText;
          homePageSubText = config.homePageSubText;
          homePageSupportingText = config.homePageSupportingText;
          emptyStateTitle = config.emptyStateTitle;
          emptyStateMessage = config.emptyStateMessage;
          errorTitle = config.errorTitle;
          errorMessage = config.errorMessage;
          pageNotFoundTitle = config.pageNotFoundTitle;
          pageNotFoundMessage = config.pageNotFoundMessage;
          homeHeroHeading = config.homeHeroHeading;
          homeHeroSupportingText = config.homeHeroSupportingText;
          theme = config.theme;
          homepageVisuals = config.homepageVisuals;
          dashboardVisuals = config.dashboardVisuals;
          logo;
        };
        adminConfigStore.add("adminConfig", updatedConfig);
      };
    };
  };

  // Quiz Management
  public shared ({ caller }) func createQuiz(id : Text, videoId : Text, questions : [QuizQuestion]) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can create quizzes");
    };
    let quiz : Quiz = {
      id;
      questions;
      videoId;
    };
    quizzes.add(id, quiz);
  };

  public shared ({ caller }) func updateQuiz(id : Text, videoId : Text, questions : [QuizQuestion]) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update quizzes");
    };
    let quiz : Quiz = {
      id;
      questions;
      videoId;
    };
    quizzes.add(id, quiz);
  };

  public shared ({ caller }) func deleteQuiz(id : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can delete quizzes");
    };
    quizzes.remove(id);
  };

  public query ({ caller }) func getQuiz(id : Text) : async ?Quiz {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only logged-in users can view quizzes");
    };
    if (isUserBlocked(caller)) {
      Runtime.trap("Unauthorized: Your account is blocked");
    };
    quizzes.get(id);
  };

  public query ({ caller }) func getQuizzesByVideo(videoId : Text) : async [Quiz] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only logged-in users can view quizzes");
    };
    if (isUserBlocked(caller)) {
      Runtime.trap("Unauthorized: Your account is blocked");
    };
    let allQuizzes = quizzes.values().toArray();
    allQuizzes.filter(func(q : Quiz) : Bool { q.videoId == videoId });
  };

  public query ({ caller }) func getAllQuizzes() : async [Quiz] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view all quizzes");
    };
    quizzes.values().toArray();
  };

  public shared ({ caller }) func takeQuiz(quizId : Text, answers : [Nat]) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can take quizzes");
    };
    if (isUserBlocked(caller)) {
      Runtime.trap("Unauthorized: Your account is blocked");
    };
    let quiz = ensureQuizExists(quizId);
    if (answers.size() != quiz.questions.size()) {
      Runtime.trap("Invalid answers: answer count must match question count");
    };
    var score : Nat = 0;
    var i = 0;
    for (answer in answers.values()) {
      if (i < quiz.questions.size()) {
        let question = quiz.questions[i];
        if (answer == question.correctAnswerIndex) {
          score += 1;
        };
      };
      i += 1;
    };
    let result : QuizResult = {
      user = caller.toText();
      score;
      timestamp = Time.now();
      quizId;
    };
    quizResults.add(result);
    score;
  };

  func ensureQuizExists(quizId : Text) : Quiz {
    switch (quizzes.get(quizId)) {
      case (null) { Runtime.trap("Quiz not found") };
      case (?quiz) { quiz };
    };
  };

  public query ({ caller }) func getLeaderboard() : async [QuizResult] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can view the leaderboard");
    };
    quizResults.toArray().sort();
  };

  public query ({ caller }) func getMyQuizResults() : async [QuizResult] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can view their results");
    };
    let callerText = caller.toText();
    let allResults = quizResults.toArray();
    allResults.filter(func(r : QuizResult) : Bool { r.user == callerText });
  };
};
