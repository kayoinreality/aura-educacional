'use client'

import { useState } from 'react'
import { API_URL } from '../lib/api'

type DashboardSummary = {
  totals: {
    users: number
    courses: number
    enrollments: number
    payments: number
    revenue: number
  }
  enrollmentStatus: Array<{
    status: string
    total: number
  }>
  paymentMethod: Array<{
    method: string
    total: number
    amount: number
  }>
  topCourses: Array<{
    id: string
    title: string
    slug: string
    totalEnrollments: number
    totalRating: number
    totalReviews: number
  }>
}

export function AdminLoginPanel() {
  const [email, setEmail] = useState('admin@aura.local')
  const [password, setPassword] = useState('Aura@123')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [summary, setSummary] = useState<DashboardSummary | null>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const loginResponse = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          rememberMe: false,
        }),
      })

      const loginPayload = await loginResponse.json()

      if (!loginResponse.ok) {
        throw new Error(loginPayload?.error || 'Falha ao autenticar.')
      }

      const dashboardResponse = await fetch(`${API_URL}/dashboard/summary`, {
        headers: {
          Authorization: `Bearer ${loginPayload.accessToken}`,
        },
      })

      const dashboardPayload = await dashboardResponse.json()

      if (!dashboardResponse.ok) {
        throw new Error(dashboardPayload?.error || 'Falha ao carregar o dashboard protegido.')
      }

      setSummary(dashboardPayload)
    } catch (caughtError) {
      setSummary(null)
      setError(caughtError instanceof Error ? caughtError.message : 'Falha inesperada.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="admin-panel">
      <div className="admin-panel__intro">
        <span className="eyebrow">Area Administrativa</span>
        <h2>Conferir o dashboard protegido da API</h2>
        <p>
          Esse bloco faz login direto contra o backend e traz as metricas protegidas para voce validar
          o fluxo de ponta a ponta.
        </p>
      </div>

      <form className="admin-form" onSubmit={handleSubmit}>
        <label>
          E-mail
          <input value={email} onChange={(event) => setEmail(event.target.value)} />
        </label>
        <label>
          Senha
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
        <button disabled={loading} type="submit">
          {loading ? 'Carregando...' : 'Entrar e buscar metricas'}
        </button>
      </form>

      {error ? <p className="admin-error">{error}</p> : null}

      {summary ? (
        <div className="admin-results">
          <div className="mini-grid">
            <article>
              <span>Usuarios</span>
              <strong>{summary.totals.users}</strong>
            </article>
            <article>
              <span>Cursos</span>
              <strong>{summary.totals.courses}</strong>
            </article>
            <article>
              <span>Matriculas</span>
              <strong>{summary.totals.enrollments}</strong>
            </article>
            <article>
              <span>Receita</span>
              <strong>R$ {summary.totals.revenue.toFixed(2)}</strong>
            </article>
          </div>

          <div className="admin-lists">
            <div>
              <h3>Status de matricula</h3>
              <ul>
                {summary.enrollmentStatus.map((item) => (
                  <li key={item.status}>
                    <span>{item.status}</span>
                    <strong>{item.total}</strong>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3>Top cursos</h3>
              <ul>
                {summary.topCourses.map((course) => (
                  <li key={course.id}>
                    <span>{course.title}</span>
                    <strong>{course.totalEnrollments} alunos</strong>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}
