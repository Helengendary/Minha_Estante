import React from 'react';

import {
  View,
  Text,
  Pressable,
  StyleSheet,
} from 'react-native';

export default function RatingStars({
  value = 0,
  onChange,
  disabled = false,
}) {
  return (
    <View style={styles.container}>
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= value;
        const selected = star === value;

        return (
          <Pressable
            key={star}
            style={({ pressed }) => [
              styles.starButton,
              pressed && !disabled && styles.pressed,
            ]}
            onPress={() => {
              if (!disabled && onChange) {
                onChange(star);
              }
            }}
            disabled={disabled}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={
              `Avaliar com ${star} ` +
              (star === 1 ? 'estrela' : 'estrelas')
            }
            accessibilityHint="Altera a avaliação pessoal do livro"
            accessibilityState={{
              selected,
              disabled,
            }}
          >
            <Text
              allowFontScaling={true}
              style={[
                styles.star,
                filled && styles.filledStar,
                disabled && styles.disabledStar,
              ]}
            >
              {filled ? '★' : '☆'}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  starButton: {
    minWidth: 44,
    minHeight: 48,
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.65,
  },
  star: {
    fontSize: 32,
    color: '#665748',
    textAlign: 'center',
  },
  filledStar: {
    color: '#A87610',
  },
  disabledStar: {
    opacity: 0.55,
  },
});