// Severity Scoring Algorithm - Healthcare Triage System
// Deterministic, rule-based, explainable for compliance

const SYMPTOM_WEIGHTS = {
  // Critical symptoms (40-50 points)
  'chest pain': 50,
  'difficulty breathing': 50,
  'severe bleeding': 50,
  'unconscious': 50,
  'stroke symptoms': 50,
  'severe head injury': 45,
  'seizure': 45,
  'severe allergic reaction': 45,
  
  // High priority symptoms (25-35 points)
  'high fever': 35,
  'severe pain': 30,
  'vomiting blood': 35,
  'confusion': 30,
  'severe abdominal pain': 30,
  'broken bone': 25,
  'deep cut': 25,
  
  // Medium priority symptoms (15-20 points)
  'moderate fever': 20,
  'persistent cough': 15,
  'moderate pain': 15,
  'dizziness': 18,
  'nausea': 15,
  'headache': 15,
  'back pain': 15,
  
  // Low priority symptoms (5-10 points)
  'mild fever': 10,
  'cold symptoms': 8,
  'minor cut': 5,
  'rash': 8,
  'sore throat': 8,
  'minor pain': 5,
  'fatigue': 8
};

const AGE_RISK_MULTIPLIER = {
  infant: 1.3,      // 0-2 years
  child: 1.1,       // 3-12 years
  teen: 1.0,        // 13-17 years
  adult: 1.0,       // 18-64 years
  senior: 1.2,      // 65-79 years
  elderly: 1.4      // 80+ years
};

const CHRONIC_CONDITION_POINTS = {
  'heart disease': 15,
  'diabetes': 12,
  'asthma': 10,
  'copd': 12,
  'cancer': 15,
  'kidney disease': 12,
  'liver disease': 12,
  'immunocompromised': 15,
  'hypertension': 8,
  'stroke history': 12,
  'epilepsy': 10
};

const VITAL_SIGN_SCORING = {
  heartRate: (value) => {
    if (value < 40 || value > 140) return 20;
    if (value < 50 || value > 120) return 10;
    return 0;
  },
  bloodPressureSystolic: (value) => {
    if (value < 90 || value > 180) return 20;
    if (value < 100 || value > 160) return 10;
    return 0;
  },
  temperature: (value) => {
    if (value > 39.5 || value < 35) return 15;
    if (value > 38.5 || value < 36) return 8;
    return 0;
  },
  oxygenSaturation: (value) => {
    if (value < 90) return 25;
    if (value < 94) return 12;
    return 0;
  }
};

const SEVERITY_THRESHOLDS = {
  critical: 80,   // >= 80 points
  high: 50,       // 50-79 points
  medium: 25,     // 25-49 points
  low: 0          // 0-24 points
};

class SeverityService {
  
  calculateSeverity(triageData) {
    const {
      symptoms = [],
      age,
      chronicConditions = [],
      vitals = {}
    } = triageData;

    let score = 0;
    const breakdown = {
      symptomScore: 0,
      ageMultiplier: 1.0,
      chronicScore: 0,
      vitalScore: 0,
      totalScore: 0
    };

    // 1. Calculate symptom score
    breakdown.symptomScore = this.calculateSymptomScore(symptoms);
    score += breakdown.symptomScore;

    // 2. Apply age risk multiplier
    breakdown.ageMultiplier = this.getAgeMultiplier(age);
    score *= breakdown.ageMultiplier;

    // 3. Add chronic condition points
    breakdown.chronicScore = this.calculateChronicScore(chronicConditions);
    score += breakdown.chronicScore;

    // 4. Add vital signs score
    breakdown.vitalScore = this.calculateVitalScore(vitals);
    score += breakdown.vitalScore;

    breakdown.totalScore = Math.round(score);

    // 5. Determine severity level
    const severity = this.determineSeverityLevel(breakdown.totalScore);

    return {
      severity,
      score: breakdown.totalScore,
      breakdown,
      priority: this.calculatePriority(severity, breakdown.totalScore),
      explanation: this.generateExplanation(breakdown, severity)
    };
  }

  calculateSymptomScore(symptoms) {
    if (!Array.isArray(symptoms) || symptoms.length === 0) return 0;

    const normalizedSymptoms = symptoms.map(s => s.toLowerCase().trim());
    let maxScore = 0;

    // Take highest weighted symptom (not sum, to avoid inflation)
    normalizedSymptoms.forEach(symptom => {
      const score = SYMPTOM_WEIGHTS[symptom] || 0;
      if (score > maxScore) maxScore = score;
    });

    // Add 5 points for each additional symptom (max 15)
    const additionalSymptoms = Math.min(normalizedSymptoms.length - 1, 3);
    return maxScore + (additionalSymptoms * 5);
  }

