import { APP_TITLE } from './index'

export const APP_MESSAGES = {
  genericError: 'Ocorreu um erro e sua solicitação não pode ser atendida. Por favor, tente novamente',
  wrongUserPassword: 'Usuário e/ou senha incorretos',
  noCredit: 'Você não possui créditos. Para poder estacionar, adiquira créditos para sua conta.',
  newVersionAvailable: 'Existe uma nova versão disponível. Para continuar, atualize o app.',
  irregularityFound: 'Este veículo possui uma irregularidade. Para continuar estacionando, você pode adquirir períodos extras.',
  hasIrregularities: `Este veículo possui irregularidades. Instale o app ${APP_TITLE} e regularize a situação.`,
  ticketActive: 'Um novo ticket só pode ser criado após a expiração do ticket atual.',
  ticketExpired: 'Este ticket venceu e não pode mais ser revalidado. Abra um novo ticket para o veículo.',
  ticketHasMaxValidity: 'A validade deste ticket já é a máxima do dia.',
  ticketOutOfRevalidationPeriod: 'O período para revalidação é 5 minutos após a criação ou 5 antes do vencimento do ticket.',
  sendTicketSuccess: 'Os dados do ticket foram enviados.',
  sendTicketError: 'Não conseguimos enviar os dados. Por favor, contate nossa equipe.',
  parkingFree: 'Este veículo está cadastrado como isento da taxa de estacionamento.'
}
export const PAYMENT_MESSAGES_TITLE = [
  'OK',
  'Pagamento Negado',
  'Pagamento Cancelado',
  'Falha no Processamento',
  'Erro desconhecido'
]
export const PAYMENT_MESSAGES = [
  'OK',
  'O pagamento foi recusado pela admistradora. Para obter maiores detalhes, por favor, contate a administradora do seu cartão.',
  'A operação foi cancelada.',
  'Ocorreu um erro ao processar o pagamento. Por favor, tente novamente.',
  'Ocorreu um erro ao processar o pagamento. Por favor, tente novamente.'
]
