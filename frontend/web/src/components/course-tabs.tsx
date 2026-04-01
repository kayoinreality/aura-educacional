'use client'

import { useState } from 'react'

type Course = {
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
}

type Tab = {
  id: string
  label: string
}

function levelLabel(level: string) {
  if (level === 'BEGINNER') return 'Iniciante'
  if (level === 'INTERMEDIATE') return 'Intermediario'
  return 'Avancado'
}

function colorForCourse(course: Course) {
  const category = course.category.slug.toLowerCase()

  if (category.includes('tech') || category.includes('dados')) {
    return 'linear-gradient(135deg, #1d4ed8 0%, #0f172a 100%)'
  }

  if (category.includes('gest') || category.includes('negoc')) {
    return 'linear-gradient(135deg, #c9a84c 0%, #3b2f12 100%)'
  }

  if (category.includes('design') || category.includes('cri')) {
    return 'linear-gradient(135deg, #7c3aed 0%, #1f103e 100%)'
  }

  return 'linear-gradient(135deg, #0f766e 0%, #092f2c 100%)'
}

export function CourseTabs({
  tabs,
  courses,
}: {
  tabs: Tab[]
  courses: Course[]
}) {
  const [activeTab, setActiveTab] = useState(tabs[0]?.id ?? 'all')

  const filteredCourses =
    activeTab === 'all'
      ? courses
      : courses.filter((course) => course.category.slug === activeTab)

  return (
    <>
      <div className="courses-controls">
        <div className="filter-pills" role="tablist" aria-label="Tipos de curso">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`pill ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
              aria-selected={activeTab === tab.id}
              role="tab"
              type="button"
            >
              {tab.label}
            </button>
          ))}
        </div>

        <a className="btn btn-outline" href="/cursos">
          Ver catálogo completo
        </a>
      </div>

      <div className="courses-grid">
        {filteredCourses.map((course) => (
          <article key={course.id} className="course-card" data-cat={course.category.slug}>
            <div className="course-thumb">
              <div className="course-thumb-bg" style={{ background: colorForCourse(course) }}>
                <span>{course.category.name.slice(0, 1)}</span>
              </div>
              <div className="course-cert-badge">Certificado</div>
            </div>

            <div className="course-body">
              <div className="course-cat-tag">{course.category.name}</div>
              <h3 className="course-title">{course.title}</h3>
              <p className="course-desc">{course.shortDescription}</p>
            </div>

            <div className="course-footer">
              <div className="course-meta">
                <div className="course-meta-item">{levelLabel(course.level)}</div>
                <div className="course-meta-item">{course.totalHours}h</div>
                <div className="course-meta-item">{course.totalLessons} aulas</div>
              </div>

              <div className="course-price">
                {course.originalPrice ? (
                  <span className="price-old">R$ {course.originalPrice.toFixed(2)}</span>
                ) : null}
                <span className="price-main">
                  {course.isFree ? 'Gratis' : `R$ ${course.price.toFixed(0)}`}
                </span>
              </div>
            </div>

            <div className="course-actions">
              <a className="public-button public-button--ghost" href={`/cursos/${course.slug}`}>
                Ver curso
              </a>
              <a className="public-button" href={`/checkout/${course.slug}`}>
                Ir para checkout
              </a>
            </div>
          </article>
        ))}

        {filteredCourses.length === 0 ? (
          <article className="course-card course-card--empty">
            <div className="course-body">
              <div className="course-cat-tag">Catalogo</div>
              <h3 className="course-title">Nenhum curso nesta trilha agora</h3>
              <p className="course-desc">
                Assim que a API devolver cursos dessa categoria, a aba sera preenchida automaticamente.
              </p>
            </div>
          </article>
        ) : null}
      </div>
    </>
  )
}
