import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import axios from 'axios';
import { API_URL } from '../../../config';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CommunityHome = ({ navigation }) => {
  const [groups, setGroups] = useState([]);
  const [groupName, setGroupName] = useState('');
  const [desc, setDesc] = useState('');
  const [userId, setUserId] = useState('');

  useEffect(() => {
    fetchGroups();
    loadUser();
  }, []);

  const loadUser = async () => {
    const id = await AsyncStorage.getItem('userId');
    setUserId(id);
  };

  const fetchGroups = async () => {
    const res = await axios.get(`${API_URL}/api/group/all`);
    setGroups(res.data);
  };

  const createGroup = async () => {
    await axios.post(`${API_URL}/api/group/create`, { name: groupName, description: desc, createdBy: userId });
    setGroupName('');
    setDesc('');
    fetchGroups();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Community Groups</Text>

      <TextInput placeholder="Group Name" style={styles.input} value={groupName} onChangeText={setGroupName} />
      <TextInput placeholder="Description" style={styles.input} value={desc} onChangeText={setDesc} />

      <Button title="Create Group" onPress={createGroup} />

      <FlatList
        data={groups}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.groupCard}
            onPress={() => navigation.navigate('GroupChat', { group: item, userId })}
          >
            <Text style={styles.groupName}>{item.name}</Text>
            <Text>{item.description}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

export default CommunityHome;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: '#fff' },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 15 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 8, marginBottom: 10 },
  groupCard: { padding: 15, backgroundColor: '#f4f4f4', borderRadius: 10, marginBottom: 10 },
  groupName: { fontSize: 18, fontWeight: 'bold' },
});
