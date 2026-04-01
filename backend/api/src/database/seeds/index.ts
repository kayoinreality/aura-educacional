import * as bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const PASSWORD = 'Aura@123'

const ids = {
  admin: 'seed-user-admin',
  instructorUser: 'seed-user-instructor',
  studentAna: 'seed-user-student-ana',
  studentBruno: 'seed-user-student-bruno',
  studentCarla: 'seed-user-student-carla',
  instructorProfile: 'seed-instructor-profile-main',
  categoryTech: 'seed-category-tech',
  categoryBusiness: 'seed-category-business',
  categoryDesign: 'seed-category-design',
  coursePrisma: 'seed-course-prisma',
  courseAnalytics: 'seed-course-analytics',
  courseDesign: 'seed-course-design',
  modulePrismaCore: 'seed-module-prisma-core',
  modulePrismaReports: 'seed-module-prisma-reports',
  moduleAnalyticsCore: 'seed-module-analytics-core',
  moduleDesignCore: 'seed-module-design-core',
  lessonPrismaModeling: 'seed-lesson-prisma-modeling',
  lessonPrismaQueries: 'seed-lesson-prisma-queries',
  lessonPrismaDashboard: 'seed-lesson-prisma-dashboard',
  lessonAnalyticsKpi: 'seed-lesson-analytics-kpi',
  lessonDesignFoundation: 'seed-lesson-design-foundation',
  paymentAna: 'seed-payment-ana',
  paymentBruno: 'seed-payment-bruno',
  paymentCarla: 'seed-payment-carla',
  enrollmentAnaPrisma: 'seed-enrollment-ana-prisma',
  enrollmentBrunoAnalytics: 'seed-enrollment-bruno-analytics',
  enrollmentCarlaDesign: 'seed-enrollment-carla-design',
  progressAnaPrisma: 'seed-progress-ana-prisma',
  progressBrunoAnalytics: 'seed-progress-bruno-analytics',
  lessonProgressAnaModeling: 'seed-lesson-progress-ana-modeling',
  lessonProgressAnaQueries: 'seed-lesson-progress-ana-queries',
  lessonProgressBrunoKpi: 'seed-lesson-progress-bruno-kpi',
  assessmentPrisma: 'seed-assessment-prisma',
  assessmentAnalytics: 'seed-assessment-analytics',
  assessmentDesign: 'seed-assessment-design',
  questionPrisma1: 'seed-question-prisma-1',
  questionPrisma2: 'seed-question-prisma-2',
  questionAnalytics1: 'seed-question-analytics-1',
  questionAnalytics2: 'seed-question-analytics-2',
  questionDesign1: 'seed-question-design-1',
  questionDesign2: 'seed-question-design-2',
  certificateAna: 'seed-certificate-ana',
  reviewAna: 'seed-review-ana',
  reviewBruno: 'seed-review-bruno',
  subscriptionBruno: 'seed-subscription-bruno',
  notificationAna: 'seed-notification-ana',
  couponLaunch: 'seed-coupon-launch',
  couponPro: 'seed-coupon-pro',
  requirementPrisma1: 'seed-requirement-prisma-1',
  requirementPrisma2: 'seed-requirement-prisma-2',
  requirementAnalytics1: 'seed-requirement-analytics-1',
  requirementDesign1: 'seed-requirement-design-1',
  outcomePrisma1: 'seed-outcome-prisma-1',
  outcomePrisma2: 'seed-outcome-prisma-2',
  outcomeAnalytics1: 'seed-outcome-analytics-1',
  outcomeDesign1: 'seed-outcome-design-1',
  loginAna: 'seed-login-ana',
  loginBruno: 'seed-login-bruno',
} as const

async function upsertUsers(passwordHash: string) {
  await prisma.user.upsert({
    where: { email: 'admin@aura.local' },
    update: {
      firstName: 'Aura',
      lastName: 'Admin',
      passwordHash,
      role: 'SUPERADMIN',
      status: 'ACTIVE',
      emailVerified: new Date('2026-03-01T10:00:00.000Z'),
      city: 'Sao Paulo',
      state: 'SP',
    },
    create: {
      id: ids.admin,
      email: 'admin@aura.local',
      firstName: 'Aura',
      lastName: 'Admin',
      passwordHash,
      role: 'SUPERADMIN',
      status: 'ACTIVE',
      emailVerified: new Date('2026-03-01T10:00:00.000Z'),
      city: 'Sao Paulo',
      state: 'SP',
    },
  })

  await prisma.user.upsert({
    where: { email: 'instrutor@aura.local' },
    update: {
      firstName: 'Marina',
      lastName: 'Souza',
      passwordHash,
      role: 'INSTRUCTOR',
      status: 'ACTIVE',
      emailVerified: new Date('2026-03-01T10:00:00.000Z'),
      bio: 'Instrutora focada em dados, produto e experiencias digitais.',
      city: 'Belo Horizonte',
      state: 'MG',
    },
    create: {
      id: ids.instructorUser,
      email: 'instrutor@aura.local',
      firstName: 'Marina',
      lastName: 'Souza',
      passwordHash,
      role: 'INSTRUCTOR',
      status: 'ACTIVE',
      emailVerified: new Date('2026-03-01T10:00:00.000Z'),
      bio: 'Instrutora focada em dados, produto e experiencias digitais.',
      city: 'Belo Horizonte',
      state: 'MG',
    },
  })

  await prisma.user.upsert({
    where: { email: 'ana@aura.local' },
    update: {
      firstName: 'Ana',
      lastName: 'Silva',
      passwordHash,
      role: 'STUDENT',
      status: 'ACTIVE',
      emailVerified: new Date('2026-03-05T10:00:00.000Z'),
      city: 'Recife',
      state: 'PE',
      lastLoginAt: new Date('2026-03-29T19:00:00.000Z'),
    },
    create: {
      id: ids.studentAna,
      email: 'ana@aura.local',
      firstName: 'Ana',
      lastName: 'Silva',
      passwordHash,
      role: 'STUDENT',
      status: 'ACTIVE',
      emailVerified: new Date('2026-03-05T10:00:00.000Z'),
      city: 'Recife',
      state: 'PE',
      lastLoginAt: new Date('2026-03-29T19:00:00.000Z'),
    },
  })

  await prisma.user.upsert({
    where: { email: 'bruno@aura.local' },
    update: {
      firstName: 'Bruno',
      lastName: 'Costa',
      passwordHash,
      role: 'STUDENT',
      status: 'ACTIVE',
      emailVerified: new Date('2026-03-07T10:00:00.000Z'),
      city: 'Curitiba',
      state: 'PR',
      lastLoginAt: new Date('2026-03-30T08:30:00.000Z'),
    },
    create: {
      id: ids.studentBruno,
      email: 'bruno@aura.local',
      firstName: 'Bruno',
      lastName: 'Costa',
      passwordHash,
      role: 'STUDENT',
      status: 'ACTIVE',
      emailVerified: new Date('2026-03-07T10:00:00.000Z'),
      city: 'Curitiba',
      state: 'PR',
      lastLoginAt: new Date('2026-03-30T08:30:00.000Z'),
    },
  })

  await prisma.user.upsert({
    where: { email: 'carla@aura.local' },
    update: {
      firstName: 'Carla',
      lastName: 'Mendes',
      passwordHash,
      role: 'STUDENT',
      status: 'ACTIVE',
      emailVerified: new Date('2026-03-08T10:00:00.000Z'),
      city: 'Fortaleza',
      state: 'CE',
      lastLoginAt: new Date('2026-03-28T14:15:00.000Z'),
    },
    create: {
      id: ids.studentCarla,
      email: 'carla@aura.local',
      firstName: 'Carla',
      lastName: 'Mendes',
      passwordHash,
      role: 'STUDENT',
      status: 'ACTIVE',
      emailVerified: new Date('2026-03-08T10:00:00.000Z'),
      city: 'Fortaleza',
      state: 'CE',
      lastLoginAt: new Date('2026-03-28T14:15:00.000Z'),
    },
  })
}

