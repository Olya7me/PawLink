import { acceptOfferSchema, submitOfferSchema } from '@/features/help/schemas/offerSchemas';

describe('submitOfferSchema', () => {
  it('accepts a message with optional meetup details', () => {
    const parsed = submitOfferSchema.parse({
      message: 'I can drive tonight',
      meetupDetails: 'Telegram @helper',
    });
    expect(parsed.message).toBe('I can drive tonight');
    expect(parsed.meetupDetails).toBe('Telegram @helper');
  });

  it('rejects an empty message', () => {
    expect(() =>
      submitOfferSchema.parse({
        message: '   ',
        meetupDetails: '',
      }),
    ).toThrow();
  });
});

describe('acceptOfferSchema', () => {
  it('allows empty meetup override', () => {
    const parsed = acceptOfferSchema.parse({ meetupDetails: '' });
    expect(parsed.meetupDetails).toBe('');
  });
});
