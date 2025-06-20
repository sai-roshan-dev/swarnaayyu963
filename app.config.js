import 'dotenv/config';

export default {
  owner: "balaji_naga",
  expo: {
    name: "Aayu",
    slug: "Aayu",
    version: "1.0.0",
    orientation: "portrait",
    scheme: "Aayu",
    userInterfaceStyle: "automatic",
    newArchEnabled: false,

    splash: {
      image: "./assets/images/aayu.png",
      resizeMode: "cover",
      backgroundColor: "#000000",
    },

    ios: {
      infoPlist: {
        NSMicrophoneUsageDescription: "This app uses the microphone to record audio.",
      },
      supportsTablet: true,
      bundleIdentifier: "com.sai.swarnaayu",
      icon: "./assets/images/image.png",
    },

    android: {
      package: "com.sai.swarnaayu",
      adaptiveIcon: {
        foregroundImage: "./assets/images/image.png",
        backgroundColor: "#000000",
      },
      permissions: ["android.permission.RECORD_AUDIO"],
    },

    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/image.png",
    },

    plugins: ["expo-router", "expo-secure-store"],

    experiments: {
      typedRoutes: true,
    },

    extra: {
      XI_AGENT_ID: process.env.XI_AGENT_ID,
      XI_API_KEY: process.env.XI_API_KEY,
      eas: {
        "projectId": "1152ab6c-d0d5-4b1d-8982-316b69947a04"
      }
    }
  }
};
