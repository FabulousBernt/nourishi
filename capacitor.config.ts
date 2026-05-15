import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.theplateful',
  appName: 'The Plateful',
  webDir: 'out',
  server: {
    androidScheme: 'https',
  },
  plugins: {
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#1B3D2F',
    },
  },
};

export default config;
