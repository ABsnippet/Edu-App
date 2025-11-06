import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import axios from "axios";
import { API_URL } from "../config";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter email and password!");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(`${API_URL}/api/auth/login`, {
        email,
        password,
        role,
      });

      const { token, user } = res.data;

      // ✅ Store user info in AsyncStorage
      await AsyncStorage.setItem("token", token);
      await AsyncStorage.setItem("userEmail", user.email);
      await AsyncStorage.setItem("userRole", user.role || role);
      await AsyncStorage.setItem("userName", user.name || "Student");

      Alert.alert("Success ✅", `Welcome ${user.name || "User"}!`);

      // ✅ Navigate based on role
      if (user.role === "admin" || role === "admin") {
        router.push("/admin/dashboard");
      } else {
        router.push("/student/dashboard");
      }
    } catch (error) {
      console.error("Login error:", error.response?.data || error.message);
      Alert.alert("Error ❌", error.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* ✅ Logo restored */}
      <Image
        source={require("../assets/favicon.png")}
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={styles.title}>Smart Education App</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
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

      <Text style={styles.label}>Select Role:</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={role}
          onValueChange={(itemValue) => setRole(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Student" value="student" />
          <Picker.Item label="Teacher (Admin)" value="admin" />
        </Picker>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#4CAF50" style={{ marginVertical: 10 }} />
      ) : (
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
      )}

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
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#222",
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 15,
    padding: 12,
    borderRadius: 10,
    fontSize: 16,
  },
  label: {
    alignSelf: "flex-start",
    marginBottom: 5,
    fontWeight: "500",
    color: "#333",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    width: "100%",
    marginBottom: 20,
  },
  picker: {
    height: 50,
    width: "100%",
  },
  button: {
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  signupText: {
    marginTop: 20,
    fontSize: 14,
    color: "#555",
  },
  link: {
    color: "#3f51b5",
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
});
