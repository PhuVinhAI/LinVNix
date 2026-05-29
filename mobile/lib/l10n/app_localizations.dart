import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:intl/intl.dart' as intl;

import 'app_localizations_de.dart';
import 'app_localizations_en.dart';
import 'app_localizations_es.dart';
import 'app_localizations_fr.dart';
import 'app_localizations_ja.dart';
import 'app_localizations_ko.dart';
import 'app_localizations_th.dart';
import 'app_localizations_vi.dart';
import 'app_localizations_zh.dart';

// ignore_for_file: type=lint

/// Callers can lookup localized strings with an instance of S
/// returned by `S.of(context)`.
///
/// Applications need to include `S.delegate()` in their app's
/// `localizationDelegates` list, and the locales they support in the app's
/// `supportedLocales` list. For example:
///
/// ```dart
/// import 'l10n/app_localizations.dart';
///
/// return MaterialApp(
///   localizationsDelegates: S.localizationsDelegates,
///   supportedLocales: S.supportedLocales,
///   home: MyApplicationHome(),
/// );
/// ```
///
/// ## Update pubspec.yaml
///
/// Please make sure to update your pubspec.yaml to include the following
/// packages:
///
/// ```yaml
/// dependencies:
///   # Internationalization support.
///   flutter_localizations:
///     sdk: flutter
///   intl: any # Use the pinned version from flutter_localizations
///
///   # Rest of dependencies
/// ```
///
/// ## iOS Applications
///
/// iOS applications define key application metadata, including supported
/// locales, in an Info.plist file that is built into the application bundle.
/// To configure the locales supported by your app, you’ll need to edit this
/// file.
///
/// First, open your project’s ios/Runner.xcworkspace Xcode workspace file.
/// Then, in the Project Navigator, open the Info.plist file under the Runner
/// project’s Runner folder.
///
/// Next, select the Information Property List item, select Add Item from the
/// Editor menu, then select Localizations from the pop-up menu.
///
/// Select and expand the newly-created Localizations item then, for each
/// locale your application supports, add a new item and select the locale
/// you wish to add from the pop-up menu in the Value field. This list should
/// be consistent with the languages listed in the S.supportedLocales
/// property.
abstract class S {
  S(String locale)
    : localeName = intl.Intl.canonicalizedLocale(locale.toString());

  final String localeName;

  static S of(BuildContext context) {
    return Localizations.of<S>(context, S)!;
  }

  static const LocalizationsDelegate<S> delegate = _SDelegate();

  /// A list of this localizations delegate along with the default localizations
  /// delegates.
  ///
  /// Returns a list of localizations delegates containing this delegate along with
  /// GlobalMaterialLocalizations.delegate, GlobalCupertinoLocalizations.delegate,
  /// and GlobalWidgetsLocalizations.delegate.
  ///
  /// Additional delegates can be added by appending to this list in
  /// MaterialApp. This list does not have to be used at all if a custom list
  /// of delegates is preferred or required.
  static const List<LocalizationsDelegate<dynamic>> localizationsDelegates =
      <LocalizationsDelegate<dynamic>>[
        delegate,
        GlobalMaterialLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
      ];

  /// A list of this localizations delegate's supported locales.
  static const List<Locale> supportedLocales = <Locale>[
    Locale('de'),
    Locale('en'),
    Locale('es'),
    Locale('fr'),
    Locale('ja'),
    Locale('ko'),
    Locale('th'),
    Locale('vi'),
    Locale('zh'),
  ];

  /// No description provided for @loginTitle.
  ///
  /// In vi, this message translates to:
  /// **'Đăng nhập'**
  String get loginTitle;

  /// No description provided for @loginSubtitle.
  ///
  /// In vi, this message translates to:
  /// **'Chào mừng trở lại'**
  String get loginSubtitle;

  /// No description provided for @emailLabel.
  ///
  /// In vi, this message translates to:
  /// **'Email'**
  String get emailLabel;

  /// No description provided for @emailHint.
  ///
  /// In vi, this message translates to:
  /// **'Nhập email của bạn'**
  String get emailHint;

  /// No description provided for @passwordLabel.
  ///
  /// In vi, this message translates to:
  /// **'Mật khẩu'**
  String get passwordLabel;

  /// No description provided for @passwordHint.
  ///
  /// In vi, this message translates to:
  /// **'Nhập mật khẩu'**
  String get passwordHint;

  /// No description provided for @signInButton.
  ///
  /// In vi, this message translates to:
  /// **'Đăng nhập'**
  String get signInButton;

  /// No description provided for @authSignIn.
  ///
  /// In vi, this message translates to:
  /// **'Đăng nhập'**
  String get authSignIn;

