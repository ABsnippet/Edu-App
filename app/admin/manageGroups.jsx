import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  Modal,
  ScrollView,
} from "react-native";
import axios from "axios";
import { API_URL } from "../../config";

export default function ManageGroups() {
  const [groups, setGroups] = useState([]);
  const [students, setStudents] = useState([]);
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Fetch groups and students
  const fetchGroups = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/groups`);
      setGroups(res.data);
    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Could not load groups");
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/users?role=student`);
      setStudents(res.data);
    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Could not load students");
    }
  };

  useEffect(() => {
    fetchGroups();
    fetchStudents();
  }, []);

  // Create group
  const handleCreateGroup = async () => {
    if (!groupName) return Alert.alert("Missing name", "Enter group name");
    try {
      await axios.post(`${API_URL}/api/groups/create`, {
        name: groupName,
        description: groupDescription,
      });
      setGroupName("");
      setGroupDescription("");
      fetchGroups();
      Alert.alert("Success", "Group created successfully");
    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Could not create group");
    }
  };

  // Delete group
  const handleDeleteGroup = async (id) => {
    try {
      await axios.delete(`${API_URL}/api/groups/${id}`);
      fetchGroups();
    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Could not delete group");
    }
  };

  // Add/remove student
  const handleAddStudent = async (groupId, studentId) => {
    try {
      await axios.post(`${API_URL}/api/groups/${groupId}/add-student`, {
        studentId,
      });
      fetchGroups();
      Alert.alert("Success", "Student added successfully");
    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Could not add student");
    }
  };

  const handleRemoveStudent = async (groupId, studentId) => {
    try {
      await axios.post(`${API_URL}/api/groups/${groupId}/remove-student`, {
        studentId,
      });
      fetchGroups();
      Alert.alert("Removed", "Student removed successfully");
    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Could not remove student");
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={groups}
        keyExtractor={(item) => item._id}
        ListHeaderComponent={
          <>
            <Text style={styles.header}>Manage Student Groups 👥</Text>

            {/* Create Group Section */}
            <View style={styles.createSection}>
              <TextInput
                placeholder="Group Name"
                value={groupName}
                onChangeText={setGroupName}
                style={styles.input}
              />
              <TextInput
                placeholder="Description"
                value={groupDescription}
                onChangeText={setGroupDescription}
                style={styles.input}
              />
              <TouchableOpacity
                style={styles.createBtn}
                onPress={handleCreateGroup}
              >
                <Text style={styles.btnText}>Create Group</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.subHeader}>Existing Groups</Text>
          </>
        }
        renderItem={({ item }) => (
          <View style={styles.groupCard}>
            <Text style={styles.groupTitle}>{item.name}</Text>
            <Text style={styles.groupDesc}>{item.description}</Text>
            <Text style={styles.memberCount}>
              Members: {item.students?.length || 0}
            </Text>

            <View style={styles.btnRow}>
              <TouchableOpacity
                style={styles.manageBtn}
                onPress={() => {
                  setSelectedGroup(item);
                  setModalVisible(true);
                }}
              >
                <Text style={styles.btnText}>Manage Members</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => handleDeleteGroup(item._id)}
              >
                <Text style={styles.btnText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", color: "#777", marginTop: 20 }}>
            No groups available.
          </Text>
        }
        contentContainerStyle={{ paddingBottom: 40 }}
      />

      {/* Modal for managing students */}
      <Modal visible={modalVisible} animationType="slide">
        <ScrollView style={styles.modalContent}>
          <Text style={styles.modalTitle}>
            Manage {selectedGroup?.name || ""} Members
          </Text>

          <Text style={styles.subHeader}>Current Members</Text>
          {selectedGroup?.students?.length > 0 ? (
            selectedGroup.students.map((s) => (
              <View key={s._id} style={styles.memberRow}>
                <Text style={styles.memberText}>{s.name}</Text>
                <TouchableOpacity
                  style={styles.removeBtn}
                  onPress={() => handleRemoveStudent(selectedGroup._id, s._id)}
                >
                  <Text style={styles.btnText}>Remove</Text>
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <Text style={styles.noMembers}>No students in this group</Text>
          )}

          <Text style={styles.subHeader}>Add Students</Text>
          {students.map((s) => (
            <View key={s._id} style={styles.memberRow}>
              <Text style={styles.memberText}>{s.name}</Text>
              <TouchableOpacity
                style={styles.addBtn}
                onPress={() => handleAddStudent(selectedGroup._id, s._id)}
              >
                <Text style={styles.btnText}>Add</Text>
              </TouchableOpacity>
            </View>
          ))}

          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => setModalVisible(false)}
          >
            <Text style={styles.btnText}>Close</Text>
          </TouchableOpacity>
        </ScrollView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa", padding: 20 },
  header: { fontSize: 24, fontWeight: "700", color: "#3f51b5", marginBottom: 10 },
  createSection: { marginVertical: 15 },
  input: {
    backgroundColor: "#fff",
    padding: 12,
    marginVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  createBtn: {
    backgroundColor: "#3f51b5",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  btnText: { color: "#fff", fontWeight: "600" },
  subHeader: { fontSize: 18, fontWeight: "600", marginTop: 20, marginBottom: 10 },
  groupCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 3,
  },
  groupTitle: { fontSize: 18, fontWeight: "700" },
  groupDesc: { color: "#555", marginVertical: 5 },
  memberCount: { color: "#777", marginBottom: 10 },
  btnRow: { flexDirection: "row", justifyContent: "space-between" },
  manageBtn: { backgroundColor: "#3f51b5", padding: 10, borderRadius: 6 },
  deleteBtn: { backgroundColor: "#ff5252", padding: 10, borderRadius: 6 },
  modalContent: { padding: 20 },
  modalTitle: { fontSize: 22, fontWeight: "700", color: "#3f51b5", marginBottom: 15 },
  memberRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 10,
    marginVertical: 4,
    borderRadius: 8,
  },
  memberText: { fontSize: 16 },
  addBtn: { backgroundColor: "#4caf50", padding: 8, borderRadius: 6 },
  removeBtn: { backgroundColor: "#f44336", padding: 8, borderRadius: 6 },
  closeBtn: {
    backgroundColor: "#3f51b5",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  noMembers: { color: "#777", marginBottom: 10 },
});
