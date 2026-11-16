import { feedbackFormSchema, reportFormSchema } from '@/features/reports/schemas/reportSchemas';

describe('reportFormSchema', () => {
  it('accepts a reason with optional comment', () => {
    const parsed = reportFormSchema.parse({
      reason: 'spam',
      body: 'Looks like an ad',
    });
    expect(parsed.reason).toBe('spam');
    expect(parsed.body).toBe('Looks like an ad');
  });

  it('allows an empty comment', () => {
    const parsed = reportFormSchema.parse({
      reason: 'other',
      body: '',
    });
    expect(parsed.reason).toBe('other');
    expect(parsed.body).toBe('');
  });

  it('rejects a missing reason', () => {
    expect(() => reportFormSchema.parse({ reason: '  ', body: '' })).toThrow();
  });
});

describe('feedbackFormSchema', () => {
  it('requires a message body', () => {
    expect(() =>
      feedbackFormSchema.parse({
        reason: 'other',
        body: '   ',
      }),
    ).toThrow();

    const parsed = feedbackFormSchema.parse({
      reason: 'misleading',
      body: 'The filters feel confusing',
    });
    expect(parsed.body).toBe('The filters feel confusing');
  });
});