  /// No description provided for @authSignInSemantics.
  ///
  /// In vi, this message translates to:
  /// **'Đăng nhập vào tài khoản của bạn'**
  String get authSignInSemantics;

  /// No description provided for @forgotPasswordButton.
  ///
  /// In vi, this message translates to:
  /// **'Quên mật khẩu?'**
  String get forgotPasswordButton;

  /// No description provided for @signUpPrompt.
  ///
  /// In vi, this message translates to:
  /// **'Chưa có tài khoản?'**
  String get signUpPrompt;

  /// No description provided for @signUpLink.
  ///
  /// In vi, this message translates to:
  /// **'Đăng ký'**
  String get signUpLink;

  /// No description provided for @orText.
  ///
  /// In vi, this message translates to:
  /// **'hoặc'**
  String get orText;

  /// No description provided for @authOr.
  ///
  /// In vi, this message translates to:
  /// **'hoặc'**
  String get authOr;

  /// No description provided for @googleSignInButton.
  ///
  /// In vi, this message translates to:
  /// **'Đăng nhập với Google'**
  String get googleSignInButton;

  /// No description provided for @authGoogleSignInSemantics.
  ///
  /// In vi, this message translates to:
  /// **'Đăng nhập bằng Google'**
  String get authGoogleSignInSemantics;

  /// No description provided for @registerTitle.
  ///
  /// In vi, this message translates to:
  /// **'Tạo tài khoản'**
  String get registerTitle;

  /// No description provided for @registerSubtitle.
  ///
  /// In vi, this message translates to:
  /// **'Tham gia cùng chúng tôi'**
  String get registerSubtitle;

  /// No description provided for @nameLabel.
  ///
  /// In vi, this message translates to:
  /// **'Họ và tên'**
  String get nameLabel;

  /// No description provided for @nameHint.
  ///
  /// In vi, this message translates to:
  /// **'Nhập họ và tên của bạn'**
  String get nameHint;

  /// No description provided for @confirmPasswordLabel.
  ///
  /// In vi, this message translates to:
  /// **'Xác nhận mật khẩu'**
  String get confirmPasswordLabel;

  /// No description provided for @confirmPasswordHint.
  ///
  /// In vi, this message translates to:
  /// **'Xác nhận mật khẩu của bạn'**
  String get confirmPasswordHint;

  /// No description provided for @signUpButton.
  ///
  /// In vi, this message translates to:
  /// **'Đăng ký'**
  String get signUpButton;

  /// No description provided for @authCreateAccount.
  ///
  /// In vi, this message translates to:
  /// **'Tạo tài khoản'**
  String get authCreateAccount;

  /// No description provided for @authCreateAccountSemantics.
  ///
  /// In vi, this message translates to:
  /// **'Tạo tài khoản mới'**
  String get authCreateAccountSemantics;

  /// No description provided for @alreadyHaveAccountPrompt.
  ///
  /// In vi, this message translates to:
  /// **'Đã có tài khoản?'**
  String get alreadyHaveAccountPrompt;

  /// No description provided for @signInLink.
  ///
  /// In vi, this message translates to:
  /// **'Đăng nhập'**
  String get signInLink;

  /// No description provided for @googleRegisterButton.
  ///
  /// In vi, this message translates to:
  /// **'Đăng ký với Google'**
  String get googleRegisterButton;

  /// No description provided for @forgotPasswordTitle.
  ///
  /// In vi, this message translates to:
  /// **'Quên mật khẩu'**
  String get forgotPasswordTitle;

  /// No description provided for @resetPasswordTitle.
  ///
  /// In vi, this message translates to:
  /// **'Đặt lại mật khẩu'**
  String get resetPasswordTitle;

  /// No description provided for @resetPasswordDescription.
  ///
  /// In vi, this message translates to:
  /// **'Nhập địa chỉ email của bạn và chúng tôi sẽ gửi cho bạn một mã để đặt lại mật khẩu.'**
  String get resetPasswordDescription;

  /// No description provided for @sendResetCodeButton.
  ///
  /// In vi, this message translates to:
  /// **'Gửi mã đặt lại'**
  String get sendResetCodeButton;

  /// No description provided for @backToSignInButton.
  ///
  /// In vi, this message translates to:
  /// **'Quay lại đăng nhập'**
  String get backToSignInButton;

  /// No description provided for @emailRequiredError.
  ///
  /// In vi, this message translates to:
  /// **'Email là bắt buộc'**
  String get emailRequiredError;

  /// No description provided for @validEmailError.
  ///
  /// In vi, this message translates to:
  /// **'Nhập email hợp lệ'**
  String get validEmailError;

  /// No description provided for @passwordRequiredError.
  ///
  /// In vi, this message translates to:
  /// **'Mật khẩu là bắt buộc'**
  String get passwordRequiredError;

