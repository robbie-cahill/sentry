from sentry.testutils.helpers.options import override_options
from sentry.utils.sdk_crashes.sdk_crash_detection_config import (
    SDKCrashDetectionConfig,
    SdkName,
    build_sdk_crash_detection_configs,
)


@override_options(
    {
        "issues.sdk_crash_detection.cocoa.project_id": 1,
        "issues.sdk_crash_detection.cocoa.sample_rate": 0.1,
        "issues.sdk_crash_detection.react-native.project_id": 2,
        "issues.sdk_crash_detection.react-native.sample_rate": 0.2,
        "issues.sdk_crash_detection.react-native.organization_allowlist": [1],
    }
)
def test_build_sdk_crash_detection_configs():
    configs = build_sdk_crash_detection_configs()

    assert configs == [
        SDKCrashDetectionConfig(
            sdk_name=SdkName.Cocoa,
            project_id=1,
            sample_rate=0.1,
            organization_allowlist=None,
        ),
        SDKCrashDetectionConfig(
            sdk_name=SdkName.ReactNative, project_id=2, sample_rate=0.2, organization_allowlist=[1]
        ),
    ]


@override_options(
    {
        "issues.sdk_crash_detection.cocoa.project_id": None,
        "issues.sdk_crash_detection.cocoa.sample_rate": None,
        "issues.sdk_crash_detection.react-native.project_id": 2,
        "issues.sdk_crash_detection.react-native.sample_rate": 0.2,
        "issues.sdk_crash_detection.react-native.organization_allowlist": [1],
    }
)
def test_build_sdk_crash_detection_configs_only_react_native():
    configs = build_sdk_crash_detection_configs()

    assert configs == [
        SDKCrashDetectionConfig(
            sdk_name=SdkName.ReactNative, project_id=2, sample_rate=0.2, organization_allowlist=[1]
        ),
    ]


@override_options(
    {
        "issues.sdk_crash_detection.cocoa.project_id": 1.0,
        "issues.sdk_crash_detection.cocoa.sample_rate": None,
        "issues.sdk_crash_detection.react-native.project_id": 2,
        "issues.sdk_crash_detection.react-native.sample_rate": 0.2,
        "issues.sdk_crash_detection.react-native.organization_allowlist": [1],
    }
)
def test_build_sdk_crash_detection_configs_no_sample_rate():
    configs = build_sdk_crash_detection_configs()

    assert configs == [
        SDKCrashDetectionConfig(
            sdk_name=SdkName.ReactNative, project_id=2, sample_rate=0.2, organization_allowlist=[1]
        ),
    ]


@override_options(
    {
        "issues.sdk_crash_detection.cocoa.project_id": None,
        "issues.sdk_crash_detection.cocoa.sample_rate": None,
        "issues.sdk_crash_detection.react-native.project_id": None,
        "issues.sdk_crash_detection.react-native.sample_rate": None,
        "issues.sdk_crash_detection.react-native.organization_allowlist": [],
    }
)
def test_build_sdk_crash_detection_configs_no_configs():
    assert len(build_sdk_crash_detection_configs()) == 0
