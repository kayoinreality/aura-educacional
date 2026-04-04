import Link from 'next/link'
import { CourseTabs } from '../components/course-tabs'
import { fetchFromApiOrDefault } from '../lib/api'
import { formatOneDecimal } from '../lib/formatters'
import {
  fallbackCourseListPayload,
  fallbackPublicOverview,
} from '../lib/public-fallback'

type PublicOverview = {
  totals: {
    publishedCourses: number
    totalEnrollments: number
    averagePrice: number
    averageRating: number
    averageHours: number
  }
  categories: Array<{
    id: string
    name: string
    slug: string
    color: string | null
    emoji: string | null
    totalCourses: number
  }>
}

type CourseList = {
  data: Array<{
    id: string
    slug: string
    title: string
    shortDescription: string
    level: string
    language: string
    price: number
    originalPrice: number | null
    isFree: boolean
    totalLessons: number
    totalHours: number
    totalEnrollments: number
    totalRating: number
    totalReviews: number
    category: {
      id: string
      name: string
      slug: string
      color: string | null
    }
    instructor: {
      id: string
      headline: string | null
      user: {
        firstName: string
        lastName: string
        avatarUrl: string | null
      }
    }
  }>
}

const journeySteps = [
  {
    step: '01',
    title: 'Realize seu cadastro',
    description:
      'Crie sua conta com e-mail e senha para acompanhar matrículas, progresso acadêmico e certificados digitais.',
  },
  {
    step: '02',
    title: 'Escolha o curso',
    description:
      'Compare trilhas, carga horária, nível de formação e conteúdos antes de formalizar sua inscrição.',
  },
  {
    step: '03',
    title: 'Conclua a inscrição',
    description:
      'Efetue o pagamento em ambiente seguro e receba acesso imediato à área de estudos assim que a inscrição for confirmada.',
  },
  {
    step: '04',
    title: 'Estude e obtenha sua certificação',
    description:
      'Acompanhe as aulas, realize a avaliação final e emita seu certificado digital ao concluir os requisitos do curso.',
  },
]

const benefitPoints = [
  {
    title: 'Formação completa em um único ambiente',
    description:
      'O estudante realiza matrícula, acompanha aulas, presta avaliação e acessa o certificado sem depender de processos externos.',
  },
  {
    title: 'Proposta acadêmica clara e objetiva',
    description:
      'A página inicial apresenta os cursos livres com linguagem institucional, foco em resultado e informações essenciais para a decisão de compra.',
  },
  {
    title: 'Estrutura preparada para expansão',
    description:
      'A plataforma foi organizada para crescer com novas trilhas, métodos de pagamento e evoluções futuras na experiência do aluno.',
  },
]

const pricingPlans = [
  {
    name: 'Curso avulso',
    price: '79',
    period: 'pagamento único',
    description:
      'Indicado para quem deseja ingressar em uma trilha específica, com acesso integral ao conteúdo adquirido.',
    features: [
      'Acesso a um curso completo',
      'Liberação imediata da área de estudos',
      'Avaliação final incluída',
      'Certificado digital verificável',
    ],
    featured: false,
  },
  {
    name: 'Assinatura Pro',
    price: '39',
    period: 'mensal',
    description:
      'Modalidade recomendada para estudantes que desejam acompanhar o catálogo continuamente e ampliar sua formação.',
    features: [
      'Acesso a todos os cursos publicados',
      'Certificados sem limite de emissão',
      'Inclusão de novas trilhas ao longo do período',
      'Modelo adequado para recorrência',
    ],
    featured: true,
  },
  {
    name: 'Turma corporativa',
    price: 'Sob consulta',
    period: 'proposta personalizada',
    description:
      'Solução voltada a empresas que precisam capacitar equipes com acompanhamento centralizado.',
    features: [
      'Curadoria de trilhas formativas',
      'Gestão por grupo ou equipe',
      'Relatórios de acompanhamento',
      'Suporte de implantação',
    ],
    featured: false,
  },
]

const faqItems = [
  {
    question: 'É necessário criar conta para adquirir um curso?',
    answer:
      'Sim. O cadastro permite vincular a compra à matrícula, registrar o progresso do estudante e emitir o certificado ao final da formação.',
  },
  {
    question: 'O certificado é emitido automaticamente?',
    answer:
      'Sim. Após a conclusão das aulas exigidas e a aprovação na avaliação final, o certificado é disponibilizado automaticamente quando o curso oferece essa certificação.',
  },
  {
    question: 'Posso acessar a plataforma com minha conta Google?',
    answer:
      'Sim. O acesso por conta Google pode ser habilitado para oferecer uma autenticação mais rápida, mantendo a mesma segurança aplicada ao cadastro tradicional.',
  },
]