  /// No description provided for @confirmPasswordRequiredError.
  ///
  /// In vi, this message translates to:
  /// **'Vui lòng xác nhận mật khẩu của bạn'**
  String get confirmPasswordRequiredError;

  /// No description provided for @passwordMismatchError.
  ///
  /// In vi, this message translates to:
  /// **'Mật khẩu không khớp'**
  String get passwordMismatchError;

  /// No description provided for @unexpectedErrorMessage.
  ///
  /// In vi, this message translates to:
  /// **'Đã xảy ra lỗi không mong muốn. Vui lòng thử lại.'**
  String get unexpectedErrorMessage;

  /// No description provided for @unexpectedErrorMessage2.
  ///
  /// In vi, this message translates to:
  /// **'Đã xảy ra lỗi không mong muốn'**
  String get unexpectedErrorMessage2;

  /// No description provided for @enterResetCodeTitle.
  ///
  /// In vi, this message translates to:
  /// **'Nhập mã đặt lại'**
  String get enterResetCodeTitle;

  /// No description provided for @resetCodeDescription.
  ///
  /// In vi, this message translates to:
  /// **'Chúng tôi đã gửi mã 6 chữ số tới'**
  String get resetCodeDescription;

  /// No description provided for @verifyCodeButton.
  ///
  /// In vi, this message translates to:
  /// **'Xác minh mã'**
  String get verifyCodeButton;

  /// No description provided for @didNotReceiveCodePrompt.
  ///
  /// In vi, this message translates to:
  /// **'Không nhận được mã?'**
  String get didNotReceiveCodePrompt;

  /// No description provided for @resendButton.
  ///
  /// In vi, this message translates to:
  /// **'Gửi lại'**
  String get resendButton;

  /// No description provided for @verifyingCodeMessage.
  ///
  /// In vi, this message translates to:
  /// **'Đang xác minh mã...'**
  String get verifyingCodeMessage;

  /// No description provided for @verificationFailedMessage.
  ///
  /// In vi, this message translates to:
  /// **'Xác minh thất bại'**
  String get verificationFailedMessage;

  /// No description provided for @resetCodeSentMessage.
  ///
  /// In vi, this message translates to:
  /// **'Mã đặt lại mới đã được gửi'**
  String get resetCodeSentMessage;

  /// No description provided for @resendCodeFailedMessage.
  ///
  /// In vi, this message translates to:
  /// **'Không thể gửi lại mã'**
  String get resendCodeFailedMessage;

  /// No description provided for @verifyButton.
  ///
  /// In vi, this message translates to:
  /// **'Xác minh'**
  String get verifyButton;

  /// No description provided for @verificationCodeSentMessage.
  ///
  /// In vi, this message translates to:
  /// **'Mã xác minh mới đã được gửi'**
  String get verificationCodeSentMessage;

  /// No description provided for @verifyCodeFailedMessage.
  ///
  /// In vi, this message translates to:
  /// **'Không thể gửi lại mã'**
  String get verifyCodeFailedMessage;

  /// No description provided for @resetPasswordButton.
  ///
  /// In vi, this message translates to:
  /// **'Đặt lại mật khẩu'**
  String get resetPasswordButton;

  /// No description provided for @changePasswordTitle.
  ///
  /// In vi, this message translates to:
  /// **'Đổi mật khẩu'**
  String get changePasswordTitle;

  /// No description provided for @newPasswordLabel.
  ///
  /// In vi, this message translates to:
  /// **'Mật khẩu mới'**
  String get newPasswordLabel;

  /// No description provided for @newPasswordHint.
  ///
  /// In vi, this message translates to:
  /// **'Nhập mật khẩu mới'**
  String get newPasswordHint;

  /// No description provided for @selectLevelTitle.
  ///
  /// In vi, this message translates to:
  /// **'Chọn trình độ của bạn'**
  String get selectLevelTitle;

  /// No description provided for @selectDialectTitle.
  ///
  /// In vi, this message translates to:
  /// **'Chọn phương ngữ của bạn'**
  String get selectDialectTitle;

  /// No description provided for @selectGoalsTitle.
  ///
  /// In vi, this message translates to:
  /// **'Đặt mục tiêu hàng ngày'**
  String get selectGoalsTitle;

  /// No description provided for @standardDialect.
  ///
  /// In vi, this message translates to:
  /// **'Tiêu chuẩn'**
  String get standardDialect;

  /// No description provided for @standardDialectDescription.
  ///
  /// In vi, this message translates to:
  /// **'Tiêu chuẩn chung'**
  String get standardDialectDescription;

  /// No description provided for @northernDialect.
  ///
  /// In vi, this message translates to:
  /// **'Miền Bắc'**
  String get northernDialect;

