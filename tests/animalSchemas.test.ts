import { createAnimalSchema } from '@/features/animals/schemas/animalSchemas';

describe('createAnimalSchema', () => {
  it('accepts a valid listing payload', () => {
    const parsed = createAnimalSchema.parse({
      name: 'Mila',
      species: 'dog',
      description: 'Found near the park',
      conditionNotes: '',
      city: {
        label: 'Kyiv',
        latitude: 50.45,
        longitude: 30.52,
      },
      district: {
        label: 'Pechersk',
        latitude: 50.42,
        longitude: 30.54,
      },
      address: null,
      urgency: 'high',
      helpTypes: ['transport', 'vet'],
    });
    expect(parsed.city?.label).toBe('Kyiv');
    expect(parsed.helpTypes).toEqual(['transport', 'vet']);
  });

  it('requires description, city, and at least one help type', () => {
    expect(() =>
      createAnimalSchema.parse({
        name: '',
        species: 'cat',
        description: '',
        conditionNotes: '',
        city: null,
        district: null,
        address: null,
        urgency: 'medium',
        helpTypes: [],
      }),
    ).toThrow();
  });
});
