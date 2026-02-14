import crypto from 'crypto';

export type WebhookPayload = {
  eventId: string;
  timestamp: number;
  data: {
    hello: string;
  };
};

export type WebhookEvent = WebhookPayload & {
  hash?: string;
};

export type WebhookInterface = {
  eventStore: WebhookEvent[];
  payload: WebhookPayload;
  rawPayload: string;
  signature: string;
  secret: string;
};

export function yourImplementation({ eventStore, payload, secret, rawPayload, signature }: WebhookInterface) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(rawPayload)
    .digest('hex');

  if (expectedSignature !== signature) {
    return;
  }

  if (eventStore.some(e => e.eventId === payload.eventId)) {
    return;
  }

  eventStore.push(payload);
}
