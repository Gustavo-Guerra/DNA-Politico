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
  { id: 1, text: "Setores essenciais deveriam continuar nas mãos de empresas públicas.", effects: { economy: 3 } },
  { id: 2, text: "Quem ganha mais deveria pagar mais impostos para ajudar a bancar serviços públicos.", effects: { economy: 3 } },
  { id: 3, text: "Empresas deveriam ter mais liberdade para contratar, mesmo com menos regras trabalhistas.", effects: { economy: -3 } },
  { id: 4, text: "Em crises, o governo deveria poder segurar o preço de itens básicos.", effects: { economy: 2 } },
  { id: 5, text: "Se uma empresa privada fizer o mesmo serviço gastando menos dinheiro público, ela deveria assumir essa função?", effects: { economy: -3 } },

  // Costumes
  { id: 6, text: "A lei deveria reconhecer vários tipos de família, não só a família tradicional.", effects: { customs: 3 } },
  { id: 7, text: "Casais do mesmo sexo deveriam ter os mesmos direitos no casamento civil.", effects: { customs: 2 } },
  { id: 8, text: "Identidade de gênero e diversidade não deveriam fazer parte das aulas obrigatórias na escola.", effects: { customs: -2 } },
  { id: 9, text: "Preservar costumes e tradições vale a pena, mesmo quando mudanças sociais ficam mais lentas.", effects: { customs: -3 } },
  { id: 10, text: "Quem tem sofrimento irreversível deveria poder escolher a eutanásia com acompanhamento médico.", effects: { customs: 2 } },

  // Segurança
  { id: 11, text: "O governo deveria colocar mais policiais nas ruas, mesmo com menos dinheiro para prevenção social.", effects: { security: 3 } },
  { id: 12, text: "Penas mais longas são uma resposta justa para crimes violentos.", effects: { security: 3 } },
  { id: 13, text: "Para reduzir o crime, prevenção e apoio a quem sai da prisão deveriam vir antes de penas maiores.", effects: { security: -3 } },
  { id: 14, text: "A polícia deveria poder usar reconhecimento facial em locais com altos índices de criminalidade?", effects: { security: 2 } },
  { id: 15, text: "Antes de revistar uma casa, a polícia deveria conseguir autorização de um juiz.", effects: { security: -2 } },

  // Liberdade individual
  { id: 16, text: "Adultos deveriam poder comprar drogas hoje proibidas, com regras claras para a venda e prevenção.", effects: { individualFreedom: 3 } },
  { id: 17, text: "A lei deveria barrar falas que incentivam discriminação, mesmo que isso limite a liberdade de expressão.", effects: { individualFreedom: -3 } },
  { id: 18, text: "Cada adulto deveria decidir que tratamento médico seguir, mesmo quando houver riscos à saúde.", effects: { individualFreedom: 3 } },
  { id: 19, text: "O acesso a armas deveria ter regras mais rígidas do que as atuais?", effects: { individualFreedom: -3 } },
  { id: 20, text: "Em uma epidemia grave, o governo deveria poder exigir vacinação ou isolamento.", effects: { individualFreedom: -2 } },

  // Nacionalismo
  { id: 21, text: "Nas compras do governo, empresas brasileiras deveriam ter preferência.", effects: { nationalism: 3 } },
  { id: 22, text: "O Brasil deveria produzir seus próprios alimentos e energia, mesmo que custem mais.", effects: { nationalism: 3 } },
  { id: 23, text: "Para enfrentar problemas globais, o Brasil deveria aceitar acordos que limitem algumas decisões nacionais.", effects: { nationalism: -3 } },
  { id: 24, text: "Quando faltam profissionais, o Brasil deveria facilitar a entrada de trabalhadores estrangeiros, mesmo com mais disputa por vagas.", effects: { nationalism: -3 } },
  { id: 25, text: "O Brasil deveria manter acordos comerciais e encarar a concorrência de produtos importados mais baratos.", effects: { nationalism: -2 } },

  // Instituições
  { id: 26, text: "O governo deve respeitar decisões de tribunais independentes, mesmo quando contrariem o presidente ou a maioria.", effects: { institutions: 3 } },
  { id: 27, text: "Em uma emergência, o presidente deveria poder agir antes de o Congresso discutir a decisão.", effects: { institutions: -3 } },
  { id: 28, text: "Quem fiscaliza o governo deveria poder investigar políticos eleitos, mesmo que isso atrase decisões do governo.", effects: { institutions: 3 } },
  { id: 29, text: "O presidente deveria poder cumprir promessas de campanha mesmo quando elas entram em conflito com decisões de instituições independentes?", effects: { institutions: -3 } },
  { id: 30, text: "Mudanças importantes na Constituição deveriam contar com apoio de mais de um partido.", effects: { institutions: 2 } },
];
