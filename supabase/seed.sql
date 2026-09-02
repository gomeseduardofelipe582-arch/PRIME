-- Official catalog seed. No student, enrollment, campaign, goal, or personal data is inserted.
insert into public.course_categories (name, slug, sort_order) values
  ('Cursos Especializados', 'cursos-especializados', 10),
  ('Cursos de CNH', 'cursos-de-cnh', 20),
  ('Cursos Operacionais', 'cursos-operacionais', 30),
  ('NRs', 'nrs', 40),
  ('Extensão / Preparatórios', 'extensao-preparatorios', 50),
  ('EJA', 'eja', 60),
  ('Cursos Técnicos', 'cursos-tecnicos', 70),
  ('Formação Acadêmica', 'formacao-academica', 80)
on conflict (slug) do update set name = excluded.name, sort_order = excluded.sort_order;

insert into public.lead_sources (name, slug, sort_order) values
  ('WhatsApp', 'whatsapp', 10), ('Facebook', 'facebook', 20), ('Instagram', 'instagram', 30),
  ('Google', 'google', 40), ('Indicação', 'indicacao', 50), ('Tráfego Pago', 'trafego-pago', 60),
  ('Prospecção', 'prospeccao', 70), ('Orgânico', 'organico', 80), ('Outro', 'outro', 90)
on conflict (slug) do update set name = excluded.name, sort_order = excluded.sort_order;

