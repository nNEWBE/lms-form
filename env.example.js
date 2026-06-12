// Template for local environment configuration.
// Copy this file to 'env.js' and fill in your actual credentials.
window.ENV = {
  CLOUDINARY_CLOUD_NAME: 'your_cloud_name_here',
  CLOUDINARY_UPLOAD_PRESET: 'your_unsigned_preset_here', // If using unsigned uploads (recommended for public GitHub Pages)
  CLOUDINARY_API_KEY: 'your_api_key_here', // Only needed if NOT using an upload preset
  CLOUDINARY_API_SECRET: 'your_api_secret_here', // Only needed if NOT using an upload preset
  ADMIN_USERNAME: 'admin', // Username to access Admin Panel
  ADMIN_PASSWORD: 'your_admin_password_here', // Password to access Admin Panel
  // Optional Cloud Database:
  // Option A: Realtime Database REST API URL
  FIREBASE_URL: 'https://your-firebase-db-id.firebaseio.com',
  // Option B: Cloud Firestore Configuration
  FIREBASE_CONFIG: {
    apiKey: "your_api_key_here",
    authDomain: "your_project_id.firebaseapp.com",
    projectId: "your_project_id",
    storageBucket: "your_project_id.appspot.com",
    messagingSenderId: "your_sender_id",
    appId: "your_app_id"
  }
};
