# Severity Determination Algorithm

## Overview
Deterministic, rule-based triage scoring system for healthcare compliance and explainability.

## Algorithm Design

### Scoring Formula
```
Total Score = (Symptom Score × Age Multiplier) + Chronic Score + Vital Score
```

### Severity Thresholds
```
Critical: ≥ 80 points
High:     50-79 points
Medium:   25-49 points
Low:      0-24 points
```

## 1. Symptom Scoring (0-50 base points)

### Weight Categories

**Critical Symptoms (40-50 points)**
- Chest pain: 50
- Difficulty breathing: 50
- Severe bleeding: 50
- Unconscious: 50
- Stroke symptoms: 50
- Severe head injury: 45
- Seizure: 45
- Severe allergic reaction: 45

**High Priority (25-35 points)**
- High fever: 35
- Vomiting blood: 35
- Severe pain: 30
- Confusion: 30
- Severe abdominal pain: 30
- Broken bone: 25
- Deep cut: 25

**Medium Priority (15-20 points)**
- Moderate fever: 20
- Dizziness: 18
- Persistent cough: 15
- Moderate pain: 15
- Nausea: 15
- Headache: 15
- Back pain: 15

**Low Priority (5-10 points)**
- Mild fever: 10
- Cold symptoms: 8
- Rash: 8
- Sore throat: 8
- Fatigue: 8
- Minor cut: 5
- Minor pain: 5

### Calculation Logic
```javascript
1. Take HIGHEST weighted symptom (not sum)
2. Add 5 points per additional symptom (max 3 additional = +15)

Example:
- Chest pain (50) + Difficulty breathing + Nausea
- Score = 50 + 5 + 5 = 60 points
```

**Rationale:** Prevents score inflation from listing many minor symptoms.

## 2. Age Risk Multiplier (1.0x - 1.4x)

### Multipliers
```
Infant (0-2):     1.3x
Child (3-12):     1.1x
Teen (13-17):     1.0x
Adult (18-64):    1.0x
Senior (65-79):   1.2x
Elderly (80+):    1.4x
```

### Application
```javascript
Score after age = Symptom Score × Age Multiplier

Example:
- Elderly patient (80+) with high fever (35 points)
- 35 × 1.4 = 49 points
- Severity: HIGH (instead of MEDIUM)
```

**Rationale:** Age extremes increase medical risk.

## 3. Chronic Condition Points (0-30 max)

### Condition Weights
```
Heart disease:        15 points
Cancer:               15 points
Immunocompromised:    15 points
Diabetes:             12 points
COPD:                 12 points
Kidney disease:       12 points
Liver disease:        12 points
Stroke history:       12 points
Asthma:               10 points
Epilepsy:             10 points
Hypertension:         8 points
```

### Calculation
```javascript
Sum all applicable conditions, capped at 30 points

Example:
- Diabetes (12) + Heart disease (15) + Hypertension (8)
- Sum = 35, capped at 30
```

**Rationale:** Multiple conditions compound risk but shouldn't dominate score.

## 4. Vital Signs Scoring (0-25 points)

### Heart Rate
```
< 40 or > 140 bpm:  +20 points
< 50 or > 120 bpm:  +10 points
Normal:             0 points
```

### Blood Pressure (Systolic)
```
< 90 or > 180 mmHg: +20 points
< 100 or > 160 mmHg: +10 points
Normal:              0 points
```

### Temperature
```
> 39.5°C or < 35°C:  +15 points
> 38.5°C or < 36°C:  +8 points
Normal:              0 points
```

### Oxygen Saturation
```
< 90%:  +25 points (critical)
< 94%:  +12 points
Normal: 0 points
```

**Rationale:** Objective measurements override subjective symptoms.

## API Endpoints

### Calculate Severity
```
POST /api/triage/calculate

Request Body:
{
  "symptoms": ["chest pain", "difficulty breathing"],
  "age": 75,
  "chronicConditions": ["heart disease", "diabetes"],
  "vitals": {
    "heartRate": 145,
    "bloodPressureSystolic": 170,
    "temperature": 37.2,
    "oxygenSaturation": 92
  }
}

Response:
{
  "severity": "critical",
  "score": 112,
  "priority": 1,
  "breakdown": {
    "symptomScore": 55,
    "ageMultiplier": 1.2,
    "chronicScore": 27,
    "vitalScore": 32,
    "totalScore": 112
  },
  "explanation": "Symptom severity: 55 points | Age risk factor: 1.2x multiplier | Chronic conditions: +27 points | Vital signs concern: +32 points | Total score: 112 → CRITICAL"
}
```

### Get Available Symptoms
```
GET /api/triage/symptoms

Response:
[
  "chest pain",
  "difficulty breathing",
  "high fever",
  ...
]
```

### Get Available Conditions
```
GET /api/triage/conditions

Response:
[
  "heart disease",
  "diabetes",
  "asthma",
  ...
]
```

## Validation Rules

### Required Fields
- `symptoms`: Array with at least 1 symptom

### Optional Fields
- `age`: 0-120
- `chronicConditions`: Array of strings
- `vitals`: Object with numeric values

