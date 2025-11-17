// app/student/ProfileEdit.jsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Platform,
  StatusBar,
  Alert,
  Image,
  ToastAndroid,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import { API_URL } from "../../config"; // ensure config path is correct

export default function ProfileEdit() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUri, setAvatarUri] = useState(null);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const n = await AsyncStorage.getItem("userName");
      const e = await AsyncStorage.getItem("userEmail");
      const a = await AsyncStorage.getItem("avatarUri");
      if (n) setName(n);
      if (e) setEmail(e);
      if (a) setAvatarUri(a);
    })();
  }, []);

  // Utility: platform toast
  const showToast = (message) => {
    if (Platform.OS === "android") {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      Alert.alert("", message);
    }
  };

  // Gallery picker
  const pickImageFromGallery = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission required", "We need permission to access your photos.");
        return;
      }
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.7,
        allowsEditing: true,
        aspect: [1, 1],
      });
      if (!res.cancelled) {
        setAvatarUri(res.uri);
      }
    } catch (e) {
      console.log("pick error", e);
      Alert.alert("Error", "Could not open gallery.");
    }
  };

  // Camera capture
  const takePhotoWithCamera = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission required", "We need camera permission to take a photo.");
        return;
      }
      const res = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.7,
        allowsEditing: true,
        aspect: [1, 1],
      });
      if (!res.cancelled) {
        setAvatarUri(res.uri);
      }
    } catch (e) {
      console.log("camera error", e);
      Alert.alert("Error", "Could not open camera.");
    }
  };

  const uploadAvatarToServer = async (localUri) => {
    try {
      const form = new FormData();
      // FormData expects { uri, name, type } on React Native
      const filename = localUri.split("/").pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image`;
      form.append("avatar", { uri: localUri, name: filename, type });

      const resp = await axios.post(`${API_URL}/api/upload-avatar`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      // Expect server response { avatarUrl: "...public url..." }
      return resp.data?.avatarUrl || null;
    } catch (err) {
      console.log("upload avatar error:", err);
      return null;
    }
  };

  const saveProfile = async () => {
    if (!name.trim() || !email.trim()) {
      Alert.alert("Validation", "Enter both name and email.");
      return;
    }

    try {
      let serverAvatarUrl = null;

      // If avatarUri is a local file (file:// or content URI), attempt upload
      if (avatarUri && (avatarUri.startsWith("file://") || avatarUri.startsWith("content://"))) {
        serverAvatarUrl = await uploadAvatarToServer(avatarUri);
      }

      // prefer server URL if returned, otherwise use local URI
      const finalAvatar = serverAvatarUrl || avatarUri || null;

      await AsyncStorage.setItem("userName", name);
      await AsyncStorage.setItem("userEmail", email);
      if (finalAvatar) await AsyncStorage.setItem("avatarUri", finalAvatar);

      // show toast/alert on success
      showToast("Profile saved successfully.");
      router.back();
    } catch (err) {
      console.log("save profile err", err);
      Alert.alert("Error", "Could not save profile. Try again.");
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#4250b5" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <MaterialIcons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Edit Profile</Text>
      </View>

      <View style={styles.container}>
        <View style={styles.avatarPickerRow}>
          <TouchableOpacity onPress={pickImageFromGallery} style={styles.smallBtn}>
            <MaterialIcons name="photo-library" size={20} color="#fff" />
            <Text style={styles.smallBtnText}>Gallery</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={takePhotoWithCamera} style={[styles.smallBtn, { marginLeft: 12 }]}>
            <MaterialIcons name="photo-camera" size={20} color="#fff" />
            <Text style={styles.smallBtnText}>Camera</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={pickImageFromGallery} style={styles.avatarPicker}>
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <MaterialIcons name="person" size={40} color="#fff" />
            </View>
          )}
          <Text style={styles.chooseText}>Tap to change avatar (or use buttons)</Text>
        </TouchableOpacity>

        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Full name"
          placeholderTextColor="#666"
        />

        <Text style={[styles.label, { marginTop: 14 }]}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Email address"
          keyboardType="email-address"
          placeholderTextColor="#666"
        />

        <TouchableOpacity style={styles.saveBtn} onPress={saveProfile}>
          <Text style={styles.saveBtnText}>Save</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f5f6f8" },
  header: {
    height: Platform.OS === "android" ? 56 : 64,
    backgroundColor: "#4250b5",
    alignItems: "center",
    flexDirection: "row",
    paddingHorizontal: 10,
  },
  back: { padding: 6 },
  title: { flex: 1, textAlign: "center", color: "#fff", fontWeight: "700", fontSize: 18 },

  container: { padding: 18, marginTop: 18 },
  avatarPickerRow: { flexDirection: "row", justifyContent: "center", marginBottom: 12 },
  smallBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4250b5",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  smallBtnText: { color: "#fff", marginLeft: 6, fontWeight: "600" },

  avatarPicker: { alignItems: "center", marginBottom: 18 },
  avatarImage: { width: 110, height: 110, borderRadius: 56 },
  avatarPlaceholder: { width: 110, height: 110, borderRadius: 56, backgroundColor: "#2F80ED", alignItems: "center", justifyContent: "center" },
  chooseText: { marginTop: 8, color: "#444" },

  label: { color: "#333", fontWeight: "600", marginBottom: 6 },
  input: { backgroundColor: "#fff", padding: 12, borderRadius: 8, elevation: 1, color: "#000" },
  saveBtn: { marginTop: 22, backgroundColor: "#4250b5", paddingVertical: 12, borderRadius: 8, alignItems: "center" },
  saveBtnText: { color: "#fff", fontWeight: "700" },
});
