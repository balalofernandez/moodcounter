import { Stack } from 'expo-router';
import { SQLiteProvider } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';
import { DB_NAME, initDatabase } from '@/db/database';
import { colors } from '@/theme/colors';

export default function RootLayout() {
  return (
    <SQLiteProvider databaseName={DB_NAME} onInit={initDatabase}>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerShadowVisible: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="index" options={{ title: 'Moods' }} />
        <Stack.Screen name="profile/[id]" options={{ title: '' }} />
        <Stack.Screen
          name="log/[id]"
          options={{ presentation: 'modal', title: 'Log mood' }}
        />
      </Stack>
    </SQLiteProvider>
  );
}