  getAgeMultiplier(age) {
    if (!age) return 1.0;
    
    if (age <= 2) return AGE_RISK_MULTIPLIER.infant;
    if (age <= 12) return AGE_RISK_MULTIPLIER.child;
    if (age <= 17) return AGE_RISK_MULTIPLIER.teen;
    if (age <= 64) return AGE_RISK_MULTIPLIER.adult;
    if (age <= 79) return AGE_RISK_MULTIPLIER.senior;
    return AGE_RISK_MULTIPLIER.elderly;
  }

  calculateChronicScore(conditions) {
    if (!Array.isArray(conditions) || conditions.length === 0) return 0;

    const normalizedConditions = conditions.map(c => c.toLowerCase().trim());
    let score = 0;

    normalizedConditions.forEach(condition => {
      score += CHRONIC_CONDITION_POINTS[condition] || 0;
    });

    // Cap chronic condition score at 30
    return Math.min(score, 30);
  }

  calculateVitalScore(vitals) {
    if (!vitals || Object.keys(vitals).length === 0) return 0;

    let score = 0;

    if (vitals.heartRate) {
      score += VITAL_SIGN_SCORING.heartRate(vitals.heartRate);
    }
    if (vitals.bloodPressureSystolic) {
      score += VITAL_SIGN_SCORING.bloodPressureSystolic(vitals.bloodPressureSystolic);
    }
    if (vitals.temperature) {
      score += VITAL_SIGN_SCORING.temperature(vitals.temperature);
    }
    if (vitals.oxygenSaturation) {
      score += VITAL_SIGN_SCORING.oxygenSaturation(vitals.oxygenSaturation);
    }

    return score;
  }

  determineSeverityLevel(score) {
    if (score >= SEVERITY_THRESHOLDS.critical) return 'critical';
    if (score >= SEVERITY_THRESHOLDS.high) return 'high';
    if (score >= SEVERITY_THRESHOLDS.medium) return 'medium';
    return 'low';
  }

  calculatePriority(severity, score) {
    // Priority is inverse of score (higher score = lower priority number)
    const priorities = {
      critical: 1,
      high: 2,
      medium: 3,
      low: 4
    };
    return priorities[severity];
  }

  generateExplanation(breakdown, severity) {
    const parts = [];

    if (breakdown.symptomScore > 0) {
      parts.push(`Symptom severity: ${breakdown.symptomScore} points`);
    }
    if (breakdown.ageMultiplier > 1.0) {
      parts.push(`Age risk factor: ${breakdown.ageMultiplier}x multiplier`);
    }
    if (breakdown.chronicScore > 0) {
      parts.push(`Chronic conditions: +${breakdown.chronicScore} points`);
    }
    if (breakdown.vitalScore > 0) {
      parts.push(`Vital signs concern: +${breakdown.vitalScore} points`);
    }

    parts.push(`Total score: ${breakdown.totalScore} → ${severity.toUpperCase()}`);

    return parts.join(' | ');
  }

  validateTriageData(data) {
    const errors = [];

    if (!data.symptoms || !Array.isArray(data.symptoms) || data.symptoms.length === 0) {
      errors.push('At least one symptom is required');
    }

    if (data.age && (data.age < 0 || data.age > 120)) {
      errors.push('Age must be between 0 and 120');
    }

    if (data.vitals) {
      if (data.vitals.heartRate && (data.vitals.heartRate < 20 || data.vitals.heartRate > 250)) {
        errors.push('Heart rate must be between 20 and 250 bpm');
      }
      if (data.vitals.temperature && (data.vitals.temperature < 30 || data.vitals.temperature > 45)) {
        errors.push('Temperature must be between 30°C and 45°C');
      }
      if (data.vitals.oxygenSaturation && (data.vitals.oxygenSaturation < 50 || data.vitals.oxygenSaturation > 100)) {
        errors.push('Oxygen saturation must be between 50% and 100%');
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  getAvailableSymptoms() {
    return Object.keys(SYMPTOM_WEIGHTS).sort();
  }

  getAvailableConditions() {
    return Object.keys(CHRONIC_CONDITION_POINTS).sort();
  }
}

module.exports = new SeverityService();