  /// No description provided for @northernDialectDescription.
  ///
  /// In vi, this message translates to:
  /// **'Miền Bắc Việt Nam (Hà Nội)'**
  String get northernDialectDescription;

  /// No description provided for @centralDialect.
  ///
  /// In vi, this message translates to:
  /// **'Miền Trung'**
  String get centralDialect;

  /// No description provided for @centralDialectDescription.
  ///
  /// In vi, this message translates to:
  /// **'Miền Trung Việt Nam (Huế, Đà Nẵng)'**
  String get centralDialectDescription;

  /// No description provided for @southernDialect.
  ///
  /// In vi, this message translates to:
  /// **'Miền Nam'**
  String get southernDialect;

  /// No description provided for @southernDialectDescription.
  ///
  /// In vi, this message translates to:
  /// **'Miền Nam Việt Nam (Thành phố Hồ Chí Minh)'**
  String get southernDialectDescription;

  /// No description provided for @bypassDialogTitle.
  ///
  /// In vi, this message translates to:
  /// **'Bỏ qua bài học?'**
  String get bypassDialogTitle;

  /// No description provided for @bypassDialogContent.
  ///
  /// In vi, this message translates to:
  /// **'Bạn đã chọn trình độ cao hơn. Bạn có thể bỏ qua bài học và đi thẳng đến bài tập.'**
  String get bypassDialogContent;

  /// No description provided for @continueWithLessonsButton.
  ///
  /// In vi, this message translates to:
  /// **'Tiếp tục với bài học'**
  String get continueWithLessonsButton;

  /// No description provided for @skipToExercisesButton.
  ///
  /// In vi, this message translates to:
  /// **'Bỏ qua đến bài tập'**
  String get skipToExercisesButton;

  /// No description provided for @completeLowerCoursesCheckbox.
  ///
  /// In vi, this message translates to:
  /// **'Hoàn thành tất cả các khóa học trình độ thấp hơn trước'**
  String get completeLowerCoursesCheckbox;

  /// No description provided for @nextButton.
  ///
  /// In vi, this message translates to:
  /// **'Tiếp theo'**
  String get nextButton;

  /// No description provided for @finishButton.
  ///
  /// In vi, this message translates to:
  /// **'Hoàn thành'**
  String get finishButton;

  /// No description provided for @onboardingCompleteTitle.
  ///
  /// In vi, this message translates to:
  /// **'Tất cả đã sẵn sàng!'**
  String get onboardingCompleteTitle;

  /// No description provided for @onboardingCompleteMessage.
  ///
  /// In vi, this message translates to:
  /// **'Bạn đã sẵn sàng để bắt đầu học'**
  String get onboardingCompleteMessage;

  /// No description provided for @startLearningButton.
  ///
  /// In vi, this message translates to:
  /// **'Bắt đầu học'**
  String get startLearningButton;

  /// No description provided for @goodMorning.
  ///
  /// In vi, this message translates to:
  /// **'Chào buổi sáng'**
  String get goodMorning;

  /// No description provided for @goodAfternoon.
  ///
  /// In vi, this message translates to:
  /// **'Chào buổi chiều'**
  String get goodAfternoon;

  /// No description provided for @goodEvening.
  ///
  /// In vi, this message translates to:
  /// **'Chào buổi tối'**
  String get goodEvening;

  /// No description provided for @readyToLearnPrompt.
  ///
  /// In vi, this message translates to:
  /// **'Sẵn sàng học?'**
  String get readyToLearnPrompt;

  /// No description provided for @continueSection.
  ///
  /// In vi, this message translates to:
  /// **'Tiếp tục học'**
  String get continueSection;

  /// No description provided for @coursesSection.
  ///
  /// In vi, this message translates to:
  /// **'Khóa học'**
  String get coursesSection;

  /// No description provided for @practiceSection.
  ///
  /// In vi, this message translates to:
  /// **'Luyện tập'**
  String get practiceSection;

  /// No description provided for @noCoursesAvailable.
  ///
  /// In vi, this message translates to:
  /// **'Không có khóa học nào'**
  String get noCoursesAvailable;

  /// No description provided for @failedToLoadCourses.
  ///
  /// In vi, this message translates to:
  /// **'Không thể tải khóa học'**
  String get failedToLoadCourses;

  /// No description provided for @retryButton.
  ///
  /// In vi, this message translates to:
  /// **'Thử lại'**
  String get retryButton;

  /// No description provided for @coursesTitle.
  ///
  /// In vi, this message translates to:
  /// **'Khóa học'**
  String get coursesTitle;

  /// No description provided for @courseDetailTitle.
  ///
  /// In vi, this message translates to:
  /// **'Khóa học'**
  String get courseDetailTitle;

  /// No description provided for @moduleDetailTitle.
  ///
  /// In vi, this message translates to:
  /// **'Mô-đun'**
  String get moduleDetailTitle;