async function upsertCatalog() {
  await prisma.instructorProfile.upsert({
    where: { userId: ids.instructorUser },
    update: {
      id: ids.instructorProfile,
      headline: 'Especialista em produto, SQL, Prisma e analytics operacional.',
      expertise: ['Prisma', 'PostgreSQL', 'Analytics', 'Product'],
      linkedin: 'https://linkedin.com/in/marina-souza',
      website: 'https://aura.local/instrutores/marina',
      youtube: 'https://youtube.com/@marinasouza',
      totalRating: 4.9,
      totalReviews: 24,
      totalStudents: 182,
      verified: true,
    },
    create: {
      id: ids.instructorProfile,
      userId: ids.instructorUser,
      headline: 'Especialista em produto, SQL, Prisma e analytics operacional.',
      expertise: ['Prisma', 'PostgreSQL', 'Analytics', 'Product'],
      linkedin: 'https://linkedin.com/in/marina-souza',
      website: 'https://aura.local/instrutores/marina',
      youtube: 'https://youtube.com/@marinasouza',
      totalRating: 4.9,
      totalReviews: 24,
      totalStudents: 182,
      verified: true,
    },
  })

  await prisma.category.upsert({
    where: { slug: 'tecnologia' },
    update: {
      id: ids.categoryTech,
      name: 'Tecnologia',
      description: 'Cursos para engenharia de software, backend e dados.',
      emoji: 'laptop',
      color: '#0f766e',
      order: 1,
    },
    create: {
      id: ids.categoryTech,
      name: 'Tecnologia',
      slug: 'tecnologia',
      description: 'Cursos para engenharia de software, backend e dados.',
      emoji: 'laptop',
      color: '#0f766e',
      order: 1,
    },
  })

  await prisma.category.upsert({
    where: { slug: 'negocios' },
    update: {
      id: ids.categoryBusiness,
      name: 'Negocios',
      description: 'Cursos sobre operacao, produto e tomada de decisao.',
      emoji: 'chart',
      color: '#1d4ed8',
      order: 2,
    },
    create: {
      id: ids.categoryBusiness,
      name: 'Negocios',
      slug: 'negocios',
      description: 'Cursos sobre operacao, produto e tomada de decisao.',
      emoji: 'chart',
      color: '#1d4ed8',
      order: 2,
    },
  })

  await prisma.category.upsert({
    where: { slug: 'design' },
    update: {
      id: ids.categoryDesign,
      name: 'Design',
      description: 'Cursos para experiencia do usuario e interfaces digitais.',
      emoji: 'palette',
      color: '#db2777',
      order: 3,
    },
    create: {
      id: ids.categoryDesign,
      name: 'Design',
      slug: 'design',
      description: 'Cursos para experiencia do usuario e interfaces digitais.',
      emoji: 'palette',
      color: '#db2777',
      order: 3,
    },
  })

  await prisma.course.upsert({
    where: { slug: 'prisma-para-dashboards' },
    update: {
      id: ids.coursePrisma,
      title: 'Prisma para Dashboards e Relatorios',
      shortDescription: 'Modele dados, agregue metricas e alimente visualizacoes com seguranca.',
      description:
        'Curso pratico focado em modelagem relacional, consultas agregadas e preparo de payloads para dashboards.',
      status: 'PUBLISHED',
      level: 'INTERMEDIATE',
      price: '197.00',
      originalPrice: '297.00',
      totalLessons: 3,
      totalHours: 4.5,
      totalModules: 2,
      tags: ['prisma', 'postgresql', 'dashboard'],
      totalEnrollments: 2,
      totalRating: 4.8,
      totalReviews: 1,
      categoryId: ids.categoryTech,
      instructorId: ids.instructorProfile,
      publishedAt: new Date('2026-03-10T12:00:00.000Z'),
    },
    create: {
      id: ids.coursePrisma,
      slug: 'prisma-para-dashboards',
      title: 'Prisma para Dashboards e Relatorios',
      shortDescription: 'Modele dados, agregue metricas e alimente visualizacoes com seguranca.',
      description:
        'Curso pratico focado em modelagem relacional, consultas agregadas e preparo de payloads para dashboards.',
      status: 'PUBLISHED',
      level: 'INTERMEDIATE',
      price: '197.00',
      originalPrice: '297.00',
      totalLessons: 3,
      totalHours: 4.5,
      totalModules: 2,
      tags: ['prisma', 'postgresql', 'dashboard'],
      totalEnrollments: 2,
      totalRating: 4.8,
      totalReviews: 1,
      categoryId: ids.categoryTech,
      instructorId: ids.instructorProfile,
      publishedAt: new Date('2026-03-10T12:00:00.000Z'),
    },
  })

  await prisma.course.upsert({
    where: { slug: 'analytics-de-produto' },
    update: {
      id: ids.courseAnalytics,
      title: 'Analytics de Produto na Pratica',
      shortDescription: 'KPIs, cohort, funnels e leitura de metricas para squads.',
      description:
        'Curso voltado para traducao de dados em decisao, com exemplos de indicadores e rotinas operacionais.',
      status: 'PUBLISHED',
      level: 'BEGINNER',
      price: '149.00',
      originalPrice: '199.00',
      totalLessons: 1,
      totalHours: 2.5,
      totalModules: 1,
      tags: ['analytics', 'produto', 'kpi'],
      totalEnrollments: 1,
      totalRating: 4.7,
      totalReviews: 1,
      categoryId: ids.categoryBusiness,
      instructorId: ids.instructorProfile,
      publishedAt: new Date('2026-03-12T12:00:00.000Z'),
    },
    create: {
      id: ids.courseAnalytics,
      slug: 'analytics-de-produto',
      title: 'Analytics de Produto na Pratica',
      shortDescription: 'KPIs, cohort, funnels e leitura de metricas para squads.',
      description:
        'Curso voltado para traducao de dados em decisao, com exemplos de indicadores e rotinas operacionais.',
      status: 'PUBLISHED',
      level: 'BEGINNER',
      price: '149.00',
      originalPrice: '199.00',
      totalLessons: 1,
      totalHours: 2.5,
      totalModules: 1,
      tags: ['analytics', 'produto', 'kpi'],
      totalEnrollments: 1,
      totalRating: 4.7,
      totalReviews: 1,
      categoryId: ids.categoryBusiness,
      instructorId: ids.instructorProfile,
      publishedAt: new Date('2026-03-12T12:00:00.000Z'),
    },
  })

  await prisma.course.upsert({
    where: { slug: 'design-systems-essenciais' },
    update: {
      id: ids.courseDesign,
      title: 'Design Systems Essenciais',
      shortDescription: 'Estruture componentes, tokens e padroes visuais reutilizaveis.',
      description:
        'Curso para organizar bibliotecas de interface com consistencia visual e tecnica.',
      status: 'PUBLISHED',
      level: 'BEGINNER',
      price: '129.00',
      originalPrice: '179.00',
      totalLessons: 1,
      totalHours: 2,
      totalModules: 1,
      tags: ['design-system', 'ui', 'ux'],
      totalEnrollments: 1,
      totalRating: 4.6,
      totalReviews: 0,
      categoryId: ids.categoryDesign,
      instructorId: ids.instructorProfile,
      publishedAt: new Date('2026-03-14T12:00:00.000Z'),
    },
    create: {
      id: ids.courseDesign,
      slug: 'design-systems-essenciais',
      title: 'Design Systems Essenciais',
      shortDescription: 'Estruture componentes, tokens e padroes visuais reutilizaveis.',
      description:
        'Curso para organizar bibliotecas de interface com consistencia visual e tecnica.',
      status: 'PUBLISHED',
      level: 'BEGINNER',
      price: '129.00',
      originalPrice: '179.00',
      totalLessons: 1,
      totalHours: 2,
      totalModules: 1,
      tags: ['design-system', 'ui', 'ux'],
      totalEnrollments: 1,
      totalRating: 4.6,
      totalReviews: 0,
      categoryId: ids.categoryDesign,
      instructorId: ids.instructorProfile,
      publishedAt: new Date('2026-03-14T12:00:00.000Z'),
    },
  })
}

