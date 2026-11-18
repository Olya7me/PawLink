export type PlaceSelection = {
  label: string;
  latitude: number;
  longitude: number;
};

export type PlaceSuggestion = PlaceSelection & {
  id: string;
};
