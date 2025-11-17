// app/_layout.jsx
import React from "react";
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false, // default: hide for most screens
      }}
    >
      {/* Make login show the router header (or any public/auth screens) */}
      <Stack.Screen name="(auth)/login" options={{ headerShown: true, title: "Login" }} />
      {/* other routes continue to be auto-discovered */}
    </Stack>
  );
}
