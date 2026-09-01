export const STATUS_ACTIONS = {
  novo_cadastro: { label: "Ver matrícula", attention: false },
  aguardando_documentos: { label: "Completar documentação", attention: true },
  documentacao_completa: { label: "Preparar envio", attention: true },
  pronto_para_enviar: { label: "Enviar para escola", attention: true },
  enviado_escola: { label: "Ver acompanhamento", attention: false },
  matricula_confirmada: { label: "Ver detalhes", attention: false },
  pendente: { label: "Ver matrícula", attention: true },
  cancelada: { label: "Ver detalhes", attention: false },
};

export function getStatusAction(status) {
  return STATUS_ACTIONS[status] || { label: "Ver matrícula", attention: false };
}