export const dynamic = 'force-dynamic'
export const runtime = 'edge'

export default async function HomePage() {
  const [overview, courses] = await Promise.all([
    fetchFromApiOrDefault<PublicOverview>('/dashboard/public-overview', fallbackPublicOverview),
    fetchFromApiOrDefault<CourseList>('/courses?page=1&pageSize=18', fallbackCourseListPayload),
  ])

  const apiUnavailable =
    overview === fallbackPublicOverview || courses === fallbackCourseListPayload

  const tabs = [
    { id: 'all', label: 'Todos' },
    ...overview.categories.map((category) => ({
      id: category.slug,
      label: category.name,
    })),
  ]

  const featuredCourse = courses.data[0]

  return (
    <main id="top">
      <section className="hero hero--public">
        <div className="hero-bg" />
        <div className="hero-grid-lines" />

        <div className="container hero-layout">
          <div className="hero-content">
            <div className="hero-tag">
              <span className="tag">Plataforma de cursos livres</span>
            </div>

            <h1 className="serif">
              Formação livre, acesso imediato e certificação digital em uma única experiência
            </h1>

            <p className="hero-sub">
              A Aura Educacional reúne catálogo público, matrícula online, ambiente de estudos,
              avaliação final e emissão de certificado com linguagem clara e proposta acadêmica objetiva.
            </p>

            <div className="hero-actions">
              <Link className="btn btn-primary" href="/cursos">
                Consultar cursos
              </Link>
              <Link className="btn btn-outline" href="/cadastro">
                Criar conta
              </Link>
              <Link className="btn btn-outline" href="/login">
                Entrar
              </Link>
            </div>

            <p className="hero-note mono">
              Matrícula online, acompanhamento individual, avaliação final e certificação digital.
            </p>

            <div className="hero-stats">
              <div>
                <div className="hero-stat-num">{overview.totals.publishedCourses}</div>
                <div className="hero-stat-label">Cursos publicados</div>
              </div>
              <div>
                <div className="hero-stat-num">{overview.totals.totalEnrollments}</div>
                <div className="hero-stat-label">Matrículas registradas</div>
              </div>
              <div>
                <div className="hero-stat-num">{formatOneDecimal(overview.totals.averageRating)}</div>
                <div className="hero-stat-label">Avaliação média</div>
              </div>
            </div>

            {apiUnavailable ? (
              <div className="hero-alert">
                Algumas informações desta vitrine estão em modo demonstrativo e serão atualizadas
                automaticamente quando a integração pública estiver disponível.
              </div>
            ) : null}
          </div>

          <div className="hero-visual">
            {courses.data.slice(0, 3).map((course) => (
              <article key={course.id} className="cert-card">
                <div className="cert-icon">{course.category.name.slice(0, 1)}</div>
                <div className="cert-info">
                  <div className="cert-title">{course.title}</div>
                  <div className="cert-meta">
                    {course.category.name} · {course.totalHours}h · {course.totalLessons} aulas
                  </div>
                </div>
                <div className="cert-badge">{course.isFree ? 'gratuito' : 'acesso imediato'}</div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="marquee-wrap">
        <div className="marquee-track">
          {[...journeySteps, ...journeySteps].map((item, index) => (
            <div className="marquee-item" key={`${item.title}-${index}`}>
              <span className="marquee-dot" />
              <span>
                {item.title} · {item.description}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="journey" id="como-funciona">
        <div className="container">
          <div className="section-header">
            <span className="tag">Jornada do estudante</span>
            <h2 className="section-title serif">Da inscrição à certificação</h2>
            <p className="section-sub">
              A plataforma foi estruturada para apresentar, de forma clara, cada etapa da experiência acadêmica.
            </p>
          </div>

          <div className="journey-grid">
            {journeySteps.map((item) => (
              <article key={item.step} className="journey-card">
                <div className="journey-step mono">{item.step}</div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="categories">
        <div className="container">
          <div className="section-header">
            <span className="tag">Áreas de formação</span>
            <h2 className="section-title serif">Trilhas organizadas por perfil e objetivo</h2>
            <p className="section-sub">
              Cada categoria foi separada para facilitar a comparação entre os percursos formativos disponíveis.
            </p>
          </div>

          <div className="cat-grid">
            {overview.categories.map((category) => (
              <article key={category.id} className="cat-card">
                <div className="cat-emoji">{category.emoji || '•'}</div>
                <div className="cat-name">{category.name}</div>
                <div className="cat-count">{category.totalCourses} cursos disponíveis</div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="courses" id="cursos">
        <div className="container">
          <div className="section-header">
            <span className="tag">Catálogo</span>
            <h2 className="section-title serif">Escolha o curso ideal e prossiga para a matrícula</h2>
            <p className="section-sub">
              As abas por categoria organizam as ofertas e conduzem o visitante para os detalhes, a inscrição e o pagamento.
            </p>
          </div>

          <CourseTabs tabs={tabs} courses={courses.data} />
        </div>
      </section>

      <section className="why" id="certificados">
        <div className="container">
          <div className="why-grid">
            <div className="why-visual">
              <div className="why-cert-preview">
                <div className="cert-preview-header">
                  <div className="cert-preview-logo">Aura Educacional</div>
                  <div className="cert-preview-sub">Certificado de conclusão</div>
                </div>
                <div className="cert-preview-body">
                  <div className="cert-preview-label">Certificamos que</div>
                  <div className="cert-preview-name">Ana Silva</div>
                  <div className="cert-preview-label">concluiu o curso</div>
                  <div className="cert-preview-course">
                    {featuredCourse?.title || 'Prisma para Dashboards e Relatórios'}
                  </div>
                  <div className="cert-preview-hours">
                    Carga horária média: {formatOneDecimal(overview.totals.averageHours)} horas
                  </div>
                </div>
                <div className="cert-preview-footer">
                  <div className="cert-sign">
                    <div className="cert-sign-line" />
                    <div className="cert-sign-label">Diretoria acadêmica</div>
                  </div>
                  <div className="cert-seal">A</div>
                  <div className="cert-hash mono">ID: AE-2026-000847</div>
                </div>
              </div>
            </div>

            <div>
              <div className="section-copy">
                <span className="tag">Certificação</span>
                <h2 className="section-title serif">O certificado integra a proposta pedagógica do curso</h2>
                <p className="section-sub section-sub--left">
                  Mais do que apresentar um curso, a página evidencia o resultado final da formação:
                  aprendizagem validada por avaliação e documento digital verificável.
                </p>
              </div>

              <div className="why-points">
                {benefitPoints.map((point) => (
                  <article key={point.title} className="why-point">
                    <div className="why-icon">✦</div>
                    <div>
                      <div className="why-point-title">{point.title}</div>
                      <div className="why-point-desc">{point.description}</div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pricing" id="planos">
        <div className="container">
          <div className="section-header">
            <span className="tag">Modalidades</span>
            <h2 className="section-title serif">Formatos comerciais disponíveis para a oferta dos cursos</h2>
            <p className="section-sub">
              A experiência pública contempla inscrição individual, recorrência e expansão para turmas corporativas.
            </p>
          </div>

          <div className="pricing-grid">
            {pricingPlans.map((plan) => (
              <article key={plan.name} className={`pricing-card ${plan.featured ? 'featured' : ''}`}>
                {plan.featured ? <div className="pricing-badge">Mais procurado</div> : null}
                <div className="pricing-plan">{plan.name}</div>
                <div className="pricing-price">
                  {plan.price === 'Sob consulta' ? (
                    <span className="price-value price-value--compact">{plan.price}</span>
                  ) : (
                    <>
                      <span className="price-prefix">R$</span>
                      <span className="price-value">{plan.price}</span>
                    </>
                  )}
                </div>
                <div className="price-period">{plan.period}</div>
                <p className="pricing-desc">{plan.description}</p>
                <hr className="pricing-divider" />
                <ul className="pricing-features">
                  {plan.features.map((feature) => (
                    <li key={feature}>
                      <span className="feat-check">✦</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link className={`btn ${plan.featured ? 'btn-primary' : 'btn-outline'}`} href="/cursos">
                  Consultar cursos
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="faq" id="faq">
        <div className="container">
          <div className="section-header">
            <span className="tag">Perguntas frequentes</span>
            <h2 className="section-title serif">Informações essenciais antes da matrícula</h2>
          </div>

          <div className="faq-list">
            {faqItems.map((item) => (
              <details key={item.question} className="faq-item">
                <summary className="faq-question">{item.question}</summary>
                <div className="faq-answer">
                  <div className="faq-answer-inner">{item.answer}</div>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="cta">
        <div className="container">
          <div className="cta-box">
            <div className="tag">Pronto para estudar</div>
            <h2 className="cta-title serif">Toda a jornada do aluno está reunida em uma única plataforma</h2>
            <p className="cta-sub">
              Cadastre-se, selecione seu curso, acompanhe o conteúdo e conclua sua formação com certificação digital.
            </p>
            <div className="hero-actions">
              <Link className="btn btn-primary" href="/cadastro">
                Iniciar agora
              </Link>
              <Link className="btn btn-outline" href="/cursos">
                Ver cursos
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
