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
  { id: 1, text: "Água e energia deveriam ser controladas por empresas públicas?", effects: { economy: 3 } },
  { id: 2, text: "Quem ganha mais deveria pagar mais impostos para bancar serviços públicos?", effects: { economy: 3 } },
  { id: 3, text: "Empresas deveriam ter menos regras para contratar funcionários?", effects: { economy: -3 } },
  { id: 4, text: "Em uma crise, o governo deveria impedir aumentos no preço de produtos básicos?", effects: { economy: 2 } },
  { id: 5, text: "Se uma empresa privada fizer o mesmo serviço cobrando menos, o governo deveria contratá-la?", effects: { economy: -3 } },

  // Costumes
  { id: 6, text: "A lei deveria reconhecer diferentes tipos de família?", effects: { customs: 3 } },
  { id: 7, text: "Casais do mesmo sexo deveriam ter os mesmos direitos de casamento que casais heterossexuais?", effects: { customs: 2 } },
  { id: 8, text: "Escolas deveriam evitar aulas obrigatórias sobre gênero e diversidade?", effects: { customs: -2 } },
  { id: 9, text: "Costumes tradicionais deveriam ser preservados mesmo quando a sociedade muda?", effects: { customs: -3 } },
  { id: 10, text: "Doentes sem cura deveriam poder escolher eutanásia com ajuda médica?", effects: { customs: 2 } },

  // Segurança
  { id: 11, text: "O governo deveria investir mais em polícia do que em projetos sociais para prevenir crimes?", effects: { security: 3 } },
  { id: 12, text: "Crimes violentos deveriam ter penas mais longas?", effects: { security: 3 } },
  { id: 13, text: "Para reduzir o crime, é melhor prevenir e ajudar ex-presos do que aumentar penas?", effects: { security: -3 } },
  { id: 14, text: "A polícia deveria usar câmeras corporais durante o dia a dia?", effects: { security: 2 } },
  { id: 15, text: "A polícia deveria pedir autorização a um juiz para revistar uma casa?", effects: { security: -2 } },

  // Liberdade individual
  { id: 16, text: "Adultos deveriam ter o direito de comprar drogas (maconha, cocaína, etc.) legalmente sob fiscalização?", effects: { individualFreedom: 3 } },
  { id: 17, text: "A lei deveria proibir falas que defendem discriminar grupos?", effects: { individualFreedom: -3 } },
  { id: 18, text: "Um adulto deveria poder recusar um tratamento recomendado pelos médicos?", effects: { individualFreedom: 3 } },
  { id: 19, text: "Deveria ser mais difícil comprar ou ter uma arma?", effects: { individualFreedom: -3 } },
  { id: 20, text: "Em uma epidemia grave, o governo deveria exigir vacina ou isolamento?", effects: { individualFreedom: -2 } },

  // Nacionalismo
  { id: 21, text: "Quando o governo compra produtos ou serviços, deveria dar preferência a empresas brasileiras?", effects: { nationalism: 3 } },
  { id: 22, text: "O Brasil deveria produzir toda sua comida e energia, sem necessidade de importações?", effects: { nationalism: 3 } },
  { id: 23, text: "O Brasil deveria seguir acordos internacionais mesmo quando eles limitam decisões do governo?", effects: { nationalism: -3 } },
  { id: 24, text: "Se faltarem profissionais em qualquer área, o Brasil deveria trazer estrangeiros para essas vagas?", effects: { nationalism: -3 } },
  { id: 25, text: "O Brasil deveria continuar comprando produtos de outros países, mesmo quando eles são mais baratos e competem com empresas brasileiras?", effects: { nationalism: -2 } },

  // Instituições
  { id: 26, text: "O governo deveria cumprir decisões da Justiça mesmo quando elas desagradam o presidente ou a maioria da população?", effects: { institutions: 3 } },
  { id: 27, text: "Em uma emergência, o presidente deveria agir antes de consultar o Congresso?", effects: { institutions: -3 } },
  { id: 28, text: "Órgãos de fiscalização deveriam poder investigar políticos eleitos?", effects: { institutions: 3 } },
  { id: 29, text: "O presidente deveria ignorar a Justiça para cumprir uma promessa de campanha?", effects: { institutions: -3 } },
  { id: 30, text: "Para mudar a Constituição, deveria ser preciso apoio de mais de um partido?", effects: { institutions: 2 } },
];
