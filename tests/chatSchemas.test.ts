import { sendChatMessageSchema } from '@/features/chat/schemas/chatSchemas';

describe('sendChatMessageSchema', () => {
  it('accepts a trimmed message', () => {
    expect(sendChatMessageSchema.parse({ body: '  Hello  ' })).toEqual({ body: 'Hello' });
  });

  it('rejects empty and oversized bodies', () => {
    expect(() => sendChatMessageSchema.parse({ body: '   ' })).toThrow();
    expect(() => sendChatMessageSchema.parse({ body: 'a'.repeat(2001) })).toThrow();
  });
});
