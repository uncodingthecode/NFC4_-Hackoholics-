import crypto from 'crypto';
import axios from 'axios';
import CloudSync from '../models/cloudSync.model.js';
import User from '../models/user.model.js';
import Vital from '../models/vital.model.js';
import Medication from '../models/medication.model.js';
import Prescription from '../models/prescription.model.js';
import Report from '../models/report.model.js';
import Profile from '../models/profile.model.js';

class CloudSyncService {
  constructor() {
    this.googleDriveConfig = {
      clientId: process.env.GOOGLE_DRIVE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_DRIVE_CLIENT_SECRET,
      redirectUri: process.env.GOOGLE_DRIVE_REDIRECT_URI,
    };
  }

  // Initialize cloud sync for a user
  async initializeCloudSync(userId, cloudProvider = 'google_drive') {
    try {
      // Generate encryption key for user data
      const encryptionKey = crypto.randomBytes(32).toString('hex');
      
      const cloudSync = new CloudSync({
        user_id: userId,
        cloud_provider: cloudProvider,
        encryption_key: encryptionKey,
        data_types: ['vitals', 'medications', 'prescriptions', 'reports', 'profile'],
        sync_frequency: 'daily',
        next_sync: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      });

      await cloudSync.save();
      return cloudSync;
    } catch (error) {
      console.error('Error initializing cloud sync:', error);
      throw new Error('Failed to initialize cloud sync');
    }
  }

  // Google Drive Integration
  async connectGoogleDrive(userId, authCode) {
    try {
      const tokenResponse = await this.getGoogleDriveTokens(authCode);
      
      const cloudSync = await CloudSync.findOne({ user_id: userId });
      if (!cloudSync) {
        await this.initializeCloudSync(userId, 'google_drive');
      }

      // Store tokens securely (in production, encrypt these)
      cloudSync.google_drive_tokens = {
        access_token: tokenResponse.access_token,
        refresh_token: tokenResponse.refresh_token,
        expires_at: new Date(Date.now() + tokenResponse.expires_in * 1000),
      };

      await cloudSync.save();
      return cloudSync;
    } catch (error) {
      console.error('Error connecting Google Drive:', error);
      throw new Error('Failed to connect Google Drive');
    }
  }

  async getGoogleDriveTokens(authCode) {
    const response = await axios.post('https://oauth2.googleapis.com/token', {
      client_id: this.googleDriveConfig.clientId,
      client_secret: this.googleDriveConfig.clientSecret,
      code: authCode,
      grant_type: 'authorization_code',
      redirect_uri: this.googleDriveConfig.redirectUri,
    });

    return response.data;
  }

  // Encrypt data before cloud storage
  encryptData(data, encryptionKey) {
    const algorithm = 'aes-256-cbc';
    const key = crypto.scryptSync(encryptionKey, 'salt', 32);
    const iv = crypto.randomBytes(16);
    
    const cipher = crypto.createCipher(algorithm, key);
    let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return {
      encrypted: encrypted,
      iv: iv.toString('hex'),
    };
  }

  // Decrypt data from cloud storage
  decryptData(encryptedData, iv, encryptionKey) {
    const algorithm = 'aes-256-cbc';
    const key = crypto.scryptSync(encryptionKey, 'salt', 32);
    
    const decipher = crypto.createDecipher(algorithm, key);
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return JSON.parse(decrypted);
  }

