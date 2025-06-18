import { AuthContextProvider, useAuth } from '@/context/AuthContext';
import RootLayoutNav from '@/components/RootLayoutNav';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native';


export default function RootLayout() {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <AuthContextProvider>
      <SafeAreaView style={styles.container}>
        <RootLayoutNav />
      </SafeAreaView>
      </AuthContextProvider>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff', // Optional default background
  },
});
