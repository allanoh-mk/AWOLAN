load("@rules_android//android:rules.bzl", "android_binary")
load("@rules_android//android:rules.bzl", "android_library")

android_binary(
    name = "awolan",
    manifest = "//app/src/main:AndroidManifest.xml",
    manifest_values = {
        "minSdkVersion": "24",
        "targetSdkVersion": "35",  # Updated to match API level
        "versionCode": "1",
        "versionName": "1.0",
    },
    deps = [
        "//app/src/main:main_lib",
    ],
)