  // Sync data to cloud
  async syncToCloud(userId, dataTypes = null) {
    try {
      const cloudSync = await CloudSync.findOne({ user_id: userId });
      if (!cloudSync) {
        throw new Error('Cloud sync not initialized');
      }

      cloudSync.sync_status = 'in_progress';
      await cloudSync.save();

      const dataToSync = {};
      const typesToSync = dataTypes || cloudSync.data_types;

      // Collect data based on types
      if (typesToSync.includes('vitals')) {
        dataToSync.vitals = await Vital.find({ user_id: userId }).sort({ timestamp: -1 }).limit(100);
      }

      if (typesToSync.includes('medications')) {
        dataToSync.medications = await Medication.find({ user_id: userId });
      }

      if (typesToSync.includes('prescriptions')) {
        dataToSync.prescriptions = await Prescription.find({ user_id: userId });
      }

      if (typesToSync.includes('reports')) {
        dataToSync.reports = await Report.find({ user_id: userId });
      }

      if (typesToSync.includes('profile')) {
        dataToSync.profile = await Profile.findOne({ user_id: userId });
      }

      // Encrypt data
      const encryptedData = this.encryptData(dataToSync, cloudSync.encryption_key);

      // Upload to cloud based on provider
      let uploadResult;
      switch (cloudSync.cloud_provider) {
        case 'google_drive':
          uploadResult = await this.uploadToGoogleDrive(cloudSync, encryptedData);
          break;
        case 'dropbox':
          uploadResult = await this.uploadToDropbox(cloudSync, encryptedData);
          break;
        default:
          throw new Error('Unsupported cloud provider');
      }

      // Update sync status
      cloudSync.last_sync = new Date();
      cloudSync.sync_status = 'completed';
      cloudSync.storage_used = uploadResult.size || 0;
      cloudSync.next_sync = this.calculateNextSync(cloudSync.sync_frequency);
      await cloudSync.save();

      return { success: true, message: 'Data synced successfully' };
    } catch (error) {
      console.error('Error syncing to cloud:', error);
      
      // Update error status
      const cloudSync = await CloudSync.findOne({ user_id: userId });
      if (cloudSync) {
        cloudSync.sync_status = 'failed';
        cloudSync.error_log.push({
          error: error.message,
          timestamp: new Date(),
        });
        await cloudSync.save();
      }

      throw error;
    }
  }

  // Sync data from cloud
  async syncFromCloud(userId) {
    try {
      const cloudSync = await CloudSync.findOne({ user_id: userId });
      if (!cloudSync) {
        throw new Error('Cloud sync not initialized');
      }

      // Download encrypted data from cloud
      let encryptedData;
      switch (cloudSync.cloud_provider) {
        case 'google_drive':
          encryptedData = await this.downloadFromGoogleDrive(cloudSync);
          break;
        case 'dropbox':
          encryptedData = await this.downloadFromDropbox(cloudSync);
          break;
        default:
          throw new Error('Unsupported cloud provider');
      }

      // Decrypt data
      const decryptedData = this.decryptData(
        encryptedData.encrypted,
        encryptedData.iv,
        cloudSync.encryption_key
      );

      // Restore data to local database (with conflict resolution)
      await this.restoreDataFromCloud(userId, decryptedData);

      return { success: true, message: 'Data restored from cloud successfully' };
    } catch (error) {
      console.error('Error syncing from cloud:', error);
      throw error;
    }
  }

