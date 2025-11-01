// Settings Screen - App settings and preferences
// Based on Expo SDK 54 (2025) best practices

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/theme';
import { Card } from '@/components/ui/Card';
import { getSetting, setSetting } from '@/services/StorageService';

export default function SettingsScreen() {
  const router = useRouter();
  const { colors, theme, themeMode, setThemeMode } = useTheme();
  const [autoScan, setAutoScan] = React.useState(true);

  React.useEffect(() => {
    const loadSettings = async () => {
      const autoScanValue = await getSetting('autoScan');
      setAutoScan(autoScanValue !== 'false');
    };
    loadSettings();
  }, []);

  const handleAutoScanToggle = async (value: boolean) => {
    setAutoScan(value);
    await setSetting('autoScan', value.toString());
  };

  const handleThemeChange = async (mode: 'light' | 'dark' | 'auto') => {
    await setThemeMode(mode);
  };

  const SettingItem = ({
    icon,
    title,
    subtitle,
    onPress,
    rightElement,
  }: {
    icon: string;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    rightElement?: React.ReactNode;
  }) => (
    <TouchableOpacity onPress={onPress} disabled={!onPress}>
      <Card style={styles.settingItem}>
        <View style={styles.settingContent}>
          <View style={[styles.iconContainer, { backgroundColor: Colors.primary + '20' }]}>
            <Ionicons name={icon as any} size={24} color={Colors.primary} />
          </View>
          <View style={styles.settingInfo}>
            <Text style={[styles.settingTitle, { color: colors.text }]}>{title}</Text>
            {subtitle && (
              <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
                {subtitle}
              </Text>
            )}
          </View>
          {rightElement || (
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          )}
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Theme Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Appearance</Text>
        <SettingItem
          icon="color-palette"
          title="Theme"
          subtitle={
            themeMode === 'auto'
              ? 'System'
              : themeMode === 'dark'
              ? 'Dark'
              : 'Light'
          }
          rightElement={
            <View style={styles.themeButtons}>
              {(['light', 'dark', 'auto'] as const).map((mode) => (
                <TouchableOpacity
                  key={mode}
                  onPress={() => handleThemeChange(mode)}
                  style={[
                    styles.themeButton,
                    {
                      backgroundColor:
                        themeMode === mode ? Colors.primary : colors.surface,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.themeButtonText,
                      {
                        color: themeMode === mode ? '#FFFFFF' : colors.text,
                      },
                    ]}
                  >
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          }
        />
      </View>

      {/* Media Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Media</Text>
        <SettingItem
          icon="refresh"
          title="Auto-scan on launch"
          subtitle="Automatically scan for new media when app opens"
          rightElement={
            <Switch
              value={autoScan}
              onValueChange={handleAutoScanToggle}
              trackColor={{ false: colors.border, true: Colors.primary }}
              thumbColor="#FFFFFF"
            />
          }
        />
        <SettingItem
          icon="folder-open"
          title="Refresh library"
          subtitle="Rescan device for media files"
          onPress={async () => {
            // Trigger refresh
            router.push('/');
          }}
        />
      </View>

      {/* About Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>About</Text>
        <SettingItem
          icon="information-circle"
          title="App Version"
          subtitle="1.0.0"
        />
        <SettingItem
          icon="document-text"
          title="Privacy Policy"
          subtitle="How we handle your data"
          onPress={() => {
            // Open privacy policy
          }}
        />
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: colors.textSecondary }]}>
          Beats - Your media, always ready
        </Text>
        <Text style={[styles.footerText, { color: colors.textSecondary }]}>
          Offline-first media player
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    ...Typography.h3,
    marginBottom: Spacing.md,
    marginTop: Spacing.sm,
  },
  settingItem: {
    marginBottom: Spacing.sm,
    padding: Spacing.md,
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    ...Typography.body,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  settingSubtitle: {
    ...Typography.bodySmall,
  },
  themeButtons: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  themeButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
  },
  themeButtonText: {
    ...Typography.bodySmall,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    marginTop: Spacing.xl,
    paddingTop: Spacing.xl,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  footerText: {
    ...Typography.bodySmall,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
});

