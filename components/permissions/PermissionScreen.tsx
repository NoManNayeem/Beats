// Permission Screen - Request all necessary permissions at app startup

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/theme';
import { requestMediaPermissions, checkMediaPermissions } from '@/services/MediaScanner';

interface PermissionScreenProps {
  onPermissionsGranted: () => void;
}

export const PermissionScreen: React.FC<PermissionScreenProps> = ({
  onPermissionsGranted,
}) => {
  const { colors } = useTheme();
  const [isRequesting, setIsRequesting] = useState(false);
  const [hasPermissions, setHasPermissions] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check permissions on mount
  useEffect(() => {
    checkInitialPermissions();
  }, []);

  const checkInitialPermissions = async () => {
    try {
      const granted = await checkMediaPermissions();
      if (granted) {
        setHasPermissions(true);
        setTimeout(() => onPermissionsGranted(), 500);
      }
    } catch (error) {
      console.error('Error checking permissions:', error);
    }
  };

  const handleRequestPermissions = async () => {
    setIsRequesting(true);
    setError(null);

    try {
      const granted = await requestMediaPermissions();
      if (granted) {
        setHasPermissions(true);
        setTimeout(() => onPermissionsGranted(), 500);
      } else {
        setError(
          'Permissions are required to scan and play your media files. Please grant access in your device settings.'
        );
      }
    } catch (error: any) {
      console.error('Error requesting permissions:', error);
      const errorMsg = error?.message || 'Failed to request permissions.';
      if (errorMsg.includes('AndroidManifest') || errorMsg.includes('development build')) {
        setError(
          'This app requires a development build to access media files.\n\n' +
          'Please rebuild the app:\n' +
          '1. Run: npx expo prebuild\n' +
          '2. Run: npx expo run:android\n\n' +
          'Or use EAS Build to create a development build.'
        );
      } else {
        setError(errorMsg);
      }
    } finally {
      setIsRequesting(false);
    }
  };

  if (hasPermissions) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={[styles.message, { color: colors.text }]}>
          Loading your media library...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: Colors.primary + '20' }]}>
          <Ionicons name="musical-notes" size={64} color={Colors.primary} />
        </View>

        <Text style={[styles.title, { color: colors.text }]}>
          Welcome to Beats
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Your media, always ready
        </Text>

        <View style={styles.permissionsList}>
          <View style={styles.permissionItem}>
            <Ionicons
              name="checkmark-circle"
              size={24}
              color={Colors.primary}
            />
            <Text style={[styles.permissionText, { color: colors.text }]}>
              Access your music library
            </Text>
          </View>
          <View style={styles.permissionItem}>
            <Ionicons
              name="checkmark-circle"
              size={24}
              color={Colors.primary}
            />
            <Text style={[styles.permissionText, { color: colors.text }]}>
              Play audio files offline
            </Text>
          </View>
          <View style={styles.permissionItem}>
            <Ionicons
              name="checkmark-circle"
              size={24}
              color={Colors.primary}
            />
            <Text style={[styles.permissionText, { color: colors.text }]}>
              Access video files
            </Text>
          </View>
        </View>

        {error && (
          <View style={[styles.errorContainer, { backgroundColor: Colors.accent + '20' }]}>
            <Ionicons name="alert-circle" size={20} color={Colors.accent} />
            <Text style={[styles.errorText, { color: Colors.accent }]}>
              {error}
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.button,
            { backgroundColor: Colors.primary },
            isRequesting && styles.buttonDisabled,
          ]}
          onPress={handleRequestPermissions}
          disabled={isRequesting}
        >
          {isRequesting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="lock-open" size={20} color="#FFFFFF" />
              <Text style={styles.buttonText}>Grant Permissions</Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={[styles.footerText, { color: colors.textSecondary }]}>
          We only access your media files to organize and play them.
          {'\n'}No data is collected or sent anywhere.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: BorderRadius.round,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  title: {
    ...Typography.h1,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    ...Typography.body,
    marginBottom: Spacing.xl,
    textAlign: 'center',
  },
  permissionsList: {
    width: '100%',
    marginBottom: Spacing.xl,
    gap: Spacing.md,
  },
  permissionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  permissionText: {
    ...Typography.body,
    flex: 1,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
    width: '100%',
  },
  errorText: {
    ...Typography.bodySmall,
    flex: 1,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
    width: '100%',
    marginBottom: Spacing.md,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    ...Typography.body,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  message: {
    ...Typography.body,
    marginTop: Spacing.md,
    textAlign: 'center',
  },
  footerText: {
    ...Typography.bodySmall,
    textAlign: 'center',
    marginTop: Spacing.md,
  },
});

