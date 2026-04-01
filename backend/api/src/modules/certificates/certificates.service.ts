import PDFDocument from 'pdfkit'
import { prisma } from '../../database/client'
import { AppError } from '../../utils/errors'

async function getCertificateByCode(code: string) {
  const certificate = await prisma.certificate.findUnique({
    where: { code },
    select: {
      id: true,
      code: true,
      status: true,
      issuedAt: true,
      pdfUrl: true,
      metadata: true,
      user: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      course: {
        select: {
          title: true,
          slug: true,
          totalHours: true,
          certificateHours: true,
          instructor: {
            select: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
      },
    },
  })

  if (!certificate) {
    throw new AppError('Certificate not found.', 404, 'CERTIFICATE_NOT_FOUND')
  }

  return certificate
}

export async function getMyCertificates(userId: string) {
  const certificates = await prisma.certificate.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: 'desc',
    },
    select: {
      id: true,
      code: true,
      status: true,
      issuedAt: true,
      pdfUrl: true,
      course: {
        select: {
          title: true,
          slug: true,
          totalHours: true,
          certificateHours: true,
        },
      },
    },
  })

  return certificates
}

export async function verifyCertificate(code: string) {
  const certificate = await getCertificateByCode(code)

  return {
    code: certificate.code,
    status: certificate.status,
    issuedAt: certificate.issuedAt,
    student: `${certificate.user.firstName} ${certificate.user.lastName}`,
    course: certificate.course.title,
    totalHours: certificate.course.certificateHours ?? certificate.course.totalHours,
    instructor: `${certificate.course.instructor.user.firstName} ${certificate.course.instructor.user.lastName}`,
  }
}

export async function generateCertificatePdf(code: string) {
  const certificate = await getCertificateByCode(code)

  const doc = new PDFDocument({
    size: 'A4',
    layout: 'landscape',
    margin: 48,
  })

  const chunks: Buffer[] = []

  return await new Promise<Buffer>((resolve, reject) => {
    doc.on('data', (chunk) => chunks.push(chunk as Buffer))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    doc.rect(0, 0, doc.page.width, doc.page.height).fill('#f8f3e8')
    doc.rect(24, 24, doc.page.width - 48, doc.page.height - 48).lineWidth(2).stroke('#c9a84c')

    doc.fillColor('#8a6f32').fontSize(18).text('Aura Educacional', 0, 60, { align: 'center' })
    doc.fillColor('#132238').fontSize(32).text('Certificado de Conclusao', 0, 100, { align: 'center' })
    doc.fontSize(14).fillColor('#526176').text('Certificamos que', 0, 170, { align: 'center' })
    doc
      .fontSize(30)
      .fillColor('#132238')
      .text(`${certificate.user.firstName} ${certificate.user.lastName}`, 0, 205, { align: 'center' })
    doc.fontSize(14).fillColor('#526176').text('concluiu com exito o curso', 0, 260, { align: 'center' })
    doc.fontSize(22).fillColor('#8a6f32').text(certificate.course.title, 0, 292, { align: 'center' })
    doc
      .fontSize(13)
      .fillColor('#526176')
      .text(
        `Carga horaria: ${certificate.course.certificateHours ?? certificate.course.totalHours} horas`,
        0,
        340,
        { align: 'center' }
      )

    doc
      .fontSize(12)
      .fillColor('#526176')
      .text(`Codigo de verificacao: ${certificate.code}`, 80, 460)
      .text(`Emitido em: ${certificate.issuedAt?.toLocaleDateString('pt-BR') ?? '-'}`, 80, 482)

    doc
      .fontSize(12)
      .fillColor('#526176')
      .text(
        `${certificate.course.instructor.user.firstName} ${certificate.course.instructor.user.lastName}`,
        560,
        460
      )
      .text('Instrutor responsavel', 560, 482)

    doc.end()
  })
}
