import { View, Text, StyleSheet } from "react-native";

export default function StudentDashboard() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>🎓 Welcome Student!</Text>
      <Text>Your dashboard will show attendance, quizzes, and AI tools here.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  text: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
});
