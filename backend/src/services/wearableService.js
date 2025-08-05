import axios from 'axios';
import crypto from 'crypto';
import Wearable from '../models/wearable.model.js';
import Vital from '../models/vital.model.js';
import geminiService from './geminiService.js';

class WearableService {
  constructor() {
    this.fitbitConfig = {
      clientId: process.env.FITBIT_CLIENT_ID,
      clientSecret: process.env.FITBIT_CLIENT_SECRET,
      redirectUri: process.env.FITBIT_REDIRECT_URI,
    };
  }

  // Fitbit Integration
  async connectFitbit(userId, authCode) {
    try {
      const tokenResponse = await this.getFitbitTokens(authCode);
      
      const wearable = new Wearable({
        user_id: userId,
        device_type: 'fitbit',
        device_name: 'Fitbit Device',
        access_token: tokenResponse.access_token,
        refresh_token: tokenResponse.refresh_token,
        token_expires_at: new Date(Date.now() + tokenResponse.expires_in * 1000),
        permissions: ['steps', 'heart_rate', 'sleep', 'calories', 'weight'],
      });

      await wearable.save();
      return wearable;
    } catch (error) {
      console.error('Error connecting Fitbit:', error);
      throw new Error('Failed to connect Fitbit');
    }
  }

  async getFitbitTokens(authCode) {
    const response = await axios.post('https://api.fitbit.com/oauth2/token', {
      client_id: this.fitbitConfig.clientId,
      grant_type: 'authorization_code',
      code: authCode,
      redirect_uri: this.fitbitConfig.redirectUri,
    }, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${this.fitbitConfig.clientId}:${this.fitbitConfig.clientSecret}`).toString('base64')}`,
      },
    });

    return response.data;
  }

  async refreshFitbitToken(wearable) {
    try {
      const response = await axios.post('https://api.fitbit.com/oauth2/token', {
        grant_type: 'refresh_token',
        refresh_token: wearable.refresh_token,
      }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${Buffer.from(`${this.fitbitConfig.clientId}:${this.fitbitConfig.clientSecret}`).toString('base64')}`,
        },
      });

      wearable.access_token = response.data.access_token;
      wearable.refresh_token = response.data.refresh_token;
      wearable.token_expires_at = new Date(Date.now() + response.data.expires_in * 1000);
      await wearable.save();

      return wearable;
    } catch (error) {
      console.error('Error refreshing Fitbit token:', error);
      throw new Error('Failed to refresh Fitbit token');
    }
  }

  async syncFitbitData(userId) {
    try {
      const wearable = await Wearable.findOne({ user_id: userId, device_type: 'fitbit', is_active: true });
      if (!wearable) {
        throw new Error('No active Fitbit connection found');
      }

      // Check if token needs refresh
      if (new Date() >= wearable.token_expires_at) {
        await this.refreshFitbitToken(wearable);
      }

      // Sync different data types
      const syncPromises = [
        this.syncFitbitHeartRate(wearable),
        this.syncFitbitSteps(wearable),
        this.syncFitbitSleep(wearable),
        this.syncFitbitWeight(wearable),
      ];

      await Promise.all(syncPromises);

      wearable.last_sync = new Date();
      await wearable.save();

      return { success: true, message: 'Fitbit data synced successfully' };
    } catch (error) {
      console.error('Error syncing Fitbit data:', error);
      throw error;
    }
  }

  async syncFitbitHeartRate(wearable) {
    try {
      const response = await axios.get('https://api.fitbit.com/1/user/-/activities/heart/date/today/1d.json', {
        headers: {
          'Authorization': `Bearer ${wearable.access_token}`,
        },
      });

      const heartRateData = response.data['activities-heart'];
      if (heartRateData && heartRateData.length > 0) {
        const latestHR = heartRateData[0];
        // Store heart rate data in vitals collection
        await Vital.findOneAndUpdate(
          { user_id: wearable.user_id, timestamp: { $gte: new Date(latestHR.dateTime) } },
          { heart_rate: latestHR.value.restingHeartRate },
          { upsert: true, new: true }
        );
      }
    } catch (error) {
      console.error('Error syncing heart rate:', error);
    }
  }

  async syncFitbitSteps(wearable) {
    try {
      const response = await axios.get('https://api.fitbit.com/1/user/-/activities/steps/date/today/1d.json', {
        headers: {
          'Authorization': `Bearer ${wearable.access_token}`,
        },
      });

      const stepsData = response.data['activities-steps'];
      if (stepsData && stepsData.length > 0) {
        // Store steps data (could create a separate collection for activity data)
        console.log('Steps synced:', stepsData[0].value);
      }
    } catch (error) {
      console.error('Error syncing steps:', error);
    }
  }

  async syncFitbitSleep(wearable) {
    try {
      const response = await axios.get('https://api.fitbit.com/1.2/user/-/sleep/date/today.json', {
        headers: {
          'Authorization': `Bearer ${wearable.access_token}`,
        },
      });

      const sleepData = response.data.sleep;
      if (sleepData && sleepData.length > 0) {
        // Store sleep data
        console.log('Sleep synced:', sleepData[0].duration);
      }
    } catch (error) {
      console.error('Error syncing sleep:', error);
    }
  }

  async syncFitbitWeight(wearable) {
    try {
      const response = await axios.get('https://api.fitbit.com/1/user/-/body/log/weight/date/today/1d.json', {
        headers: {
          'Authorization': `Bearer ${wearable.access_token}`,
        },
      });

      const weightData = response.data.weight;
      if (weightData && weightData.length > 0) {
        const latestWeight = weightData[0];
        await Vital.findOneAndUpdate(
          { user_id: wearable.user_id, timestamp: { $gte: new Date(latestWeight.date) } },
          { weight: latestWeight.weight },
          { upsert: true, new: true }
        );
      }
    } catch (error) {
      console.error('Error syncing weight:', error);
    }
  }

  // Apple Health Integration (simplified - would need HealthKit integration)
  async connectAppleHealth(userId, healthData) {
    try {
      const wearable = new Wearable({
        user_id: userId,
        device_type: 'apple_health',
        device_name: 'Apple Health',
        access_token: crypto.randomBytes(32).toString('hex'), // Placeholder
        permissions: ['steps', 'heart_rate', 'sleep', 'calories', 'weight'],
      });

      await wearable.save();
      return wearable;
    } catch (error) {
      console.error('Error connecting Apple Health:', error);
      throw new Error('Failed to connect Apple Health');
    }
  }

  // Generic wearable data processing
  async processWearableData(userId, wearableData) {
    try {
      // Generate AI insights from wearable data
      const insights = await geminiService.generateWearableDataInsights(wearableData);
      
      // Store processed data
      // This could be stored in a separate collection for wearable insights
      
      return insights;
    } catch (error) {
      console.error('Error processing wearable data:', error);
      throw error;
    }
  }

  // Get user's connected wearables
  async getUserWearables(userId) {
    return await Wearable.find({ user_id: userId, is_active: true });
  }

  // Disconnect wearable
  async disconnectWearable(userId, wearableId) {
    const wearable = await Wearable.findOne({ _id: wearableId, user_id: userId });
    if (!wearable) {
      throw new Error('Wearable not found');
    }

    wearable.is_active = false;
    await wearable.save();
    return { success: true, message: 'Wearable disconnected successfully' };
  }

  // Get wearable sync status
  async getSyncStatus(userId) {
    const wearables = await this.getUserWearables(userId);
    return wearables.map(wearable => ({
      device_type: wearable.device_type,
      device_name: wearable.device_name,
      last_sync: wearable.last_sync,
      sync_frequency: wearable.sync_frequency,
      is_active: wearable.is_active,
    }));
  }
}

export default new WearableService(); 