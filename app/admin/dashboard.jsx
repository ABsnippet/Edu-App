import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { Ionicons, MaterialIcons, Feather } from "@expo/vector-icons";

export default function AdminDashboard() {
  const router = useRouter();
  const [adminName, setAdminName] = useState("");
  const [loading, setLoading] = useState(true);

  // 🧠 Fetch admin name from AsyncStorage
  useEffect(() => {
    const fetchAdminName = async () => {
      try {
        const storedName = await AsyncStorage.getItem("userName");
        setAdminName(storedName || "Admin");
      } catch (err) {
        console.error("Error fetching name:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminName();
  }, []);

  // 🧩 Dashboard Features
  const features = [
    {
      title: "Upload Assignments",
      icon: <Ionicons name="document-text-outline" size={28} color="#3f51b5" />,
      path: "/admin/uploadAssignment",
    },
    {
      title: "Upload Notes",
      icon: <Feather name="file-plus" size={28} color="#3f51b5" />,
      path: "/admin/uploadNotes",
    },
    {
      title: "Send Announcements",
      icon: <MaterialIcons name="campaign" size={28} color="#3f51b5" />,
      path: "/admin/announcements",
    },
    {
      title: "Manage Student Groups",
      icon: <Ionicons name="people-outline" size={28} color="#3f51b5" />,
      path: "/admin/manageGroups",
    },
  ];

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#3f51b5" />
        <Text style={{ marginTop: 10 }}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* 🧠 Header */}
      <Text style={styles.welcome}>Welcome, {adminName} 👋</Text>
      <Text style={styles.subtitle}>Manage your classroom effectively</Text>

      {/* 🧩 Feature Cards */}
      <View style={styles.cardContainer}>
        {features.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.card}
            onPress={() => router.push(item.path)}
          >
            <View style={styles.iconContainer}>{item.icon}</View>
            <Text style={styles.cardText}>{item.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

// 🎨 Styles
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#f3f5fc",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    paddingTop: 50,
  },
  loaderContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  welcome: {
    fontSize: 26,
    fontWeight: "800",
    color: "#3f51b5",
    marginBottom: 5,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#555",
    marginBottom: 25,
    textAlign: "center",
  },
  cardContainer: {
    width: "100%",
    alignItems: "center",
  },
  card: {
    width: "90%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    elevation: 4,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
  },
  iconContainer: {
    backgroundColor: "#e8eaf6",
    borderRadius: 50,
    padding: 10,
    marginRight: 15,
  },
  cardText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
});
