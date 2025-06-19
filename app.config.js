import 'dotenv/config';

export default {
  owner: "balaji_naga",
  expo: {
    name: "SwarnAayu",
    slug: "voice-test",
    version: "1.0.0",
    orientation: "portrait",
    scheme: "SwarnaAyu",
    userInterfaceStyle: "automatic",
    newArchEnabled: false,

    splash: {
      image: "./assets/images/splash.png",
      resizeMode: "cover",
      backgroundColor: "#ffffff",
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
        projectId: "2db3e96f-5651-480e-b423-9644cc5c2cc0"
      }
    }
  }
};
