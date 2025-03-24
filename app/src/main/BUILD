load("@rules_android//android:rules.bzl", "android_library")

android_library(
    name = "main_lib",
    srcs = glob(["java/**/*.java"]),
    manifest = "AndroidManifest.xml",
    resource_files = glob(["res/**/*"]),
    deps = [
        "@maven//:androidx_appcompat_appcompat",
        "@maven//:com_google_android_material_material",
        "@maven//:androidx_constraintlayout_constraintlayout",
    ],
    visibility = ["//visibility:public"],
)