-- Prices from TABELA VALORES ATUALIZADOS.pdf are stored as suggested_price. The supplied
-- materials do not identify a separate repass_amount source, therefore repass_amount stays NULL.
insert into public.courses (category_id, name, slug, workload_hours, minimum_completion_days, maximum_completion_days, validity_description, requirements_text, important_notes, suggested_price)
select c.id, seed.name, seed.slug, seed.workload_hours, seed.min_days, seed.max_days, seed.validity, seed.requirements, seed.notes, seed.suggested_price
from public.course_categories c
join (values
  ('cursos-especializados','MOPP - Transporte de Produtos Perigosos','mopp',50,7,60,null,'Maior de 21 anos; CNH válida nas categorias B, C, D ou E; sem impedimentos judiciais.','A prova no DETRAN e a averbação possuem divergência nos materiais e exigem confirmação.',164.27::numeric),
  ('cursos-especializados','Capacitação de Cargas Indivisíveis','cargas-indivisiveis',50,7,60,null,'Maior de 21 anos; CNH válida nas categorias C, D ou E; sem impedimentos judiciais.',null,164.27::numeric),
  ('cursos-especializados','Capacitação de Transporte Escolar','transporte-escolar',50,7,60,null,'Maior de 21 anos; CNH válida nas categorias D ou E; sem impedimentos judiciais.',null,164.27::numeric),
  ('cursos-especializados','Capacitação de Transporte Coletivo de Passageiros','transporte-coletivo-passageiros',50,7,60,null,'Maior de 21 anos; CNH válida nas categorias D ou E; sem impedimentos judiciais.',null,164.27::numeric),
  ('cursos-especializados','Capacitação de Veículo de Emergência','veiculo-emergencia',50,7,60,'5 anos','Maior de 21 anos; CNH válida nas categorias A, B, C, D ou E; sem impedimentos judiciais.',null,164.27::numeric),
  ('cursos-especializados','Capacitação Motofrete','motofrete',30,3,5,'Vitalício','Maior de 21 anos; no mínimo dois anos de CNH categoria A; sem suspensão, cassação ou impedimento judicial.',null,199.00::numeric),
  ('cursos-especializados','Capacitação Mototáxi','mototaxi',30,3,5,'Vitalício','Maior de 21 anos; no mínimo dois anos de CNH categoria A; sem suspensão, cassação ou impedimento judicial.',null,199.00::numeric),
  ('cursos-de-cnh','Reciclagem Condutor Infrator','reciclagem-condutor-infrator',30,3,4,null,'Suspensão, acidente grave com contribuição, condenação por delito de trânsito ou situação de risco no trânsito.','Disponibilidade por estado deve ser confirmada no material oficial.',199.00::numeric),
  ('cursos-de-cnh','Preventivo de Reciclagem','preventivo-reciclagem',30,3,4,null,'Liberação do DETRAN; EAR na CNH; entre 30 e 39 pontos; não ter feito a mesma reciclagem nos últimos 12 meses.','Disponibilidade por estado deve ser confirmada no material oficial.',199.00::numeric),
  ('cursos-de-cnh','Atualização para Renovação de CNH','atualizacao-renovacao-cnh',15,2,3,null,'CNH sem renovação há mais de 3 anos.','Disponibilidade por estado deve ser confirmada no material oficial.',199.00::numeric),
  ('eja','EJA - Conclusão do Ensino Médio','eja-conclusao-ensino-medio',null,null,30,null,'Maior de 19 anos; histórico escolar e série interrompida devem ser confirmados no atendimento.','Certificação em até 30 dias úteis, segundo o material oficial.',346.21::numeric),
  ('formacao-academica','Superior Sequencial','superior-sequencial',null,null,null,null,null,'Não equivale a graduação.',599.00::numeric),
  ('cursos-tecnicos','Técnico por Competência','tecnico-por-competencia',null,null,null,null,'Experiência mínima de um ano na área, análise documental, histórico e diploma do ensino médio.','Prazo de emissão informado entre 25 e 35 dias; requer confirmação.',899.90::numeric),
  ('cursos-tecnicos','Técnico Regular','tecnico-regular',null,180,365,null,'Documentos da formação técnica regular definidos nos materiais oficiais.',null,899.90::numeric),
  ('extensao-preparatorios','APH - Atendimento Pré-Hospitalar','aph',80,2,3,null,null,null,174.90::numeric),
  ('extensao-preparatorios','Direção Defensiva','direcao-defensiva',10,1,2,null,null,null,89.00::numeric),
  ('extensao-preparatorios','Primeiros Socorros','primeiros-socorros',10,1,1,null,null,null,89.00::numeric),
  ('extensao-preparatorios','Monitor Escolar','monitor-escolar',20,2,3,null,null,null,129.90::numeric),
  ('extensao-preparatorios','Taxista','taxista',28,2,3,null,null,'Estado de disponibilidade deve ser confirmado com suporte.',174.90::numeric),
  ('extensao-preparatorios','Percepção de Risco','percepcao-de-risco',2,1,1,null,null,null,199.00::numeric),
  ('extensao-preparatorios','Transporte de Carga Viva','transporte-carga-viva',40,null,null,null,null,'Curso livre; sem tempo mínimo de conclusão.',174.90::numeric),
  ('extensao-preparatorios','Responsabilidade Civil e Criminal','responsabilidade-civil-criminal',4,1,1,null,null,'Complementação para Cargas Indivisíveis.',174.90::numeric),
  ('extensao-preparatorios','Mobilidade Reduzida para Passageiros','mobilidade-reduzida',20,2,3,null,null,'Material informa indisponibilidade para SP.',129.90::numeric),
  ('extensao-preparatorios','Direção Econômica','direcao-economica',40,null,null,null,null,null,174.90::numeric),
  ('nrs','NR 01','nr-01',16,2,2,'2 anos',null,null,149.00::numeric),
  ('nrs','NR 03','nr-03',40,3,3,'2 anos',null,null,149.00::numeric),
  ('nrs','NR 06','nr-06',16,2,2,'2 anos',null,null,64.90::numeric),
  ('nrs','NR 09','nr-09',16,2,2,'2 anos',null,null,149.00::numeric),
  ('nrs','NR 10','nr-10',40,3,3,'2 anos',null,null,149.00::numeric),
  ('nrs','NR 11','nr-11',16,2,2,'1 ano',null,null,64.90::numeric),
  ('nrs','NR 12','nr-12',16,2,2,'2 anos',null,null,149.00::numeric),
  ('nrs','NR 13','nr-13',16,2,2,'2 anos',null,null,null),
  ('nrs','NR 16','nr-16',16,2,2,'2 anos',null,null,64.90::numeric),
  ('nrs','NR 18','nr-18',8,2,2,'2 anos',null,null,null),
  ('nrs','NR 20','nr-20',16,2,2,'2 anos',null,null,64.90::numeric),
  ('nrs','NR 23','nr-23',40,2,2,'2 anos',null,null,149.00::numeric),
  ('nrs','NR 29','nr-29',24,3,3,'2 anos',null,null,149.00::numeric),
  ('nrs','NR 33','nr-33',16,2,2,'1 ano',null,null,149.00::numeric),
  ('nrs','NR 34','nr-34',4,1,1,'2 anos',null,null,149.00::numeric),
  ('nrs','NR 35','nr-35',8,2,2,'2 anos',null,null,64.90::numeric),
  ('cursos-operacionais','Operador de Munck','operador-munck',40,null,null,null,null,'Recomenda NR 11, NR 12 e NR 18.',174.90::numeric),
  ('cursos-operacionais','Operador de Caminhão Fora de Estrada','operador-caminhao-fora-estrada',80,null,null,null,null,null,174.90::numeric),
  ('cursos-operacionais','Operador de Escavadeira Hidráulica','operador-escavadeira-hidraulica',40,null,null,null,null,null,174.90::numeric),
  ('cursos-operacionais','Operador de Empilhadeira','operador-empilhadeira',40,null,null,null,null,null,174.90::numeric),
  ('cursos-operacionais','Operador de Guindaste','operador-guindaste',120,null,null,null,null,'Recomenda NR 18.',174.90::numeric),
  ('cursos-operacionais','Operador de PEMT','operador-pemt',80,null,null,null,null,'Recomenda NR 18.',174.90::numeric),
  ('cursos-operacionais','Operador de Rolos Compactadores','operador-rolos-compactadores',40,null,null,null,null,null,174.90::numeric),
  ('cursos-operacionais','Operador de Ponte Rolante','operador-ponte-rolante',40,null,null,null,null,'Recomenda NR 11.',174.90::numeric),
  ('cursos-operacionais','Operador de Pórtico Rolante','operador-portico-rolante',40,null,null,null,null,null,null),
  ('cursos-operacionais','Manipulador Telescópico','manipulador-telescopico',80,null,null,null,null,null,174.90::numeric),
  ('cursos-operacionais','Operador de Trator de Esteira','operador-trator-esteira',16,null,null,null,null,null,174.90::numeric),
  ('cursos-operacionais','Operador de Grua','operador-grua',120,null,null,null,null,'Recomenda NR 11 e NR 18.',174.90::numeric),
  ('cursos-operacionais','Operador de Colheitadeiras de Grãos','operador-colheitadeiras-graos',60,null,null,null,null,null,174.90::numeric),
  ('cursos-operacionais','Operador de Pá Carregadeira','operador-pa-carregadeira',40,null,null,null,null,null,174.90::numeric),
  ('cursos-operacionais','Operador de Retroescavadeira','operador-retroescavadeira',40,null,null,null,null,null,174.90::numeric),
  ('cursos-operacionais','Motorista de Caminhão Comboio/Lubrificador','motorista-caminhao-comboio-lubrificador',40,null,null,null,null,null,174.90::numeric),
  ('cursos-operacionais','Motorista Operador de Bitrem/Rodotrem','motorista-operador-bitrem-rodotrem',40,null,null,null,'CNH categoria E.',null,174.90::numeric),
  ('cursos-operacionais','Operador de Caminhão Traçado Basculante','operador-caminhao-tracado-basculante',40,null,null,null,null,null,174.90::numeric),
  ('cursos-operacionais','SmartDriver para Motorista de Transportes','smartdriver-motorista-transportes',20,null,null,null,null,null,174.90::numeric),
  ('cursos-operacionais','Instrutor de Master Drive','instrutor-master-drive',120,null,null,null,null,null,249.90::numeric),
  ('cursos-operacionais','Operador de Cesto Aéreo','operador-cesto-aereo',24,null,null,'2 anos',null,null,null)
) as seed(category_slug, name, slug, workload_hours, min_days, max_days, validity, requirements, notes, suggested_price)
on c.slug = seed.category_slug
on conflict (slug) do update set
  category_id = excluded.category_id, name = excluded.name, workload_hours = excluded.workload_hours,
  minimum_completion_days = excluded.minimum_completion_days, maximum_completion_days = excluded.maximum_completion_days,
  validity_description = excluded.validity_description, requirements_text = excluded.requirements_text,
  important_notes = excluded.important_notes, suggested_price = excluded.suggested_price;

