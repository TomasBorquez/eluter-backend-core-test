import crypto from 'crypto';
import { WebhookPayload } from './implementations';

export function generatePayload({
  secret,
  data,
  timestamp,
}: {
  secret: string;
  data: WebhookPayload['data'];
  timestamp?: number;
}) {
  timestamp = timestamp ?? Date.now();
  const eventId = crypto.randomUUID();
  const payload: WebhookPayload = {
    eventId,
    data,
    timestamp,
  };
  const rawPayload = JSON.stringify(payload);
  const signature = crypto
    .createHmac('sha256', secret)
    .update(rawPayload)
    .digest('hex');
  return {
    signature,
    payload,
    rawPayload,
  };
}
