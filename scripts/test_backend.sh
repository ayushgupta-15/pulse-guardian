#!/usr/bin/env bash
set -euo pipefail

BASE_URL=${BASE_URL:-http://127.0.0.1:8000}

section() {
  echo
  echo "==> $1"
}

require_jq() {
  if ! command -v jq >/dev/null 2>&1; then
    echo "jq is required for assertions. Install with: sudo apt install jq"
    exit 1
  fi
}

assert() {
  local label=$1
  shift
  if ! "$@"; then
    echo "Assertion failed: $label"
    exit 1
  fi
}

require_jq

section "Health check"
curl -s "$BASE_URL/health" | tee /tmp/health.json
assert "health status" jq -e '.status == "healthy"' /tmp/health.json >/dev/null

section "List patients"
curl -s "$BASE_URL/patients/" | tee /tmp/patients.json
assert "patients list non-empty" jq -e 'length >= 1' /tmp/patients.json >/dev/null

section "Post normal vitals (P001)"
curl -s -X POST "$BASE_URL/vitals/" \
  -H "Content-Type: application/json" \
  -d '{"patient_id":"P001","heart_rate":75,"spo2":98,"temperature":37.0}' \
  | tee /tmp/vitals_normal.json
assert "normal risk level" jq -e '.risk.level == "NORMAL"' /tmp/vitals_normal.json >/dev/null
assert "normal has vitals object" jq -e '.vitals.heart_rate and .vitals.spo2 and .vitals.temperature' /tmp/vitals_normal.json >/dev/null

section "Post warning vitals (P002)"
curl -s -X POST "$BASE_URL/vitals/" \
  -H "Content-Type: application/json" \
  -d '{"patient_id":"P002","heart_rate":110,"spo2":93,"temperature":38.0}' \
  | tee /tmp/vitals_warning.json
assert "warning risk level" jq -e '.risk.level == "WARNING"' /tmp/vitals_warning.json >/dev/null

section "Post critical vitals (P003)"
curl -s -X POST "$BASE_URL/vitals/" \
  -H "Content-Type: application/json" \
  -d '{"patient_id":"P003","heart_rate":160,"spo2":88,"temperature":39.5}' \
  | tee /tmp/vitals_critical.json
assert "critical risk level" jq -e '.risk.level == "CRITICAL"' /tmp/vitals_critical.json >/dev/null

section "Boundary tests"
curl -s -X POST "$BASE_URL/vitals/" \
  -H "Content-Type: application/json" \
  -d '{"patient_id":"P001","heart_rate":60,"spo2":95,"temperature":36.1}' \
  | tee /tmp/boundary_normal.json
assert "boundary normal" jq -e '.risk.level == "NORMAL"' /tmp/boundary_normal.json >/dev/null

curl -s -X POST "$BASE_URL/vitals/" \
  -H "Content-Type: application/json" \
  -d '{"patient_id":"P001","heart_rate":59,"spo2":94,"temperature":36.0}' \
  | tee /tmp/boundary_warning.json
assert "boundary warning" jq -e '.risk.level == "WARNING"' /tmp/boundary_warning.json >/dev/null

curl -s -X POST "$BASE_URL/vitals/" \
  -H "Content-Type: application/json" \
  -d '{"patient_id":"P001","heart_rate":40,"spo2":90,"temperature":35.0}' \
  | tee /tmp/boundary_warning2.json
assert "boundary warning at critical thresholds" jq -e '.risk.level == "WARNING"' /tmp/boundary_warning2.json >/dev/null

curl -s -X POST "$BASE_URL/vitals/" \
  -H "Content-Type: application/json" \
  -d '{"patient_id":"P001","heart_rate":39,"spo2":89,"temperature":34.9}' \
  | tee /tmp/boundary_critical.json
assert "critical below thresholds" jq -e '.risk.level == "CRITICAL"' /tmp/boundary_critical.json >/dev/null

section "Latest vitals check"
for pid in P001 P002 P003; do
  echo "- $pid"
  curl -s "$BASE_URL/vitals/latest/$pid" | tee "/tmp/latest_${pid}.json"
  assert "latest ${pid} schema" jq -e '.patient_id and .timestamp and .vitals and .risk' "/tmp/latest_${pid}.json" >/dev/null
  echo
 done

section "History check (P001, limit 5)"
curl -s "$BASE_URL/vitals/history/P001?limit=5" | tee /tmp/history_p001.json
assert "history schema" jq -e '.patient_id and (.history | type=="array")' /tmp/history_p001.json >/dev/null
assert "history items schema" jq -e 'all(.history[]; .patient_id and .timestamp and .vitals and .risk)' /tmp/history_p001.json >/dev/null

section "Missing vital field (expect 400)"
http_code=$(curl -s -o /tmp/missing_field.json -w "%{http_code}" -X POST "$BASE_URL/vitals/" \
  -H "Content-Type: application/json" \
  -d '{"patient_id":"P001","heart_rate":70,"spo2":98}')
assert "missing field status 400" test "$http_code" = "400"
assert "missing field error shape" jq -e '.error and .detail' /tmp/missing_field.json >/dev/null

section "Malformed JSON (expect 422)"
http_code=$(curl -s -o /tmp/malformed.json -w "%{http_code}" -X POST "$BASE_URL/vitals/" \
  -H "Content-Type: application/json" \
  -d '{"patient_id":"P001",')
assert "malformed status 422" test "$http_code" = "422"
assert "malformed error shape" jq -e '.error and .detail' /tmp/malformed.json >/dev/null

section "Invalid patient (expect 404)"
http_code=$(curl -s -o /tmp/invalid_patient.json -w "%{http_code}" "$BASE_URL/vitals/latest/NOPE")
assert "invalid patient status 404" test "$http_code" = "404"
assert "invalid patient error shape" jq -e '.error == "not_found"' /tmp/invalid_patient.json >/dev/null

section "Limit edge cases"
http_code=$(curl -s -o /tmp/history_limit0.json -w "%{http_code}" "$BASE_URL/vitals/history/P001?limit=0")
assert "limit=0 status 200" test "$http_code" = "200"
assert "limit=0 history array" jq -e '.history | type=="array"' /tmp/history_limit0.json >/dev/null

http_code=$(curl -s -o /tmp/history_limit_large.json -w "%{http_code}" "$BASE_URL/vitals/history/P001?limit=1000")
assert "limit=1000 status 200" test "$http_code" = "200"
assert "limit=1000 history array" jq -e '.history | type=="array"' /tmp/history_limit_large.json >/dev/null

echo
echo "Done. All assertions passed."
