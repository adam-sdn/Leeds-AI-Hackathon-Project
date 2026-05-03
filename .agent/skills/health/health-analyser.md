Health Trend Analyzer
Analyze health data trends and patterns over time, identify changes, correlations, and provide data-driven health insights.

When to Use
Use when you need to analyze health data trends, correlations, or significant changes over a period of time.
Use for tasks involving multiple dimensions like weight, symptoms, medications, lab tests, mood, or sleep changing over time.
Use when users ask "what changes have occurred in my health recently" or request a trends report.
Core Features
1. Multi-Dimensional Trend Analysis
Weight/BMI Trends: Track weight and BMI changes over time, assess health trends
Symptom Patterns: Identify recurring symptoms, frequency changes, and potential triggers
Medication Adherence: Analyze medication patterns, identify missed doses and improvement opportunities
Lab Results Trends: Track biomarker changes (cholesterol, blood sugar, blood pressure, etc.)
Mood and Sleep: Correlate emotional states with sleep quality, identify mental health trends
2. Correlation Analysis Engine
Medication-Symptom Correlation: Identify if new medications relate to symptom changes
Lifestyle Impact: Link diet/sleep to symptoms and mood
Treatment Effectiveness: Measure whether treatment leads to improvement
Cycle-Symptom Correlation: Track cycle-related patterns in women's health
3. Change Detection
Significant Changes: Alert on rapid weight changes, new symptoms, medication changes
Deterioration Patterns: Early identification of health decline
Improvement Recognition: Highlight positive health changes
Threshold Alerts: Warn when approaching dangerous levels (radiation, BMI extremes)
4. Predictive Insights
Risk Assessment: Identify risk factors based on trends
Prevention Recommendations: Suggest preventive measures based on patterns
Early Warnings: Predict problems before they become serious
Usage Instructions
Trigger Conditions
Use this skill when users mention these scenarios:

General Inquiries:

✅ "What changes have occurred in my health over the past period?"
✅ "Analyze my health trends"
✅ "What changes have happened to my body?"
✅ "Health status summary"
Specific Dimensions:

✅ "What's my weight/BMI trend?"
✅ "Analyze my symptom patterns"
✅ "How's my medication adherence?"
✅ "What changes in my lab values?"
✅ "My mood and sleep trends"
Correlation Analysis:

✅ "What is my symptom correlated with?"
✅ "Is my medication working?"
✅ "What's the relationship between sleep and my mood?"
Time Ranges:

Default analysis: past 3 months
Supported: "past 1 month", "past 6 months", "past 1 year"
Supported: "January 2025 to now", "last 90 days"
Execution Steps
Step 1: Determine Analysis Time Range
Extract time range from user input, or use default value (3 months).

Step 2: Read Health Data
Read from the following data sources:
// 1. Personal profile (BMI, weight)
const profile = readFile('data/profile.json');

// 2. Symptom records
const symptomFiles = glob('data/symptoms/**/*.json');
const symptoms = readAllJson(symptomFiles);

// 3. Mood records
const moodFiles = glob('data/mood/**/*.json');
const moods = readAllJson(moodFiles);

// 4. Diet records
const dietFiles = glob('data/diet/**/*.json');
const diets = readAllJson(dietFiles);

// 5. Medication logs
const medicationLogs = glob('data/medication-logs/**/*.json');

// 6. Women's health data (if applicable)
const cycleData = readFile('data/cycle-tracker.json');
const pregnancyData = readFile('data/pregnancy-tracker.json');
const menopauseData = readFile('data/menopause-tracker.json');

// 7. Allergy history
const allergies = readFile('data/allergies.json');

// 8. Radiation records
const radiation = readFile('data/radiation-records.json');

Step 3: Data Filtering
Filter data by time range:
function filterByDate(data, startDate, endDate) {
  return data.filter(item => {
    const itemDate = new Date(item.date || item.created_at);
    return itemDate >= startDate && itemDate <= endDate;
  });
}

Step 4: Trend Analysis
Perform trend analysis on each data dimension:

4.1 Weight/BMI Trends

Extract historical weight data
Calculate BMI changes
Identify trend direction (increasing/decreasing/stable)
Assess magnitude of change
4.2 Symptom Patterns

