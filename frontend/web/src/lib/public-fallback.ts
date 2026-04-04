export const fallbackPublicOverview = {
  totals: {
    publishedCourses: 3,
    totalEnrollments: 128,
    averagePrice: 129,
    averageRating: 4.8,
    averageHours: 18,
  },
  categories: [
    {
      id: 'cat-tech',
      name: 'Tecnologia e Dados',
      slug: 'tecnologia-dados',
      color: '#1d4ed8',
      emoji: 'T',
      totalCourses: 1,
    },
    {
      id: 'cat-ai',
      name: 'Inteligencia Artificial',
      slug: 'inteligencia-artificial',
      color: '#7c3aed',
      emoji: 'I',
      totalCourses: 1,
    },
    {
      id: 'cat-biz',
      name: 'Gestao e Negocios',
      slug: 'gestao-negocios',
      color: '#c9a84c',
      emoji: 'G',
      totalCourses: 1,
    },
  ],
}

export const fallbackCourses = [
  {
    id: 'course-prisma',
    slug: 'prisma-dashboards-relatorios',
    title: 'Prisma para Dashboards e Relatorios',
    shortDescription: 'Aprenda a modelar dados, consultar com eficiencia e montar bases prontas para analytics.',
    level: 'INTERMEDIATE',
    language: 'PT-BR',
    price: 149,
    originalPrice: 197,
    isFree: false,
    totalLessons: 16,
    totalHours: 14,
    totalEnrollments: 54,
    totalRating: 4.9,
    totalReviews: 23,
    category: {
      id: 'cat-tech',
      name: 'Tecnologia e Dados',
      slug: 'tecnologia-dados',
      color: '#1d4ed8',
    },
    instructor: {
      id: 'inst-1',
      headline: 'Engenheira de software e dados',
      user: {
        firstName: 'Marina',
        lastName: 'Lopes',
        avatarUrl: null,
      },
    },
  },
  {
    id: 'course-ai',
    slug: 'ia-aplicada-produtividade',
    title: 'IA Aplicada a Produtividade',
    shortDescription: 'Use IA no trabalho real para pesquisa, escrita, automacao e organizacao de processos.',
    level: 'BEGINNER',
    language: 'PT-BR',
    price: 97,
    originalPrice: 127,
    isFree: false,
    totalLessons: 12,
    totalHours: 10,
    totalEnrollments: 41,
    totalRating: 4.7,
    totalReviews: 19,
    category: {
      id: 'cat-ai',
      name: 'Inteligencia Artificial',
      slug: 'inteligencia-artificial',
      color: '#7c3aed',
    },
    instructor: {
      id: 'inst-2',
      headline: 'Especialista em automacao e IA aplicada',
      user: {
        firstName: 'Kayo',
        lastName: 'Rodrigo',
        avatarUrl: null,
      },
    },
  },
  {
    id: 'course-biz',
    slug: 'gestao-agil-para-equipes',
    title: 'Gestao Agil para Equipes',
    shortDescription: 'Organize times, projetos e entregas com praticas ageis aplicadas a negocios reais.',
    level: 'BEGINNER',
    language: 'PT-BR',
    price: 129,
    originalPrice: null,
    isFree: false,
    totalLessons: 14,
    totalHours: 12,
    totalEnrollments: 33,
    totalRating: 4.8,
    totalReviews: 14,
    category: {
      id: 'cat-biz',
      name: 'Gestao e Negocios',
      slug: 'gestao-negocios',
      color: '#c9a84c',
    },
    instructor: {
      id: 'inst-3',
      headline: 'Consultora de operacoes e estrategia',
      user: {
        firstName: 'Ana',
        lastName: 'Souza',
        avatarUrl: null,
      },
    },
  },
]

export const fallbackCourseListPayload = {
  data: fallbackCourses,
}

