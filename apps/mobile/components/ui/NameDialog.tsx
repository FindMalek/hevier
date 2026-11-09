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
// Also asks for the body weight on Save Workout (`message`, a number keyboard
// and `isValid`).
export function NameDialog({
  visible,
  title,
  placeholder,
  onSave,
  onCancel,
  message,
  keyboardType,
  isValid,
  cancelLabel = 'Cancel',
  onDismiss = onCancel,
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
  const valid = isValid ? isValid(name) : !!name;

  return (
    <Modal transparent visible={visible} animationType="fade" statusBarTranslucent navigationBarTranslucent onRequestClose={onDismiss}>
      <Pressable style={[styles.overlay, { paddingBottom: keyboard }]} onPress={onDismiss}>
        <Pressable style={styles.box}>
          <Text style={styles.title}>{title}</Text>
          {message && <Text style={styles.message}>{message}</Text>}
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
            keyboardType={keyboardType}
            returnKeyType="done"
            onSubmitEditing={() => valid && onSave(name)}
          />
          <DialogButton label="Save" primary disabled={!valid} onPress={() => onSave(name)} />
          <DialogButton label={cancelLabel} onPress={onCancel} />
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
  message: {
    marginTop: SPACE.sm,
    textAlign: 'center',
    ...TYPE.body,
    color: COLORS.textSecondary,
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
