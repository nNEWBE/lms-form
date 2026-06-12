// Template for local environment configuration.
// Copy this file to 'env.js' and fill in your actual credentials.
window.ENV = {
  CLOUDINARY_CLOUD_NAME: 'your_cloud_name_here',
  CLOUDINARY_UPLOAD_PRESET: 'your_unsigned_preset_here', // If using unsigned uploads (recommended for public GitHub Pages)
  CLOUDINARY_API_KEY: 'your_api_key_here', // Only needed if NOT using an upload preset
  CLOUDINARY_API_SECRET: 'your_api_secret_here', // Only needed if NOT using an upload preset
  // Optional Cloud Database: If set, cards will sync automatically to Firebase!
  FIREBASE_URL: 'https://your-firebase-db-id.firebaseio.com'
};
