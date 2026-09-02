# Revisão de dados oficiais

Este registro impede que o catálogo persistente transforme divergências documentais em regras de negócio silenciosas. O seed preserva `NULL` para repasse enquanto não houver uma fonte identificada como repasse.

| Produto/campo | Fonte | Valores conflitantes ou lacuna | Confirmação necessária |
| --- | --- | --- | --- |
| MOPP - procedimento após conclusão | `CURSOS ESPECIALIZADOS.pdf`, p. 1-2 | Regra geral menciona prova no DETRAN; a seção MOPP também afirma averbação automática sem prova. | Confirmar procedimento operacional vigente por curso e estado. |
| Veículo de emergência - renovação | `CURSOS ESPECIALIZADOS.pdf`, p. 4-5 | Renovação exige certificado prévio de “cargas indivisíveis”, embora seja renovação de veículo de emergência. | Confirmar qual certificado prévio é aceito. |
| Técnico por competência - emissão | `CURSOS ACADEMICOS.pdf`, p. 2 | “Até 30 dias” e “25 a 35 dias”. | Confirmar prazo comercial a apresentar. |
| Valores financeiros | `TABELA VALORES ATUALIZADOS.pdf` | O arquivo apresenta “valores” e parcelas, mas não rotula cada valor como repasse. | Confirmar a fonte específica de repasse e manter `repass_amount` nulo até então. |
| NR 12 na tabela | `TABELA VALORES ATUALIZADOS.pdf` | NR 12 aparece duas vezes no agrupamento de R$ 149,00. | Confirmar se é duplicação editorial. |
| Catálogo operacional | Artes, `CURSOS OPERACIONAIS.pdf`, tabela de valores | Pórtico Rolante e Cesto Aéreo não têm preço individual explícito; os nomes também variam entre artes/tabela. | Confirmar disponibilidade e enquadramento comercial antes de vender. |

## Regra aplicada

- PDFs oficiais são a fonte para cursos, requisitos, documentos, prazos e valores apresentados.
- Nenhuma informação ausente foi inferida; os campos permanecem nulos quando necessário.
- O seed não cria alunos, matrículas, campanhas, metas ou documentos fictícios.
