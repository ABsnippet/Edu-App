// Edu-App/app/ChatScreen.jsx
import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import io from "socket.io-client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { API_URL } from "../config";

const PENDING_KEY = "chat_pending_messages_v1";

export default function ChatScreen() {
  const params = useLocalSearchParams();
  const roomId = params?.roomId;
  const roomName = params?.roomName || "Group Chat";

  const [messages, setMessages] = useState([]); // includes server and temp messages
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef(null);
  const flatRef = useRef(null);
  const pendingRef = useRef([]); // in-memory pending queue

  // --- Utils: pending queue (persisted) ---
  async function loadPending() {
    try {
      const raw = await AsyncStorage.getItem(PENDING_KEY);
      pendingRef.current = raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.log("loadPending error", e);
      pendingRef.current = [];
    }
  }

  async function savePending() {
    try {
      await AsyncStorage.setItem(PENDING_KEY, JSON.stringify(pendingRef.current));
    } catch (e) {
      console.log("savePending error", e);
    }
  }

  function addPending(item) {
    // item: { tempId, roomId, text, createdAt }
    pendingRef.current.push(item);
    savePending();
  }

  async function flushPending() {
    if (!pendingRef.current.length) return;
    console.log("Flushing pending messages", pendingRef.current.length);
    const token = await AsyncStorage.getItem("auth_token");
    const queue = [...pendingRef.current];
    for (const item of queue) {
      try {
        // prefer socket if connected
        if (socketRef.current && socketRef.current.connected) {
          socketRef.current.emit("sendMessage", { roomId: item.roomId, text: item.text });
          // remove from queue immediately (server will broadcast)
          pendingRef.current = pendingRef.current.filter(p => p.tempId !== item.tempId);
          await savePending();
        } else {
          // fallback: HTTP POST
          const res = await axios.post(
            `${API_URL}/api/chat/room/${item.roomId}`,
            { text: item.text },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          // server saved message returned - append and remove pending
          if (res?.data?.message) {
            // replace temp message with server message
            setMessages(prev => prev.map(m => (m._tempId === item.tempId ? res.data.message : m)));
            pendingRef.current = pendingRef.current.filter(p => p.tempId !== item.tempId);
            await savePending();
          }
        }
      } catch (err) {
        console.log("flushPending error for", item.tempId, err.message || err);
        // keep it in queue to retry later
      }
    }
  }

  // --- Init: load history, connect socket, load pending ---
  useEffect(() => {
    let mounted = true;

    async function init() {
      if (!roomId) {
        setLoading(false);
        return;
      }

      await loadPending();

      const token = await AsyncStorage.getItem("auth_token");
      // fetch history
      try {
        const res = await axios.get(`${API_URL}/api/chat/room/${roomId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (mounted && res.data && res.data.messages) {
          setMessages(res.data.messages);
        }
      } catch (e) {
        console.log("fetch messages error", e.message || e);
      }

      // connect socket
      try {
        socketRef.current = io(API_URL, {
          auth: { token },
          transports: ["websocket"],
          autoConnect: true,
          reconnectionAttempts: 5,
        });

        socketRef.current.on("connect", () => {
          console.log("socket connected", socketRef.current.id);
          setConnected(true);
          socketRef.current.emit("joinRoom", roomId);
          // flush any pending messages
          flushPending();
        });

        socketRef.current.on("disconnect", (reason) => {
          console.log("socket disconnected", reason);
          setConnected(false);
        });

        socketRef.current.on("reconnect", (attempt) => {
          console.log("socket reconnected attempt", attempt);
          setConnected(true);
          socketRef.current.emit("joinRoom", roomId);
          flushPending();
        });

        socketRef.current.on("connect_error", (err) => {
          console.log("socket connect_error", err.message || err);
        });

        socketRef.current.on("newMessage", (msg) => {
          // If we have a temp message with same room and same createdAt-ish or text, replace it
          setMessages(prev => {
            // Try to find a matching temp by comparing text & room & recent createdAt
            const idx = prev.findIndex(m => m._tempId && m.roomId === msg.roomId && m.text === msg.text);
            if (idx !== -1) {
              // replace temp with server message
              const copy = [...prev];
              copy[idx] = msg;
              return copy;
            }
            // otherwise append
            return [...prev, msg];
          });
          setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 120);
        });

      } catch (err) {
        console.log("socket init error", err);
      }

      if (mounted) setLoading(false);
    }

    init();

    return () => {
      mounted = false;
      if (socketRef.current) {
        socketRef.current.emit("leaveRoom", roomId);
        socketRef.current.disconnect();
      }
    };
  }, [roomId]);

  // --- Send message with optimistic UI + pending queue & fallback ---
  const send = async () => {
    if (!text.trim()) return;
    const body = text.trim();
    setText("");

    // create temp message
    const tempId = `tmp_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    const tempMsg = {
      _tempId: tempId,
      roomId,
      senderId: "me",
      senderName: "You",
      text: body,
      createdAt: new Date().toISOString(),
      status: connected ? "sending" : "pending", // status for UI
    };

    setMessages(prev => [...prev, tempMsg]);
    setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 50);

    // If socket connected, emit
    try {
      if (socketRef.current && socketRef.current.connected) {
        socketRef.current.emit("sendMessage", { roomId, text: body });
        // we keep the temp until server broadcasts actual saved message
      } else {
        // queue and attempt HTTP fallback now
        addPending({ tempId, roomId, text: body, createdAt: tempMsg.createdAt });
        // try to send via HTTP immediately
        const token = await AsyncStorage.getItem("auth_token");
        try {
          const res = await axios.post(`${API_URL}/api/chat/room/${roomId}`, { text: body }, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res?.data?.message) {
            // Replace temp with saved message
            setMessages(prev => prev.map(m => (m._tempId === tempId ? res.data.message : m)));
            // remove from pending
            pendingRef.current = pendingRef.current.filter(p => p.tempId !== tempId);
            await savePending();
          }
        } catch (err) {
          console.log("HTTP fallback send error", err.message || err);
          // it remains in pending queue and will be retried on reconnect
        }
      }
    } catch (err) {
      console.log("send error", err);
      addPending({ tempId, roomId, text: body, createdAt: tempMsg.createdAt });
    }
  };

  // Render single message
  const renderItem = ({ item }) => {
    const isTemp = !!item._tempId;
    const isMe = item.senderId === "me" || item.senderName === "You" || isTemp;
    return (
      <View style={[styles.bubble, isMe ? styles.myBubble : styles.otherBubble]}>
        <Text style={styles.sender}>{isMe ? "You" : item.senderName}</Text>
        <Text style={styles.msgText}>{item.text}</Text>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={styles.time}>{new Date(item.createdAt).toLocaleTimeString()}</Text>
          {isTemp ? <Text style={{ fontSize: 10, color: "#888", marginLeft: 8 }}>{item.status === "pending" ? "Pending" : "Sending"}</Text> : null}
        </View>
      </View>
    );
  };

  if (!roomId) {
    return (
      <View style={styles.center}>
        <Text>No room specified.</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={{ flex: 1, padding: 12 }}>
        <Text style={styles.header}>{roomName} {connected ? "●" : "○"}</Text>
        <FlatList
          ref={flatRef}
          data={messages}
          keyExtractor={(item) => item._id || item._tempId || item.createdAt}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      </View>

      <View style={styles.footer}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Type a message"
          style={styles.input}
        />
        <TouchableOpacity onPress={send} style={styles.sendBtn}>
          <Text style={{ color: "#fff", fontWeight: "bold" }}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: { fontSize: 18, fontWeight: "700", marginBottom: 8, textAlign: "center" },
  bubble: { marginVertical: 6, padding: 10, borderRadius: 8, maxWidth: "80%" },
  myBubble: { backgroundColor: "#DCF8C6", alignSelf: "flex-end" },
  otherBubble: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#eee", alignSelf: "flex-start" },
  sender: { fontSize: 12, color: "#666" },
  msgText: { fontSize: 16, marginTop: 4 },
  time: { fontSize: 10, color: "#888", marginTop: 6, alignSelf: "flex-end" },
  footer: { flexDirection: "row", padding: 8, borderTopWidth: 1, borderColor: "#eee", alignItems: "center" },
  input: { flex: 1, backgroundColor: "#fff", padding: 10, borderRadius: 8, borderWidth: 1, borderColor: "#ddd" },
  sendBtn: { backgroundColor: "#007AFF", padding: 12, marginLeft: 8, borderRadius: 8 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" }
});
