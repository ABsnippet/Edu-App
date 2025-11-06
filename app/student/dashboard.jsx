import React, { useEffect, useState } from "react";
import { View, Text, Button, StyleSheet, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useRouter } from "expo-router";
import { API_URL } from "../../config";

export default function Dashboard() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const router = useRouter();

  useEffect(() => {
    const loadUser = async () => {
      const storedName = await AsyncStorage.getItem("userName");
      const storedEmail = await AsyncStorage.getItem("userEmail");
      if (storedName) setName(storedName);
      if (storedEmail) setEmail(storedEmail);
    };
    loadUser();
  }, []);

  const handleLogout = async () => {
    try {
      await axios.get(`${API_URL}/api/auth/logout`);
      await AsyncStorage.clear();
      Alert.alert("Logged out", "You have been logged out successfully.");
      router.replace("/student/login");
    } catch (error) {
      Alert.alert("Error", "Logout failed. Try again.");
      console.log(error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome, {name || "Student"} 👋</Text>
      <Text style={styles.subtitle}>Choose where you’d like to go:</Text>

      <View style={styles.btnContainer}>
        <Button
          title="View My Group"
          color="#4CAF50"
          onPress={() => router.push("/student/ViewGroup")}
        />

      </View>

      <View style={styles.btnContainer}>
        <Button
          title="Join Video Meet"
          color="#007bff"
          onPress={() => router.push("/student/community/videoMeet")}
        />
      </View>

      <View style={styles.btnContainer}>
        <Button
          title="View Announcements"
          color="#4caf50"
          onPress={() => router.push("/student/announcements")}
        />
      </View>

      <View style={styles.btnContainer}>
        <Button title="Logout" color="#ff4d4d" onPress={handleLogout} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#212121",
  },
  subtitle: {
    fontSize: 16,
    color: "#555",
    marginBottom: 30,
  },
  btnContainer: {
    width: "85%",
    marginVertical: 10,
  },
});
