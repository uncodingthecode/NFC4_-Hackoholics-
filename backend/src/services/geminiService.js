import { GoogleGenerativeAI } from '@google/generative-ai';

class GeminiService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
  }

  async generateHealthReport(userData, vitals, medications, prescriptions) {
    try {
      const prompt = this.buildHealthReportPrompt(userData, vitals, medications, prescriptions);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error generating health report:', error);
      throw new Error('Failed to generate health report');
    }
  }

  async generateVitalTrendsAnalysis(vitals) {
    try {
      const prompt = this.buildVitalTrendsPrompt(vitals);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error generating vital trends analysis:', error);
      throw new Error('Failed to generate vital trends analysis');
    }
  }

  async generateMedicationInsights(medications, vitals) {
    try {
      const prompt = this.buildMedicationInsightsPrompt(medications, vitals);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error generating medication insights:', error);
      throw new Error('Failed to generate medication insights');
    }
  }

  async generateWearableDataInsights(wearableData) {
    try {
      const prompt = this.buildWearableInsightsPrompt(wearableData);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error generating wearable insights:', error);
      throw new Error('Failed to generate wearable insights');
    }
  }

  buildHealthReportPrompt(userData, vitals, medications, prescriptions) {
    return `
    Generate a comprehensive health report for ${userData.name} (${userData.age || 'N/A'} years old).
    
    Vital Signs Data:
    ${JSON.stringify(vitals, null, 2)}
    
    Medications:
    ${JSON.stringify(medications, null, 2)}
    
    Prescriptions:
    ${JSON.stringify(prescriptions, null, 2)}
    
    Please provide:
    1. Executive Summary
    2. Vital Signs Analysis
    3. Medication Review
    4. Health Trends
    5. Recommendations
    6. Risk Assessment
    
    Format the response in a professional medical report style with clear sections and actionable insights.
    `;
  }

  buildVitalTrendsPrompt(vitals) {
    return `
    Analyze the following vital signs data and provide insights on trends, patterns, and potential health implications:
    
    ${JSON.stringify(vitals, null, 2)}
    
    Please include:
    1. Trend Analysis
    2. Normal vs Abnormal Values
    3. Potential Health Implications
    4. Recommendations for Monitoring
    `;
  }

  buildMedicationInsightsPrompt(medications, vitals) {
    return `
    Analyze the relationship between medications and vital signs:
    
    Medications:
    ${JSON.stringify(medications, null, 2)}
    
    Vital Signs:
    ${JSON.stringify(vitals, null, 2)}
    
    Please provide:
    1. Medication Effectiveness Analysis
    2. Potential Side Effects
    3. Drug Interactions
    4. Dosage Optimization Suggestions
    `;
  }

  buildWearableInsightsPrompt(wearableData) {
    return `
    Analyze the following wearable device data and provide health insights:
    
    ${JSON.stringify(wearableData, null, 2)}
    
    Please include:
    1. Activity Level Analysis
    2. Sleep Quality Assessment
    3. Heart Rate Patterns
    4. Fitness Recommendations
    5. Health Goals Suggestions
    `;
  }
}

export default new GeminiService(); 