  /// No description provided for @failedToLoadCourse.
  ///
  /// In vi, this message translates to:
  /// **'Không thể tải khóa học'**
  String get failedToLoadCourse;

  /// No description provided for @failedToLoadModule.
  ///
  /// In vi, this message translates to:
  /// **'Không thể tải mô-đun'**
  String get failedToLoadModule;

  /// No description provided for @lessonTitle.
  ///
  /// In vi, this message translates to:
  /// **'Bài học'**
  String get lessonTitle;

  /// No description provided for @failedToLoadLesson.
  ///
  /// In vi, this message translates to:
  /// **'Không thể tải bài học'**
  String get failedToLoadLesson;

  /// No description provided for @continueLesson.
  ///
  /// In vi, this message translates to:
  /// **'Tiếp tục bài học?'**
  String get continueLesson;

  /// No description provided for @continueLessonContent.
  ///
  /// In vi, this message translates to:
  /// **'Bạn có một bài học đang tiến hành. Bạn có muốn bỏ qua đến bài tập không?'**
  String get continueLessonContent;

  /// No description provided for @startFromBeginningButton.
  ///
  /// In vi, this message translates to:
  /// **'Bắt đầu từ đầu'**
  String get startFromBeginningButton;

  /// No description provided for @goToExercisesButton.
  ///
  /// In vi, this message translates to:
  /// **'Đi đến bài tập'**
  String get goToExercisesButton;

  /// No description provided for @exercisesTitle.
  ///
  /// In vi, this message translates to:
  /// **'Bài tập'**
  String get exercisesTitle;

  /// No description provided for @exercisePlayTitle.
  ///
  /// In vi, this message translates to:
  /// **'Bài tập'**
  String get exercisePlayTitle;

  /// No description provided for @bookmarksTitle.
  ///
  /// In vi, this message translates to:
  /// **'Dấu trang'**
  String get bookmarksTitle;

  /// No description provided for @savedWordsTitle.
  ///
  /// In vi, this message translates to:
  /// **'Từ đã lưu'**
  String get savedWordsTitle;

  /// No description provided for @removeSavedWordTitle.
  ///
  /// In vi, this message translates to:
  /// **'Xóa từ đã lưu'**
  String get removeSavedWordTitle;

  /// No description provided for @removeSavedWordContent.
  ///
  /// In vi, this message translates to:
  /// **'Bạn có chắc chắn muốn xóa từ này khỏi các từ đã lưu không?'**
  String get removeSavedWordContent;

  /// No description provided for @cancelButton.
  ///
  /// In vi, this message translates to:
  /// **'Hủy'**
  String get cancelButton;

  /// No description provided for @removeButton.
  ///
  /// In vi, this message translates to:
  /// **'Xóa'**
  String get removeButton;

  /// No description provided for @noSavedWords.
  ///
  /// In vi, this message translates to:
  /// **'Không có từ đã lưu'**
  String get noSavedWords;

  /// No description provided for @classifierLabel.
  ///
  /// In vi, this message translates to:
  /// **'Bộ phân loại:'**
  String get classifierLabel;

  /// No description provided for @exampleLabel.
  ///
  /// In vi, this message translates to:
  /// **'Ví dụ:'**
  String get exampleLabel;

  /// No description provided for @tapToFlipBack.
  ///
  /// In vi, this message translates to:
  /// **'Nhấn để lật lại'**
  String get tapToFlipBack;

  /// No description provided for @profileTitle.
  ///
  /// In vi, this message translates to:
  /// **'Hồ sơ'**
  String get profileTitle;

  /// No description provided for @settingsTitle.
  ///
  /// In vi, this message translates to:
  /// **'Cài đặt'**
  String get settingsTitle;

  /// No description provided for @settingsButton.
  ///
  /// In vi, this message translates to:
  /// **'Cài đặt'**
  String get settingsButton;

  /// No description provided for @failedToLoadSettings.
  ///
  /// In vi, this message translates to:
  /// **'Không thể tải cài đặt'**
  String get failedToLoadSettings;

  /// No description provided for @accountSection.
  ///
  /// In vi, this message translates to:
  /// **'Tài khoản'**
  String get accountSection;

  /// No description provided for @editProfileTitle.
  ///
  /// In vi, this message translates to:
  /// **'Chỉnh sửa hồ sơ'**
  String get editProfileTitle;

  /// No description provided for @editProfileSubtitle.
  ///
  /// In vi, this message translates to:
  /// **'Tên, ngôn ngữ, trình độ, phương ngữ'**
  String get editProfileSubtitle;

  /// No description provided for @changePasswordSubtitle.
  ///
  /// In vi, this message translates to:
  /// **'Gửi mã xác minh đến email của bạn'**
  String get changePasswordSubtitle;

