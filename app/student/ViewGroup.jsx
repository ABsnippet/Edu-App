// Edu-App/app/student/ViewGroup.jsx
import React, { useEffect, useState } from "react";
import { View, Text, Button, StyleSheet, ActivityIndicator, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useRouter, useLocalSearchParams } from "expo-router";
import { API_URL } from "../../config";

export default function ViewGroup() {
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // useLocalSearchParams is compatible with expo-router versions that support it
  const params = useLocalSearchParams();
  const routeGroupId = params?.groupId;

  useEffect(() => {
    const loadGroup = async () => {
      try {
        // Priority: route param -> AsyncStorage -> fetch from API
        if (routeGroupId) {
          setGroup({ id: routeGroupId, name: `Group ${routeGroupId}` });
          await AsyncStorage.setItem("groupId", routeGroupId);
          setLoading(false);
          return;
        }

        const storedGroupId = await AsyncStorage.getItem("groupId");
        if (storedGroupId) {
          setGroup({ id: storedGroupId, name: `Group ${storedGroupId}` });
          setLoading(false);
          return;
        }

        // Fallback: try to fetch the user's group from backend
        const token = await AsyncStorage.getItem("auth_token");
        if (token) {
          const res = await axios.get(`${API_URL}/api/users/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.data && res.data.groupId) {
            const gid = res.data.groupId;
            setGroup({ id: gid, name: res.data.groupName || `Group ${gid}` });
            await AsyncStorage.setItem("groupId", gid);
            setLoading(false);
            return;
          }
        }

        setGroup(null);
        setLoading(false);
      } catch (err) {
        console.log("loadGroup error", err?.message || err);
        setLoading(false);
        Alert.alert("Error", "Unable to load group. Try again.");
      }
    };

    loadGroup();
  }, [routeGroupId]);

  const openGroupChat = () => {
    if (!group || !group.id) {
      Alert.alert("No Group", "No group found for this user.");
      return;
    }
    const roomId = `group_${group.id}`;
    // if ChatScreen is at app/ChatScreen.jsx
    router.push({
      pathname: "/ChatScreen",
      params: { roomId, roomName: group.name || "Group Chat" },
    });
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!group) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>You are not assigned to any group yet.</Text>
        <View style={styles.btnArea}>
          <Button title="Refresh" onPress={() => router.reload()} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{group.name}</Text>
      <Text style={styles.subtitle}>Group ID: {group.id}</Text>

      <View style={styles.btnArea}>
        <Button title="Open Group Chat" color="#2e7d32" onPress={openGroupChat} />
      </View>

      <View style={styles.btnArea}>
        <Button title="Back to Dashboard" onPress={() => router.back()} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
  },
  btnArea: {
    marginVertical: 10,
    width: "80%",
    alignSelf: "center",
  },
});
