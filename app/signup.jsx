import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import axios from "axios";
import { API_URL } from "../config";

export default function SignupScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [role, setRole] = useState("student");
  const [loading, setLoading] = useState(false); // ✅ new state for spinner

  const handleSignup = async () => {
    if (!name || !email || !password || !confirm) {
      Alert.alert("Error", "Please fill all fields!");
      return;
    }

    if (password !== confirm) {
      Alert.alert("Error", "Passwords do not match!");
      return;
    }

    try {
      setLoading(true); // start spinner
      const res = await axios.post(`${API_URL}/api/auth/signup`, {
        name,
        email,
        password,
        role,
      });

      console.log("Signup success:", res.data);
      Alert.alert("Success ✅", "Account created successfully!");
      router.push("/login");
    } catch (error) {
      console.error("Signup error:", error.response?.data || error.message);
      Alert.alert("Error ❌", error.response?.data?.error || "Signup failed");
    } finally {
      setLoading(false); // stop spinner
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create an Account</Text>

      <TextInput
        style={styles.input}
        placeholder="Full Name"
        value={name}
        onChangeText={setName}
      />

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

      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        secureTextEntry
        value={confirm}
        onChangeText={setConfirm}
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
        <TouchableOpacity
          style={[styles.button, loading && { backgroundColor: "#ccc" }]}
          onPress={handleSignup}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>
      )}

      <Text style={styles.loginText}>
        Already have an account?{" "}
        <Text style={styles.link} onPress={() => router.push("/login")}>
          Login
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
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 25,
    color: "#222"
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
    borderRadius: 10,
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
    paddingHorizontal: 50,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  loginText: {
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
