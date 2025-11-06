import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet, ScrollView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { API_URL } from "../../config";

export default function ViewGroup() {
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchGroup = async () => {
      try {
        const email = await AsyncStorage.getItem("userEmail");
        const res = await axios.get(`${API_URL}/api/groups/my-group/${email}`);
        setGroup(res.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch group");
      } finally {
        setLoading(false);
      }
    };
    fetchGroup();
  }, []);

  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3f51b5" />
        <Text>Loading your group...</Text>
      </View>
    );

  if (error)
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{group.name}</Text>
      {group.description ? (
        <Text style={styles.subtitle}>{group.description}</Text>
      ) : null}

      <Text style={styles.sectionTitle}>👥 Group Members:</Text>
      {group.students.map((student) => (
        <View key={student._id} style={styles.memberCard}>
          <Text style={styles.memberName}>{student.name}</Text>
          <Text style={styles.memberEmail}>{student.email}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: "center",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#3f51b5",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 10,
    alignSelf: "flex-start",
  },
  memberCard: {
    width: "100%",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 3,
  },
  memberName: {
    fontSize: 16,
    fontWeight: "600",
  },
  memberEmail: {
    fontSize: 14,
    color: "#666",
  },
  error: {
    color: "red",
    fontSize: 16,
    textAlign: "center",
  },
});
