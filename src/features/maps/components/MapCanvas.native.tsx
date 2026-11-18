import { Camera, Map, Marker, type CameraRef } from '@maplibre/maplibre-react-native';
import { useEffect, useMemo, useRef } from 'react';
import { View } from 'react-native';

import type { AnimalListItem } from '@/features/animals/api/animalsApi';
import { lazyStyles } from '@/theme';

import { MAP_STYLE_URL } from '../constants';
import { styles } from './AnimalMap.styles';

type MapCanvasProps = {
  animals: AnimalListItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
};

export function MapCanvas({ animals, selectedId, onSelect }: MapCanvasProps) {
  const cameraRef = useRef<CameraRef>(null);
  const focus = animals.find((animal) => animal.id === selectedId) ?? animals[0];

  const center = useMemo(() => {
    if (focus?.latitude != null && focus.longitude != null) {
      return [focus.longitude, focus.latitude] as [number, number];
    }
    return undefined;
  }, [focus]);

  useEffect(() => {
    if (!center) return;
    cameraRef.current?.easeTo({ center, zoom: 12, duration: 300 });
  }, [center, selectedId]);

  return (
    <Map style={styles.map} mapStyle={MAP_STYLE_URL}>
      <Camera
        ref={cameraRef}
        initialViewState={
          center
            ? { center, zoom: 11 }
            : {
                center: [0, 20],
                zoom: 2,
              }
        }
      />
      {animals.map((animal) =>
        animal.latitude != null && animal.longitude != null ? (
          <Marker
            key={animal.id}
            id={animal.id}
            lngLat={[animal.longitude, animal.latitude]}
            anchor="center"
            onPress={() => onSelect(animal.id)}
          >
            <View
              style={[
                pinStyles.dot,
                animal.id === selectedId ? pinStyles.dotSelected : null,
              ]}
            />
          </Marker>
        ) : null,
      )}
    </Map>
  );
}

const pinStyles = lazyStyles((colors) => ({
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.accent,
    borderWidth: 2,
    borderColor: colors.surface,
  },
  dotSelected: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.accentPressed,
  },
}));
