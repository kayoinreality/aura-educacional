import { prisma } from '../../database/client'
import { ensureRedisConnection, redis } from '../../config/redis'

type DatabaseInfoRow = {
  database_name: string
  server_version: string
}

export async function getAdminOverview() {
  await ensureRedisConnection()

  const [databaseInfoRows, tableCounts, usersByRole, usersByStatus, recentUsers, recentPayments] =
    await Promise.all([
      prisma.$queryRaw<DatabaseInfoRow[]>`
        SELECT current_database()::text AS database_name, version()::text AS server_version
      `,
      Promise.all([
        prisma.user.count({ where: { deletedAt: null } }),
        prisma.instructorProfile.count(),
        prisma.category.count(),
        prisma.course.count(),
        prisma.module.count(),
        prisma.lesson.count(),
        prisma.enrollment.count(),
        prisma.payment.count(),
        prisma.certificate.count(),
        prisma.notification.count(),
      ]),
      prisma.user.groupBy({
        by: ['role'],
        where: { deletedAt: null },
        _count: { _all: true },
      }),
      prisma.user.groupBy({
        by: ['status'],
        where: { deletedAt: null },
        _count: { _all: true },
      }),
      prisma.user.findMany({
        where: { deletedAt: null },
        orderBy: { createdAt: 'desc' },
        take: 8,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          status: true,
          city: true,
          state: true,
          createdAt: true,
          emailVerified: true,
          lastLoginAt: true,
        },
      }),
      prisma.payment.findMany({
        orderBy: { createdAt: 'desc' },
        take: 6,
        select: {
          id: true,
          amount: true,
          currency: true,
          status: true,
          method: true,
          createdAt: true,
          paidAt: true,
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      }),
    ])

  const redisPing = await redis.ping()
  const databaseInfo = databaseInfoRows[0]

  const [
    users,
    instructorProfiles,
    categories,
    courses,
    modules,
    lessons,
    enrollments,
    payments,
    certificates,
    notifications,
  ] = tableCounts

  return {
    services: {
      database: 'up',
      redis: redisPing === 'PONG' ? 'up' : 'degraded',
    },
    database: {
      name: databaseInfo?.database_name ?? 'unknown',
      version: databaseInfo?.server_version ?? 'unknown',
      tables: [
        { name: 'users', total: users },
        { name: 'instructor_profiles', total: instructorProfiles },
        { name: 'categories', total: categories },
        { name: 'courses', total: courses },
        { name: 'modules', total: modules },
        { name: 'lessons', total: lessons },
        { name: 'enrollments', total: enrollments },
        { name: 'payments', total: payments },
        { name: 'certificates', total: certificates },
        { name: 'notifications', total: notifications },
      ],
    },
    users: {
      total: users,
      byRole: usersByRole.map((item) => ({
        role: item.role,
        total: item._count._all,
      })),
      byStatus: usersByStatus.map((item) => ({
        status: item.status,
        total: item._count._all,
      })),
      recent: recentUsers,
    },
    recentPayments: recentPayments.map((payment) => ({
      ...payment,
      amount: Number(payment.amount),
    })),
  }
}
