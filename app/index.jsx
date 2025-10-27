import React from "react";
import { View, Text, Button, StyleSheet, Image } from "react-native";
import { useRouter } from "expo-router";

export default function Index() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/favicon.png")} // Optional logo
        style={styles.logo}
      />

      <Text style={styles.title}>Welcome to Smart Education App</Text>
      <Text style={styles.subtitle}>
        Empowering teachers and students with smart AI tools!
      </Text>

      <View style={styles.buttonContainer}>
        <Button
          title="Login"
          color="#3f51b5"
          onPress={() => router.push("/login")}
        />
        <View style={{ height: 10 }} />
        <Button
          title="Sign Up"
          color="#4CAF50"
          onPress={() => router.push("/signup")}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
    color: "#333",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#666",
    marginBottom: 30,
  },
  buttonContainer: {
    width: "70%",
  },
});
