import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, Button, StyleSheet, Alert } from "react-native";
import { WebView } from "react-native-webview";
import * as Permissions from "expo-permissions";
import { useRouter, useLocalSearchParams } from "expo-router";

export default function VideoMeet() {
  const router = useRouter();
  const { meetUrl } = useLocalSearchParams();
  const [hasPermission, setHasPermission] = useState(false);
  const [loading, setLoading] = useState(true);

  const defaultMeet = "https://meet.jit.si/SmartEduRoom";

  useEffect(() => {
    const getPermissions = async () => {
      try {
        const { status } = await Permissions.askAsync(
          Permissions.CAMERA,
          Permissions.AUDIO_RECORDING
        );
        if (status === "granted") {
          setHasPermission(true);
        } else {
          Alert.alert("Permission Denied", "Camera & Microphone are required for video meeting.");
        }
      } catch (error) {
        console.error("Permission error:", error);
      }
    };
    getPermissions();
  }, []);

  if (!hasPermission) {
    return (
      <View style={styles.centered}>
        <Text style={styles.text}>Camera and Microphone permissions are required.</Text>
        <Button title="Go Back" onPress={() => router.back()} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3f51b5" />
          <Text style={styles.loadingText}>Connecting to meeting...</Text>
        </View>
      )}

      <WebView
        source={{ uri: meetUrl || defaultMeet }}
        style={styles.webview}
        onLoadEnd={() => setLoading(false)}
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
      />

      <View style={styles.btnContainer}>
        <Button title="Leave Meeting" color="#d9534f" onPress={() => router.back()} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  webview: { flex: 1 },
  loadingContainer: {
    position: "absolute",
    top: "40%",
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 10,
  },
  loadingText: {
    color: "#fff",
    marginTop: 10,
    fontSize: 16,
    fontWeight: "500",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  text: { fontSize: 16, textAlign: "center", marginBottom: 15 },
  btnContainer: {
    padding: 10,
    backgroundColor: "#fff",
  },
});