  /// No description provided for @clearDataTitle.
  ///
  /// In vi, this message translates to:
  /// **'Xóa dữ liệu'**
  String get clearDataTitle;

  /// No description provided for @clearDataSubtitle.
  ///
  /// In vi, this message translates to:
  /// **'Xóa tất cả tiến độ, dấu trang, thống kê và lịch sử AI'**
  String get clearDataSubtitle;

  /// No description provided for @assistantSection.
  ///
  /// In vi, this message translates to:
  /// **'Trợ lý'**
  String get assistantSection;

  /// No description provided for @aiAssistantBarTitle.
  ///
  /// In vi, this message translates to:
  /// **'Thanh trợ lý AI'**
  String get aiAssistantBarTitle;

  /// No description provided for @aiAssistantBarSubtitle.
  ///
  /// In vi, this message translates to:
  /// **'Hiển thị trên màn hình bài học và bài tập'**
  String get aiAssistantBarSubtitle;

  /// No description provided for @viewSavedWordsButton.
  ///
  /// In vi, this message translates to:
  /// **'Xem các từ đã lưu'**
  String get viewSavedWordsButton;

  /// No description provided for @chatTitle.
  ///
  /// In vi, this message translates to:
  /// **'Trò chuyện'**
  String get chatTitle;

  /// No description provided for @practiceTitle.
  ///
  /// In vi, this message translates to:
  /// **'Trò chuyện'**
  String get practiceTitle;

  /// No description provided for @conversationHistoryTitle.
  ///
  /// In vi, this message translates to:
  /// **'Lịch sử trò chuyện'**
  String get conversationHistoryTitle;

  /// No description provided for @chooseCharacterTitle.
  ///
  /// In vi, this message translates to:
  /// **'Chọn nhân vật'**
  String get chooseCharacterTitle;

  /// No description provided for @unableToLoadDataMessage.
  ///
  /// In vi, this message translates to:
  /// **'Không thể tải dữ liệu'**
  String get unableToLoadDataMessage;

  /// No description provided for @simulationResultTitle.
  ///
  /// In vi, this message translates to:
  /// **'Kết quả mô phỏng'**
  String get simulationResultTitle;

  /// No description provided for @unableToLoadResultMessage.
  ///
  /// In vi, this message translates to:
  /// **'Không thể tải kết quả'**
  String get unableToLoadResultMessage;

  /// No description provided for @sessionEndedMessage.
  ///
  /// In vi, this message translates to:
  /// **'Phiên đã kết thúc'**
  String get sessionEndedMessage;

  /// No description provided for @viewResultsButton.
  ///
  /// In vi, this message translates to:
  /// **'Xem kết quả'**
  String get viewResultsButton;

  /// No description provided for @failedToLoadCategoriesMessage.
  ///
  /// In vi, this message translates to:
  /// **'Không thể tải danh mục'**
  String get failedToLoadCategoriesMessage;

  /// No description provided for @failedToLoadCategoriesTitle.
  ///
  /// In vi, this message translates to:
  /// **'Không thể tải danh mục'**
  String get failedToLoadCategoriesTitle;

  /// No description provided for @unableToCreateSessionMessage.
  ///
  /// In vi, this message translates to:
  /// **'Không thể tạo phiên trò chuyện'**
  String get unableToCreateSessionMessage;

  /// No description provided for @imageDiscoveryTitle.
  ///
  /// In vi, this message translates to:
  /// **'Khám phá hình ảnh'**
  String get imageDiscoveryTitle;

  /// No description provided for @addPhotoTitle.
  ///
  /// In vi, this message translates to:
  /// **'Thêm ảnh'**
  String get addPhotoTitle;

  /// No description provided for @takePhotoOption.
  ///
  /// In vi, this message translates to:
  /// **'Chụp ảnh'**
  String get takePhotoOption;

  /// No description provided for @uploadFromLibraryOption.
  ///
  /// In vi, this message translates to:
  /// **'Tải lên từ thư viện'**
  String get uploadFromLibraryOption;

  /// No description provided for @attachedPhotosTitle.
  ///
  /// In vi, this message translates to:
  /// **'Ảnh đã đính kèm'**
  String get attachedPhotosTitle;

  /// No description provided for @resetSessionButton.
  ///
  /// In vi, this message translates to:
  /// **'Đặt lại phiên'**
  String get resetSessionButton;

  /// No description provided for @cancelButton2.
  ///
  /// In vi, this message translates to:
  /// **'Hủy'**
  String get cancelButton2;

  /// No description provided for @appName.
  ///
  /// In vi, this message translates to:
  /// **'LinVNix'**
  String get appName;

