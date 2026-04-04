import Link from 'next/link'
import { fetchFromApiOrDefault } from '../../lib/api'
import { formatCourseLevel, formatCurrency } from '../../lib/formatters'
import { fallbackCourseListPayload } from '../../lib/public-fallback'

export const runtime = 'edge'

type CourseList = {
  data: Array<{
    id: string
    slug: string
    title: string
    shortDescription: string
    level: string
    totalLessons: number
    totalHours: number
    price: number
    originalPrice: number | null
    isFree: boolean
    category: {
      name: string
    }
    instructor: {
      user: {
        firstName: string
        lastName: string
      }
    }
  }>
}

export default async function CoursesPage() {
  const payload = await fetchFromApiOrDefault<CourseList>(
    '/courses?page=1&pageSize=24',
    fallbackCourseListPayload
  )

  return (
    <main className="app-shell">
      <section className="page-intro">
        <span className="tag">Catálogo</span>
        <h1 className="section-title serif">Selecione um curso e inicie seus estudos</h1>
        <p className="section-sub section-sub--left">
          Consulte as trilhas disponíveis, compare carga horária, nível e proposta de formação antes de realizar sua inscrição.
        </p>
      </section>

      <section className="catalog-grid">
        {payload.data.map((course) => (
          <article key={course.id} className="student-card">
            <span className="student-card__eyebrow">{course.category.name}</span>
            <h2>{course.title}</h2>
            <p>{course.shortDescription}</p>

            <div className="student-card__meta">
              <span>{formatCourseLevel(course.level)}</span>
              <span>{course.totalLessons} aulas</span>
              <span>{course.totalHours}h</span>
            </div>

            <div className="student-card__footer">
              <div>
                <small>Instrutoria</small>
                <strong>
                  {course.instructor.user.firstName} {course.instructor.user.lastName}
                </strong>
              </div>
              <div className="student-card__price">
                {course.originalPrice ? <small>{formatCurrency(course.originalPrice)}</small> : null}
                <strong>{course.isFree ? 'Gratuito' : formatCurrency(course.price)}</strong>
              </div>
            </div>

            <div className="student-card__actions">
              <Link className="public-button public-button--ghost" href={`/cursos/${course.slug}`}>
                Ver detalhes
              </Link>
              <Link className="public-button" href={`/checkout/${course.slug}`}>
                Prosseguir para a compra
              </Link>
            </div>
          </article>
        ))}
      </section>
    </main>
  )
}