Count symptom frequency
Identify high-frequency symptoms
Analyze symptom time patterns
Detect symptom triggers
4.3 Medication Adherence

Calculate overall adherence rate
Analyze adherence by medication
Identify missed dose patterns
Evaluate improvement recommendations
4.4 Lab Results

Track biomarkers across multiple reports
Compare against reference ranges
Identify improvement/deterioration
Flag abnormal values
4.5 Mood and Sleep

Correlate mood scores with sleep duration
Identify mood fluctuation patterns
Detect stress levels
Assess mental health trends
Step 5: Correlation Analysis
Use statistical methods to identify correlations:
// Pearson correlation coefficient
function pearsonCorrelation(x, y) {
  // Calculate correlation coefficient
  // Returns: -1 (negative correlation) to 1 (positive correlation)
}

// Application scenarios
- Medication start date vs symptom frequency
- Sleep duration vs mood score
- Weight change vs diet records
- Exercise amount vs mood state

Step 6: Change Detection
Identify significant changes:
// Change point detection
function detectChangePoints(timeSeries) {
  // Use statistical methods to detect significant change points
  // Example: sudden weight drop, symptom increase
}

// Threshold alerts
function checkThresholds(value, thresholds) {
  // Check if approaching or exceeding danger thresholds
  // Example: BMI > 30, radiation dose > safety limit
}

Step 7: Generate Insights
Create meaningful, actionable health insights:

7.1 Summary Report

Generate overview of health status
Highlight key trends
Point out significant changes
7.2 Personalized Recommendations

Diet suggestions based on trends
Exercise recommendations
Medication adherence improvement strategies
Lifestyle adjustments
7.3 Risk Assessment

Identify potential health risks
Flag concerning patterns
Recommend preventive actions
7.4 Alert Generation

Create alerts for urgent changes
Warn about threshold violations
Provide immediate action guidance
7.5 Progress Tracking

Show improvement over time
Celebrate positive changes
Encourage continued healthy habits
Step 8: Data Visualization
Generate visual representations of trends:

// Chart.js configuration
function generateCharts(data, type, options) {
  switch(type) {
    case 'line':
      return {
        type: 'line',
        data: {
          labels: data.labels,
          datasets: data.datasets
        },
        options: options
      };
    case 'bar':
      // Bar chart for symptom frequencies
      break;
    case 'scatter':
      // Scatter plot for correlations
      break;
    case 'pie':
      // Pie chart for distribution
      break;
  }
}
Common Visualizations
Trend line charts (weight, BMI, lab values)
Symptom frequency bar charts
Medication adherence pie chart
Correlation scatter plots
Mood vs sleep line chart
Step 9: Output Formatting
Generate user-friendly output:

// JSON output structure
{
  "summary": {
    "status": "stable",
    "message": "Your health trends are generally positive with some areas to monitor."
  },
  "trends": [
    {
      "dimension": "weight",
      "trend": "stable",
      "change": "+0.5 kg",
      "period": "3 months",
      "visualization": "chart_data"
    },
    {
      "dimension": "symptoms",
      "trend": "improving",
      "change": "-20% frequency",
      "period": "3 months",
      "visualization": "chart_data"
    }
  ],
  "correlations": [
    {
      "dimension": "sleep_vs_mood",
      "correlation": 0.78,
      "strength": "strong positive",
      "insight": "Better sleep correlates with improved mood."
    }
  ],
  "recommendations": [
    "Continue current medication regimen.",
    "Maintain current diet and exercise routine.",
    "Monitor weight weekly."
  ],
  "alerts": [
    // Only if significant changes detected
  ]
}
Execution Examples
Example 1: Simple Trend Request
User: "Analyze my health trends over the past 3 months"

Agent:

Determine date range: Past 3 months

Read profile and health data

Calculate trends for all dimensions

Generate summary report

Create 2-3 key visualizations

Provide personalized recommendations

Example 2: Correlation Analysis
User: "Is my medication working?"

Agent:

Identify medication period

Read medication logs and symptom data

Calculate correlation between medication and symptoms

Analyze if symptoms improved after starting medication

Generate correlation report with visualizations

Provide conclusion on effectiveness

Example 3: Multi-Period Comparison
User: "How has my health changed in 2025?"

Agent:

