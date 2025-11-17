// app/student/Dashboard.jsx
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Image,
  Platform,
  Animated,
  Easing,
  TouchableWithoutFeedback,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const HEADER_H_ANDROID = 56;
const HEADER_H_IOS = 64;

export default function Dashboard() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUri, setAvatarUri] = useState(null);

  // measured header layout (kept for menu positioning)
  const [headerLayout, setHeaderLayout] = useState({ y: 0, height: 0 });

  // menu visibility + animation
  const [menuVisible, setMenuVisible] = useState(false);
  const anim = useRef(new Animated.Value(0)).current;

  // load basic user state
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

  // auth guard: redirect to login if not logged in
  useEffect(() => {
    const checkAuth = async () => {
      const storedEmail = await AsyncStorage.getItem("userEmail");
      const token = await AsyncStorage.getItem("authToken"); // optional, remove if unused
      if (!storedEmail && !token) {
        console.log("[AuthGuard] No user found — redirecting to /student/login");
        // use replace so user can't go back
        router.replace({ pathname: "/student/login" }).catch((e) => {
          console.warn("[AuthGuard] router.replace failed:", e);
        });
      }
    };
    checkAuth();
  }, [router]);

  // Debug helper (uncomment to print router state)
  // const debugRoutes = () => console.log("router.getState()", router.getState?.() || "no getState");

  const toggleMenu = (force) => {
    const next = typeof force === "boolean" ? force : !menuVisible;
    setMenuVisible(next);
    Animated.timing(anim, {
      toValue: next ? 1 : 0,
      duration: 240,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  };

  // compute menu top based on safe area + header height
  const headerHeight = Platform.OS === "android" ? HEADER_H_ANDROID : HEADER_H_IOS;
  const topPadding = insets.top || 0;
  const computedMenuTop = topPadding + headerHeight;

  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [-220, 0] });
  const opacity = anim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });

  // Robust logout handler: removes only used keys and navigates using replace
  const handleLogout = async () => {
    try {
      console.log("[Logout] clearing storage keys...");
      // remove only keys you use (safer than clear)
      await AsyncStorage.removeItem("userName");
      await AsyncStorage.removeItem("userEmail");
      await AsyncStorage.removeItem("avatarUri");
      await AsyncStorage.removeItem("groupId");
      // if you use an auth token: await AsyncStorage.removeItem("authToken");

      console.log("[Logout] navigating to /student/login via pathname object");
      await router.replace({ pathname: "/student/login" });

      // small fallback in case route system didn't update immediately
      setTimeout(() => {
        console.log("[Logout] fallback check -> replace('/student/login')");
        router.replace("/student/login").catch((e) => {
          console.warn("[Logout] fallback replace failed:", e);
          router.replace("/").catch(() => {});
        });
      }, 300);
    } catch (err) {
      console.error("[Logout] error during logout:", err);
      try {
        await router.replace("/student/login");
      } catch (e) {
        console.warn("[Logout] final fallback failed, going to root", e);
        router.replace("/").catch(() => {});
      }
    }
  };

  const onMenuAction = async (action) => {
    toggleMenu(false);
    switch (action) {
      case "viewGroup":
        router.push("/student/ViewGroup");
        break;
      case "groupChat":
        router.push({ pathname: "/ChatScreen", params: { roomId: "group_main", roomName: "Group Chat" } });
        break;
      case "video":
        router.push("/student/community/videoMeet");
        break;
      case "edit":
        router.push("/student/ProfileEdit");
        break;
      case "logout":
        await handleLogout();
        break;
      default:
        break;
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={styles.header.backgroundColor} />

      {/* header (part of layout, not absolute) */}
      <View
        style={[styles.header, { paddingTop: topPadding, height: headerHeight + topPadding }]}
        onLayout={(ev) => {
          const { y, height } = ev.nativeEvent.layout;
          setHeaderLayout({ y, height });
        }}
      >
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => {
            try {
              router.back();
            } catch (e) {
              router.replace("/");
            }
          }}
        >
          <MaterialIcons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>student</Text>

        <TouchableOpacity style={styles.menuBtn} onPress={() => toggleMenu(true)} accessibilityLabel="Open menu">
          <MaterialIcons name="menu" size={26} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* overlay closes menu when clicking outside */}
      {menuVisible && <TouchableWithoutFeedback onPress={() => toggleMenu(false)}><View style={styles.overlay} /></TouchableWithoutFeedback>}

      {/* animated menu */}
      <Animated.View
        pointerEvents={menuVisible ? "auto" : "none"}
        style={[
          styles.animatedMenu,
          {
            top: computedMenuTop,
            transform: [{ translateY }],
            opacity,
            zIndex: 9999,
            elevation: 9999,
          },
        ]}
      >
        <View style={styles.menuHeader}>
          <Text style={styles.menuHeaderText}>Menu</Text>
        </View>

        <TouchableOpacity style={styles.menuItem} onPress={() => onMenuAction("viewGroup")}>
          <Text style={styles.menuItemText}>View My Group</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => onMenuAction("groupChat")}>
          <Text style={styles.menuItemText}>Group Chat</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => onMenuAction("video")}>
          <Text style={styles.menuItemText}>Join Video Meet</Text>
        </TouchableOpacity>

        <View style={styles.sep} />

        <TouchableOpacity style={styles.menuItem} onPress={() => onMenuAction("edit")}>
          <Text style={styles.menuItemText}>Edit Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => onMenuAction("logout")}>
          <Text style={[styles.menuItemText, { color: "#ff8080" }]}>Logout</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* main content */}
      <View style={styles.container}>
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
            ) : (
              <Image
                source={{
                  uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(name || "Student")}&background=2F80ED&color=fff&size=128`,
                }}
                style={styles.avatarImage}
              />
            )}
          </View>

          <View style={styles.profileText}>
            <Text style={styles.title}>Welcome, {name || "Student"} 👋</Text>
            {email ? <Text style={styles.email}>{email}</Text> : null}
            <Text style={styles.subtitle}>This is your profile page.</Text>

            <TouchableOpacity style={styles.editBtn} onPress={() => router.push("/student/ProfileEdit")}>
              <MaterialIcons name="edit" size={18} color="#fff" />
              <Text style={styles.editBtnText}> Edit Profile</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* FAB */}
      <TouchableOpacity style={[styles.fab, { zIndex: 10001, elevation: 10001 }]} onPress={() => toggleMenu()}>
        <MaterialIcons name="more-vert" size={26} color="#222" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0f1720" },

  header: {
    width: "100%",
    backgroundColor: "#2b3a9a",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  backBtn: { padding: 6 },
  headerTitle: { flex: 1, textAlign: "center", fontSize: 20, color: "#fff", fontWeight: "700" },
  menuBtn: { padding: 6 },

  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9000,
    backgroundColor: "transparent",
  },

  animatedMenu: {
    position: "absolute",
    left: 12,
    right: 12,
    backgroundColor: "#111827",
    borderRadius: 12,
    paddingVertical: 6,
    shadowColor: "#000",
    shadowOpacity: 0.5,
    shadowRadius: 12,
  },
  menuHeader: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#172028",
  },
  menuHeaderText: { fontSize: 16, fontWeight: "700", color: "#fff" },

  menuItem: { paddingVertical: 14, paddingHorizontal: 16 },
  menuItemText: { fontSize: 16, fontWeight: "600", color: "#fff" },
  sep: { height: 1, backgroundColor: "#172028", marginVertical: 6 },

  container: { flex: 1, paddingHorizontal: 18, paddingTop: 24 },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    backgroundColor: "#0b1220",
    padding: 16,
    borderRadius: 12,
  },
  avatar: { width: 78, height: 78, borderRadius: 40, overflow: "hidden", marginRight: 14 },
  avatarImage: { width: "100%", height: "100%" },
  profileText: { flex: 1 },
  title: { fontSize: 22, fontWeight: "800", color: "#fff" },
  email: { fontSize: 13, color: "#cbd5e1", marginTop: 4 },
  subtitle: { fontSize: 14, color: "#9ca3af", marginTop: 8 },
  editBtn: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2b3a9a",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  editBtnText: { color: "#fff", fontWeight: "600", fontSize: 13 },

  fab: {
    position: "absolute",
    right: 18,
    bottom: 26,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
