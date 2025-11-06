import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TextInput, Button, StyleSheet } from 'react-native';
import io from 'socket.io-client';
import { API_URL } from '../../../config';

const socket = io(API_URL, { transports: ['websocket'] });

const GroupChat = ({ route, navigation }) => {
  const { group, userId } = route.params;
  const [messages, setMessages] = useState([]);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    socket.emit('joinRoom', group._id);

    socket.on('message', (newMsg) => {
      setMessages((prev) => [...prev, newMsg]);
    });

    return () => {
      socket.off('message');
    };
  }, []);

  const sendMessage = () => {
    if (msg.trim()) {
      socket.emit('message', { roomId: group._id, user: userId, text: msg });
      setMsg('');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{group.name}</Text>

      <FlatList
        data={messages}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.msgBox}>
            <Text style={styles.user}>{item.user}</Text>
            <Text>{item.text}</Text>
          </View>
        )}
      />

      <TextInput
        placeholder="Type a message..."
        style={styles.input}
        value={msg}
        onChangeText={setMsg}
      />
      <Button title="Send" onPress={sendMessage} />
      <Button title="Start Video Meeting" color="#0078FF" onPress={() => navigation.navigate('VideoMeet', { group })} />
    </View>
  );
};

export default GroupChat;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15 },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  msgBox: { backgroundColor: '#eee', padding: 10, borderRadius: 8, marginBottom: 10 },
  user: { fontWeight: 'bold' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 8, marginBottom: 10 },
});