  // Upload to Google Drive
  async uploadToGoogleDrive(cloudSync, encryptedData) {
    try {
      const response = await axios.post(
        'https://www.googleapis.com/upload/drive/v3/files',
        {
          name: `health_data_${Date.now()}.json`,
          parents: ['root'],
        },
        {
          headers: {
            'Authorization': `Bearer ${cloudSync.google_drive_tokens.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      // Upload the actual encrypted data
      const fileId = response.data.id;
      await axios.patch(
        `https://www.googleapis.com/upload/drive/v3/files/${fileId}`,
        JSON.stringify(encryptedData),
        {
          headers: {
            'Authorization': `Bearer ${cloudSync.google_drive_tokens.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return { size: JSON.stringify(encryptedData).length };
    } catch (error) {
      console.error('Error uploading to Google Drive:', error);
      throw new Error('Failed to upload to Google Drive');
    }
  }

  // Download from Google Drive
  async downloadFromGoogleDrive(cloudSync) {
    try {
      // List files and find the latest health data file
      const response = await axios.get(
        'https://www.googleapis.com/drive/v3/files',
        {
          headers: {
            'Authorization': `Bearer ${cloudSync.google_drive_tokens.access_token}`,
          },
          params: {
            q: "name contains 'health_data'",
            orderBy: 'createdTime desc',
            pageSize: 1,
          },
        }
      );

      if (!response.data.files || response.data.files.length === 0) {
        throw new Error('No health data files found');
      }

      const fileId = response.data.files[0].id;
      const downloadResponse = await axios.get(
        `https://www.googleapis.com/drive/v3/files/${fileId}`,
        {
          headers: {
            'Authorization': `Bearer ${cloudSync.google_drive_tokens.access_token}`,
          },
          responseType: 'arraybuffer',
        }
      );

      return JSON.parse(downloadResponse.data.toString());
    } catch (error) {
      console.error('Error downloading from Google Drive:', error);
      throw new Error('Failed to download from Google Drive');
    }
  }

  // Placeholder for Dropbox integration
  async uploadToDropbox(cloudSync, encryptedData) {
    // Implement Dropbox upload logic
    console.log('Dropbox upload not implemented yet');
    return { size: 0 };
  }

  async downloadFromDropbox(cloudSync) {
    // Implement Dropbox download logic
    console.log('Dropbox download not implemented yet');
    return {};
  }

  // Restore data from cloud to local database
  async restoreDataFromCloud(userId, data) {
    try {
      // Restore vitals (with conflict resolution)
      if (data.vitals) {
        for (const vital of data.vitals) {
          await Vital.findOneAndUpdate(
            { user_id: userId, timestamp: vital.timestamp },
            vital,
            { upsert: true, new: true }
          );
        }
      }

      // Restore medications
      if (data.medications) {
        for (const medication of data.medications) {
          await Medication.findOneAndUpdate(
            { user_id: userId, _id: medication._id },
            medication,
            { upsert: true, new: true }
          );
        }
      }

      // Restore prescriptions
      if (data.prescriptions) {
        for (const prescription of data.prescriptions) {
          await Prescription.findOneAndUpdate(
            { user_id: userId, _id: prescription._id },
            prescription,
            { upsert: true, new: true }
          );
        }
      }

      // Restore profile
      if (data.profile) {
        await Profile.findOneAndUpdate(
          { user_id: userId },
          data.profile,
          { upsert: true, new: true }
        );
      }

      return { success: true };
    } catch (error) {
      console.error('Error restoring data from cloud:', error);
      throw error;
    }
  }

  // Calculate next sync time
  calculateNextSync(frequency) {
    const now = new Date();
    switch (frequency) {
      case 'hourly':
        return new Date(now.getTime() + 60 * 60 * 1000);
      case 'daily':
        return new Date(now.getTime() + 24 * 60 * 60 * 1000);
      case 'weekly':
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      case 'monthly':
        return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      default:
        return new Date(now.getTime() + 24 * 60 * 60 * 1000);
    }
  }

  // Get sync status
  async getSyncStatus(userId) {
    const cloudSync = await CloudSync.findOne({ user_id: userId });
    if (!cloudSync) {
      return null;
    }

    return {
      cloud_provider: cloudSync.cloud_provider,
      sync_status: cloudSync.sync_status,
      last_sync: cloudSync.last_sync,
      next_sync: cloudSync.next_sync,
      sync_frequency: cloudSync.sync_frequency,
      storage_used: cloudSync.storage_used,
      storage_limit: cloudSync.storage_limit,
      data_types: cloudSync.data_types,
    };
  }

  // Update sync settings
  async updateSyncSettings(userId, settings) {
    const cloudSync = await CloudSync.findOne({ user_id: userId });
    if (!cloudSync) {
      throw new Error('Cloud sync not initialized');
    }

    if (settings.sync_frequency) {
      cloudSync.sync_frequency = settings.sync_frequency;
      cloudSync.next_sync = this.calculateNextSync(settings.sync_frequency);
    }

    if (settings.data_types) {
      cloudSync.data_types = settings.data_types;
    }

    await cloudSync.save();
    return cloudSync;
  }
}

export default new CloudSyncService(); 