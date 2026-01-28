import { StyleSheet, Text, View } from "react-native";

interface VitalTileProps {
  label: string;
  value: number | string;
  unit: string;
  status?: "normal" | "warning" | "critical";
}

export default function VitalTile({
  label,
  value,
  unit,
  status = "normal",
}: VitalTileProps) {
  const statusColors = {
    normal: "#d4edda",
    warning: "#fff3cd",
    critical: "#f8d7da",
  };

  return (
    <View style={[styles.container, { backgroundColor: statusColors[status] }]}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>
        {value}
        <Text style={styles.unit}> {unit}</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    margin: 8,
    minWidth: 100,
  },
  label: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  value: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  unit: {
    fontSize: 14,
    color: "#666",
  },
});
