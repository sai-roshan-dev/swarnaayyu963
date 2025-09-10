import 'dotenv/config';

export default {
  owner: "balaji_naga",
  expo: {
    name: "Aayu",
    slug: "aayu",
    version: "4.2.2",
    orientation: "portrait",
    scheme: "Aayu",
    userInterfaceStyle: "automatic",
    newArchEnabled: false,

    icon: "./assets/images/image.png",

    

    ios: {
      infoPlist: {
        NSMicrophoneUsageDescription: "This app uses the microphone to record audio.",
      },
      supportsTablet: true,
      bundleIdentifier: "com.sai.swarnaayu",
      icon: "./assets/images/image.png",
      buildNumber: "22",
    },

    android: {
      versionCode: 2,
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
            "projectId": "8dfca521-6f5f-415a-8d08-db8d9cfa23c7"
      }
    }
  }
};





