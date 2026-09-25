import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ecoclasifica.app',
  appName: 'EcoClasifica',
  webDir: 'dist',
  server: {
    // Permite llamar a la API por HTTP (red local) desde Android.
    androidScheme: 'https',
    cleartext: true,
  },
  ios: {
    contentInset: 'automatic',
  },
};

export default config;
