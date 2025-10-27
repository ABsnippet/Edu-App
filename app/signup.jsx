import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker"; // add this import
import { useRouter } from "expo-router";
import axios from "axios";
import { API_URL } from "../config";

export default function SignupScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [role, setRole] = useState("student"); // default role

  const handleSignup = async() => {
    if (!email || !password || !confirm) {
      Alert.alert("Error", "Please fill all fields!");
      return;
    }
    if (password !== confirm) {
      Alert.alert("Error", "Passwords do not match!");
      return;
    }

    try {
      const res = await axios.post(`${API_URL}/api/auth/signup`, {
        
        email,
        password,
        role,
         // you can add a field in UI later
        
      });

      Alert.alert("Success ✅", "Account created successfully!");
      console.log(res.data);
      router.push("/login");
    } catch (error) {
      console.error(error);
      Alert.alert("Error ❌", error.response?.data?.error || "Signup failed");
    }
  };


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create an Account</Text>

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

      <Button title="Sign Up" color="#4CAF50" onPress={handleSignup} />

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
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 15,
    padding: 10,
    borderRadius: 8,
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
