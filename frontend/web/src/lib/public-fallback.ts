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
      name: 'Inteligência Artificial',
      slug: 'inteligencia-artificial',
      color: '#7c3aed',
      emoji: 'I',
      totalCourses: 1,
    },
    {
      id: 'cat-biz',
      name: 'Gestão e Negócios',
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
    title: 'Prisma para Dashboards e Relatórios',
    shortDescription:
      'Aprenda a modelar dados, consultar com eficiência e estruturar bases preparadas para análise e tomada de decisão.',
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
    title: 'IA Aplicada à Produtividade',
    shortDescription:
      'Utilize inteligência artificial no trabalho real para pesquisa, escrita, automação e organização de processos.',
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
      name: 'Inteligência Artificial',
      slug: 'inteligencia-artificial',
      color: '#7c3aed',
    },
    instructor: {
      id: 'inst-2',
      headline: 'Especialista em automação e IA aplicada',
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
    title: 'Gestão Ágil para Equipes',
    shortDescription:
      'Organize equipes, projetos e entregas com práticas ágeis aplicadas a contextos profissionais reais.',
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
      name: 'Gestão e Negócios',
      slug: 'gestao-negocios',
      color: '#c9a84c',
    },
    instructor: {
      id: 'inst-3',
      headline: 'Consultora de operações e estratégia',
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
    'Curso livre com abordagem prática, estrutura guiada e trilha de aprendizagem organizada para o estudante.',
  hasCertificate: true,
  certificateHours: 20,
  tags: ['certificado', 'curso livre', 'aulas gravadas'],
}

