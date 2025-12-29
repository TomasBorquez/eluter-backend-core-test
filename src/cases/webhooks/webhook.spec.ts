/* eslint-disable @typescript-eslint/no-unused-vars */
import { noChecks, WebhookEvent, yourImplementation } from './implementations';
import { generatePayload } from './remote';

const implementations = [noChecks, yourImplementation];

describe.each(implementations)('Transaction', (implementation) => {
  describe(`Implementation: ${implementation.name}`, () => {
    describe('Basic spec', () => {
      it('Processes a single event', () => {
        const store = [] as WebhookEvent[];
        const secret = 'secret';
        implementation({
          eventStore: store,
          secret,
          ...generatePayload({
            secret: 'secret',
            data: { hello: 'world' },
          }),
        });
        expect(store.length).toBe(1);
      });

      it('Processes different events', () => {
        const store = [] as WebhookEvent[];
        const secret = 'secret';
        implementation({
          eventStore: store,
          secret,
          ...generatePayload({
            secret: 'secret',
            data: { hello: 'world' },
          }),
        });
        implementation({
          eventStore: store,
          secret,
          ...generatePayload({
            secret: 'secret',
            data: { hello: 'sekai' },
          }),
        });
        expect(store.length).toBe(2);
      });

      it('Processes similar event at different times', () => {
        const store = [] as WebhookEvent[];
        const secret = 'secret';
        implementation({
          eventStore: store,
          secret,
          ...generatePayload({
            secret: 'secret',
            data: { hello: 'world' },
          }),
        });
        implementation({
          eventStore: store,
          secret,
          ...generatePayload({
            secret: 'secret',
            data: { hello: 'world' },
          }),
        });
        expect(store.length).toBe(2);
      });
    });

    describe('Vulnerabilities', () => {
      it('Unauthorized posting', () => {
        const store = [] as WebhookEvent[];
        const secret = 'not_secret';
        implementation({
          eventStore: store,
          secret,
          ...generatePayload({
            secret: 'secret',
            data: { hello: 'world' },
          }),
        });
        expect(store.length).toBe(0);
      });

      it('Event Replay', () => {
        const store = [] as WebhookEvent[];
        const secret = 'secret';
        const payload = generatePayload({
          secret: 'secret',
          data: { hello: 'world' },
        });
        implementation({
          eventStore: store,
          secret,
          ...payload,
        });
        implementation({
          eventStore: store,
          secret,
          ...payload,
        });
        expect(store.length).toBe(1);
      });
    });
  });
});
