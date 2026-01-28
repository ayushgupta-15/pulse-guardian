import { StyleSheet, Text, View } from "react-native";

interface AlertBannerProps {
  riskLevel: string;
  message: string;
}

export default function AlertBanner({ riskLevel, message }: AlertBannerProps) {
  if (riskLevel === "Normal") return null;

  const isCritical = riskLevel === "Critical";

  return (
    <View style={[styles.banner, isCritical ? styles.critical : styles.warning]}>
      <Text style={styles.icon}>{isCritical ? "🚨" : "⚠️"}</Text>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{riskLevel} Alert</Text>
        <Text style={styles.message}>{message}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: "row",
    padding: 16,
    margin: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  warning: {
    backgroundColor: "#fff3cd",
  },
  critical: {
    backgroundColor: "#f8d7da",
  },
  icon: {
    fontSize: 32,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    color: "#666",
  },
});
