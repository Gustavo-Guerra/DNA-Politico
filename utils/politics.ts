import type { Axis, Question } from "@/data/questions";

export const answerOptions = [
  "Concordo muito",
  "Concordo",
  "Concordo um pouco",
  "Discordo um pouco",
  "Discordo",
  "Discordo muito",
] as const;

export type Answer = (typeof answerOptions)[number];
export type Scores = Record<Axis, number>;

export const scoreMap: Record<Answer, number> = {
  "Concordo muito": 3,
  Concordo: 2,
  "Concordo um pouco": 1,
  "Discordo um pouco": -1,
  Discordo: -2,
  "Discordo muito": -3,
};

const previousAnswerScores: Record<string, number> = {
  "Concordo plenamente": 3,
  "Concordo parcialmente": 1,
  "Discordo parcialmente": -1,
  "Discordo plenamente": -3,
};

export const axisInfo: { key: Axis; label: string; low: string; high: string }[] = [
  { key: "economy", label: "Economia", low: "Mercado", high: "Estado" },
  { key: "customs", label: "Costumes", low: "Tradicional", high: "Progressista" },
  { key: "security", label: "Segurança", low: "Prevenção e garantias", high: "Policiamento e punição" },
  { key: "individualFreedom", label: "Liberdade Individual", low: "Regulação", high: "Autonomia" },
  { key: "nationalism", label: "Nacionalismo", low: "Cooperação global", high: "Soberania nacional" },
  { key: "institutions", label: "Instituições", low: "Liderança direta", high: "Freios e regras" },
];

export const archetypes = [
  { name: "Social Democrata", description: "Combina proteção social e serviços públicos amplos com reformas graduais e instituições democráticas.", phrase: "Uma sociedade mais justa amplia as oportunidades de todos.", target: { economy: 0.7, customs: 0.25, security: -0.25, individualFreedom: 0.2, nationalism: -0.1, institutions: 0.75 } },
  { name: "Liberal de Mercado", description: "Confia na concorrência, na iniciativa privada e em regras previsíveis para ampliar escolhas.", phrase: "Liberdade para criar; regras claras para competir.", target: { economy: -0.8, customs: 0.2, security: -0.1, individualFreedom: 0.65, nationalism: -0.35, institutions: 0.45 } },
  { name: "Progressista Comunitário", description: "Apoia inclusão, direitos civis e ação coletiva para reduzir desigualdades.", phrase: "Direitos avançam quando ninguém fica para trás.", target: { economy: 0.55, customs: 0.85, security: -0.35, individualFreedom: 0.45, nationalism: -0.25, institutions: 0.55 } },
  { name: "Conservador Tradicional", description: "Valoriza continuidade cultural, vínculos comunitários e mudanças cautelosas.", phrase: "Mudar com cuidado também é proteger o que importa.", target: { economy: -0.2, customs: -0.8, security: 0.45, individualFreedom: -0.2, nationalism: 0.5, institutions: 0.35 } },
  { name: "Libertário Civil", description: "Defende escolhas pessoais e limites firmes à interferência do Estado.", phrase: "Liberdade também é poder escolher o próprio caminho.", target: { economy: -0.55, customs: 0.2, security: -0.25, individualFreedom: 0.9, nationalism: -0.5, institutions: 0.25 } },
  { name: "Punitivista", description: "Prioriza policiamento ostensivo e sanções firmes para responder ao crime.", phrase: "Segurança é poder viver sem medo.", target: { economy: -0.1, customs: -0.25, security: 0.9, individualFreedom: -0.6, nationalism: 0.35, institutions: -0.25 } },
  { name: "Nacional Desenvolvimentista", description: "Defende planejamento público e indústria forte para ampliar a autonomia econômica do país.", phrase: "Um país forte também produz o próprio futuro.", target: { economy: 0.8, customs: 0.05, security: 0.25, individualFreedom: -0.2, nationalism: 0.85, institutions: 0.35 } },
  { name: "Soberanista Popular", description: "Prioriza soberania nacional e decisões políticas guiadas diretamente pela vontade popular.", phrase: "Os rumos do país devem ser decididos por quem vive nele.", target: { economy: 0.25, customs: 0.2, security: 0.2, individualFreedom: 0.1, nationalism: 0.9, institutions: -0.7 } },
  { name: "Liberal Institucional", description: "Defende liberdades civis, pluralismo e controles independentes sobre o poder.", phrase: "O poder é mais legítimo quando encontra limites.", target: { economy: -0.25, customs: 0.35, security: -0.25, individualFreedom: 0.65, nationalism: -0.35, institutions: 0.9 } },
  { name: "Centro Reformista", description: "Prefere melhorias graduais, negociação e decisões guiadas por resultados.", phrase: "Avançar com equilíbrio também é avançar.", target: { economy: 0.15, customs: 0.1, security: 0.05, individualFreedom: 0.1, nationalism: 0, institutions: 0.45 } },
  { name: "Ecologista Global", description: "Valoriza cooperação entre países e uma transição sustentável com justiça social.", phrase: "Problemas sem fronteiras pedem respostas em comum.", target: { economy: 0.35, customs: 0.4, security: -0.15, individualFreedom: 0.3, nationalism: -0.8, institutions: 0.65 } },
  { name: "Comunitarista Local", description: "Confia em comunidades e governos próximos para resolver problemas e fortalecer vínculos.", phrase: "Boas mudanças começam perto de casa.", target: { economy: 0.25, customs: -0.2, security: 0.25, individualFreedom: -0.15, nationalism: 0.3, institutions: 0.55 } },
  { name: "Tecnocrata de Ordem", description: "Prioriza gestão especializada, estabilidade institucional e segurança pública.", phrase: "Decidir bem exige método, responsabilidade e resultados.", target: { economy: 0.15, customs: 0, security: 0.6, individualFreedom: -0.35, nationalism: 0.2, institutions: 0.85 } },
  { name: "Anarquista Individual", description: "Desconfia de hierarquias e concentrações de poder; prioriza autonomia e cooperação voluntária.", phrase: "Menos tutela, mais autonomia compartilhada.", target: { economy: -0.55, customs: 0.2, security: -0.8, individualFreedom: 0.9, nationalism: -0.45, institutions: -0.8 } },
  { name: "Social Conservador", description: "Combina proteção econômica com valores tradicionais e ênfase na segurança.", phrase: "Cuidar da comunidade também é preservar seus vínculos.", target: { economy: 0.55, customs: -0.75, security: 0.5, individualFreedom: -0.4, nationalism: 0.45, institutions: 0.35 } },
  { name: "Moderado Pluralista", description: "Busca conciliar diferenças, proteger regras comuns e manter o diálogo político.", phrase: "Conviver não exige pensar igual.", target: { economy: 0, customs: 0, security: -0.05, individualFreedom: 0.15, nationalism: -0.2, institutions: 0.65 } },
] as const;

