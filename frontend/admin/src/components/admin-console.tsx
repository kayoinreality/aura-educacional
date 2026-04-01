'use client'

import { useEffect, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import { API_URL } from '../lib/api'

type AdminOverview = {
  services: {
    database: string
    redis: string
  }
  database: {
    name: string
    version: string
    tables: Array<{
      name: string
      total: number
    }>
  }
  users: {
    total: number
    byRole: Array<{
      role: string
      total: number
    }>
    byStatus: Array<{
      status: string
      total: number
    }>
    recent: Array<{
      id: string
      email: string
      firstName: string
      lastName: string
      role: string
      status: string
      city: string | null
      state: string | null
      createdAt: string
      emailVerified: string | null
      lastLoginAt: string | null
    }>
  }
  recentPayments: Array<{
    id: string
    amount: number
    currency: string
    status: string
    method: string
    createdAt: string
    paidAt: string | null
    user: {
      firstName: string
      lastName: string
      email: string
    }
  }>
}

type UsersResponse = {
  data: Array<{
    id: string
    email: string
    firstName: string
    lastName: string
    role: string
    status: string
    city: string | null
    state: string | null
    createdAt: string
    emailVerified: string | null
    lastLoginAt: string | null
  }>
}

const roleColors = ['#1d4ed8', '#0f766e', '#ea580c', '#7c3aed']
const statusColors = ['#16a34a', '#2563eb', '#dc2626', '#f59e0b']

function formatDate(value: string | null) {
  if (!value) return 'Nunca'
  return new Date(value).toLocaleString('pt-BR')
}

export function AdminConsole() {
  const [email, setEmail] = useState('admin@aura.local')
  const [password, setPassword] = useState('Aura@123')
  const [token, setToken] = useState<string | null>(null)
  const [overview, setOverview] = useState<AdminOverview | null>(null)
  const [users, setUsers] = useState<UsersResponse['data']>([])
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function authenticateAndLoad(shouldPersistToken = true) {
    setLoading(true)
    setError(null)

    try {
      const loginResponse = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          rememberMe: false,
        }),
      })

      const loginPayload = await loginResponse.json()

      if (!loginResponse.ok) {
        throw new Error(loginPayload?.error || 'Nao foi possivel autenticar.')
      }

      const accessToken = loginPayload.accessToken as string

      if (shouldPersistToken) {
        setToken(accessToken)
      }

      const [overviewResponse, usersResponse] = await Promise.all([
        fetch(`${API_URL}/admin/overview`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }),
        fetch(`${API_URL}/users?page=1&pageSize=12`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }),
      ])

      const overviewPayload = await overviewResponse.json()
      const usersPayload = await usersResponse.json()

      if (!overviewResponse.ok) {
        throw new Error(overviewPayload?.error || 'Falha ao carregar visao do banco.')
      }

      if (!usersResponse.ok) {
        throw new Error(usersPayload?.error || 'Falha ao carregar usuarios.')
      }

      setOverview(overviewPayload)
      setUsers(usersPayload.data)
    } catch (caughtError) {
      setOverview(null)
      setUsers([])
      setToken(null)
      setError(caughtError instanceof Error ? caughtError.message : 'Falha inesperada.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  async function handleRefresh() {
    if (!token) return

    setRefreshing(true)
    setError(null)

    try {
      const [overviewResponse, usersResponse] = await Promise.all([
        fetch(`${API_URL}/admin/overview`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        fetch(`${API_URL}/users?page=1&pageSize=12`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      ])

      const overviewPayload = await overviewResponse.json()
      const usersPayload = await usersResponse.json()

      if (!overviewResponse.ok) {
        throw new Error(overviewPayload?.error || 'Falha ao atualizar o painel.')
      }

      if (!usersResponse.ok) {
        throw new Error(usersPayload?.error || 'Falha ao atualizar usuarios.')
      }

      setOverview(overviewPayload)
      setUsers(usersPayload.data)
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Falha inesperada.')
    } finally {
      setRefreshing(false)
    }
  }

  useEffect(() => {
    void authenticateAndLoad(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <main className="admin-shell">
      <section className="admin-hero">
        <div>
          <span className="eyebrow">Painel Administrativo</span>
          <h1>Banco de dados, usuarios e operacao em uma visualizacao separada do site publico</h1>
          <p>
            Este app fica em um frontend proprio e conversa apenas com endpoints protegidos do backend.
            Ele foi pensado para dar leitura rapida da saude do banco e da base de usuarios.
          </p>
        </div>

        <form
          className="login-card"
          onSubmit={(event) => {
            event.preventDefault()
            void authenticateAndLoad(true)
          }}
        >
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
          <div className="login-card__actions">
            <button disabled={loading} type="submit">
              {loading ? 'Entrando...' : 'Entrar no painel'}
            </button>
            <button
              className="ghost-button"
              disabled={!token || refreshing}
              onClick={() => void handleRefresh()}
              type="button"
            >
              {refreshing ? 'Atualizando...' : 'Atualizar dados'}
            </button>
          </div>
          {error ? <p className="error-text">{error}</p> : null}
        </form>
      </section>

      {overview ? (
        <>
          <section className="status-grid">
            <article className="status-card">
              <span>Banco</span>
              <strong>{overview.services.database}</strong>
              <small>{overview.database.name}</small>
            </article>
            <article className="status-card">
              <span>Redis</span>
              <strong>{overview.services.redis}</strong>
              <small>cache e sessoes</small>
            </article>
            <article className="status-card">
              <span>Usuarios</span>
              <strong>{overview.users.total}</strong>
              <small>cadastros ativos na base</small>
            </article>
            <article className="status-card">
              <span>Tabelas monitoradas</span>
              <strong>{overview.database.tables.length}</strong>
              <small>visao operacional principal</small>
            </article>
          </section>

          <section className="chart-grid">
            <article className="panel">
              <div className="panel__heading">
                <span className="eyebrow">Distribuicao por papel</span>
                <h2>Usuarios por role</h2>
              </div>
              <div className="chart-box">
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={overview.users.byRole}
                      dataKey="total"
                      nameKey="role"
                      innerRadius={60}
                      outerRadius={96}
                    >
                      {overview.users.byRole.map((item, index) => (
                        <Cell key={item.role} fill={roleColors[index % roleColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </article>

            <article className="panel">
              <div className="panel__heading">
                <span className="eyebrow">Status da base</span>
                <h2>Usuarios por status</h2>
              </div>
              <div className="chart-box">
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={overview.users.byStatus}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(15, 23, 42, 0.08)" />
                    <Tooltip />
                    <Bar dataKey="total" radius={[10, 10, 0, 0]}>
                      {overview.users.byStatus.map((item, index) => (
                        <Cell key={item.status} fill={statusColors[index % statusColors.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </article>
          </section>

          <section className="split-grid">
            <article className="panel">
              <div className="panel__heading">
                <span className="eyebrow">Banco monitorado</span>
                <h2>Contagem das principais tabelas</h2>
                <p>{overview.database.version}</p>
              </div>
              <div className="table-grid">
                {overview.database.tables.map((table) => (
                  <div key={table.name} className="metric-box">
                    <span>{table.name}</span>
                    <strong>{table.total}</strong>
                  </div>
                ))}
              </div>
            </article>

            <article className="panel">
              <div className="panel__heading">
                <span className="eyebrow">Financeiro recente</span>
                <h2>Pagamentos mais recentes</h2>
              </div>
              <ul className="activity-list">
                {overview.recentPayments.map((payment) => (
                  <li key={payment.id}>
                    <div>
                      <strong>
                        {payment.user.firstName} {payment.user.lastName}
                      </strong>
                      <span>{payment.user.email}</span>
                    </div>
                    <div className="activity-list__meta">
                      <strong>R$ {payment.amount.toFixed(2)}</strong>
                      <span>
                        {payment.method} · {payment.status}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </article>
          </section>

          <section className="panel">
            <div className="panel__heading">
              <span className="eyebrow">Usuarios recentes</span>
              <h2>Cadastros e acessos</h2>
            </div>
            <div className="users-table">
              <div className="users-table__head">
                <span>Nome</span>
                <span>Perfil</span>
                <span>Status</span>
                <span>Localizacao</span>
                <span>Criado em</span>
                <span>Ultimo login</span>
              </div>
              {users.map((user) => (
                <div key={user.id} className="users-table__row">
                  <span>
                    <strong>
                      {user.firstName} {user.lastName}
                    </strong>
                    <small>{user.email}</small>
                  </span>
                  <span>{user.role}</span>
                  <span>{user.status}</span>
                  <span>{user.city || '-'} / {user.state || '-'}</span>
                  <span>{formatDate(user.createdAt)}</span>
                  <span>{formatDate(user.lastLoginAt)}</span>
                </div>
              ))}
            </div>
          </section>
        </>
      ) : (
        <section className="panel panel--empty">
          <h2>Aguardando autenticacao administrativa</h2>
          <p>
            Use as credenciais de administrador para carregar a visao do banco de dados e dos usuarios.
          </p>
        </section>
      )}
    </main>
  )
}