Split 2025 into quarters (Q1, Q2, Q3, Q4)

Analyze trends for each quarter

Compare changes across quarters

Generate quarterly progress report

Highlight improvements and areas needing attention

Example 4: Specific Data Analysis
User: "Analyze my weight and BMI trends."

Agent:

Extract weight data from records

Calculate BMI for each entry

Generate weight trend chart

Identify BMI categories (underweight, normal, overweight, obese)

Provide recommendations based on BMI category

Data Format Examples
Symptom record:

{
  "id": "s-001",
  "user_id": "u-123",
  "symptom": "headache",
  "severity": 7,
  "duration_hours": 4,
  "date": "2025-01-15",
  "time": "14:30",
  "triggers": ["stress", "missed meal"],
  "notes": "Migraine started after work meeting"
}

Weight record:

{
  "id": "w-001",
  "user_id": "u-123",
  "weight_kg": 75.2,
  "bmi": 24.5,
  "date": "2025-01-15",
  "source": "smart_scale"
}

Medication log:

{
  "id": "m-001",
  "user_id": "u-123",
  "medication_id": "med-001",
  "medication_name": "Ibuprofen",
  "dosage": "400mg",
  "frequency": "as needed",
  "date": "2025-01-15",
  "time": "14:35",
  "status": "taken"
}

Mood record:

{
  "id": "mo-001",
  "user_id": "u-123",
  "score": 7,
  "scale": 1-10,
  "date": "2025-01-15",
  "time": "21:00",
  "notes": "Felt productive today"
}

Health Trend Analysis Report
━━━━━━━━━━━━━━━━━━━━━━━━━━
Generated: 2025-12-31
Analysis Period: Past 3 months (2025-10-01 to 2025-12-31)

📊 Overall Assessment
━━━━━━━━━━━━━━━━━━━━━━━━━━
Improving: Weight management, cholesterol levels
Stable: Blood sugar control, mood state
Needs Attention: Medication adherence, sleep quality

📊 Weight/BMI Trends
├─ Current weight: 68.5 kg
├─ Current BMI: 23.1 (normal range)
├─ 3-month change: -2.3 kg (-3.2%)
├─ Trend: 📉 Gradual weight loss
└─ Assessment: ✅ Positive trend, within healthy range

💊 Medication Adherence
├─ Current medications: 3
├─ Overall adherence rate: 78%
├─ Missed doses: 8
├─ Best: Aspirin (95%)
└─ Needs improvement: Amlodipine (65%)

⚠️ Symptom Patterns
├─ Most frequent: Headaches (12 times past 3 months)
├─ Trend: 📉 Decreasing frequency (4 fewer than previous period)
├─ Potential trigger: Moderate correlation identified with sleep quality (r=0.62)
└─ Recommendation: Continue improving sleep patterns

🧪 Lab Results Trends
├─ Cholesterol: 240 → 210 mg/dL (improved ✅)
├─ Blood sugar: 5.6 → 5.4 mmol/L (stable)
├─ Last test: 30 days ago
└─ Recommendation: Retest in 3 months

😊 Mood and Sleep
├─ Average mood score: 6.8/10
├─ Average sleep duration: 6.5 hours
├─ Trend: Mood stable, sleep slightly improved
└─ Correlation: Sleep duration and mood score strongly correlated (r=0.78)

🔗 Correlation Analysis
━━━━━━━━━━━━━━━━━━━━━━━━━━
• Sleep duration ↔ Mood score: Strong positive correlation (r=0.78)
• Weight change ↔ Diet records: Moderate correlation (r=0.55)
• Medication adherence ↔ Symptom frequency: Moderate negative correlation (r=-0.62)

💡 Risk Assessment & Recommendations
━━━━━━━━━━━━━━━━━━━━━━━━━━

🟢 Continue Current Approach
• Current weight management method is effective
• Cholesterol level improvement is significant

🟡 Areas to Monitor
• Improve amlodipine adherence (set reminders)
• Increase sleep duration to 7-8 hours

📅 Follow-up Plan
• Retest lipid panel in 3 months
• Evaluate medication adherence improvement in 1 month

━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ Disclaimer
This analysis is for reference only and does not replace professional medical diagnosis.
Please consult a healthcare provider for professional advice.