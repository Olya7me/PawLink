import type { AnimalListItem } from '@/features/animals/api/animalsApi';

type MapCanvasProps = {
  animals: AnimalListItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
};

export function MapCanvas(_props: MapCanvasProps) {
  return null;
}
