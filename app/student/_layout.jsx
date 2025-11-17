// app/student/_layout.jsx
import React from "react";
import { Stack } from "expo-router";

export default function StudentLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="community/CommunityHome" />
      <Stack.Screen name="community/Group" />
      <Stack.Screen name="community/GroupChat" />
      <Stack.Screen name="community/videoMeet" />
      {/* other student screens auto-discovered (dashboard.jsx, ProfileEdit.jsx, etc.) */}
    </Stack>
  );
}
