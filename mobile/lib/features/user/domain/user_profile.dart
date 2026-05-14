class UserProfile {
  const UserProfile({
    required this.id,
    required this.email,
    required this.fullName,
    this.nativeLanguage,
    this.currentLevel,
    this.preferredDialect,
    this.avatarUrl,
    this.onboardingCompleted = false,
  });

  factory UserProfile.fromJson(Map<String, dynamic> json) {
    return UserProfile(
      id: json['id'] as String,
      email: json['email'] as String,
      fullName: json['fullName'] as String,
      nativeLanguage: json['nativeLanguage'] as String?,
      currentLevel: json['currentLevel'] as String?,
      preferredDialect: json['preferredDialect'] as String?,
      avatarUrl: json['avatarUrl'] as String?,
      onboardingCompleted: json['onboardingCompleted'] as bool? ?? false,
    );
  }

  final String id;
  final String email;
  final String fullName;
  final String? nativeLanguage;
  final String? currentLevel;
  final String? preferredDialect;
  final String? avatarUrl;
  final bool onboardingCompleted;

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'fullName': fullName,
      'nativeLanguage': nativeLanguage,
      'currentLevel': currentLevel,
      'preferredDialect': preferredDialect,
      'avatarUrl': avatarUrl,
      'onboardingCompleted': onboardingCompleted,
    };
  }
}
