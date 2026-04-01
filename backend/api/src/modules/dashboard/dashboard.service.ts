import { prisma } from '../../database/client'

export async function getDashboardSummary() {
  const [
    totalUsers,
    totalCourses,
    totalEnrollments,
    totalPayments,
    totalRevenue,
    enrollmentStatus,
    paymentMethod,
    topCourses,
  ] = await Promise.all([
    prisma.user.count({ where: { deletedAt: null } }),
    prisma.course.count(),
    prisma.enrollment.count(),
    prisma.payment.count({ where: { status: 'PAID' } }),
    prisma.payment.aggregate({
      where: { status: 'PAID' },
      _sum: { amount: true },
    }),
    prisma.enrollment.groupBy({
      by: ['status'],
      _count: { _all: true },
    }),
    prisma.payment.groupBy({
      by: ['method'],
      where: { status: 'PAID' },
      _count: { _all: true },
      _sum: { amount: true },
    }),
    prisma.course.findMany({
      take: 5,
      orderBy: [{ totalEnrollments: 'desc' }, { totalRating: 'desc' }],
      select: {
        id: true,
        title: true,
        slug: true,
        totalEnrollments: true,
        totalRating: true,
        totalReviews: true,
      },
    }),
  ])

  return {
    totals: {
      users: totalUsers,
      courses: totalCourses,
      enrollments: totalEnrollments,
      payments: totalPayments,
      revenue: Number(totalRevenue._sum.amount ?? 0),
    },
    enrollmentStatus: enrollmentStatus.map((item) => ({
      status: item.status,
      total: item._count._all,
    })),
    paymentMethod: paymentMethod.map((item) => ({
      method: item.method,
      total: item._count._all,
      amount: Number(item._sum.amount ?? 0),
    })),
    topCourses,
  }
}

export async function getPublicDashboardOverview() {
  const [courseLevels, categories, highlights] = await Promise.all([
    prisma.course.groupBy({
      by: ['level'],
      where: { status: 'PUBLISHED' },
      _count: { _all: true },
      _avg: { price: true, totalRating: true },
    }),
    prisma.category.findMany({
      where: {
        isActive: true,
        courses: {
          some: {
            status: 'PUBLISHED',
          },
        },
      },
      orderBy: [{ order: 'asc' }, { name: 'asc' }],
      select: {
        id: true,
        name: true,
        slug: true,
        color: true,
        emoji: true,
        _count: {
          select: {
            courses: {
              where: {
                status: 'PUBLISHED',
              },
            },
          },
        },
      },
    }),
    prisma.course.aggregate({
      where: { status: 'PUBLISHED' },
      _count: { _all: true },
      _avg: { price: true, totalRating: true, totalHours: true },
      _sum: { totalEnrollments: true },
    }),
  ])

  return {
    totals: {
      publishedCourses: highlights._count._all,
      totalEnrollments: highlights._sum.totalEnrollments ?? 0,
      averagePrice: Number(highlights._avg.price ?? 0),
      averageRating: Number(highlights._avg.totalRating ?? 0),
      averageHours: Number(highlights._avg.totalHours ?? 0),
    },
    courseLevels: courseLevels.map((item) => ({
      level: item.level,
      total: item._count._all,
      averagePrice: Number(item._avg.price ?? 0),
      averageRating: Number(item._avg.totalRating ?? 0),
    })),
    categories: categories.map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      color: category.color,
      emoji: category.emoji,
      totalCourses: category._count.courses,
    })),
  }
}
