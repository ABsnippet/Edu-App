import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import * as Permissions from 'expo-permissions';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const Group = () => {
  const router = useRouter();
  const { id, name } = useLocalSearchParams();

  const [loading, setLoading] = useState(false);

  const group = { _id: id, name };

  const handleJoinMeet = async () => {
    setLoading(true);
    try {
      const { status: camStatus } = await Permissions.askAsync(Permissions.CAMERA);
      const { status: micStatus } = await Permissions.askAsync(Permissions.AUDIO_RECORDING);

      if (camStatus !== 'granted' || micStatus !== 'granted') {
        Alert.alert(
          'Permissions Required',
          'Please allow camera and microphone access to join the meeting.'
        );
        setLoading(false);
        return;
      }

      router.push({
        pathname: '/student/community/videoMeet',
        params: { group },
      });
    } catch (err) {
      Alert.alert('Error', 'Unable to start the meeting. Please try again.');
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{name} Community</Text>

      <Text style={styles.subtitle}>
        Welcome to the {name} group! You can chat, share resources, or join a live video session.
      </Text>

      <TouchableOpacity
        style={styles.meetButton}
        onPress={handleJoinMeet}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Ionicons name="videocam" size={22} color="#fff" />
            <Text style={styles.meetText}>Join Video Meet</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default Group;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#222',
  },
  subtitle: {
    textAlign: 'center',
    color: '#555',
    fontSize: 16,
    marginBottom: 30,
  },
  meetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
    elevation: 4,
  },
  meetText: {
    color: '#fff',
    fontSize: 18,
    marginLeft: 8,
    fontWeight: '600',
  },
});
