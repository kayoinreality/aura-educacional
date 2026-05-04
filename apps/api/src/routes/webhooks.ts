import { Hono } from 'hono';
import Stripe from 'stripe';
import { eq } from 'drizzle-orm';
import { db, webhookEvents, lessons } from '@aura/db';

export const webhookRoutes = new Hono();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', { apiVersion: '2024-11-20.acacia' });
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET ?? '';
const MUX_WEBHOOK_SECRET = process.env.MUX_WEBHOOK_SECRET ?? '';

/**
 * POST /webhooks/stripe — recebe eventos Stripe.
 * Strategy: valida HMAC, registra em webhook_events (idempotência via UNIQUE),
 * enfileira processamento real em Cloud Tasks (não bloqueia o webhook).
 */
webhookRoutes.post('/stripe', async (c) => {
  const sig = c.req.header('stripe-signature');
  if (!sig) return c.text('missing signature', 400);
  const raw = await c.req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return c.text('invalid signature', 400);
  }

  // Idempotência: ON CONFLICT DO NOTHING evita reprocessar.
  const inserted = await db
    .insert(webhookEvents)
    .values({
      source: 'stripe',
      eventId: event.id,
      eventType: event.type,
      payload: event as unknown as Record<string, unknown>,
    })
    .onConflictDoNothing()
    .returning();

  if (inserted.length === 0) {
    // já processado anteriormente
    return c.json({ received: true, duplicate: true });
  }

  // TODO: enfileirar em Cloud Tasks → /internal/process-webhook
  // No MVP, processa síncrono aqui (eventos rápidos):
  //   - checkout.session.completed → criar order/access
  //   - customer.subscription.* → atualizar subscription
  //   - invoice.payment_failed → notificar usuário
  // Implementação real: src/handlers/stripe.ts (próxima iteração)

  return c.json({ received: true });
});

/**
 * POST /webhooks/mux — recebe eventos Mux (asset.ready, asset.errored, etc.)
 */
webhookRoutes.post('/mux', async (c) => {
  // Mux assina via header `mux-signature`. Validação real fica no próximo PR.
  const body = await c.req.json<{ type: string; data: { id: string; status?: string; playback_ids?: Array<{ id: string }> } }>();

  await db
    .insert(webhookEvents)
    .values({
      source: 'mux',
      eventId: `mux_${body.data.id}_${body.type}_${Date.now()}`,
      eventType: body.type,
      payload: body as unknown as Record<string, unknown>,
    })
    .onConflictDoNothing();

  if (body.type === 'video.asset.ready' && body.data.id) {
    const playbackId = body.data.playback_ids?.[0]?.id;
    await db
      .update(lessons)
      .set({ muxStatus: 'ready', muxPlaybackId: playbackId ?? null })
      .where(eq(lessons.muxAssetId, body.data.id));
  }

  return c.json({ received: true });
});