### Vital Sign Ranges
- Heart rate: 20-250 bpm
- Blood pressure: 50-250 mmHg
- Temperature: 30-45°C
- Oxygen saturation: 50-100%

## Example Scenarios

### Scenario 1: Critical Emergency
```javascript
Input:
- Symptoms: ["chest pain", "difficulty breathing"]
- Age: 68
- Conditions: ["heart disease"]
- Vitals: { oxygenSaturation: 88 }

Calculation:
1. Symptom: 50 (chest pain) + 5 (additional) = 55
2. Age: 55 × 1.2 = 66
3. Chronic: 15 (heart disease)
4. Vitals: 25 (low O2)
Total: 66 + 15 + 25 = 106

Result: CRITICAL (priority 1)
```

### Scenario 2: High Priority
```javascript
Input:
- Symptoms: ["high fever", "severe pain"]
- Age: 45
- Conditions: ["diabetes"]
- Vitals: { temperature: 39.8 }

Calculation:
1. Symptom: 35 (high fever) + 5 = 40
2. Age: 40 × 1.0 = 40
3. Chronic: 12 (diabetes)
4. Vitals: 15 (high temp)
Total: 40 + 12 + 15 = 67

Result: HIGH (priority 2)
```

### Scenario 3: Medium Priority
```javascript
Input:
- Symptoms: ["moderate fever", "headache"]
- Age: 30
- Conditions: []
- Vitals: {}

Calculation:
1. Symptom: 20 (moderate fever) + 5 = 25
2. Age: 25 × 1.0 = 25
3. Chronic: 0
4. Vitals: 0
Total: 25

Result: MEDIUM (priority 3)
```

### Scenario 4: Low Priority
```javascript
Input:
- Symptoms: ["sore throat"]
- Age: 25
- Conditions: []
- Vitals: {}

Calculation:
1. Symptom: 8 (sore throat)
2. Age: 8 × 1.0 = 8
3. Chronic: 0
4. Vitals: 0
Total: 8

Result: LOW (priority 4)
```

## Integration with Queue System

### Automatic Severity Assignment
```javascript
// In appointmentController.createAppointment()
const triageData = {
  symptoms: req.body.symptoms,
  age: req.body.age,
  chronicConditions: req.body.chronicConditions,
  vitals: req.body.vitals
};

const result = severityService.calculateSeverity(triageData);
appointment.severity = result.severity;
appointment.triageScore = result.score;

// Queue automatically sorts by severity
```

### Queue Priority
```
Critical patients → Position 1-N (sorted by time)
High patients → Position N+1-M (sorted by time)
Medium patients → Position M+1-P (sorted by time)
Low patients → Position P+1-Q (sorted by time)
```

## Compliance & Explainability

### Audit Trail
Every severity calculation includes:
- Input data
- Score breakdown
- Human-readable explanation
- Timestamp

### Explainability Example
```
"Symptom severity: 50 points | Age risk factor: 1.3x multiplier | 
Chronic conditions: +15 points | Vital signs concern: +25 points | 
Total score: 105 → CRITICAL"
```

### Healthcare Standards
- ✅ Deterministic (same input = same output)
- ✅ Explainable (shows reasoning)
- ✅ Auditable (logs all calculations)
- ✅ Configurable (thresholds adjustable)
- ✅ No black-box ML (rule-based)

## Configuration Management

### Adjusting Thresholds
```javascript
// In severityService.js
const SEVERITY_THRESHOLDS = {
  critical: 80,  // Adjust based on hospital capacity
  high: 50,
  medium: 25,
  low: 0
};
```

### Adding New Symptoms
```javascript
SYMPTOM_WEIGHTS = {
  ...existing,
  'new symptom': 30  // Add with appropriate weight
};
```

### Modifying Age Multipliers
```javascript
AGE_RISK_MULTIPLIER = {
  infant: 1.3,  // Adjust based on clinical data
  ...
};
```

## Future Enhancements

### Phase 2: Machine Learning
- Train model on historical triage data
- Use ML score as additional input
- Keep rule-based as fallback
- Maintain explainability

### Phase 3: Real-Time Vitals
- Integrate with medical devices
- Continuous monitoring
- Auto-escalate on vital changes

### Phase 4: Predictive Analytics
- Predict deterioration risk
- Suggest preventive measures
- Resource allocation optimization

## Testing

### Unit Tests
```javascript
// Test critical threshold
expect(calculateSeverity({
  symptoms: ['chest pain'],
  age: 70
})).toHaveProperty('severity', 'critical');

// Test age multiplier
expect(calculateSeverity({
  symptoms: ['high fever'],
  age: 85
})).toHaveProperty('score', 49); // 35 × 1.4
```

### Edge Cases
- Empty symptoms → Error
- Invalid age → Error
- Missing vitals → Score without vitals
- Unknown symptom → Ignored (0 points)

## Performance

### Expected Latency
- Calculation: < 5ms
- Database save: < 50ms
- Total API response: < 100ms

### Scalability
- Stateless calculation
- No external dependencies
- Can handle 1000+ req/sec