async function upsertCourseContent() {
  await prisma.courseRequirement.upsert({
    where: { id: ids.requirementPrisma1 },
    update: { description: 'Conhecimento basico de SQL e APIs.', order: 1, courseId: ids.coursePrisma },
    create: {
      id: ids.requirementPrisma1,
      courseId: ids.coursePrisma,
      description: 'Conhecimento basico de SQL e APIs.',
      order: 1,
    },
  })

  await prisma.courseRequirement.upsert({
    where: { id: ids.requirementPrisma2 },
    update: { description: 'Node.js instalado na maquina.', order: 2, courseId: ids.coursePrisma },
    create: {
      id: ids.requirementPrisma2,
      courseId: ids.coursePrisma,
      description: 'Node.js instalado na maquina.',
      order: 2,
    },
  })

  await prisma.courseRequirement.upsert({
    where: { id: ids.requirementAnalytics1 },
    update: { description: 'Interesse em metricas de produto.', order: 1, courseId: ids.courseAnalytics },
    create: {
      id: ids.requirementAnalytics1,
      courseId: ids.courseAnalytics,
      description: 'Interesse em metricas de produto.',
      order: 1,
    },
  })

  await prisma.courseRequirement.upsert({
    where: { id: ids.requirementDesign1 },
    update: { description: 'Nocoes basicas de Figma ajudam, mas nao sao obrigatorias.', order: 1, courseId: ids.courseDesign },
    create: {
      id: ids.requirementDesign1,
      courseId: ids.courseDesign,
      description: 'Nocoes basicas de Figma ajudam, mas nao sao obrigatorias.',
      order: 1,
    },
  })

  await prisma.courseOutcome.upsert({
    where: { id: ids.outcomePrisma1 },
    update: { description: 'Criar consultas agregadas no Prisma sem quebrar o payload.', order: 1, courseId: ids.coursePrisma },
    create: {
      id: ids.outcomePrisma1,
      courseId: ids.coursePrisma,
      description: 'Criar consultas agregadas no Prisma sem quebrar o payload.',
      order: 1,
    },
  })

  await prisma.courseOutcome.upsert({
    where: { id: ids.outcomePrisma2 },
    update: { description: 'Preparar series temporais para dashboards com PostgreSQL.', order: 2, courseId: ids.coursePrisma },
    create: {
      id: ids.outcomePrisma2,
      courseId: ids.coursePrisma,
      description: 'Preparar series temporais para dashboards com PostgreSQL.',
      order: 2,
    },
  })

  await prisma.courseOutcome.upsert({
    where: { id: ids.outcomeAnalytics1 },
    update: { description: 'Estruturar um painel de indicadores acionaveis para produto.', order: 1, courseId: ids.courseAnalytics },
    create: {
      id: ids.outcomeAnalytics1,
      courseId: ids.courseAnalytics,
      description: 'Estruturar um painel de indicadores acionaveis para produto.',
      order: 1,
    },
  })

  await prisma.courseOutcome.upsert({
    where: { id: ids.outcomeDesign1 },
    update: { description: 'Construir a base de um design system reutilizavel.', order: 1, courseId: ids.courseDesign },
    create: {
      id: ids.outcomeDesign1,
      courseId: ids.courseDesign,
      description: 'Construir a base de um design system reutilizavel.',
      order: 1,
    },
  })

  await prisma.module.upsert({
    where: { id: ids.modulePrismaCore },
    update: { courseId: ids.coursePrisma, title: 'Modelagem e Relacoes', order: 1 },
    create: {
      id: ids.modulePrismaCore,
      courseId: ids.coursePrisma,
      title: 'Modelagem e Relacoes',
      description: 'Base relacional para relatorios confiaveis.',
      order: 1,
    },
  })

  await prisma.module.upsert({
    where: { id: ids.modulePrismaReports },
    update: { courseId: ids.coursePrisma, title: 'Relatorios e Dashboards', order: 2 },
    create: {
      id: ids.modulePrismaReports,
      courseId: ids.coursePrisma,
      title: 'Relatorios e Dashboards',
      description: 'Agrupamentos, metricas e payloads para graficos.',
      order: 2,
    },
  })

  await prisma.module.upsert({
    where: { id: ids.moduleAnalyticsCore },
    update: { courseId: ids.courseAnalytics, title: 'KPIs e Operacao', order: 1 },
    create: {
      id: ids.moduleAnalyticsCore,
      courseId: ids.courseAnalytics,
      title: 'KPIs e Operacao',
      description: 'Indicadores centrais e como agir sobre eles.',
      order: 1,
    },
  })

  await prisma.module.upsert({
    where: { id: ids.moduleDesignCore },
    update: { courseId: ids.courseDesign, title: 'Fundamentos de Sistema', order: 1 },
    create: {
      id: ids.moduleDesignCore,
      courseId: ids.courseDesign,
      title: 'Fundamentos de Sistema',
      description: 'Tokens, componentes e governanca.',
      order: 1,
    },
  })

  await prisma.lesson.upsert({
    where: { id: ids.lessonPrismaModeling },
    update: { moduleId: ids.modulePrismaCore, title: 'Modelando relacoes para metricas', order: 1, videoDuration: 1800 },
    create: {
      id: ids.lessonPrismaModeling,
      moduleId: ids.modulePrismaCore,
      title: 'Modelando relacoes para metricas',
      description: 'Como estruturar entidades para dashboards consistentes.',
      order: 1,
      videoDuration: 1800,
      content: 'Introducao a relacionamentos, cardinalidade e indices.',
    },
  })

  await prisma.lesson.upsert({
    where: { id: ids.lessonPrismaQueries },
    update: { moduleId: ids.modulePrismaCore, title: 'Consultas agregadas com Prisma', order: 2, videoDuration: 2100 },
    create: {
      id: ids.lessonPrismaQueries,
      moduleId: ids.modulePrismaCore,
      title: 'Consultas agregadas com Prisma',
      description: 'GroupBy, aggregate e tratamentos para Decimal.',
      order: 2,
      videoDuration: 2100,
      content: 'Exemplos praticos com count, sum e filtros compostos.',
    },
  })

  await prisma.lesson.upsert({
    where: { id: ids.lessonPrismaDashboard },
    update: { moduleId: ids.modulePrismaReports, title: 'Do banco ao grafico', order: 1, videoDuration: 1500 },
    create: {
      id: ids.lessonPrismaDashboard,
      moduleId: ids.modulePrismaReports,
      title: 'Do banco ao grafico',
      description: 'Preparando dados para bibliotecas de visualizacao.',
      order: 1,
      videoDuration: 1500,
      content: 'Serializacao, rotulos e consistencia para dashboards no frontend.',
    },
  })

  await prisma.lesson.upsert({
    where: { id: ids.lessonAnalyticsKpi },
    update: { moduleId: ids.moduleAnalyticsCore, title: 'KPIs acionaveis', order: 1, videoDuration: 1600 },
    create: {
      id: ids.lessonAnalyticsKpi,
      moduleId: ids.moduleAnalyticsCore,
      title: 'KPIs acionaveis',
      description: 'Como transformar metricas em decisao diaria.',
      order: 1,
      videoDuration: 1600,
      content: 'North star, metricas de saude e rituais de acompanhamento.',
    },
  })

  await prisma.lesson.upsert({
    where: { id: ids.lessonDesignFoundation },
    update: { moduleId: ids.moduleDesignCore, title: 'Fundacoes de design systems', order: 1, videoDuration: 1400 },
    create: {
      id: ids.lessonDesignFoundation,
      moduleId: ids.moduleDesignCore,
      title: 'Fundacoes de design systems',
      description: 'Base visual e tecnica para escalar a interface.',
      order: 1,
      videoDuration: 1400,
      content: 'Tokens, componentes e documentacao.',
    },
  })
}

