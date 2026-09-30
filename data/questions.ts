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
  { id: 1, text: "Serviços essenciais, como água e energia, deveriam continuar sob controle de empresas públicas?", effects: { economy: 3 } },
  { id: 2, text: "Quem ganha mais deveria pagar mais impostos para ajudar a financiar saúde, educação e outros serviços públicos?", effects: { economy: 3 } },
  { id: 3, text: "As empresas deveriam ter menos regras para contratar funcionários?", effects: { economy: -3 } },
  { id: 4, text: "Em uma crise, o governo deveria poder limitar o preço de itens básicos?", effects: { economy: 2 } },
  { id: 5, text: "Se uma empresa privada fizer o mesmo serviço e gastar menos dinheiro público, o governo deveria contratá-la?", effects: { economy: -3 } },

  // Costumes
  { id: 6, text: "A lei deveria reconhecer vários tipos de família, não só a família tradicional.", effects: { customs: 3 } },
  { id: 7, text: "Casais do mesmo sexo deveriam ter os mesmos direitos no casamento civil.", effects: { customs: 2 } },
  { id: 8, text: "As escolas deveriam evitar aulas obrigatórias sobre identidade de gênero (como cada pessoa se identifica) e diversidade?", effects: { customs: -2 } },
  { id: 9, text: "Vale a pena preservar costumes e tradições, mesmo que a sociedade mude mais devagar?", effects: { customs: -3 } },
  { id: 10, text: "Uma pessoa que sofre sem chance de melhora deveria poder escolher a eutanásia com ajuda médica?", effects: { customs: 2 } },

  // Segurança
  { id: 11, text: "O governo deveria colocar mais policiais nas ruas, mesmo que sobre menos dinheiro para projetos sociais que tentam prevenir crimes?", effects: { security: 3 } },
  { id: 12, text: "Penas mais longas são uma resposta justa para crimes violentos.", effects: { security: 3 } },
  { id: 13, text: "Para reduzir o crime, é melhor prevenir e ajudar quem sai da prisão do que aumentar as penas?", effects: { security: -3 } },
  { id: 14, text: "A polícia deveria poder usar câmeras que reconhecem rostos em lugares onde há muito crime?", effects: { security: 2 } },
  { id: 15, text: "Antes de revistar uma casa, a polícia deveria conseguir autorização de um juiz.", effects: { security: -2 } },

  // Liberdade individual
  { id: 16, text: "Adultos deveriam poder comprar drogas hoje proibidas, com regras para a venda e medidas para reduzir os riscos?", effects: { individualFreedom: 3 } },
  { id: 17, text: "A lei deveria proibir falas que incentivam tratar certos grupos pior, mesmo limitando a liberdade de expressão?", effects: { individualFreedom: -3 } },
  { id: 18, text: "Cada adulto deveria decidir que tratamento médico seguir, mesmo quando houver riscos à saúde.", effects: { individualFreedom: 3 } },
  { id: 19, text: "O acesso a armas deveria ter regras mais rígidas do que as atuais?", effects: { individualFreedom: -3 } },
  { id: 20, text: "Em uma epidemia grave, o governo deveria poder exigir vacinação ou isolamento.", effects: { individualFreedom: -2 } },

  // Nacionalismo
  { id: 21, text: "Nas compras do governo, empresas brasileiras deveriam ter preferência.", effects: { nationalism: 3 } },
  { id: 22, text: "O Brasil deveria produzir seus próprios alimentos e energia, mesmo que custem mais.", effects: { nationalism: 3 } },
  { id: 23, text: "O Brasil deveria aceitar regras internacionais, mesmo quando elas limitam algumas decisões do país?", effects: { nationalism: -3 } },
  { id: 24, text: "Quando faltam profissionais no Brasil, o país deveria facilitar a vinda de trabalhadores de fora, mesmo que mais pessoas passem a disputar as vagas?", effects: { nationalism: -3 } },
  { id: 25, text: "O Brasil deveria manter acordos comerciais e encarar a concorrência de produtos importados mais baratos.", effects: { nationalism: -2 } },

  // Instituições
  { id: 26, text: "O governo deveria respeitar decisões da Justiça, que deve agir sem pressão política, mesmo quando forem contra o presidente ou a maioria?", effects: { institutions: 3 } },
  { id: 27, text: "Em uma emergência, o presidente deveria poder agir antes de o Congresso discutir a decisão.", effects: { institutions: -3 } },
  { id: 28, text: "Quem verifica se o governo está seguindo as regras deveria poder investigar políticos eleitos, mesmo que isso atrase decisões?", effects: { institutions: 3 } },
  { id: 29, text: "Se a Justiça ou outros órgãos impedirem uma promessa de campanha, o presidente deveria poder seguir em frente mesmo assim?", effects: { institutions: -3 } },
  { id: 30, text: "Mudanças importantes na Constituição deveriam ter apoio de mais de um partido?", effects: { institutions: 2 } },
];