const baseDetail = {
  description:
    'Curso livre com foco pratico, estrutura guiada e suporte a uma jornada de aprendizagem clara para o aluno final.',
  hasCertificate: true,
  certificateHours: 20,
  tags: ['certificado', 'curso livre', 'aulas gravadas'],
}

export const fallbackCourseDetails: Record<string, any> = {
  'prisma-dashboards-relatorios': {
    slug: 'prisma-dashboards-relatorios',
    title: 'Prisma para Dashboards e Relatorios',
    shortDescription:
      'Aprenda a modelar dados, consultar com eficiencia e montar bases prontas para analytics.',
    level: 'INTERMEDIATE',
    language: 'PT-BR',
    price: 149,
    originalPrice: 197,
    isFree: false,
    totalLessons: 16,
    totalHours: 14,
    category: {
      name: 'Tecnologia e Dados',
      description: 'Formacao pratica em software, dados e produto digital.',
    },
    instructor: {
      headline: 'Engenheira de software e dados',
      expertise: ['Prisma', 'PostgreSQL', 'BI'],
      verified: true,
      user: {
        firstName: 'Marina',
        lastName: 'Lopes',
        bio: 'Atua com modelagem de dados, backend e produtos baseados em analytics.',
      },
    },
    requirements: [
      { id: 'req-1', description: 'Conhecimento basico de JavaScript ou TypeScript.' },
      { id: 'req-2', description: 'Noes basicas de banco relacional ajudam, mas nao sao obrigatorias.' },
    ],
    outcomes: [
      { id: 'out-1', description: 'Modelar entidades e relacionamentos com Prisma.' },
      { id: 'out-2', description: 'Preparar consultas para dashboard e relatorios.' },
      { id: 'out-3', description: 'Estruturar dados para crescimento do produto.' },
    ],
    modules: [
      {
        id: 'mod-1',
        title: 'Fundamentos do schema',
        description: 'Base conceitual para desenhar um schema consistente.',
        lessons: [
          { id: 'les-1', title: 'Models e relacionamentos', description: null, videoDuration: 18, isPreview: true },
          { id: 'les-2', title: 'Enums e campos calculados', description: null, videoDuration: 16, isPreview: false },
        ],
      },
      {
        id: 'mod-2',
        title: 'Consultas para analytics',
        description: 'Como transformar dados transacionais em visoes gerenciais.',
        lessons: [
          { id: 'les-3', title: 'Aggregations e groupBy', description: null, videoDuration: 22, isPreview: false },
          { id: 'les-4', title: 'Series temporais e filtros', description: null, videoDuration: 19, isPreview: false },
        ],
      },
    ],
    ...baseDetail,
  },
  'ia-aplicada-produtividade': {
    slug: 'ia-aplicada-produtividade',
    title: 'IA Aplicada a Produtividade',
    shortDescription: 'Use IA no trabalho real para pesquisa, escrita, automacao e organizacao de processos.',
    level: 'BEGINNER',
    language: 'PT-BR',
    price: 97,
    originalPrice: 127,
    isFree: false,
    totalLessons: 12,
    totalHours: 10,
    category: {
      name: 'Inteligencia Artificial',
      description: 'Cursos para uso pratico de IA em rotina profissional.',
    },
    instructor: {
      headline: 'Especialista em automacao e IA aplicada',
      expertise: ['IA generativa', 'prompts', 'automacao'],
      verified: true,
      user: {
        firstName: 'Kayo',
        lastName: 'Rodrigo',
        bio: 'Ajuda equipes a adotar IA de forma pragmatica no dia a dia.',
      },
    },
    requirements: [
      { id: 'req-1', description: 'Nao exige experiencia previa com IA.' },
      { id: 'req-2', description: 'Basta familiaridade com rotinas de escritorio e internet.' },
    ],
    outcomes: [
      { id: 'out-1', description: 'Criar prompts melhores para tarefas reais.' },
      { id: 'out-2', description: 'Organizar processos com apoio de IA.' },
      { id: 'out-3', description: 'Ganhar velocidade sem perder criterio.' },
    ],
    modules: [
      {
        id: 'mod-1',
        title: 'Bases de uso profissional',
        description: 'Como usar IA com contexto, objetivo e qualidade.',
        lessons: [
          { id: 'les-1', title: 'Prompts com clareza', description: null, videoDuration: 14, isPreview: true },
          { id: 'les-2', title: 'Fluxos e revisao humana', description: null, videoDuration: 17, isPreview: false },
        ],
      },
      {
        id: 'mod-2',
        title: 'Aplicacoes no trabalho',
        description: 'Casos de uso em pesquisa, comunicacao e operacoes.',
        lessons: [
          { id: 'les-3', title: 'Pesquisa assistida', description: null, videoDuration: 18, isPreview: false },
          { id: 'les-4', title: 'Documentacao e sintese', description: null, videoDuration: 16, isPreview: false },
        ],
      },
    ],
    ...baseDetail,
  },
  'gestao-agil-para-equipes': {
    slug: 'gestao-agil-para-equipes',
    title: 'Gestao Agil para Equipes',
    shortDescription: 'Organize times, projetos e entregas com praticas ageis aplicadas a negocios reais.',
    level: 'BEGINNER',
    language: 'PT-BR',
    price: 129,
    originalPrice: null,
    isFree: false,
    totalLessons: 14,
    totalHours: 12,
    category: {
      name: 'Gestao e Negocios',
      description: 'Cursos voltados a lideranca, organizacao e crescimento.',
    },
    instructor: {
      headline: 'Consultora de operacoes e estrategia',
      expertise: ['Agilidade', 'operacoes', 'times'],
      verified: true,
      user: {
        firstName: 'Ana',
        lastName: 'Souza',
        bio: 'Trabalha com melhoria de processo e lideranca de equipes.',
      },
    },
    requirements: [
      { id: 'req-1', description: 'Indicado para lideres, coordenadores e profissionais de projeto.' },
      { id: 'req-2', description: 'Nao exige certificacao previa em agilidade.' },
    ],
    outcomes: [
      { id: 'out-1', description: 'Organizar ritos e prioridades com clareza.' },
      { id: 'out-2', description: 'Acompanhar entregas sem microgestao.' },
      { id: 'out-3', description: 'Melhorar colaboracao e previsibilidade do time.' },
    ],
    modules: [
      {
        id: 'mod-1',
        title: 'Fundamentos ageis',
        description: 'Principios para organizar pessoas e trabalho.',
        lessons: [
          { id: 'les-1', title: 'Backlog, sprint e foco', description: null, videoDuration: 15, isPreview: true },
          { id: 'les-2', title: 'Papéis e cadencia', description: null, videoDuration: 18, isPreview: false },
        ],
      },
      {
        id: 'mod-2',
        title: 'Gestao aplicada',
        description: 'Como levar a teoria para a rotina do time.',
        lessons: [
          { id: 'les-3', title: 'Ritmos de acompanhamento', description: null, videoDuration: 16, isPreview: false },
          { id: 'les-4', title: 'Indicadores e alinhamento', description: null, videoDuration: 17, isPreview: false },
        ],
      },
    ],
    ...baseDetail,
  },
}

export function getFallbackCourseDetail(slug: string) {
  return fallbackCourseDetails[slug] ?? fallbackCourseDetails['prisma-dashboards-relatorios']
}

export function getFallbackCheckoutSummary(slug: string) {
  const course = fallbackCourses.find((item) => item.slug === slug) ?? fallbackCourses[0]

  return {
    course: {
      title: course.title,
      slug: course.slug,
      shortDescription: course.shortDescription,
      isFree: course.isFree,
    },
    pricing: {
      basePrice: course.originalPrice ?? course.price,
      discountAmount: (course.originalPrice ?? course.price) - course.price,
      finalPrice: course.price,
      isFree: course.isFree,
      coupon: null,
    },
  }
}