export const fallbackCourseDetails: Record<string, any> = {
  'prisma-dashboards-relatorios': {
    slug: 'prisma-dashboards-relatorios',
    title: 'Prisma para Dashboards e Relatórios',
    shortDescription:
      'Aprenda a modelar dados, consultar com eficiência e estruturar bases preparadas para análise e tomada de decisão.',
    level: 'INTERMEDIATE',
    language: 'PT-BR',
    price: 149,
    originalPrice: 197,
    isFree: false,
    totalLessons: 16,
    totalHours: 14,
    category: {
      name: 'Tecnologia e Dados',
      description: 'Formação prática em software, dados e produto digital.',
    },
    instructor: {
      headline: 'Engenheira de software e dados',
      expertise: ['Prisma', 'PostgreSQL', 'BI'],
      verified: true,
      user: {
        firstName: 'Marina',
        lastName: 'Lopes',
        bio: 'Atua com modelagem de dados, backend e produtos orientados por indicadores e análise.',
      },
    },
    requirements: [
      { id: 'req-1', description: 'Conhecimento básico de JavaScript ou TypeScript.' },
      {
        id: 'req-2',
        description: 'Noções básicas de banco de dados relacional são recomendáveis, mas não obrigatórias.',
      },
    ],
    outcomes: [
      { id: 'out-1', description: 'Modelar entidades e relacionamentos com Prisma.' },
      { id: 'out-2', description: 'Preparar consultas para dashboards e relatórios.' },
      { id: 'out-3', description: 'Estruturar dados para a evolução sustentável do produto.' },
    ],
    modules: [
      {
        id: 'mod-1',
        title: 'Fundamentos do esquema',
        description: 'Base conceitual para construir um esquema consistente.',
        lessons: [
          { id: 'les-1', title: 'Modelos e relacionamentos', description: null, videoDuration: 18, isPreview: true },
          { id: 'les-2', title: 'Enumeradores e campos calculados', description: null, videoDuration: 16, isPreview: false },
        ],
      },
      {
        id: 'mod-2',
        title: 'Consultas para análise',
        description: 'Como transformar dados transacionais em visões gerenciais.',
        lessons: [
          { id: 'les-3', title: 'Agregações e groupBy', description: null, videoDuration: 22, isPreview: false },
          { id: 'les-4', title: 'Séries temporais e filtros', description: null, videoDuration: 19, isPreview: false },
        ],
      },
    ],
    ...baseDetail,
  },
  'ia-aplicada-produtividade': {
    slug: 'ia-aplicada-produtividade',
    title: 'IA Aplicada à Produtividade',
    shortDescription:
      'Utilize inteligência artificial no trabalho real para pesquisa, escrita, automação e organização de processos.',
    level: 'BEGINNER',
    language: 'PT-BR',
    price: 97,
    originalPrice: 127,
    isFree: false,
    totalLessons: 12,
    totalHours: 10,
    category: {
      name: 'Inteligência Artificial',
      description: 'Cursos voltados ao uso prático de IA na rotina profissional.',
    },
    instructor: {
      headline: 'Especialista em automação e IA aplicada',
      expertise: ['IA generativa', 'prompts', 'automação'],
      verified: true,
      user: {
        firstName: 'Kayo',
        lastName: 'Rodrigo',
        bio: 'Atua na implementação de IA de forma pragmática, com foco em produtividade e qualidade.',
      },
    },
    requirements: [
      { id: 'req-1', description: 'Não exige experiência prévia com inteligência artificial.' },
      { id: 'req-2', description: 'Basta familiaridade com rotinas administrativas e uso da internet.' },
    ],
    outcomes: [
      { id: 'out-1', description: 'Construir prompts mais claros para tarefas reais.' },
      { id: 'out-2', description: 'Organizar processos com apoio de IA.' },
      { id: 'out-3', description: 'Ganhar produtividade sem comprometer o critério técnico.' },
    ],
    modules: [
      {
        id: 'mod-1',
        title: 'Bases de uso profissional',
        description: 'Como utilizar IA com contexto, objetivo e qualidade.',
        lessons: [
          { id: 'les-1', title: 'Prompts com clareza', description: null, videoDuration: 14, isPreview: true },
          { id: 'les-2', title: 'Fluxos e revisão humana', description: null, videoDuration: 17, isPreview: false },
        ],
      },
      {
        id: 'mod-2',
        title: 'Aplicações no trabalho',
        description: 'Casos de uso em pesquisa, comunicação e operações.',
        lessons: [
          { id: 'les-3', title: 'Pesquisa assistida', description: null, videoDuration: 18, isPreview: false },
          { id: 'les-4', title: 'Documentação e síntese', description: null, videoDuration: 16, isPreview: false },
        ],
      },
    ],
    ...baseDetail,
  },
  'gestao-agil-para-equipes': {
    slug: 'gestao-agil-para-equipes',
    title: 'Gestão Ágil para Equipes',
    shortDescription:
      'Organize equipes, projetos e entregas com práticas ágeis aplicadas a contextos profissionais reais.',
    level: 'BEGINNER',
    language: 'PT-BR',
    price: 129,
    originalPrice: null,
    isFree: false,
    totalLessons: 14,
    totalHours: 12,
    category: {
      name: 'Gestão e Negócios',
      description: 'Cursos voltados à liderança, à organização e ao crescimento profissional.',
    },
    instructor: {
      headline: 'Consultora de operações e estratégia',
      expertise: ['Agilidade', 'operações', 'equipes'],
      verified: true,
      user: {
        firstName: 'Ana',
        lastName: 'Souza',
        bio: 'Atua com melhoria de processos, organização de rotinas e liderança de equipes.',
      },
    },
    requirements: [
      { id: 'req-1', description: 'Indicado para líderes, coordenadores e profissionais de projetos.' },
      { id: 'req-2', description: 'Não exige certificação prévia em metodologias ágeis.' },
    ],
    outcomes: [
      { id: 'out-1', description: 'Organizar ritos e prioridades com clareza.' },
      { id: 'out-2', description: 'Acompanhar entregas sem microgestão.' },
      { id: 'out-3', description: 'Melhorar a colaboração e a previsibilidade da equipe.' },
    ],
    modules: [
      {
        id: 'mod-1',
        title: 'Fundamentos ágeis',
        description: 'Princípios para organizar pessoas e trabalho.',
        lessons: [
          { id: 'les-1', title: 'Backlog, sprint e foco', description: null, videoDuration: 15, isPreview: true },
          { id: 'les-2', title: 'Papéis e cadência', description: null, videoDuration: 18, isPreview: false },
        ],
      },
      {
        id: 'mod-2',
        title: 'Gestão aplicada',
        description: 'Como levar a teoria para a rotina da equipe.',
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
