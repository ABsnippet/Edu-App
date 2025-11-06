import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import axios from "axios";
import { API_URL } from "../../config";

export default function UploadNotes() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const pickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ],
      });

      if (result.canceled) return;

      const pickedFile = result.assets[0];
      setFile(pickedFile);
      Alert.alert("File Selected ✅", pickedFile.name);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "File selection failed");
    }
  };

  const handleUpload = async () => {
    if (!title || !description || !file) {
      Alert.alert("Missing Fields", "Please fill all details and pick a file.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("file", {
      uri: file.uri,
      name: file.name,
      type: file.mimeType || "application/pdf",
    });

    try {
      setLoading(true);
      const res = await axios.post(`${API_URL}/api/admin/upload-note`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      Alert.alert("✅ Success", res.data.message || "Note uploaded successfully!");
      setTitle("");
      setDescription("");
      setFile(null);
    } catch (error) {
      console.error(error);
      Alert.alert("❌ Upload Failed", error.response?.data?.error || "Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>📚 Upload Notes</Text>

      <TextInput
        style={styles.input}
        placeholder="Note Title"
        value={title}
        onChangeText={setTitle}
      />

      <TextInput
        style={[styles.input, { height: 100 }]}
        placeholder="Note Description"
        multiline
        value={description}
        onChangeText={setDescription}
      />

      <TouchableOpacity style={styles.fileButton} onPress={pickFile}>
        <Text style={styles.fileButtonText}>
          {file ? `📄 ${file.name}` : "Choose File"}
        </Text>
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator size="large" color="#3f51b5" style={{ marginTop: 20 }} />
      ) : (
        <TouchableOpacity style={styles.uploadButton} onPress={handleUpload}>
          <Text style={styles.uploadButtonText}>Upload Note</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  fileButton: {
    borderWidth: 1,
    borderColor: "#3f51b5",
    borderRadius: 10,
    padding: 15,
    backgroundColor: "#e8eaf6",
    alignItems: "center",
    marginBottom: 20,
  },
  fileButtonText: {
    fontSize: 16,
    color: "#3f51b5",
    fontWeight: "500",
  },
  uploadButton: {
    backgroundColor: "#3f51b5",
    borderRadius: 10,
    padding: 15,
    alignItems: "center",
  },
  uploadButtonText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "600",
  },
});
