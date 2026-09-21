// Responsabilidad: avatar circular de mascota con foto o iniciales (capa SHARED).

import {
  Image,
  StyleSheet,
  Text,
  View,
  type ImageStyle,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { colors } from '../../core/theme/colors';
import { fonts } from '../../core/theme/typography';

interface PetAvatarProps {
  name: string;
  photoUrl?: string | null;
  size?: number;
  selected?: boolean;
  style?: StyleProp<ViewStyle & ImageStyle>;
}

function initials(name: string) {
  return name.trim().slice(0, 2).toUpperCase();
}

export function PetAvatar({ name, photoUrl, size = 64, selected = false, style }: PetAvatarProps) {
  const circle = {
    width: size,
    height: size,
    borderRadius: size / 2,
  };

  if (photoUrl) {
    return (
      <Image
        source={{ uri: photoUrl }}
        style={[styles.avatar, circle, selected && styles.selected, style]}
        accessibilityLabel={`Foto de ${name}`}
      />
    );
  }

  return (
    <View style={[styles.avatar, circle, selected && styles.selected, style]}>
      <Text style={[styles.initials, { fontSize: size * 0.3 }]}>{initials(name)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  selected: {
    borderWidth: 2.5,
    borderColor: colors.appHeading,
  },

  initials: {
    fontFamily: fonts.extrabold,
    color: colors.appHeading,
  },
});
