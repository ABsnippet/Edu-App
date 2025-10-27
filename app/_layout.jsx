import { Stack } from "expo-router";

export default function Layout() {
    return (
        <Stack
            screenOptions={{
                headerStyle: { backgroundColor: "#3f51b5" },
                headerTintColor: "#fff",
                headerTitleAlign: "center",
                headerTitleStyle: { fontWeight: "bold" },
            }}
        >
            {/* Define your routes */}
            <Stack.Screen
                name="index"
                options={{
                    title: "Welcome",
                    headerShown: false, // Hide header on home page
                }}
            />
            <Stack.Screen
                name="login"
                options={{
                    title: "Login",
                }}
            />
            <Stack.Screen
                name="signup"
                options={{
                    title: "Sign Up",
                }}
            />
            <Stack.Screen name="student/dashboard" options={{ title: "Student Dashboard" }} />
            <Stack.Screen name="admin/dashboard" options={{ title: "Teacher Dashboard" }} />
        </Stack>
    );
}
