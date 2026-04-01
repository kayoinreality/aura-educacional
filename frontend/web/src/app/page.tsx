import Link from 'next/link'
import { CourseTabs } from '../components/course-tabs'
import { fetchFromApiOrDefault } from '../lib/api'

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

const emptyOverview: PublicOverview = {
  totals: {
    publishedCourses: 0,
    totalEnrollments: 0,
    averagePrice: 0,
    averageRating: 0,
    averageHours: 0,
  },
  categories: [],
}

const emptyCourses: CourseList = {
  data: [],
}

const journeySteps = [
  {
    step: '01',
    title: 'Crie sua conta',
    description:
      'Cadastro simples por e-mail e senha, com opção de login Google assim que a chave estiver configurada.',
  },
  {
    step: '02',
    title: 'Escolha o curso',
    description:
      'Navegue por trilhas, veja carga horária, nível, aulas e diferenciais antes de seguir para o checkout.',
  },
  {
    step: '03',
    title: 'Pague com segurança',
    description:
      'Fluxo preparado para cartão, PIX e boleto, com modo mock em desenvolvimento e integração Stripe depois.',
  },
  {
    step: '04',
    title: 'Estude e conclua',
    description:
      'Área do aluno com progresso por aula, avaliação final e emissão automática de certificado ao concluir.',
  },
]

const benefitPoints = [
  {
    title: 'Experiência completa do aluno',
    description:
      'A jornada pública agora cobre entrada, compra, estudo, avaliação e certificado sem depender do admin.',
  },
  {
    title: 'Cursos livres com argumento comercial',
    description:
      'A home comunica catálogo, resultado profissional e prova de conclusão de um jeito mais vendável.',
  },
  {
    title: 'Pronto para evoluir em produção',
    description:
      'O backend já expõe rotas reais para matrícula, progresso, avaliação e certificado, facilitando deploy posterior.',
  },
]

const pricingPlans = [
  {
    name: 'Curso Avulso',
    price: '79',
    period: 'pagamento único',
    description: 'Ideal para quem quer entrar em uma trilha específica com acesso vitalício.',
    features: [
      '1 curso completo',
      'Área de estudos liberada na hora',
      'Avaliação final incluída',
      'Certificado digital verificável',
    ],
    featured: false,
  },
  {
    name: 'Assinatura Pro',
    price: '39',
    period: 'por mês',
    description: 'Acesso recorrente ao catálogo para estudar em ritmo contínuo.',
    features: [
      'Todos os cursos publicados',
      'Certificados ilimitados',
      'Novas trilhas ao longo do tempo',
      'Ideal para recorrência em produção',
    ],
    featured: true,
  },
  {
    name: 'Turma Corporativa',
    price: 'Sob consulta',
    period: 'plano sob medida',
    description: 'Formato pensado para times que querem capacitação e acompanhamento centralizado.',
    features: [
      'Curadoria de trilhas',
      'Gestão por equipe',
      'Relatórios de progresso',
      'Suporte de implantação',
    ],
    featured: false,
  },
]

const faqItems = [
  {
    question: 'Preciso criar conta para comprar um curso?',
    answer:
      'Sim. O login garante vínculo da compra com a matrícula, progresso, avaliação e certificado emitido depois.',
  },
  {
    question: 'O certificado sai automaticamente?',
    answer:
      'Sim. Quando o aluno conclui as aulas exigidas, passa na avaliação e o curso possui certificado habilitado, a emissão acontece automaticamente.',
  },
  {
    question: 'O login com Google já está pronto?',
    answer:
      'A infraestrutura está preparada. Para ativar de verdade, eu ainda preciso do seu GOOGLE_CLIENT_ID público e da configuração OAuth correspondente.',
  },
]

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const [overview, courses] = await Promise.all([
    fetchFromApiOrDefault<PublicOverview>('/dashboard/public-overview', emptyOverview),
    fetchFromApiOrDefault<CourseList>('/courses?page=1&pageSize=18', emptyCourses),
  ])

  const apiUnavailable = overview.totals.publishedCourses === 0 && courses.data.length === 0

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
              Aprenda, pague, estude, faça a avaliação e emita seu certificado no mesmo lugar
            </h1>

            <p className="hero-sub">
              A Aura Educacional agora está desenhada para o público final: catálogo comercial,
              checkout, área do aluno, prova final e certificado digital verificável.
            </p>

            <div className="hero-actions">
              <Link className="btn btn-primary" href="/cursos">
                Ver catálogo
              </Link>
              <Link className="btn btn-outline" href="/cadastro">
                Criar conta
              </Link>
              <Link className="btn btn-outline" href="/login">
                Entrar
              </Link>
            </div>

            <p className="hero-note mono">
              frontend/web · backend/api · PostgreSQL · Prisma · Redis · certificados em PDF
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
                <div className="hero-stat-num">{overview.totals.averageRating.toFixed(1)}</div>
                <div className="hero-stat-label">Avaliação média</div>
              </div>
            </div>

            {apiUnavailable ? (
              <div className="hero-alert">
                A estrutura pública já está pronta. Assim que a API estiver online, o catálogo volta a
                carregar os dados reais automaticamente.
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
                <div className="cert-badge">{course.isFree ? 'livre' : 'acesso imediato'}</div>
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
            <span className="tag">Jornada do aluno</span>
            <h2 className="section-title serif">Do primeiro acesso ao certificado</h2>
            <p className="section-sub">
              O site público agora mostra claramente como a plataforma funciona para o aluno final.
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
            <span className="tag">Categorias</span>
            <h2 className="section-title serif">Trilhas organizadas por perfil e objetivo</h2>
            <p className="section-sub">
              Cada categoria vira uma aba na vitrine para o público comparar caminhos de estudo com mais
              clareza.
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
            <h2 className="section-title serif">Escolha por tipo de curso e siga direto para o checkout</h2>
            <p className="section-sub">
              As abas já usam dados reais da API e conduzem a navegação para detalhes, matrícula e compra.
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
                    Carga horária média: {overview.totals.averageHours.toFixed(1)} horas
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
                <span className="tag">Valor percebido</span>
                <h2 className="section-title serif">O certificado virou parte central da proposta do produto</h2>
                <p className="section-sub section-sub--left">
                  Além de vender o curso, a home agora vende o resultado final: uma experiência completa
                  de formação com prova e documento verificável.
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
            <span className="tag">Oferta</span>
            <h2 className="section-title serif">Formatos comerciais para vender a plataforma</h2>
            <p className="section-sub">
              A experiência pública já comporta desde curso avulso até assinatura e expansão futura.
            </p>
          </div>

          <div className="pricing-grid">
            {pricingPlans.map((plan) => (
              <article key={plan.name} className={`pricing-card ${plan.featured ? 'featured' : ''}`}>
                {plan.featured ? <div className="pricing-badge">Mais popular</div> : null}
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
                  Explorar cursos
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="faq" id="faq">
        <div className="container">
          <div className="section-header">
            <span className="tag">FAQ</span>
            <h2 className="section-title serif">Dúvidas comuns antes da matrícula</h2>
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
            <div className="tag">Pronto para uso</div>
            <h2 className="cta-title serif">A base pública da plataforma já cobre a jornada completa do aluno</h2>
            <p className="cta-sub">
              Cadastre-se, escolha um curso, conclua a jornada e acompanhe seus certificados em uma mesma
              experiência.
            </p>
            <div className="hero-actions">
              <Link className="btn btn-primary" href="/cadastro">
                Começar agora
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
