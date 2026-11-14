import { createAnimalSchema } from '@/features/animals/schemas/animalSchemas';

describe('createAnimalSchema', () => {
  it('accepts a valid listing payload', () => {
    const parsed = createAnimalSchema.parse({
      name: 'Mila',
      species: 'dog',
      description: 'Found near the park',
      conditionNotes: '',
      city: 'Kyiv',
      locationLabel: 'Pechersk',
      urgency: 'high',
      helpTypes: ['transport', 'vet'],
    });
    expect(parsed.city).toBe('Kyiv');
    expect(parsed.helpTypes).toEqual(['transport', 'vet']);
  });

  it('requires description, city, and at least one help type', () => {
    expect(() =>
      createAnimalSchema.parse({
        name: '',
        species: 'cat',
        description: '',
        conditionNotes: '',
        city: '',
        locationLabel: '',
        urgency: 'medium',
        helpTypes: [],
      }),
    ).toThrow();
  });
});
