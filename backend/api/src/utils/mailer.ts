import nodemailer from 'nodemailer'
import { env } from '../config/env'
import { logger } from './logger'

type SupportedTemplate = 'welcome-verify' | 'password-reset' | 'password-reset-confirmed'

type TemplateData = Record<string, string | number | undefined>

interface SendEmailInput {
  to: string
  template: SupportedTemplate
  data: TemplateData
}

let transporter: nodemailer.Transporter | null = null

function getTransporter() {
  if (transporter) {
    return transporter
  }

  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth:
      env.SMTP_USER && env.SMTP_PASSWORD
        ? {
            user: env.SMTP_USER,
            pass: env.SMTP_PASSWORD,
          }
        : undefined,
  })

  return transporter
}

function renderTemplate(template: SupportedTemplate, data: TemplateData) {
  if (template === 'welcome-verify') {
    const subject = 'Confirme seu e-mail'
    const text = `Olá ${data.firstName}, confirme seu e-mail em: ${data.verifyUrl}`
    return { subject, text }
  }

  if (template === 'password-reset') {
    const subject = 'Redefinição de senha'
    const text = `Olá ${data.firstName}, redefina sua senha em: ${data.resetUrl}. Esse link expira em ${data.expiresMinutes} minutos.`
    return { subject, text }
  }

  const subject = 'Senha alterada com sucesso'
  const text = `Olá ${data.firstName}, sua senha foi atualizada com sucesso.`
  return { subject, text }
}

export async function sendEmail(input: SendEmailInput) {
  const rendered = renderTemplate(input.template, input.data)

  if (
    env.EMAIL_TRANSPORT_MODE !== 'smtp' ||
    !env.SMTP_HOST ||
    !env.EMAIL_FROM ||
    !env.SMTP_USER ||
    !env.SMTP_PASSWORD
  ) {
    logger.info({
      event: 'email.skipped',
      reason: 'transport_disabled',
      to: input.to,
      template: input.template,
      preview: rendered.text,
    })
    return
  }

  const transport = getTransporter()
  await transport.sendMail({
    from: env.EMAIL_FROM,
    to: input.to,
    subject: rendered.subject,
    text: rendered.text,
  })

  logger.info({ event: 'email.sent', to: input.to, template: input.template })
}
