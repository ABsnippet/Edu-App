import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import axios from "axios";
import { API_URL } from "../../config";

export default function StudentAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAnnouncements = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/admin/announcements`);
      setAnnouncements(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAnnouncements();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3f51b5" />
        <Text style={{ marginTop: 10, color: "#555" }}>Loading announcements...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text style={styles.header}>📢 Announcements</Text>

      {announcements.length === 0 ? (
        <Text style={styles.emptyText}>No announcements yet.</Text>
      ) : (
        announcements.map((a, index) => (
          <View key={index} style={styles.card}>
            <Text style={styles.title}>{a.title}</Text>
            <Text style={styles.message}>{a.message}</Text>
            <Text style={styles.footer}>
              Posted by {a.createdBy || "Admin"} on{" "}
              {new Date(a.createdAt).toLocaleString()}
            </Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fc",
  },
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#f8f9fc",
  },
  header: {
    fontSize: 26,
    fontWeight: "700",
    color: "#3f51b5",
    textAlign: "center",
    marginBottom: 25,
  },
  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#222",
    marginBottom: 5,
  },
  message: {
    fontSize: 15,
    color: "#444",
    marginBottom: 10,
  },
  footer: {
    fontSize: 12,
    color: "#777",
    textAlign: "right",
  },
  emptyText: {
    textAlign: "center",
    color: "#999",
    fontSize: 16,
  },
});
