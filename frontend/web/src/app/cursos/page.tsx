import Link from 'next/link'
import { fetchFromApiOrDefault } from '../../lib/api'

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
  const payload = await fetchFromApiOrDefault<CourseList>('/courses?page=1&pageSize=24', {
    data: [],
  })

  return (
    <main className="app-shell">
      <section className="page-intro">
        <span className="tag">Catalogo</span>
        <h1 className="section-title serif">Escolha um curso e comece a estudar hoje</h1>
        <p className="section-sub section-sub--left">
          Explore o catalogo publico da plataforma, compare trilhas e siga para checkout quando encontrar
          o curso ideal.
        </p>
      </section>

      <section className="catalog-grid">
        {payload.data.map((course) => (
          <article key={course.id} className="student-card">
            <span className="student-card__eyebrow">{course.category.name}</span>
            <h2>{course.title}</h2>
            <p>{course.shortDescription}</p>

            <div className="student-card__meta">
              <span>{course.level}</span>
              <span>{course.totalLessons} aulas</span>
              <span>{course.totalHours}h</span>
            </div>

            <div className="student-card__footer">
              <div>
                <small>Instrutor(a)</small>
                <strong>
                  {course.instructor.user.firstName} {course.instructor.user.lastName}
                </strong>
              </div>
              <div className="student-card__price">
                {course.originalPrice ? <small>R$ {course.originalPrice.toFixed(2)}</small> : null}
                <strong>{course.isFree ? 'Gratis' : `R$ ${course.price.toFixed(2)}`}</strong>
              </div>
            </div>

            <div className="student-card__actions">
              <Link className="public-button public-button--ghost" href={`/cursos/${course.slug}`}>
                Ver detalhes
              </Link>
              <Link className="public-button" href={`/checkout/${course.slug}`}>
                Comprar
              </Link>
            </div>
          </article>
        ))}
      </section>
    </main>
  )
}
