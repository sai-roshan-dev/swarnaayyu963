import React from 'react'
import { Stack } from 'expo-router'

export default function AppLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="ai-voice" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="history" />
      <Stack.Screen name="edit-profile" />
      <Stack.Screen name="my-privacy" />
      <Stack.Screen name="about-aayu" />
    </Stack>
  )
}