async function upsertCommercialData() {
  await prisma.subscription.upsert({
    where: { userId: ids.studentBruno },
    update: {
      id: ids.subscriptionBruno,
      plan: 'PRO',
      status: 'ACTIVE',
      gatewaySubId: 'sub_seed_bruno_pro',
      trialEndsAt: null,
      currentPeriodStart: new Date('2026-03-01T00:00:00.000Z'),
      currentPeriodEnd: new Date('2026-04-01T00:00:00.000Z'),
    },
    create: {
      id: ids.subscriptionBruno,
      userId: ids.studentBruno,
      plan: 'PRO',
      status: 'ACTIVE',
      gatewaySubId: 'sub_seed_bruno_pro',
      currentPeriodStart: new Date('2026-03-01T00:00:00.000Z'),
      currentPeriodEnd: new Date('2026-04-01T00:00:00.000Z'),
    },
  })

  await prisma.payment.upsert({
    where: { id: ids.paymentAna },
    update: {
      userId: ids.studentAna,
      amount: '197.00',
      status: 'PAID',
      method: 'PIX',
      courseId: ids.coursePrisma,
      gatewayId: 'pay_seed_ana',
      paidAt: new Date('2026-03-20T13:00:00.000Z'),
    },
    create: {
      id: ids.paymentAna,
      userId: ids.studentAna,
      amount: '197.00',
      status: 'PAID',
      method: 'PIX',
      courseId: ids.coursePrisma,
      gatewayId: 'pay_seed_ana',
      paidAt: new Date('2026-03-20T13:00:00.000Z'),
    },
  })

  await prisma.payment.upsert({
    where: { id: ids.paymentBruno },
    update: {
      userId: ids.studentBruno,
      amount: '149.00',
      status: 'PAID',
      method: 'SUBSCRIPTION',
      courseId: ids.courseAnalytics,
      subscriptionId: ids.subscriptionBruno,
      gatewayId: 'pay_seed_bruno',
      paidAt: new Date('2026-03-21T14:00:00.000Z'),
    },
    create: {
      id: ids.paymentBruno,
      userId: ids.studentBruno,
      amount: '149.00',
      status: 'PAID',
      method: 'SUBSCRIPTION',
      courseId: ids.courseAnalytics,
      subscriptionId: ids.subscriptionBruno,
      gatewayId: 'pay_seed_bruno',
      paidAt: new Date('2026-03-21T14:00:00.000Z'),
    },
  })

  await prisma.payment.upsert({
    where: { id: ids.paymentCarla },
    update: {
      userId: ids.studentCarla,
      amount: '129.00',
      status: 'PAID',
      method: 'CREDIT_CARD',
      courseId: ids.courseDesign,
      gatewayId: 'pay_seed_carla',
      paidAt: new Date('2026-03-22T15:00:00.000Z'),
    },
    create: {
      id: ids.paymentCarla,
      userId: ids.studentCarla,
      amount: '129.00',
      status: 'PAID',
      method: 'CREDIT_CARD',
      courseId: ids.courseDesign,
      gatewayId: 'pay_seed_carla',
      paidAt: new Date('2026-03-22T15:00:00.000Z'),
    },
  })

  await prisma.enrollment.upsert({
    where: { userId_courseId: { userId: ids.studentAna, courseId: ids.coursePrisma } },
    update: {
      id: ids.enrollmentAnaPrisma,
      status: 'COMPLETED',
      progress: 100,
      paymentId: ids.paymentAna,
      completedAt: new Date('2026-03-26T18:00:00.000Z'),
    },
    create: {
      id: ids.enrollmentAnaPrisma,
      userId: ids.studentAna,
      courseId: ids.coursePrisma,
      status: 'COMPLETED',
      progress: 100,
      paymentId: ids.paymentAna,
      completedAt: new Date('2026-03-26T18:00:00.000Z'),
    },
  })

  await prisma.enrollment.upsert({
    where: { userId_courseId: { userId: ids.studentBruno, courseId: ids.courseAnalytics } },
    update: {
      id: ids.enrollmentBrunoAnalytics,
      status: 'ACTIVE',
      progress: 62,
      paymentId: ids.paymentBruno,
    },
    create: {
      id: ids.enrollmentBrunoAnalytics,
      userId: ids.studentBruno,
      courseId: ids.courseAnalytics,
      status: 'ACTIVE',
      progress: 62,
      paymentId: ids.paymentBruno,
    },
  })

  await prisma.enrollment.upsert({
    where: { userId_courseId: { userId: ids.studentCarla, courseId: ids.courseDesign } },
    update: {
      id: ids.enrollmentCarlaDesign,
      status: 'ACTIVE',
      progress: 34,
      paymentId: ids.paymentCarla,
    },
    create: {
      id: ids.enrollmentCarlaDesign,
      userId: ids.studentCarla,
      courseId: ids.courseDesign,
      status: 'ACTIVE',
      progress: 34,
      paymentId: ids.paymentCarla,
    },
  })

  await prisma.courseProgress.upsert({
    where: { userId_courseId: { userId: ids.studentAna, courseId: ids.coursePrisma } },
    update: {
      id: ids.progressAnaPrisma,
      lastLessonId: ids.lessonPrismaDashboard,
      progressPercent: 100,
    },
    create: {
      id: ids.progressAnaPrisma,
      userId: ids.studentAna,
      courseId: ids.coursePrisma,
      lastLessonId: ids.lessonPrismaDashboard,
      progressPercent: 100,
    },
  })

  await prisma.courseProgress.upsert({
    where: { userId_courseId: { userId: ids.studentBruno, courseId: ids.courseAnalytics } },
    update: {
      id: ids.progressBrunoAnalytics,
      lastLessonId: ids.lessonAnalyticsKpi,
      progressPercent: 62,
    },
    create: {
      id: ids.progressBrunoAnalytics,
      userId: ids.studentBruno,
      courseId: ids.courseAnalytics,
      lastLessonId: ids.lessonAnalyticsKpi,
      progressPercent: 62,
    },
  })

  await prisma.lessonProgress.upsert({
    where: { userId_lessonId: { userId: ids.studentAna, lessonId: ids.lessonPrismaModeling } },
    update: { id: ids.lessonProgressAnaModeling, completed: true, watchTime: 1800, completedAt: new Date('2026-03-24T18:00:00.000Z') },
    create: {
      id: ids.lessonProgressAnaModeling,
      userId: ids.studentAna,
      lessonId: ids.lessonPrismaModeling,
      completed: true,
      watchTime: 1800,
      completedAt: new Date('2026-03-24T18:00:00.000Z'),
    },
  })

  await prisma.lessonProgress.upsert({
    where: { userId_lessonId: { userId: ids.studentAna, lessonId: ids.lessonPrismaQueries } },
    update: { id: ids.lessonProgressAnaQueries, completed: true, watchTime: 2100, completedAt: new Date('2026-03-25T18:00:00.000Z') },
    create: {
      id: ids.lessonProgressAnaQueries,
      userId: ids.studentAna,
      lessonId: ids.lessonPrismaQueries,
      completed: true,
      watchTime: 2100,
      completedAt: new Date('2026-03-25T18:00:00.000Z'),
    },
  })

  await prisma.lessonProgress.upsert({
    where: { userId_lessonId: { userId: ids.studentBruno, lessonId: ids.lessonAnalyticsKpi } },
    update: { id: ids.lessonProgressBrunoKpi, completed: false, watchTime: 950 },
    create: {
      id: ids.lessonProgressBrunoKpi,
      userId: ids.studentBruno,
      lessonId: ids.lessonAnalyticsKpi,
      completed: false,
      watchTime: 950,
    },
  })

  await prisma.certificate.upsert({
    where: { enrollmentId: ids.enrollmentAnaPrisma },
    update: {
      id: ids.certificateAna,
      code: 'AE-2026-00001',
      userId: ids.studentAna,
      courseId: ids.coursePrisma,
      status: 'ISSUED',
      pdfUrl: '/certificates/AE-2026-00001.pdf',
      issuedAt: new Date('2026-03-27T10:00:00.000Z'),
      metadata: {
        instructor: 'Marina Souza',
        totalHours: 4.5,
      },
    },
    create: {
      id: ids.certificateAna,
      code: 'AE-2026-00001',
      userId: ids.studentAna,
      courseId: ids.coursePrisma,
      enrollmentId: ids.enrollmentAnaPrisma,
      status: 'ISSUED',
      pdfUrl: '/certificates/AE-2026-00001.pdf',
      issuedAt: new Date('2026-03-27T10:00:00.000Z'),
      metadata: {
        instructor: 'Marina Souza',
        totalHours: 4.5,
      },
    },
  })
}

