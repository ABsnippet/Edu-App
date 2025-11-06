import { Stack } from "expo-router";

export default function StudentLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="community/CommunityHome" />
      <Stack.Screen name="community/Group" />
      <Stack.Screen name="community/GroupChat" />
      <Stack.Screen name="community/videoMeet" />
    </Stack>
  );
}
