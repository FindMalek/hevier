import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput } from 'react-native';

import { DialogButton } from './ConfirmDialog';
import { useKeyboardHeight } from '@/hooks/useKeyboardHeight';
import { COLORS, LINE_HEIGHTS, TYPE } from '@/constants/theme';
import { BORDER_WIDTHS, RADIUS, SPACE } from '@/constants/layout';
import { NAME_DIALOG_SIZES } from '@/constants/sizes';
import type { NameDialogProps } from './types';

// The "Create New Folder" / "Rename Folder" dialog: title, one text field,
// Save (grey until something is typed), Cancel. It sits centred in the space
// above the keyboard.
//
// The field starts empty; `placeholder` shows the current name when renaming.
export function NameDialog({
  visible,
  title,
  placeholder,
  onSave,
  onCancel,
}: NameDialogProps) {
  const [text, setText] = useState('');
  const keyboard = useKeyboardHeight();
  // Each opening starts with an empty field.
  const [wasVisible, setWasVisible] = useState(visible);
  if (visible !== wasVisible) {
    setWasVisible(visible);
    if (visible) setText('');
  }

  const name = text.trim();

  return (
    <Modal transparent visible={visible} animationType="fade" statusBarTranslucent navigationBarTranslucent onRequestClose={onCancel}>
      <Pressable style={[styles.overlay, { paddingBottom: keyboard }]} onPress={onCancel}>
        <Pressable style={styles.box}>
          <Text style={styles.title}>{title}</Text>
          <TextInput
            style={styles.input}
            value={text}
            onChangeText={setText}
            placeholder={placeholder}
            placeholderTextColor={COLORS.textSecondary}
            selectionColor={COLORS.primary}
            cursorColor={COLORS.primary}
            autoFocus
            autoCapitalize="sentences"
            returnKeyType="done"
            onSubmitEditing={() => name && onSave(name)}
          />
          <DialogButton label="Save" primary disabled={!name} onPress={() => onSave(name)} />
          <DialogButton label="Cancel" onPress={onCancel} />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACE.xxl,
    backgroundColor: COLORS.dialogOverlay,
  },
  box: {
    borderRadius: RADIUS.xl,
    padding: SPACE.lg,
    paddingTop: SPACE.xl,
    backgroundColor: COLORS.surface,
  },
  title: {
    textAlign: 'center',
    ...TYPE.titleSemibold,
    lineHeight: LINE_HEIGHTS.relaxed,
  },
  input: {
    height: NAME_DIALOG_SIZES.inputHeight,
    marginTop: SPACE.xl,
    paddingHorizontal: SPACE.lg,
    paddingVertical: 0,
    borderWidth: BORDER_WIDTHS.hairline,
    borderColor: COLORS.separator,
    borderRadius: RADIUS.md,
    ...TYPE.body,
  },
});
