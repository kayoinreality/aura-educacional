const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

const integerFormatter = new Intl.NumberFormat('pt-BR', {
  maximumFractionDigits: 0,
})

const oneDecimalFormatter = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})

export function formatCurrency(value: number) {
  return currencyFormatter.format(value)
}

export function formatPercent(value: number) {
  return `${integerFormatter.format(value)}%`
}

export function formatOneDecimal(value: number) {
  return oneDecimalFormatter.format(value)
}

export function formatCourseLevel(level: string) {
  if (level === 'BEGINNER') return 'Iniciante'
  if (level === 'INTERMEDIATE') return 'Intermediário'
  if (level === 'ADVANCED') return 'Avançado'
  return 'Nível não informado'
}

export function formatEnrollmentStatus(status: string) {
  if (status === 'ACTIVE') return 'Em andamento'
  if (status === 'COMPLETED') return 'Concluído'
  if (status === 'PENDING') return 'Pendente'
  if (status === 'CANCELLED') return 'Cancelado'
  return status
}

export function formatPaymentMethod(method: string) {
  if (method === 'CREDIT_CARD') return 'Cartão de crédito'
  if (method === 'PIX') return 'Pix'
  if (method === 'BOLETO') return 'Boleto bancário'
  return method
}

export function formatPaymentStatus(status: string) {
  if (status === 'PAID') return 'Pago'
  if (status === 'PENDING') return 'Pendente'
  if (status === 'PROCESSING') return 'Em processamento'
  if (status === 'FAILED') return 'Não autorizado'
  return status
}