async function upsertAssessments() {
  await prisma.courseAssessment.upsert({
    where: { courseId: ids.coursePrisma },
    update: {
      id: ids.assessmentPrisma,
      title: 'Avaliacao final de Prisma',
      description: 'Verifique se o aluno consegue estruturar consultas e payloads para dashboards.',
      passingScore: 70,
      timeLimitMinutes: 20,
    },
    create: {
      id: ids.assessmentPrisma,
      courseId: ids.coursePrisma,
      title: 'Avaliacao final de Prisma',
      description: 'Verifique se o aluno consegue estruturar consultas e payloads para dashboards.',
      passingScore: 70,
      timeLimitMinutes: 20,
    },
  })

  await prisma.courseAssessment.upsert({
    where: { courseId: ids.courseAnalytics },
    update: {
      id: ids.assessmentAnalytics,
      title: 'Avaliacao final de Analytics',
      description: 'Confirma se o aluno sabe identificar indicadores acionaveis.',
      passingScore: 70,
      timeLimitMinutes: 15,
    },
    create: {
      id: ids.assessmentAnalytics,
      courseId: ids.courseAnalytics,
      title: 'Avaliacao final de Analytics',
      description: 'Confirma se o aluno sabe identificar indicadores acionaveis.',
      passingScore: 70,
      timeLimitMinutes: 15,
    },
  })

  await prisma.courseAssessment.upsert({
    where: { courseId: ids.courseDesign },
    update: {
      id: ids.assessmentDesign,
      title: 'Avaliacao final de Design Systems',
      description: 'Valida os fundamentos de componentes, tokens e governanca.',
      passingScore: 70,
      timeLimitMinutes: 15,
    },
    create: {
      id: ids.assessmentDesign,
      courseId: ids.courseDesign,
      title: 'Avaliacao final de Design Systems',
      description: 'Valida os fundamentos de componentes, tokens e governanca.',
      passingScore: 70,
      timeLimitMinutes: 15,
    },
  })

  await prisma.assessmentQuestion.upsert({
    where: { id: ids.questionPrisma1 },
    update: {
      assessmentId: ids.assessmentPrisma,
      prompt: 'Qual recurso do Prisma ajuda a agregar valores por status ou categoria?',
      correctOption: 'groupBy',
      order: 1,
      options: [
        { id: 'findMany', label: 'findMany' },
        { id: 'groupBy', label: 'groupBy' },
        { id: 'createMany', label: 'createMany' },
        { id: 'disconnect', label: 'disconnect' },
      ],
      explanation: 'groupBy permite agrupar e calcular metricas por campos como status e metodo.',
    },
    create: {
      id: ids.questionPrisma1,
      assessmentId: ids.assessmentPrisma,
      prompt: 'Qual recurso do Prisma ajuda a agregar valores por status ou categoria?',
      correctOption: 'groupBy',
      order: 1,
      options: [
        { id: 'findMany', label: 'findMany' },
        { id: 'groupBy', label: 'groupBy' },
        { id: 'createMany', label: 'createMany' },
        { id: 'disconnect', label: 'disconnect' },
      ],
      explanation: 'groupBy permite agrupar e calcular metricas por campos como status e metodo.',
    },
  })

  await prisma.assessmentQuestion.upsert({
    where: { id: ids.questionPrisma2 },
    update: {
      assessmentId: ids.assessmentPrisma,
      prompt: 'O que normalmente precisa ser feito com Decimal antes de enviar para o frontend?',
      correctOption: 'converter-para-number',
      order: 2,
      options: [
        { id: 'converter-para-number', label: 'Converter para Number ou string segura' },
        { id: 'salvar-em-cookie', label: 'Salvar em cookie' },
        { id: 'apagar-o-campo', label: 'Apagar o campo' },
        { id: 'transformar-em-date', label: 'Transformar em Date' },
      ],
      explanation: 'Decimal deve ser serializado de forma segura antes de chegar ao JSON do frontend.',
    },
    create: {
      id: ids.questionPrisma2,
      assessmentId: ids.assessmentPrisma,
      prompt: 'O que normalmente precisa ser feito com Decimal antes de enviar para o frontend?',
      correctOption: 'converter-para-number',
      order: 2,
      options: [
        { id: 'converter-para-number', label: 'Converter para Number ou string segura' },
        { id: 'salvar-em-cookie', label: 'Salvar em cookie' },
        { id: 'apagar-o-campo', label: 'Apagar o campo' },
        { id: 'transformar-em-date', label: 'Transformar em Date' },
      ],
      explanation: 'Decimal deve ser serializado de forma segura antes de chegar ao JSON do frontend.',
    },
  })

  await prisma.assessmentQuestion.upsert({
    where: { id: ids.questionAnalytics1 },
    update: {
      assessmentId: ids.assessmentAnalytics,
      prompt: 'Qual KPI costuma refletir crescimento sustentavel do produto?',
      correctOption: 'north-star',
      order: 1,
      options: [
        { id: 'north-star', label: 'Uma metrica north star ligada ao valor entregue' },
        { id: 'likes', label: 'Numero de likes em rede social' },
        { id: 'prints', label: 'Quantidade de prints enviados' },
        { id: 'tickets', label: 'Total de chamados sem contexto' },
      ],
      explanation: 'A north star precisa refletir valor real percebido pelo usuario.',
    },
    create: {
      id: ids.questionAnalytics1,
      assessmentId: ids.assessmentAnalytics,
      prompt: 'Qual KPI costuma refletir crescimento sustentavel do produto?',
      correctOption: 'north-star',
      order: 1,
      options: [
        { id: 'north-star', label: 'Uma metrica north star ligada ao valor entregue' },
        { id: 'likes', label: 'Numero de likes em rede social' },
        { id: 'prints', label: 'Quantidade de prints enviados' },
        { id: 'tickets', label: 'Total de chamados sem contexto' },
      ],
      explanation: 'A north star precisa refletir valor real percebido pelo usuario.',
    },
  })

  await prisma.assessmentQuestion.upsert({
    where: { id: ids.questionAnalytics2 },
    update: {
      assessmentId: ids.assessmentAnalytics,
      prompt: 'Para que serve um funil de produto?',
      correctOption: 'identificar-quedas',
      order: 2,
      options: [
        { id: 'identificar-quedas', label: 'Identificar onde o usuario abandona a jornada' },
        { id: 'trocar-o-logo', label: 'Trocar a identidade visual' },
        { id: 'mudar-o-banco', label: 'Escolher o banco de dados' },
        { id: 'criar-cupom', label: 'Criar cupons promocionais' },
      ],
      explanation: 'Funis ajudam a localizar gargalos e pontos de abandono na jornada.',
    },
    create: {
      id: ids.questionAnalytics2,
      assessmentId: ids.assessmentAnalytics,
      prompt: 'Para que serve um funil de produto?',
      correctOption: 'identificar-quedas',
      order: 2,
      options: [
        { id: 'identificar-quedas', label: 'Identificar onde o usuario abandona a jornada' },
        { id: 'trocar-o-logo', label: 'Trocar a identidade visual' },
        { id: 'mudar-o-banco', label: 'Escolher o banco de dados' },
        { id: 'criar-cupom', label: 'Criar cupons promocionais' },
      ],
      explanation: 'Funis ajudam a localizar gargalos e pontos de abandono na jornada.',
    },
  })

  await prisma.assessmentQuestion.upsert({
    where: { id: ids.questionDesign1 },
    update: {
      assessmentId: ids.assessmentDesign,
      prompt: 'Qual elemento costuma centralizar cores, espacamentos e tipografia num design system?',
      correctOption: 'tokens',
      order: 1,
      options: [
        { id: 'tokens', label: 'Tokens de design' },
        { id: 'cookies', label: 'Cookies do navegador' },
        { id: 'dns', label: 'Registros DNS' },
        { id: 'logs', label: 'Logs de aplicacao' },
      ],
      explanation: 'Tokens guardam valores reutilizaveis de interface e ajudam na consistencia.',
    },
    create: {
      id: ids.questionDesign1,
      assessmentId: ids.assessmentDesign,
      prompt: 'Qual elemento costuma centralizar cores, espacamentos e tipografia num design system?',
      correctOption: 'tokens',
      order: 1,
      options: [
        { id: 'tokens', label: 'Tokens de design' },
        { id: 'cookies', label: 'Cookies do navegador' },
        { id: 'dns', label: 'Registros DNS' },
        { id: 'logs', label: 'Logs de aplicacao' },
      ],
      explanation: 'Tokens guardam valores reutilizaveis de interface e ajudam na consistencia.',
    },
  })

  await prisma.assessmentQuestion.upsert({
    where: { id: ids.questionDesign2 },
    update: {
      assessmentId: ids.assessmentDesign,
      prompt: 'Qual o principal objetivo de um componente reutilizavel?',
      correctOption: 'consistencia',
      order: 2,
      options: [
        { id: 'consistencia', label: 'Garantir consistencia e acelerar entrega' },
        { id: 'duplicacao', label: 'Duplicar layouts sempre' },
        { id: 'improvisar', label: 'Improvisar visual sem regra' },
        { id: 'quebrar-acessibilidade', label: 'Ignorar acessibilidade' },
      ],
      explanation: 'Componentes reutilizaveis ajudam a manter consistencia, qualidade e velocidade.',
    },
    create: {
      id: ids.questionDesign2,
      assessmentId: ids.assessmentDesign,
      prompt: 'Qual o principal objetivo de um componente reutilizavel?',
      correctOption: 'consistencia',
      order: 2,
      options: [
        { id: 'consistencia', label: 'Garantir consistencia e acelerar entrega' },
        { id: 'duplicacao', label: 'Duplicar layouts sempre' },
        { id: 'improvisar', label: 'Improvisar visual sem regra' },
        { id: 'quebrar-acessibilidade', label: 'Ignorar acessibilidade' },
      ],
      explanation: 'Componentes reutilizaveis ajudam a manter consistencia, qualidade e velocidade.',
    },
  })
}

