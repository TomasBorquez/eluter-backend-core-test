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

export function noChecks(args: WebhookInterface) {
  args.eventStore.push(args.payload);
}

export function yourImplementation(args: WebhookInterface) {}
