import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../../config";

export default function Announcements() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const sendAnnouncement = async () => {
    if (!title || !message) {
      Alert.alert("Missing Fields", "Please enter both title and message.");
      return;
    }

    try {
      setLoading(true);
      const adminName = await AsyncStorage.getItem("userName");

      const res = await axios.post(`${API_URL}/api/admin/send-announcement`, {
        title,
        message,
        createdBy: adminName || "Admin",
      });

      Alert.alert("✅ Success", res.data.message);
      setTitle("");
      setMessage("");
    } catch (error) {
      console.error(error);
      Alert.alert("❌ Error", error.response?.data?.error || "Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>📢 Send Announcement</Text>

      <TextInput
        style={styles.input}
        placeholder="Announcement Title"
        value={title}
        onChangeText={setTitle}
      />

      <TextInput
        style={[styles.input, { height: 150 }]}
        placeholder="Write your message here..."
        value={message}
        onChangeText={setMessage}
        multiline
      />

      {loading ? (
        <ActivityIndicator size="large" color="#3f51b5" style={{ marginTop: 20 }} />
      ) : (
        <TouchableOpacity style={styles.button} onPress={sendAnnouncement}>
          <Text style={styles.buttonText}>Send Announcement</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#f8f9fc",
    padding: 20,
    paddingTop: 60,
  },
  heading: {
    fontSize: 24,
    fontWeight: "700",
    color: "#3f51b5",
    textAlign: "center",
    marginBottom: 30,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
    backgroundColor: "#fff",
  },
  button: {
    backgroundColor: "#3f51b5",
    borderRadius: 10,
    padding: 15,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});