async function upsertEngagementData() {
  await prisma.review.upsert({
    where: { userId_courseId: { userId: ids.studentAna, courseId: ids.coursePrisma } },
    update: {
      id: ids.reviewAna,
      rating: 5,
      title: 'Pratico e direto',
      body: 'Consegui estruturar minhas consultas e montar um dashboard sem sofrer com Decimal.',
      isVerified: true,
      isVisible: true,
    },
    create: {
      id: ids.reviewAna,
      userId: ids.studentAna,
      courseId: ids.coursePrisma,
      rating: 5,
      title: 'Pratico e direto',
      body: 'Consegui estruturar minhas consultas e montar um dashboard sem sofrer com Decimal.',
      isVerified: true,
      isVisible: true,
    },
  })

  await prisma.review.upsert({
    where: { userId_courseId: { userId: ids.studentBruno, courseId: ids.courseAnalytics } },
    update: {
      id: ids.reviewBruno,
      rating: 4,
      title: 'Boa base de indicadores',
      body: 'Material objetivo para organizar KPI e rotina de acompanhamento.',
      isVerified: true,
      isVisible: true,
    },
    create: {
      id: ids.reviewBruno,
      userId: ids.studentBruno,
      courseId: ids.courseAnalytics,
      rating: 4,
      title: 'Boa base de indicadores',
      body: 'Material objetivo para organizar KPI e rotina de acompanhamento.',
      isVerified: true,
      isVisible: true,
    },
  })

  await prisma.notification.upsert({
    where: { id: ids.notificationAna },
    update: {
      userId: ids.studentAna,
      type: 'CERTIFICATE_ISSUED',
      title: 'Seu certificado esta pronto',
      body: 'O certificado do curso Prisma para Dashboards e Relatorios ja pode ser baixado.',
      sentAt: new Date('2026-03-27T10:05:00.000Z'),
      readAt: new Date('2026-03-27T11:00:00.000Z'),
      data: { certificateId: ids.certificateAna, courseId: ids.coursePrisma },
    },
    create: {
      id: ids.notificationAna,
      userId: ids.studentAna,
      type: 'CERTIFICATE_ISSUED',
      title: 'Seu certificado esta pronto',
      body: 'O certificado do curso Prisma para Dashboards e Relatorios ja pode ser baixado.',
      sentAt: new Date('2026-03-27T10:05:00.000Z'),
      readAt: new Date('2026-03-27T11:00:00.000Z'),
      data: { certificateId: ids.certificateAna, courseId: ids.coursePrisma },
    },
  })

  await prisma.coupon.upsert({
    where: { code: 'LANCAMENTO20' },
    update: {
      id: ids.couponLaunch,
      description: 'Cupom de lancamento para cursos individuais.',
      discountType: 'PERCENT',
      discount: '20.00',
      maxUses: 100,
      usedCount: 12,
      minAmount: '100.00',
      courseIds: [ids.coursePrisma, ids.courseAnalytics],
    },
    create: {
      id: ids.couponLaunch,
      code: 'LANCAMENTO20',
      description: 'Cupom de lancamento para cursos individuais.',
      discountType: 'PERCENT',
      discount: '20.00',
      maxUses: 100,
      usedCount: 12,
      minAmount: '100.00',
      courseIds: [ids.coursePrisma, ids.courseAnalytics],
    },
  })

  await prisma.coupon.upsert({
    where: { code: 'PRO10' },
    update: {
      id: ids.couponPro,
      description: 'Desconto para assinatura PRO.',
      discountType: 'FIXED',
      discount: '10.00',
      maxUses: 50,
      usedCount: 4,
      minAmount: '50.00',
      courseIds: [],
    },
    create: {
      id: ids.couponPro,
      code: 'PRO10',
      description: 'Desconto para assinatura PRO.',
      discountType: 'FIXED',
      discount: '10.00',
      maxUses: 50,
      usedCount: 4,
      minAmount: '50.00',
      courseIds: [],
    },
  })

  await prisma.loginHistory.upsert({
    where: { id: ids.loginAna },
    update: {
      userId: ids.studentAna,
      ipAddress: '127.0.0.1',
      userAgent: 'seed-script',
      success: true,
      city: 'Recife',
      country: 'BR',
    },
    create: {
      id: ids.loginAna,
      userId: ids.studentAna,
      ipAddress: '127.0.0.1',
      userAgent: 'seed-script',
      success: true,
      city: 'Recife',
      country: 'BR',
    },
  })

  await prisma.loginHistory.upsert({
    where: { id: ids.loginBruno },
    update: {
      userId: ids.studentBruno,
      ipAddress: '127.0.0.1',
      userAgent: 'seed-script',
      success: true,
      city: 'Curitiba',
      country: 'BR',
    },
    create: {
      id: ids.loginBruno,
      userId: ids.studentBruno,
      ipAddress: '127.0.0.1',
      userAgent: 'seed-script',
      success: true,
      city: 'Curitiba',
      country: 'BR',
    },
  })
}

async function main() {
  const passwordHash = await bcrypt.hash(PASSWORD, 10)

  await upsertUsers(passwordHash)
  await upsertCatalog()
  await upsertCourseContent()
  await upsertAssessments()
  await upsertCommercialData()
  await upsertEngagementData()

  console.log('Seed concluida com sucesso.')
  console.log('Usuarios de teste: admin@aura.local, instrutor@aura.local, ana@aura.local, bruno@aura.local, carla@aura.local')
  console.log(`Senha padrao: ${PASSWORD}`)
}

main()
  .catch((error) => {
    console.error('Falha ao executar seed:', error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
