import { useEffect, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import AlertBanner from "../components/AlertBanner";
import VitalTile from "../components/VitalTile";
import { api, Patient, Vitals } from "../services/api";

export default function HomeScreen() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<string>("P001");
  const [vitals, setVitals] = useState<Vitals | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const patientsData = await api.getAllPatients();
      setPatients(patientsData);

      const vitalsData = await api.getLatestVitals(selectedPatient);
      setVitals(vitalsData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, [selectedPatient]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>🏥 Health Monitor</Text>
        <Text style={styles.subtitle}>Real-time patient vitals</Text>
      </View>

      <ScrollView horizontal style={styles.patientSelector}>
        {patients.map((patient) => (
          <TouchableOpacity
            key={patient.patient_id}
            style={[
              styles.patientButton,
              selectedPatient === patient.patient_id && styles.selectedPatient,
            ]}
            onPress={() => setSelectedPatient(patient.patient_id)}
          >
            <Text
              style={[
                styles.patientButtonText,
                selectedPatient === patient.patient_id &&
                  styles.selectedPatientText,
              ]}
            >
              {patient.name}
            </Text>
            <Text style={styles.patientRoom}>{patient.room}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {vitals ? (
        <>
          <AlertBanner riskLevel={vitals.risk_level} message={vitals.message} />

          <View style={styles.riskContainer}>
            <Text style={styles.riskLabel}>Risk Level</Text>
            <View
              style={[
                styles.riskBadge,
                vitals.risk_level === "Critical"
                  ? styles.riskCritical
                  : vitals.risk_level === "Warning"
                  ? styles.riskWarning
                  : styles.riskNormal,
              ]}
            >
              <Text style={styles.riskLevel}>{vitals.risk_level}</Text>
              <Text style={styles.riskScore}>
                Score: {vitals.risk_score.toFixed(1)}
              </Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Current Vitals</Text>
          <View style={styles.vitalsGrid}>
            <VitalTile
              label="Heart Rate"
              value={vitals.heart_rate}
              unit="BPM"
              status={
                vitals.heart_rate < 60 || vitals.heart_rate > 100
                  ? vitals.heart_rate < 40 || vitals.heart_rate > 140
                    ? "critical"
                    : "warning"
                  : "normal"
              }
            />
            <VitalTile
              label="Blood Oxygen"
              value={vitals.spo2}
              unit="%"
              status={
                vitals.spo2 < 95
                  ? vitals.spo2 < 90
                    ? "critical"
                    : "warning"
                  : "normal"
              }
            />
            <VitalTile
              label="Temperature"
              value={vitals.temperature}
              unit="°C"
              status={
                vitals.temperature < 36.1 || vitals.temperature > 37.2
                  ? vitals.temperature < 35 || vitals.temperature > 39
                    ? "critical"
                    : "warning"
                  : "normal"
              }
            />
          </View>
          <Text style={styles.timestamp}>
            Last updated:{" "}
            {new Date(vitals.timestamp * 1000).toLocaleTimeString()}
          </Text>
        </>
      ) : (
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>No vitals data available</Text>
          <Text style={styles.noDataSubtext}>Start the simulator to see data</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    backgroundColor: "#fff",
    padding: 24,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  patientSelector: {
    backgroundColor: "#fff",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  patientButton: {
    padding: 12,
    marginRight: 12,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
    minWidth: 120,
  },
  selectedPatient: {
    backgroundColor: "#007AFF",
  },
  patientButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  selectedPatientText: {
    color: "#fff",
  },
  patientRoom: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  riskContainer: {
    alignItems: "center",
    padding: 24,
  },
  riskLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  riskBadge: {
    padding: 16,
    borderRadius: 12,
    minWidth: 150,
    alignItems: "center",
  },
  riskNormal: {
    backgroundColor: "#d4edda",
  },
  riskWarning: {
    backgroundColor: "#fff3cd",
  },
  riskCritical: {
    backgroundColor: "#f8d7da",
  },
  riskLevel: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  riskScore: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  vitalsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
  },
  timestamp: {
    textAlign: "center",
    color: "#666",
    fontSize: 12,
    marginTop: 16,
    marginBottom: 24,
  },
  loadingText: {
    fontSize: 18,
    color: "#666",
  },
  noDataContainer: {
    alignItems: "center",
    padding: 48,
  },
  noDataText: {
    fontSize: 18,
    color: "#666",
    marginBottom: 8,
  },
  noDataSubtext: {
    fontSize: 14,
    color: "#999",
  },
});
