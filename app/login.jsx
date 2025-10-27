import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import axios from "axios";
import { API_URL } from "../config";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields!");
      return;
    }

    try {
      const res = await axios.post(`${API_URL}/api/auth/login`, {
        email,
        password,
        role,
      });

      Alert.alert("Success 🎉", "Login successful!");
      console.log("JWT Token:", res.data.token);

      if (role === "student") router.push("/student/dashboard");
      else router.push("/admin/dashboard");
    } catch (error) {
      console.error(error);
      Alert.alert("Error ❌", error.response?.data?.error || "Invalid credentials");
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require("../assets/favicon.png")} style={styles.logo} />
      <Text style={styles.title}>Smart Education App</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <Text style={styles.subtitle}>Select Role:</Text>
      <View style={styles.roleContainer}>
        <TouchableOpacity
          style={[styles.roleButton, role === "student" && styles.roleSelected]}
          onPress={() => setRole("student")}
        >
          <Text style={role === "student" ? styles.roleTextSelected : styles.roleText}>
            Student
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.roleButton, role === "admin" && styles.roleSelected]}
          onPress={() => setRole("admin")}
        >
          <Text style={role === "admin" ? styles.roleTextSelected : styles.roleText}>
            Teacher
          </Text>
        </TouchableOpacity>
      </View>

      <Button title="Login" color="#3f51b5" onPress={handleLogin} />

      <Text style={styles.signupText}>
        Don’t have an account?{" "}
        <Text style={styles.link} onPress={() => router.push("/signup")}>
          Sign Up
        </Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  logo: { width: 100, height: 100, marginBottom: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 15,
    padding: 10,
    borderRadius: 8,
  },
  subtitle: { fontSize: 16, fontWeight: "500", marginBottom: 8, color: "#333" },
  roleContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginBottom: 20,
  },
  roleButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: "#3f51b5",
    borderRadius: 8,
  },
  roleSelected: { backgroundColor: "#3f51b5" },
  roleText: { color: "#3f51b5", fontWeight: "bold" },
  roleTextSelected: { color: "#fff", fontWeight: "bold" },
  signupText: { marginTop: 20, fontSize: 14, color: "#555" },
  link: {
    color: "#3f51b5",
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
});
