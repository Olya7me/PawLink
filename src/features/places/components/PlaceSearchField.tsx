import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { TextField } from '@/shared/components/TextField';

import { searchPlaces } from '../api/searchPlaces';
import type { PlaceSelection, PlaceSuggestion } from '../types';
import { styles } from './PlaceSearchField.styles';

type PlaceSearchFieldProps = {
  kind: 'city' | 'district' | 'address';
  label: string;
  placeholder: string;
  hint?: string;
  error?: string;
  searchErrorLabel?: string;
  near?: string;
  disabled?: boolean;
  value: PlaceSelection | null;
  onChange: (next: PlaceSelection | null) => void;
};

export function PlaceSearchField({
  kind,
  label,
  placeholder,
  hint,
  error,
  searchErrorLabel,
  near,
  disabled,
  value,
  onChange,
}: PlaceSearchFieldProps) {
  const [draft, setDraft] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [searchFailed, setSearchFailed] = useState(false);
  const query = draft ?? value?.label ?? '';

  useEffect(() => {
    if (disabled || query.trim().length < 2 || query.trim() === value?.label) {
      return;
    }

    let cancelled = false;
    const timer = setTimeout(() => {
      void searchPlaces(query, kind, near)
        .then((rows) => {
          if (cancelled) return;
          setSearchFailed(false);
          setSuggestions(rows);
        })
        .catch(() => {
          if (cancelled) return;
          setSuggestions([]);
          setSearchFailed(true);
        });
    }, 350);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [disabled, kind, near, query, value?.label]);

  return (
    <View style={styles.wrap}>
      <TextField
        label={label}
        placeholder={placeholder}
        value={query}
        editable={!disabled}
        onChangeText={(text) => {
          setDraft(text);
          setSuggestions([]);
          setSearchFailed(false);
          if (value && text.trim() !== value.label) {
            onChange(null);
          }
        }}
        error={error}
      />
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      {suggestions.length > 0 ? (
        <View style={styles.list}>
          {suggestions.map((item) => (
            <Pressable
              key={item.id}
              style={styles.row}
              onPress={() => {
                onChange(item);
                setDraft(null);
                setSuggestions([]);
              }}
            >
              <Text style={styles.rowText}>{item.label}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
      {searchFailed && searchErrorLabel ? <Text style={styles.hint}>{searchErrorLabel}</Text> : null}
    </View>
  );
}
