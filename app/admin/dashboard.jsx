import { View, Text, StyleSheet } from "react-native";

export default function TeacherDashboard() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>👩‍🏫 Welcome Teacher!</Text>
      <Text>Here you can manage students, view attendance, and create quizzes.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  text: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
});