  /// No description provided for @authAppTitleSemantics.
  ///
  /// In vi, this message translates to:
  /// **'LinVNix - Học tiếng Việt'**
  String get authAppTitleSemantics;

  /// No description provided for @authAppTagline.
  ///
  /// In vi, this message translates to:
  /// **'Học tiếng Việt mỗi ngày'**
  String get authAppTagline;

  /// No description provided for @authEmailHint.
  ///
  /// In vi, this message translates to:
  /// **'Nhập email của bạn'**
  String get authEmailHint;

  /// No description provided for @authEmailInputSemantics.
  ///
  /// In vi, this message translates to:
  /// **'Trường nhập email'**
  String get authEmailInputSemantics;

  /// No description provided for @authEmailRequired.
  ///
  /// In vi, this message translates to:
  /// **'Email là bắt buộc'**
  String get authEmailRequired;

  /// No description provided for @authEmailInvalid.
  ///
  /// In vi, this message translates to:
  /// **'Nhập email hợp lệ'**
  String get authEmailInvalid;

  /// No description provided for @authPasswordInputSemantics.
  ///
  /// In vi, this message translates to:
  /// **'Trường nhập mật khẩu'**
  String get authPasswordInputSemantics;

  /// No description provided for @authPasswordRequired.
  ///
  /// In vi, this message translates to:
  /// **'Mật khẩu là bắt buộc'**
  String get authPasswordRequired;

  /// No description provided for @authShowPassword.
  ///
  /// In vi, this message translates to:
  /// **'Hiện mật khẩu'**
  String get authShowPassword;

  /// No description provided for @authHidePassword.
  ///
  /// In vi, this message translates to:
  /// **'Ẩn mật khẩu'**
  String get authHidePassword;

  /// No description provided for @authForgotPassword.
  ///
  /// In vi, this message translates to:
  /// **'Quên mật khẩu?'**
  String get authForgotPassword;

  /// No description provided for @authForgotPasswordSemantics.
  ///
  /// In vi, this message translates to:
  /// **'Điều hướng đến trang quên mật khẩu'**
  String get authForgotPasswordSemantics;

  /// No description provided for @authAlreadyHaveAccount.
  ///
  /// In vi, this message translates to:
  /// **'Đã có tài khoản?'**
  String get authAlreadyHaveAccount;

  /// No description provided for @authConfirmPasswordRequired.
  ///
  /// In vi, this message translates to:
  /// **'Vui lòng xác nhận mật khẩu'**
  String get authConfirmPasswordRequired;

  /// No description provided for @authPasswordMismatch.
  ///
  /// In vi, this message translates to:
  /// **'Mật khẩu không khớp'**
  String get authPasswordMismatch;

  /// No description provided for @authForgotPasswordTitle.
  ///
  /// In vi, this message translates to:
  /// **'Quên mật khẩu'**
  String get authForgotPasswordTitle;

  /// No description provided for @authResetPassword.
  ///
  /// In vi, this message translates to:
  /// **'Đặt lại mật khẩu'**
  String get authResetPassword;

  /// No description provided for @authResetPasswordDescription.
  ///
  /// In vi, this message translates to:
  /// **'Nhập địa chỉ email của bạn và chúng tôi sẽ gửi mã đặt lại.'**
  String get authResetPasswordDescription;

  /// No description provided for @authSendResetCode.
  ///
  /// In vi, this message translates to:
  /// **'Gửi mã đặt lại'**
  String get authSendResetCode;

  /// No description provided for @authBackToSignIn.
  ///
  /// In vi, this message translates to:
  /// **'Quay lại đăng nhập'**
  String get authBackToSignIn;

  /// No description provided for @authBackToSettings.
  ///
  /// In vi, this message translates to:
  /// **'Quay lại cài đặt'**
  String get authBackToSettings;

  /// No description provided for @authEnterResetCode.
  ///
  /// In vi, this message translates to:
  /// **'Nhập mã đặt lại'**
  String get authEnterResetCode;

  /// No description provided for @authResetCodeDescription.
  ///
  /// In vi, this message translates to:
  /// **'Chúng tôi đã gửi mã 6 chữ số tới'**
  String get authResetCodeDescription;

  /// No description provided for @authVerifyCode.
  ///
  /// In vi, this message translates to:
  /// **'Xác minh mã'**
  String get authVerifyCode;

  /// No description provided for @authVerifyingCode.
  ///
  /// In vi, this message translates to:
  /// **'Đang xác minh mã...'**
  String get authVerifyingCode;

  /// No description provided for @authVerify.
  ///
  /// In vi, this message translates to:
  /// **'Xác minh'**
  String get authVerify;

  /// No description provided for @authVerificationFailed.
  ///
  /// In vi, this message translates to:
  /// **'Xác minh thất bại'**
  String get authVerificationFailed;

