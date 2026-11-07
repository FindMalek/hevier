import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';

import { Avatar } from '@/components/ui/Avatar';
import { HeaderPillButton, HeaderTextLeft, InnerHeader } from '@/components/ui/InnerHeader';
import { COLORS, TYPE } from '@/constants/theme';
import { saveProfileNames } from '@/db/profile/names';
import { getProfile } from '@/db/profile/profile';
import { SPACE } from '@/constants/layout';
import { EDIT_PROFILE_SIZES, SIZES } from '@/constants/sizes';
import { Screen } from '@/components/ui/Screen';
import { Divider } from '@/components/ui/Divider';
import { SCREEN_STYLES } from '@/components/ui/screenStyles';
import type { ProfileFieldProps } from '@/types/profile';

// ✏️ on the Profile tab: the routine editor's
// Cancel / title / pill header, the avatar, then Name and Username rows.
// Nothing is saved until Done.
export default function EditProfile() {
  const router = useRouter();
  const [name, setName] = useState<string | null>(null);
  const [username, setUsername] = useState('');

  useEffect(() => {
    getProfile().then((p) => {
      setName(p.name);
      setUsername(p.username);
    });
  }, []);

  const valid = !!name?.trim() && !!username;

  async function done() {
    await saveProfileNames(name!.trim(), username);
    router.back();
  }

  return (
    <Screen>
      <Stack.Screen options={{ headerShown: false }} />
      <InnerHeader
        title="Edit Profile"
        left={<HeaderTextLeft label="Cancel" onPress={() => router.back()} />}
        right={<HeaderPillButton label="Done" disabled={!valid} onPress={done} />}
      />
      {name !== null && (
        <ScrollView contentContainerStyle={SCREEN_STYLES.content} keyboardShouldPersistTaps="handled">
          <View style={styles.avatar}>
            <Avatar name={name || '?'} size={SIZES.avatarLarge} />
          </View>
          <Field label="Name" value={name} onChange={setName} placeholder="Your name" />
          <Divider />
          {/* Usernames have no spaces. */}
          <Field
            label="Username"
            value={username}
            onChange={(v) => setUsername(v.replace(/\s/g, ''))}
            placeholder="username"
            autoCapitalize="none"
          />
          <Divider />
        </ScrollView>
      )}
    </Screen>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  autoCapitalize,
}: ProfileFieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={COLORS.textSecondary}
        selectionColor={COLORS.primary}
        cursorColor={COLORS.primary}
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    marginTop: SPACE.xl,
    marginBottom: SPACE.xl,
  },
  field: {
    height: SIZES.formRowHeight,
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    width: EDIT_PROFILE_SIZES.labelWidth,
    ...TYPE.body,
  },
  input: {
    flex: 1,
    ...TYPE.body,
    padding: 0,
  },
});
