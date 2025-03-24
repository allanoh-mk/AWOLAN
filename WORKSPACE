load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")

# Android SDK repository
android_sdk_repository(
    name = "androidsdk",
    api_level = 35,  # Updated to match installed API level
    path = "C:/Users/allan/AppData/Local/Android/Sdk",
    build_tools_version = "35.0.1",  # Updated to match installed version
)

# Android NDK repository
android_ndk_repository(
    name = "androidndk",
    path = "C:/Users/allan/AppData/Local/Android/Sdk/ndk/25.2.9519653",  # Updated to a stable version
    api_level = 24,
)

# Rules Android
http_archive(
    name = "rules_android",
    sha256 = "cd06d15dd8bb59926e4d65f9003bfc20f9da4b2519985c27e190cddc8b7a7806",
    url = "https://github.com/bazelbuild/rules_android/archive/v0.1.1.zip",
    strip_prefix = "rules_android-0.1.1",
)

# Rules JVM External
RULES_JVM_EXTERNAL_TAG = "4.5"
RULES_JVM_EXTERNAL_SHA = "b17d7388feb9bfa7f2fa09031b32707df529f26c91ab9e5d909eb1676badd9a6"

http_archive(
    name = "rules_jvm_external",
    strip_prefix = "rules_jvm_external-%s" % RULES_JVM_EXTERNAL_TAG,
    sha256 = RULES_JVM_EXTERNAL_SHA,
    url = "https://github.com/bazelbuild/rules_jvm_external/archive/%s.zip" % RULES_JVM_EXTERNAL_TAG,
)

# Load rules_jvm_external dependencies
load("@rules_jvm_external//:repositories.bzl", "rules_jvm_external_deps")
rules_jvm_external_deps()

# Maven dependencies
load("@rules_jvm_external//:defs.bzl", "maven_install")

maven_install(
    name = "maven",
    artifacts = [
        "androidx.appcompat:appcompat:1.6.1",
        "com.google.android.material:material:1.11.0",
        "androidx.constraintlayout:constraintlayout:2.1.4",
    ],
    repositories = [
        "https://maven.google.com",
        "https://repo1.maven.org/maven2",
    ],
)
