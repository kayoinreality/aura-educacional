import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

async function main() {
  const url = process.env.DATABASE_URL_LOCAL ?? process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is required');

  const client = postgres(url, { max: 1 });
  const db = drizzle(client, { schema });

  console.info('🌱 Seeding database…');

  // Categorias
  const [cat1, cat2, cat3] = await db
    .insert(schema.categories)
    .values([
      { slug: 'gestao', name: 'Gestão e Liderança', orderIndex: 1, iconName: 'briefcase' },
      { slug: 'tecnologia', name: 'Tecnologia', orderIndex: 2, iconName: 'cpu' },
      { slug: 'educacao', name: 'Educação', orderIndex: 3, iconName: 'graduation-cap' },
    ])
    .returning();

  // Plano de assinatura
  await db.insert(schema.subscriptionPlans).values([
    {
      slug: 'pro',
      name: 'Pro',
      description: 'Acesso a todos os cursos e certificados ilimitados',
      stripeProductId: 'prod_PLACEHOLDER',
      monthlyPriceCents: 4990,
      yearlyPriceCents: 49900,
      trialDays: 7,
      isFeatured: true,
      features: [
        'Acesso a todo o catálogo',
        'Certificados ilimitados',
        'Novos cursos a cada mês',
        'Suporte prioritário',
      ],
    },
  ]);

  console.info('✅ Seed completo');
  console.info(`   Categorias: ${[cat1, cat2, cat3].filter(Boolean).length}`);

  await client.end();
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