insert into public.course_required_fields (course_id, field_key, label, field_type, required, sort_order)
select c.id, seed.field_key, seed.label, seed.field_type, seed.required, seed.sort_order
from public.courses c
join (values
  ('eja-conclusao-ensino-medio','naturalidade','Naturalidade','text',true,10),
  ('eja-conclusao-ensino-medio','ultima_escola','Última escola onde estudou','text',true,20),
  ('eja-conclusao-ensino-medio','ano_estudado','Ano em que estudou','number',true,30),
  ('eja-conclusao-ensino-medio','serie_estudada','Série em que estudou','text',true,40),
  ('eja-conclusao-ensino-medio','cidade_escola','Cidade da escola','text',true,50),
  ('eja-conclusao-ensino-medio','estado_escola','Estado da escola','text',true,60)
) as seed(course_slug, field_key, label, field_type, required, sort_order) on c.slug = seed.course_slug
on conflict (course_id, field_key) do update set label = excluded.label, field_type = excluded.field_type, required = excluded.required, sort_order = excluded.sort_order;

insert into public.course_required_documents (course_id, document_key, label, required, sort_order)
select c.id, seed.document_key, seed.label, seed.required, seed.sort_order
from public.courses c
join (values
  ('eja-conclusao-ensino-medio','foto_3x4','Foto 3x4',true,10),
  ('eja-conclusao-ensino-medio','reservista','Certificado de reservista ou alistamento militar',false,20),
  ('eja-conclusao-ensino-medio','rg_ou_cnh','RG ou CNH (com local de nascimento)',true,30),
  ('eja-conclusao-ensino-medio','cpf','CPF',true,40),
  ('eja-conclusao-ensino-medio','comprovante_endereco','Comprovante de endereço',true,50),
  ('eja-conclusao-ensino-medio','titulo_eleitor','Título de eleitor',true,60),
  ('eja-conclusao-ensino-medio','historico_escolar','Histórico da última série concluída',true,70),
  ('tecnico-regular','foto_3x4','Foto 3x4',true,10),
  ('tecnico-regular','certidao','Certidão de nascimento ou casamento',true,20),
  ('tecnico-regular','cpf_rg_cnh','CPF e RG ou CNH',true,30),
  ('tecnico-regular','titulo_eleitor','Título de eleitor',true,40),
  ('tecnico-regular','reservista','Certificado de reservista',false,50),
  ('tecnico-regular','comprovante_endereco','Comprovante de residência',true,60),
  ('tecnico-regular','historico_certificado_medio','Histórico e certificado do ensino médio',true,70)
) as seed(course_slug, document_key, label, required, sort_order) on c.slug = seed.course_slug
on conflict (course_id, document_key) do update set label = excluded.label, required = excluded.required, sort_order = excluded.sort_order;