  /// No description provided for @authResetCodeSent.
  ///
  /// In vi, this message translates to:
  /// **'Mã đặt lại mới đã được gửi'**
  String get authResetCodeSent;

  /// No description provided for @authResendCodeFailed.
  ///
  /// In vi, this message translates to:
  /// **'Không thể gửi lại mã'**
  String get authResendCodeFailed;

  /// No description provided for @authResend.
  ///
  /// In vi, this message translates to:
  /// **'Gửi lại'**
  String get authResend;

  /// No description provided for @authDidNotReceiveCode.
  ///
  /// In vi, this message translates to:
  /// **'Không nhận được mã?'**
  String get authDidNotReceiveCode;

  /// No description provided for @authSetNewPassword.
  ///
  /// In vi, this message translates to:
  /// **'Đặt mật khẩu mới'**
  String get authSetNewPassword;

  /// No description provided for @authNewPassword.
  ///
  /// In vi, this message translates to:
  /// **'Mật khẩu mới'**
  String get authNewPassword;

  /// No description provided for @authChooseStrongPassword.
  ///
  /// In vi, this message translates to:
  /// **'Chọn mật khẩu mạnh'**
  String get authChooseStrongPassword;

  /// No description provided for @authConfirmPassword.
  ///
  /// In vi, this message translates to:
  /// **'Xác nhận mật khẩu'**
  String get authConfirmPassword;

  /// No description provided for @authPasswordResetSuccess.
  ///
  /// In vi, this message translates to:
  /// **'Đặt lại thành công'**
  String get authPasswordResetSuccess;

  /// No description provided for @authPasswordChangedSuccess.
  ///
  /// In vi, this message translates to:
  /// **'Mật khẩu đã được thay đổi'**
  String get authPasswordChangedSuccess;

  /// No description provided for @authPasswordResetSuccessMessage.
  ///
  /// In vi, this message translates to:
  /// **'Mật khẩu của bạn đã được đặt lại thành công.'**
  String get authPasswordResetSuccessMessage;

  /// No description provided for @authEmailVerification.
  ///
  /// In vi, this message translates to:
  /// **'Xác minh email'**
  String get authEmailVerification;

  /// No description provided for @authCheckEmail.
  ///
  /// In vi, this message translates to:
  /// **'Kiểm tra email của bạn'**
  String get authCheckEmail;

  /// No description provided for @authVerificationCodeSent.
  ///
  /// In vi, this message translates to:
  /// **'Mã xác minh mới đã được gửi'**
  String get authVerificationCodeSent;

  /// No description provided for @authEmailVerified.
  ///
  /// In vi, this message translates to:
  /// **'Email đã được xác minh'**
  String get authEmailVerified;

  /// No description provided for @authEmailVerifiedSuccess.
  ///
  /// In vi, this message translates to:
  /// **'Email của bạn đã được xác minh thành công'**
  String get authEmailVerifiedSuccess;

  /// No description provided for @authContinueHome.
  ///
  /// In vi, this message translates to:
  /// **'Tiếp tục'**
  String get authContinueHome;

  /// No description provided for @languageSection.
  ///
  /// In vi, this message translates to:
  /// **'Ngôn ngữ giao diện'**
  String get languageSection;

  /// No description provided for @languageEnglish.
  ///
  /// In vi, this message translates to:
  /// **'Tiếng Anh'**
  String get languageEnglish;

  /// No description provided for @languageVietnamese.
  ///
  /// In vi, this message translates to:
  /// **'Tiếng Việt'**
  String get languageVietnamese;
}

class _SDelegate extends LocalizationsDelegate<S> {
  const _SDelegate();

  @override
  Future<S> load(Locale locale) {
    return SynchronousFuture<S>(lookupS(locale));
  }

  @override
  bool isSupported(Locale locale) => <String>[
    'de',
    'en',
    'es',
    'fr',
    'ja',
    'ko',
    'th',
    'vi',
    'zh',
  ].contains(locale.languageCode);

  @override
  bool shouldReload(_SDelegate old) => false;
}

S lookupS(Locale locale) {
  // Lookup logic when only language code is specified.
  switch (locale.languageCode) {
    case 'de':
      return SDe();
    case 'en':
      return SEn();
    case 'es':
      return SEs();
    case 'fr':
      return SFr();
    case 'ja':
      return SJa();
    case 'ko':
      return SKo();
    case 'th':
      return STh();
    case 'vi':
      return SVi();
    case 'zh':
      return SZh();
  }

  throw FlutterError(
    'S.delegate failed to load unsupported locale "$locale". This is likely '
    'an issue with the localizations generation tool. Please file an issue '
    'on GitHub with a reproducible sample app and the gen-l10n configuration '
    'that was used.',
  );
}
