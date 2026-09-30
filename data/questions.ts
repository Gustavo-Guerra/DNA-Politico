export type Axis =
  | "economy"
  | "customs"
  | "security"
  | "individualFreedom"
  | "nationalism"
  | "institutions";

export type Question = {
  id: number;
  text: string;
  effects: Partial<Record<Axis, number>>;
};

// Concordar aponta para o polo positivo descrito em utils/politics.ts.
export const questions: Question[] = [
  // Economia
  { id: 1, text: "O governo deve manter empresas públicas em setores essenciais, mesmo que isso limite a concorrência privada.", effects: { economy: 3 } },
  { id: 2, text: "Impostos maiores sobre rendas altas são justificáveis para financiar serviços públicos, mesmo que reduzam o retorno de alguns investimentos.", effects: { economy: 3 } },
  { id: 3, text: "Empresas devem poder contratar com menos exigências trabalhistas, mesmo que algumas proteções dos trabalhadores diminuam.", effects: { economy: -3 } },
  { id: 4, text: "O governo deve limitar temporariamente preços de itens básicos durante crises, mesmo que isso possa reduzir a oferta.", effects: { economy: 2 } },
  { id: 5, text: "Serviços públicos deveriam ser substituídos por alternativas privadas quando estas custarem menos, mesmo que o acesso dependa mais da renda.", effects: { economy: -3 } },

  // Costumes
  { id: 6, text: "A legislação civil deve reconhecer igualmente diferentes formas de família, mesmo quando isso diverge de valores defendidos por grupos tradicionais.", effects: { customs: 3 } },
  { id: 7, text: "Casais do mesmo sexo devem ter os mesmos direitos no casamento civil, mesmo quando comunidades religiosas discordem dessa política.", effects: { customs: 2 } },
  { id: 8, text: "A escola deve deixar temas de identidade de gênero e diversidade fora do currículo obrigatório, mesmo que isso limite a discussão desses assuntos em sala.", effects: { customs: -2 } },
  { id: 9, text: "Políticas públicas devem preservar costumes e referências culturais tradicionais, mesmo que isso torne algumas mudanças sociais mais lentas.", effects: { customs: -3 } },
  { id: 10, text: "Pacientes com sofrimento irreversível devem poder solicitar eutanásia voluntária sob critérios médicos e legais, mesmo que isso altere limites tradicionais sobre o fim da vida.", effects: { customs: 2 } },

  // Segurança
  { id: 11, text: "A polícia deve receber mais recursos para operações ostensivas, mesmo que isso reduza verbas disponíveis para prevenção social.", effects: { security: 3 } },
  { id: 12, text: "Penas mais longas para crimes violentos são justificáveis, mesmo que aumentem a população prisional e seus custos.", effects: { security: 3 } },
  { id: 13, text: "Programas de prevenção e reintegração devem ter prioridade sobre o aumento de penas, mesmo que seus resultados demorem a aparecer.", effects: { security: -3 } },
  { id: 14, text: "Câmeras com identificação de pessoas devem ser usadas em áreas de alto risco, mesmo com redução da privacidade nesses locais.", effects: { security: 2 } },
  { id: 15, text: "A polícia deve ser obrigada a obter autorização judicial antes de realizar buscas em residências, mesmo que isso torne algumas operações mais lentas.", effects: { security: -2 } },

  // Liberdade individual
  { id: 16, text: "Adultos devem poder consumir drogas hoje proibidas sob regras de venda e prevenção, mesmo que isso aumente a exposição ao consumo.", effects: { individualFreedom: 3 } },
  { id: 17, text: "O Estado deve restringir discursos que incentivem discriminação, mesmo que isso limite algumas manifestações individuais.", effects: { individualFreedom: -3 } },
  { id: 18, text: "Pessoas devem poder decidir sobre tratamentos médicos sem obrigação estatal, mesmo que algumas escolhas tragam riscos à saúde.", effects: { individualFreedom: 3 } },
  { id: 19, text: "O governo deve exigir licenças e limites mais rígidos para armas, mesmo que isso restrinja a escolha de adultos considerados aptos.", effects: { individualFreedom: -3 } },
  { id: 20, text: "O Estado deve poder exigir medidas de saúde pública em uma epidemia grave, mesmo que isso limite temporariamente escolhas individuais.", effects: { individualFreedom: -2 } },

  // Nacionalismo
  { id: 21, text: "O governo deve priorizar fornecedores nacionais em compras públicas, mesmo quando empresas estrangeiras oferecem preços menores.", effects: { nationalism: 3 } },
  { id: 22, text: "O país deve reduzir a dependência de importações de alimentos e energia, mesmo que a produção local custe mais no curto prazo.", effects: { nationalism: 3 } },
  { id: 23, text: "O país deve aceitar regras internacionais vinculantes para enfrentar problemas globais, mesmo que isso limite decisões do governo nacional.", effects: { nationalism: -3 } },
  { id: 24, text: "A imigração deve ser facilitada para suprir falta de profissionais, mesmo que isso aumente a competição em alguns setores de trabalho.", effects: { nationalism: -3 } },
  { id: 25, text: "Acordos comerciais devem ser mantidos mesmo quando pressionem setores nacionais a competir com produtos importados mais baratos.", effects: { nationalism: -2 } },

  // Instituições
  { id: 26, text: "Decisões de tribunais independentes devem ser respeitadas pelo governo, mesmo quando contrariem a maioria ou o presidente.", effects: { institutions: 3 } },
  { id: 27, text: "O Executivo deve poder acelerar decisões sem revisão do Congresso em situações urgentes, mesmo com menos debate público.", effects: { institutions: -3 } },
  { id: 28, text: "Órgãos de controle devem poder investigar autoridades eleitas, mesmo que isso atrase políticas apoiadas pelo governo.", effects: { institutions: 3 } },
  { id: 29, text: "Uma liderança eleita deve poder contornar instituições que bloqueiem suas promessas, mesmo que essas instituições tenham mandato independente.", effects: { institutions: -3 } },
  { id: 30, text: "Mudanças constitucionais importantes devem exigir apoio de mais de um partido, mesmo que isso dificulte aprovar reformas populares.", effects: { institutions: 2 } },
];