export function calculateScores(questions: Question[], answers: (Answer | null)[]): Scores {
  const totals: Scores = {
    economy: 0,
    customs: 0,
    security: 0,
    individualFreedom: 0,
    nationalism: 0,
    institutions: 0,
  };

  questions.forEach((question, index) => {
    const answer = answers[index];
    if (!answer) return;
    const answerScore = scoreMap[answer] ?? previousAnswerScores[answer];
    if (!Number.isFinite(answerScore)) return;
    (Object.keys(question.effects) as Axis[]).forEach((axis) => {
      const weight = question.effects[axis] ?? 0;
      if (Number.isFinite(weight)) totals[axis] += weight * answerScore;
    });
  });

  return totals;
}

export function getAxisPercent(axis: Axis, score: number, questions: Question[]): number {
  if (!Number.isFinite(score)) return 50;
  const max = questions.reduce((sum, question) => {
    const weight = question.effects[axis] ?? 0;
    return Number.isFinite(weight) ? sum + Math.abs(weight) * 3 : sum;
  }, 0);
  if (!Number.isFinite(max) || !max) return 50;
  return Math.max(0, Math.min(100, Math.round(((score / max + 1) / 2) * 100)));
}

export function getPoliticalPosition(scores: Scores, questions: Question[]): string {
  const normalized = (axis: Axis) => {
    const max = questions.reduce((sum, question) => sum + Math.abs(question.effects[axis] ?? 0) * 3, 0);
    return max ? scores[axis] / max : 0;
  };

  // A síntese usa apenas economia (Estado à esquerda) e costumes (progressista à esquerda).
  const leftRight = (normalized("economy") + normalized("customs")) / 2;

  // Os eixos normalizados variam de -1 a 1; a média também fica nesse intervalo.
  // Reservamos |leftRight| >= 0.75 para posições extremas, exigindo inclinação forte
  // combinada em Economia e Costumes. A faixa central existente permanece estreita.
  if (leftRight >= 0.75) return "Extrema-esquerda";
  if (leftRight <= -0.75) return "Extrema-direita";
  if (leftRight >= 0.45) return "Esquerda";
  if (leftRight <= -0.45) return "Direita";
  if (leftRight >= 0.15) return "Centro-esquerda";
  if (leftRight <= -0.15) return "Centro-direita";
  return "Centro";
}

export function getArchetype(scores: Scores, questions: Question[]) {
  const normalized = Object.fromEntries(
    (Object.keys(scores) as Axis[]).map((axis) => {
      const max = questions.reduce((sum, question) => sum + Math.abs(question.effects[axis] ?? 0) * 3, 0);
      return [axis, max ? scores[axis] / max : 0];
    }),
  ) as Scores;

  return archetypes.reduce((closest, candidate) => {
    const distance = (item: (typeof archetypes)[number]) =>
      (Object.keys(normalized) as Axis[]).reduce(
        (sum, axis) => sum + (normalized[axis] - item.target[axis]) ** 2,
        0,
      );
    return distance(candidate) < distance(closest) ? candidate : closest;
  }, archetypes[0]);
}

export function getArchetypeSimilarities(scores: Scores, questions: Question[]) {
  const axes = Object.keys(scores) as Axis[];
  const normalized = Object.fromEntries(
    axes.map((axis) => {
      const max = questions.reduce((sum, question) => sum + Math.abs(question.effects[axis] ?? 0) * 3, 0);
      return [axis, max ? scores[axis] / max : 0];
    }),
  ) as Scores;
  const maxDistance = Math.sqrt(axes.length * 4);

  return archetypes
    .map((archetype) => {
      const distance = Math.sqrt(
        axes.reduce((sum, axis) => sum + (normalized[axis] - archetype.target[axis]) ** 2, 0),
      );

      return {
        archetype,
        distance,
        compatibility: Math.round((1 - distance / maxDistance) * 100),
      };
    })
    .sort((left, right) => left.distance - right.distance);
}
