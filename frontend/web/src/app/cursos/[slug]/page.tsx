import Link from 'next/link'
import { fetchFromApiOrDefault } from '../../../lib/api'
import { formatCourseLevel, formatCurrency } from '../../../lib/formatters'
import { getFallbackCourseDetail } from '../../../lib/public-fallback'

export const runtime = 'edge'

type CourseDetail = {
  slug: string
  title: string
  shortDescription: string
  description: string
  level: string
  language: string
  price: number
  originalPrice: number | null
  isFree: boolean
  hasCertificate: boolean
  certificateHours: number | null
  totalLessons: number
  totalHours: number
  tags: string[]
  category: {
    name: string
    description: string | null
  }
  instructor: {
    headline: string | null
    expertise: string[]
    verified: boolean
    user: {
      firstName: string
      lastName: string
      bio: string | null
    }
  }
  requirements: Array<{
    id: string
    description: string
  }>
  outcomes: Array<{
    id: string
    description: string
  }>
  modules: Array<{
    id: string
    title: string
    description: string | null
    lessons: Array<{
      id: string
      title: string
      description: string | null
      videoDuration: number | null
      isPreview: boolean
    }>
  }>
}

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const course = await fetchFromApiOrDefault<CourseDetail>(
    `/courses/${slug}`,
    getFallbackCourseDetail(slug)
  )

  return (
    <main className="app-shell">
      <section className="course-hero">
        <div>
          <span className="tag">{course.category.name}</span>
          <h1 className="section-title serif">{course.title}</h1>
          <p className="section-sub section-sub--left">{course.shortDescription}</p>

          <div className="student-card__meta student-card__meta--wide">
            <span>{formatCourseLevel(course.level)}</span>
            <span>{course.language}</span>
            <span>{course.totalLessons} aulas</span>
            <span>{course.totalHours}h</span>
            {course.hasCertificate ? <span>Certificado incluído</span> : null}
          </div>

          <div className="course-hero__actions">
            <Link className="public-button" href={`/checkout/${course.slug}`}>
              Prosseguir para a inscrição
            </Link>
            <Link className="public-button public-button--ghost" href="/cursos">
              Voltar ao catálogo
            </Link>
          </div>
        </div>

        <aside className="checkout-card">
          <span className="checkout-card__eyebrow">Investimento</span>
          {course.originalPrice ? <small>{formatCurrency(course.originalPrice)}</small> : null}
          <strong>{course.isFree ? 'Gratuito' : formatCurrency(course.price)}</strong>
          <p>{course.description}</p>
        </aside>
      </section>

      <section className="details-grid">
        <article className="student-card">
          <h2>O que você aprenderá</h2>
          <ul className="bullet-list">
            {course.outcomes.map((item) => (
              <li key={item.id}>{item.description}</li>
            ))}
          </ul>
        </article>

        <article className="student-card">
          <h2>Requisitos recomendados</h2>
          <ul className="bullet-list">
            {course.requirements.map((item) => (
              <li key={item.id}>{item.description}</li>
            ))}
          </ul>
        </article>
      </section>

      <section className="student-card">
        <h2>Conteúdo programático</h2>
        <div className="module-listing">
          {course.modules.map((module) => (
            <article key={module.id} className="module-card">
              <h3>{module.title}</h3>
              <p>{module.description}</p>
              <ul className="bullet-list">
                {module.lessons.map((lesson) => (
                  <li key={lesson.id}>
                    {lesson.title}
                    {lesson.isPreview ? ' · aula de demonstração' : ''}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}
