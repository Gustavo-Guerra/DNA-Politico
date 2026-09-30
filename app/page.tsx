"use client";

import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  CircleCheck,
  CircleX,
  ChevronDown,
  Clock3,
  Compass,
  Coffee,
  Copy,
  Dna,
  Factory,
  Feather,
  Flag,
  Gauge,
  Handshake,
  House,
  KeyRound,
  Landmark,
  Leaf,
  MessagesSquare,
  Scale,
  Settings2,
  Shield,
  TrendingUp,
  TreePine,
  Users,
  type LucideIcon,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { questions } from "@/data/questions";
import { answerOptions, axisInfo, calculateScores, getArchetype, getArchetypeSimilarities, getAxisPercent, getPoliticalPosition, type Answer } from "@/utils/politics";
import type { Axis } from "@/data/questions";

type Stage = "home" | "quiz" | "result";

const axisIcons: Record<Axis, LucideIcon> = {
  economy: TrendingUp,
  customs: Users,
  security: Shield,
  individualFreedom: KeyRound,
  nationalism: Flag,
  institutions: Landmark,
};

const archetypeIcons: Record<string, LucideIcon> = {
  "Social Democrata": Landmark,
  "Liberal de Mercado": TrendingUp,
  "Progressista Comunitário": Users,
  "Conservador Tradicional": TreePine,
  "Libertário Civil": KeyRound,
  Punitivista: Shield,
  "Nacional Desenvolvimentista": Factory,
  "Soberanista Popular": Flag,
  "Liberal Institucional": Scale,
  "Centro Reformista": Compass,
  "Ecologista Global": Leaf,
  "Comunitarista Local": House,
  "Tecnocrata de Ordem": Gauge,
  "Anarquista Individual": Feather,
  "Social Conservador": Handshake,
  "Moderado Pluralista": MessagesSquare,
};

const homeProfiles = [
  { name: "Centro Reformista", description: "Mudanças graduais, negociação e foco em resultados.", examples: ["Tancredo Neves", "Fernando Henrique Cardoso", "John Maynard Keynes", "Angela Merkel"] },
  { name: "Social Democrata", description: "Mercado com forte proteção social e redução de desigualdades.", examples: ["Lula", "Olof Palme", "Willy Brandt", "Franklin D. Roosevelt"] },
  { name: "Liberal de Mercado", description: "Economia mais livre e menor intervenção estatal.", examples: ["Roberto Campos", "Javier Milei", "Friedrich Hayek", "Milton Friedman", "Margaret Thatcher"] },
  { name: "Progressista Comunitário", description: "Inclusão social, diversidade e fortalecimento coletivo.", examples: ["Marina Silva", "Jane Addams", "Martin Luther King Jr.", "Wangari Maathai"] },
  { name: "Conservador Tradicional", description: "Preservação de valores, costumes e instituições sociais.", examples: ["Jair Bolsonaro", "Edmund Burke", "Michael Oakeshott", "Ronald Reagan"] },
  { name: "Libertário Civil", description: "Máxima autonomia individual e pouca intervenção do Estado.", examples: ["John Stuart Mill", "Benjamin Constant", "Maria Lacerda de Moura", "Benjamin Tucker"] },
  { name: "Punitivista", description: "Segurança pública baseada em punição e policiamento rigorosos.", examples: ["Jair Bolsonaro", "Nayib Bukele", "James Q. Wilson", "William Bratton"] },
  { name: "Nacional Desenvolvimentista", description: "Crescimento econômico com protagonismo nacional.", examples: ["Leonel Brizola", "Ciro Gomes", "Celso Furtado", "Juscelino Kubitschek"] },
  { name: "Soberanista Popular", description: "Ênfase em soberania nacional e liderança popular.", examples: ["Enéas Carneiro", "Donald Trump", "Simón Bolívar", "Thomas Jefferson"] },
  { name: "Liberal Institucional", description: "Liberdades individuais com forte respeito às instituições.", examples: ["Fernando Henrique Cardoso", "José Serra", "James Madison", "Ulysses Guimarães"] },
  { name: "Ecologista Global", description: "Sustentabilidade e cooperação internacional.", examples: ["Marina Silva", "Wangari Maathai", "Gro Harlem Brundtland", "Al Gore"] },
  { name: "Comunitarista Local", description: "Soluções locais e fortalecimento das comunidades.", examples: ["Eduardo Suplicy", "Elinor Ostrom", "Jane Addams", "John Dewey"] },
  { name: "Tecnocrata de Ordem", description: "Gestão técnica, eficiência e estabilidade institucional.", examples: ["José Serra", "Mario Draghi", "Jean Monnet", "Angela Merkel"] },
  { name: "Social Conservador", description: "Proteção social combinada com valores tradicionais.", examples: ["Jair Bolsonaro", "Konrad Adenauer", "Jacques Maritain", "Ronald Reagan"] },
  { name: "Moderado Pluralista", description: "Busca equilíbrio entre diferentes correntes políticas.", examples: ["Tancredo Neves", "Nelson Mandela", "Václav Havel", "Angela Merkel"] },
  { name: "Anarquista Individual", description: "Máxima autonomia pessoal e rejeição à autoridade central.", examples: ["Maria Lacerda de Moura", "Benjamin Tucker", "Lysander Spooner", "Murray Rothbard"] },
];

const pixPayload = "00020126580014BR.GOV.BCB.PIX0136c39d45db-82be-4237-861e-ba554e50cdcd5204000053039865802BR5920Gustavo Guerra Sales6009SAO PAULO621405101suPsiyNgr63047223";

type ShareAxis = { label: string; percent: number };
type QuadrantCoordinates = { x: number; y: number };

function getQuadrantCoordinates(percentages: Record<Axis, number>): QuadrantCoordinates {
  const economyRight = (50 - percentages.economy) / 50;
  const nationalismRight = (percentages.nationalism - 50) / 50;
  const horizontal = economyRight * 0.8 + nationalismRight * 0.2;

  const individualLibertarian = (percentages.individualFreedom - 50) / 50;
  const securityLibertarian = (50 - percentages.security) / 50;
  const institutionsLibertarian = (percentages.institutions - 50) / 50;
  const verticalLibertarian = (individualLibertarian + securityLibertarian + institutionsLibertarian) / 3;

  return {
    x: 50 + horizontal * 40,
    y: 50 - verticalLibertarian * 40,
  };
}

function createShareImage(archetypeName: string, phrase: string, position: string, axes: ShareAxis[], quadrant: QuadrantCoordinates): Blob {
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 630;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Não foi possível gerar a imagem.");

  const background = context.createLinearGradient(0, 0, 1200, 630);
  background.addColorStop(0, "#11121e");
  background.addColorStop(0.58, "#17152b");
  background.addColorStop(1, "#102522");
  context.fillStyle = background;
  context.fillRect(0, 0, 1200, 630);
  context.fillStyle = "rgba(139,124,246,.12)";
  context.beginPath();
  context.arc(1040, 35, 260, 0, Math.PI * 2);
  context.fill();

  context.fillStyle = "#a99cff";
  context.font = "600 20px Arial, sans-serif";
  context.fillText("DNA POLÍTICO", 64, 68);
  context.fillStyle = "rgba(255,255,255,.48)";
  context.font = "600 13px Arial, sans-serif";
  context.fillText("MEU PERFIL POLÍTICO", 64, 132);

  context.fillStyle = "#f7f6ff";
  context.font = "700 38px Arial, sans-serif";
  const words = archetypeName.split(" ");
  let line = "";
  let y = 184;
  for (const word of words) {
    const nextLine = line ? `${line} ${word}` : word;
    if (context.measureText(nextLine).width > 470 && line) {
      context.fillText(line, 64, y);
      y += 48;
      line = word;
    } else line = nextLine;
  }
  if (line) context.fillText(line, 64, y);

  context.fillStyle = "#bdb1ff";
  context.font = "600 18px Arial, sans-serif";
  context.fillText(`Posicionamento geral · ${position}`, 64, y + 48);
  context.fillStyle = "rgba(255,255,255,.8)";
  context.font = "italic 18px Arial, sans-serif";
  const phraseWords = `“${phrase}”`.split(" ");
  let phraseLine = "";
  let phraseY = y + 100;
  for (const word of phraseWords) {
    const nextLine = phraseLine ? `${phraseLine} ${word}` : word;
    if (context.measureText(nextLine).width > 460 && phraseLine) {
      context.fillText(phraseLine, 64, phraseY);
      phraseY += 28;
      phraseLine = word;
    } else phraseLine = nextLine;
  }
  if (phraseLine) context.fillText(phraseLine, 64, phraseY);

  context.fillStyle = "rgba(255,255,255,.06)";
  context.beginPath();
  context.roundRect(570, 96, 566, 462, 24);
  context.fill();
  axes.forEach((axis, index) => {
    const rowY = 154 + index * 64;
    context.fillStyle = "#f7f6ff";
    context.font = "600 17px Arial, sans-serif";
    context.fillText(axis.label, 604, rowY);
    context.fillStyle = "#86e6d5";
    context.font = "700 16px Arial, sans-serif";
    context.textAlign = "right";
    context.fillText(`${axis.percent}%`, 1098, rowY);
    context.textAlign = "left";
    context.fillStyle = "rgba(255,255,255,.12)";
    context.beginPath();
    context.roundRect(604, rowY + 14, 494, 8, 4);
    context.fill();
    const bar = context.createLinearGradient(604, 0, 1098, 0);
    bar.addColorStop(0, "#8b7cf6");
    bar.addColorStop(1, "#42d6bf");
    context.fillStyle = bar;
    context.beginPath();
    context.roundRect(604, rowY + 14, (494 * axis.percent) / 100, 8, 4);
    context.fill();
  });

  context.fillStyle = "rgba(255,255,255,.06)";
  context.beginPath();
  context.roundRect(64, 366, 442, 196, 20);
  context.fill();
  context.fillStyle = "rgba(255,255,255,.72)";
  context.font = "600 12px Arial, sans-serif";
  context.fillText("MEU POSICIONAMENTO NO QUADRANTE", 84, 389);

  const plotSize = 132;
  const plotLeft = 219;
  const plotTop = 410;
  context.fillStyle = "rgba(255,255,255,.025)";
  context.beginPath();
  context.roundRect(plotLeft, plotTop, plotSize, plotSize, 10);
  context.fill();
  context.strokeStyle = "rgba(255,255,255,.22)";
  context.lineWidth = 1;
  context.beginPath();
  context.moveTo(plotLeft + plotSize / 2, plotTop);
  context.lineTo(plotLeft + plotSize / 2, plotTop + plotSize);
  context.moveTo(plotLeft, plotTop + plotSize / 2);
  context.lineTo(plotLeft + plotSize, plotTop + plotSize / 2);
  context.stroke();

  context.fillStyle = "rgba(255,255,255,.58)";
  context.font = "11px Arial, sans-serif";
  context.textAlign = "center";
  context.fillText("Libertário", plotLeft + plotSize / 2, 405);
  context.fillText("Autoritário", plotLeft + plotSize / 2, 556);
  context.textAlign = "right";
  context.fillText("Esquerda", plotLeft - 9, plotTop + plotSize / 2 + 4);
  context.textAlign = "left";
  context.fillText("Direita", plotLeft + plotSize + 9, plotTop + plotSize / 2 + 4);

  const dotX = plotLeft + (quadrant.x / 100) * plotSize;
  const dotY = plotTop + (quadrant.y / 100) * plotSize;
  context.fillStyle = "rgba(66,214,191,.28)";
  context.beginPath();
  context.arc(dotX, dotY, 11, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = "#86e6d5";
  context.strokeStyle = "#11121e";
  context.lineWidth = 2;
  context.beginPath();
  context.arc(dotX, dotY, 6, 0, Math.PI * 2);
  context.fill();
  context.stroke();
  context.textAlign = "left";

  context.fillStyle = "rgba(255,255,255,.38)";
  context.font = "13px Arial, sans-serif";
  context.fillText("Um retrato simplificado das minhas respostas", 64, 582);
  context.textAlign = "right";
  context.fillText("dnapolitico.vercel.app", 1136, 582);
  context.textAlign = "left";
  const data = canvas.toDataURL("image/png").split(",")[1];
  if (!data) throw new Error("Não foi possível gerar a imagem.");
  const binary = atob(data);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return new Blob([bytes], { type: "image/png" });
}

export default function Home() {
  const [stage, setStage] = useState<Stage>("home");
  const [current, setCurrent] = useState(0);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState(questions);
  const [answers, setAnswers] = useState<(Answer | null)[]>(Array(questions.length).fill(null));
  const [shareMessage, setShareMessage] = useState("");
  const [pixMessage, setPixMessage] = useState("");
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("light");

  useEffect(() => {
    let savedTheme: string | null = null;
    try {
      savedTheme = window.localStorage.getItem("dna-politico-theme");
    } catch {
      // O tema escuro continua disponível mesmo se o armazenamento estiver bloqueado.
    }
    const initialTheme = savedTheme === "dark" ? "dark" : "light";
    document.documentElement.dataset.theme = initialTheme;
    setTheme(initialTheme);
  }, []);

  function toggleTheme() {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    document.documentElement.dataset.theme = nextTheme;
    try {
      window.localStorage.setItem("dna-politico-theme", nextTheme);
    } catch {
      // A alternância permanece ativa durante esta sessão sem persistência.
    }
  }

  function startQuiz() {
    const randomized = [...questions];
    for (let index = randomized.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [randomized[index], randomized[swapIndex]] = [randomized[swapIndex], randomized[index]];
    }
    setQuizQuestions(randomized);
    setAnswers(Array(randomized.length).fill(null));
    setCurrent(0);
    setStage("quiz");
  }

  function continueQuiz() {
    if (current > 0 || answers.some(Boolean)) setStage("quiz");
    else startQuiz();
  }

  function chooseAnswer(answer: Answer) {
    if (isAdvancing) return;

    const next = [...answers];
    next[current] = answer;
    setAnswers(next);
    setIsAdvancing(true);

    window.setTimeout(() => {
      if (current === quizQuestions.length - 1) setStage("result");
      else setCurrent(current + 1);
      setIsAdvancing(false);
    }, 180);
  }

  function restart() {
    setQuizQuestions(questions);
    setAnswers(Array(questions.length).fill(null));
    setCurrent(0);
    setStage("home");
  }

  const scores = calculateScores(quizQuestions, answers);
  const archetype = getArchetype(scores, quizQuestions);
  const archetypeSimilarities = getArchetypeSimilarities(scores, quizQuestions);
  const primaryCompatibility = archetypeSimilarities.find((match) => match.archetype.name === archetype.name)?.compatibility ?? 0;
  const closestProfiles = archetypeSimilarities
    .filter((match) => match.archetype.name !== archetype.name)
    .slice(0, 3);
  const politicalPosition = getPoliticalPosition(scores, quizQuestions);
  const progress = ((current + (answers[current] ? 1 : 0)) / quizQuestions.length) * 100;
  const currentQuestion = quizQuestions[current];
  const currentAxis = axisInfo.find((axis) => currentQuestion?.effects[axis.key] !== undefined)?.label ?? "Questão";
  const ProfileIcon = archetypeIcons[archetype.name] ?? Dna;
  const axisPercentages = Object.fromEntries(axisInfo.map((axis) => [axis.key, getAxisPercent(axis.key, scores[axis.key], quizQuestions)])) as Record<Axis, number>;
  const quadrantCoordinates = getQuadrantCoordinates(axisPercentages);
  const shareAxes = axisInfo.map((axis) => ({ label: axis.label, percent: axisPercentages[axis.key] }));
  const shareText = `Meu resultado no DNA Político: ${archetype.name}. Posicionamento geral: ${politicalPosition}. ${shareAxes.map((axis) => `${axis.label}: ${axis.percent}%`).join(" · ")} Confira o seu em ${typeof window !== "undefined" ? window.location.href : "https://dnapolitico.vercel.app"}`;

  async function copyResult() {
    try {
      await navigator.clipboard.writeText(shareText);
      setShareMessage("Resultado copiado!");
    } catch {
      setShareMessage("Não foi possível copiar automaticamente neste navegador.");
    }
  }

  async function copyPix() {
    try {
      await navigator.clipboard.writeText(pixPayload);
      setPixMessage("Obrigado por apoiar o DNA Político ❤️");
    } catch {
      setPixMessage("Não foi possível copiar automaticamente. Tente novamente neste navegador.");
    }
  }

  async function downloadResultImage() {
    setIsGeneratingImage(true);
    setShareMessage("");
    try {
      const blob = createShareImage(archetype.name, archetype.phrase, politicalPosition, shareAxes, quadrantCoordinates);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "meu-dna-politico.png";
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setShareMessage("Imagem PNG baixada!");
    } catch {
      setShareMessage("Não foi possível gerar a imagem neste navegador.");
    } finally {
      setIsGeneratingImage(false);
    }
  }

  async function copyResultImage() {
    if (typeof ClipboardItem === "undefined" || typeof navigator.clipboard?.write !== "function") {
      setShareMessage("Este navegador não oferece suporte para copiar imagens. Use “Baixar imagem PNG”.");
      return;
    }

    try {
      const blob = createShareImage(archetype.name, archetype.phrase, politicalPosition, shareAxes, quadrantCoordinates);
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      setShareMessage("Imagem copiada para a área de transferência.");
    } catch {
      setShareMessage("Este navegador ou suas permissões não permitem copiar imagens. Use “Baixar imagem PNG”.");
    }
  }

  async function shareResult() {
    type ShareNavigator = Navigator & {
      canShare?: (data: { files: File[] }) => boolean;
      share?: (data: { title: string; text: string; url: string; files?: File[] }) => Promise<void>;
    };
    const shareNavigator = navigator as ShareNavigator;
    if (!shareNavigator.share) {
      await copyResult();
      setShareMessage("Compartilhamento não disponível. Resultado copiado!");
      return;
    }

    try {
      const blob = createShareImage(archetype.name, archetype.phrase, politicalPosition, shareAxes, quadrantCoordinates);
      const file = new File([blob], "meu-dna-politico.png", { type: "image/png" });
      const url = window.location.href;
      if (shareNavigator.canShare?.({ files: [file] })) {
        await shareNavigator.share({ title: "Meu resultado no DNA Político", text: shareText, url, files: [file] });
      } else {
        await shareNavigator.share({ title: "Meu resultado no DNA Político", text: shareText, url });
      }
      setShareMessage("Compartilhamento iniciado!");
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return;
      setShareMessage("Não foi possível compartilhar neste navegador.");
    }
  }

  return (
    <main className="min-h-screen px-5 py-8 sm:px-8 sm:py-12">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-5xl flex-col">
        <header className="flex items-center justify-between">
          <button onClick={() => stage === "quiz" ? setStage("home") : restart()} className="flex items-center gap-2.5 text-sm font-semibold tracking-wide text-white/90" aria-label={stage === "quiz" ? "Voltar ao início sem apagar respostas" : "Voltar ao início"}>
            <span className="theme-brand-mark grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/[0.06] text-violet-300"><Dna aria-hidden="true" className="h-5 w-5" /></span>
            DNA POLÍTICO
          </button>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-white/40 sm:inline">Ideias em perspectiva, sem rótulos rígidos</span>
            <button type="button" onClick={toggleTheme} className="theme-mode-button inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] text-white/80 transition hover:bg-white/[0.12] focus:outline-none focus:ring-2 focus:ring-violet-300" aria-label={`Tema ${theme === "dark" ? "escuro" : "claro"} ativo. Alternar para tema ${theme === "dark" ? "claro" : "escuro"}`} title={`Tema ${theme === "dark" ? "escuro" : "claro"}`}>
              {theme === "dark" ? (
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.2 15.4A8.5 8.5 0 0 1 8.6 3.8 8.7 8.7 0 1 0 20.2 15.4Z" /></svg>
              ) : (
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" /></svg>
              )}
            </button>
          </div>
        </header>

        {stage === "home" && (
          <section className="my-auto grid items-center gap-12 py-16 md:grid-cols-[1.2fr_.8fr]">
            <div>
              <div className="mb-6 flex flex-wrap items-center gap-2 text-xs font-medium">
                <span className="inline-flex items-center gap-2 rounded-full border border-violet-300/20 bg-violet-300/[0.07] px-3.5 py-2 text-violet-200"><span className="h-1.5 w-1.5 rounded-full bg-teal-300" />30 perguntas · 6 eixos políticos</span>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.035] px-3.5 py-2 text-white/55"><Clock3 aria-hidden="true" className="h-4 w-4" />Cerca de 4 minutos</span>
              </div>
              <h1 className="max-w-2xl text-5xl font-semibold leading-[1.08] tracking-[-0.04em] sm:text-6xl lg:text-7xl">Descubra seu <span className="bg-gradient-to-r from-violet-300 to-teal-200 bg-clip-text text-transparent">DNA Político</span></h1>
              <p className="mt-6 max-w-xl text-base leading-7 text-white/55 sm:text-lg">Responda 30 questões sobre economia, costumes, segurança e outros temas para conhecer as ideias que mais se aproximam das suas.</p>
              <button onClick={continueQuiz} className="mt-8 inline-flex items-center gap-3 rounded-xl bg-violet-400 px-6 py-4 text-sm font-semibold text-[#11101d] transition hover:bg-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-200 focus:ring-offset-2 focus:ring-offset-[#090b12]">{current > 0 || answers.some(Boolean) ? "Continuar questionário" : "Iniciar questionário"} <ArrowUpRight aria-hidden="true" className="h-4 w-4" /></button>
              <p className="mt-4 text-xs text-white/45">Não há respostas certas. Escolha a opção que melhor representa sua opinião.</p>
            </div>
            <div className="relative mx-auto flex aspect-square w-full max-w-[340px] items-center justify-center">
              <div className="absolute inset-5 rounded-full border border-white/[0.08]" />
              <div className="absolute inset-[16%] rounded-full border border-dashed border-white/[0.12]" />
              <div className="absolute left-1/2 top-5 bottom-5 w-px bg-white/[0.09]" />
              <div className="absolute left-5 right-5 top-1/2 h-px bg-white/[0.09]" />
              <div className="absolute left-[22%] top-[22%] h-16 w-16 rounded-full bg-violet-500/20 blur-2xl" />
              <div className="absolute right-[22%] bottom-[22%] h-16 w-16 rounded-full bg-teal-400/20 blur-2xl" />
              <div className="theme-center-mark relative grid h-28 w-28 place-items-center rounded-[2rem] border border-white/10 bg-[#151624] shadow-[0_0_80px_rgba(113,91,230,.16)]"><Dna aria-hidden="true" className="h-14 w-14 text-violet-200" strokeWidth={1.4} /></div>
              <span className="absolute left-0 top-1/2 text-[10px] uppercase tracking-widest text-white/30">Economia</span>
              <span className="absolute right-0 top-1/2 text-[10px] uppercase tracking-widest text-white/30">Liberdades</span>
              <span className="absolute top-0 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-widest text-white/30">Sociedade</span>
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-widest text-white/30">Instituições</span>
            </div>
          </section>
        )}

        {stage === "home" && (
          <>
            <section className="mb-10" aria-labelledby="profiles-title">
              <header className="mx-auto mb-8 max-w-3xl text-center">
                <h2 id="profiles-title" className="text-2xl font-semibold tracking-tight sm:text-3xl">Os 16 perfis possíveis</h2>
                <p className="mt-3 text-sm leading-6 text-white/55 sm:text-base">Seu resultado será uma combinação dos seis eixos analisados. Estes são os perfis que podem aparecer ao final do questionário.</p>
              </header>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {homeProfiles.map((profile) => {
                  const ProfileIcon = archetypeIcons[profile.name];
                  return (
                    <article key={profile.name} className="theme-panel rounded-xl border border-white/[0.08] bg-white/[0.025] p-5">
                      <span aria-hidden="true" className="mb-4 grid h-10 w-10 place-items-center rounded-xl border border-violet-300/20 bg-violet-300/[0.08] text-violet-300">
                        <ProfileIcon className="h-5 w-5" strokeWidth={1.8} />
                      </span>
                      <h3 className="text-sm font-semibold leading-5">{profile.name}</h3>
                      <p className="mt-2 text-sm leading-5 text-white/55">{profile.description}</p>
                    </article>
                  );
                })}
              </div>
              <p className="mt-6 rounded-xl border border-violet-300/15 bg-violet-300/[0.05] px-5 py-4 text-center text-sm leading-6 text-white/65">Não existem respostas certas ou erradas. Os perfis representam combinações diferentes de valores e prioridades.</p>
            </section>
            <section className="mb-10" aria-labelledby="historical-profiles-title">
              <header className="mx-auto mb-8 max-w-3xl text-center">
                <h2 id="historical-profiles-title" className="text-2xl font-semibold tracking-tight sm:text-3xl">Perfis e exemplos históricos</h2>
                <p className="mt-3 text-sm leading-6 text-white/55 sm:text-base">Figuras frequentemente associadas a ideias semelhantes, como exemplos aproximados — não classificações definitivas.</p>
              </header>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {homeProfiles.map((profile) => {
                  const ProfileIcon = archetypeIcons[profile.name];
                  return (
                    <details key={profile.name} className="historical-profile theme-panel rounded-xl border border-white/[0.08] bg-white/[0.025] p-5">
                      <summary className="flex cursor-pointer list-none items-start gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-300">
                        <span aria-hidden="true" className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-violet-300/20 bg-violet-300/[0.08] text-violet-300">
                          <ProfileIcon className="h-5 w-5" strokeWidth={1.8} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-semibold leading-5">{profile.name}</span>
                          <span className="mt-2 block text-sm leading-5 text-white/55">{profile.description}</span>
                          <span className="mt-3 block text-xs font-medium text-violet-300">Ver exemplos aproximados</span>
                        </span>
                        <ChevronDown aria-hidden="true" className="historical-chevron mt-1 h-4 w-4 shrink-0 text-white/45 transition-transform" />
                      </summary>
                      <div className="mt-4 border-t border-white/[0.08] pt-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-white/45">Figuras frequentemente associadas</p>
                        <ul className="mt-2 space-y-1.5 text-sm leading-5 text-white/75">
                          {profile.examples.map((example) => <li key={example}>{example}</li>)}
                        </ul>
                      </div>
                    </details>
                  );
                })}
              </div>
              <p className="mt-6 rounded-xl border border-violet-300/15 bg-violet-300/[0.05] px-5 py-4 text-center text-sm leading-6 text-white/65">Os exemplos abaixo são apenas aproximações ilustrativas. Pessoas reais raramente correspondem perfeitamente a um único perfil.</p>
            </section>
            <div className="mb-12 flex justify-center">
              <button onClick={continueQuiz} className="inline-flex items-center gap-3 rounded-xl border border-violet-300/30 bg-violet-300/[0.08] px-5 py-3 text-sm font-semibold text-violet-200 transition hover:bg-violet-300/[0.14] focus:outline-none focus:ring-2 focus:ring-violet-300">Começar questionário <ArrowUpRight aria-hidden="true" className="h-4 w-4" /></button>
            </div>
          </>
        )}

        {stage === "quiz" && (
          <section className="my-auto w-full max-w-3xl self-center py-12">
            <div className="mb-8 flex items-center justify-between text-xs font-medium text-white/45"><span>Pergunta {current + 1} <span className="text-white/25">/ {quizQuestions.length}</span></span><span>{Math.round((current / quizQuestions.length) * 100)}% concluído</span></div>
            <div className="theme-progress-track mb-10 h-1 overflow-hidden rounded-full bg-white/[0.08]"><div className="h-full rounded-full bg-gradient-to-r from-violet-400 to-teal-300 transition-all duration-300" style={{ width: `${progress}%` }} /></div>
            <div key={`question-${currentQuestion.id}`}>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[.18em] text-violet-300">{currentAxis}</p>
              <h1 className="mb-9 text-2xl font-medium leading-relaxed tracking-[-0.02em] sm:text-3xl">{currentQuestion.text}</h1>
              <div className="grid grid-cols-1 gap-3">
                {answerOptions.map((option, index) => (
                  <button key={`${currentQuestion.id}-${option}`} onClick={() => chooseAnswer(option)} disabled={isAdvancing} aria-pressed={answers[current] === option} className={`group flex min-h-14 touch-manipulation items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-all duration-150 ease-out active:scale-[0.97] active:brightness-125 motion-reduce:transition-none motion-reduce:active:scale-100 focus:outline-none focus:ring-2 focus:ring-violet-300 disabled:cursor-wait disabled:opacity-100 ${answers[current] === option ? (index < 3 ? "border-emerald-300/80 bg-emerald-400/25 text-white ring-2 ring-emerald-300/50 shadow-[0_0_18px_rgba(52,211,153,.18)]" : "border-rose-300/80 bg-rose-400/25 text-white ring-2 ring-rose-300/50 shadow-[0_0_18px_rgba(251,113,133,.18)]") : index < 3 ? "border-emerald-300/15 bg-emerald-400/[0.025] text-white/75 hover:border-emerald-300/40 hover:bg-emerald-400/[0.08] hover:text-white" : "border-rose-300/15 bg-rose-400/[0.025] text-white/75 hover:border-rose-300/40 hover:bg-rose-400/[0.08] hover:text-white"}`}>
                    {index < 3 ? <CircleCheck aria-hidden="true" className="answer-agree-icon h-5 w-5 shrink-0" strokeWidth={2} /> : <CircleX aria-hidden="true" className="answer-disagree-icon h-5 w-5 shrink-0" strokeWidth={2} />}{option}
                  </button>
                ))}
              </div>
            </div>
            <button disabled={current === 0 || isAdvancing} onClick={() => setCurrent(current - 1)} className="mt-7 inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/[0.07] px-4 py-2.5 text-sm font-semibold text-white/85 transition hover:border-violet-300/40 hover:bg-violet-300/[0.1] hover:text-white focus:outline-none focus:ring-2 focus:ring-violet-300 disabled:cursor-not-allowed disabled:opacity-30">← Voltar</button>
          </section>
        )}

        {stage === "result" && (
          <section className="my-auto grid w-full items-start gap-4 self-center py-4 md:grid-cols-[.9fr_1.1fr] sm:py-6">
            <div className="theme-archetype-card relative flex flex-col justify-between overflow-hidden rounded-2xl border border-violet-300/25 bg-gradient-to-br from-violet-500/[0.2] via-[#11131f] to-teal-400/[0.08] p-4 shadow-[0_24px_90px_rgba(113,91,230,.12)] sm:p-5">
              <ProfileIcon aria-hidden="true" className="absolute -right-8 -top-10 h-36 w-36 text-violet-300 opacity-[0.07]" strokeWidth={1.2} />
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[.16em] text-violet-300">Seu perfil político</p>
                <div className="mt-3 flex items-center gap-3">
                  <span aria-hidden="true" className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-violet-200/20 bg-violet-300/10 shadow-[0_0_32px_rgba(167,139,250,.18)]"><ProfileIcon className="h-7 w-7 text-violet-200" strokeWidth={1.7} /></span>
                  <div>
                    <h1 className="text-2xl font-semibold tracking-[-0.03em] sm:text-3xl">{archetype.name}</h1>
                    <p className="mt-1 text-xs font-semibold tabular-nums text-teal-200">Compatibilidade: {primaryCompatibility}%</p>
                  </div>
                </div>
                <p className="mt-2 text-sm leading-5 text-white/65">{archetype.description}</p>
                <blockquote className="theme-quote mt-3 rounded-xl border border-white/[0.08] bg-black/15 px-3 py-2.5 text-xs leading-5 text-teal-100/90">“{archetype.phrase}”</blockquote>
                <div className="mt-3 rounded-xl border border-violet-300/15 bg-violet-300/[0.06] px-3 py-2.5">
                  <p className="text-[10px] font-semibold uppercase tracking-[.16em] text-violet-200/65">Posicionamento Geral</p>
                  <p className="mt-0.5 text-lg font-semibold text-white">{politicalPosition}</p>
                  <p className="text-[11px] leading-4 text-white/50">Baseado em Economia e Costumes.</p>
                </div>
                <section className="mt-4" aria-labelledby="closest-profiles-title">
                  <h2 id="closest-profiles-title" className="text-sm font-semibold">Perfis mais próximos</h2>
                  <ul className="mt-2 space-y-1.5">
                    {closestProfiles.map(({ archetype: profile, compatibility }) => {
                      const NearbyIcon = archetypeIcons[profile.name] ?? Dna;
                      return (
                        <li key={profile.name} className="theme-panel flex items-center justify-between gap-2 rounded-lg border border-white/[0.08] bg-white/[0.025] px-2.5 py-2">
                          <span className="flex min-w-0 items-center gap-2">
                            <NearbyIcon aria-hidden="true" className="h-4 w-4 shrink-0 text-violet-300" strokeWidth={1.8} />
                            <span className="truncate text-xs font-medium">{profile.name}</span>
                          </span>
                          <span className="shrink-0 text-[11px] tabular-nums text-teal-200">{compatibility}%</span>
                        </li>
                      );
                    })}
                  </ul>
                  <p className="mt-1.5 text-[10px] leading-4 text-white/40">Compatibilidade indica proximidade, não uma avaliação política.</p>
                </section>
              </div>
              <div className="mt-4 border-t border-white/[0.08] pt-3">
                <p className="text-[10px] leading-4 text-white/40">Um retrato simplificado das suas respostas — não um rótulo definitivo.</p>
                <button onClick={restart} className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-violet-200 transition hover:text-white">Refazer questionário <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5" /></button>
              </div>
            </div>
            <div className="space-y-4">
            <div className="theme-panel rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4 sm:p-5"><div className="mb-4"><h2 className="text-base font-semibold">Seus seis eixos</h2><p className="mt-0.5 text-[11px] leading-4 text-white/45">50% indica o centro; os extremos mostram a inclinação.</p></div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-3">{axisInfo.map((axis) => {
                const percent = getAxisPercent(axis.key, scores[axis.key], quizQuestions);
                const AxisIcon = axisIcons[axis.key];
                return <div key={axis.key}>
                  <div className="mb-1 flex items-center justify-between gap-1"><span className="flex min-w-0 items-center gap-1.5 text-[11px] font-medium leading-4 text-white/85"><AxisIcon aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-violet-300" strokeWidth={1.8} />{axis.label}</span><span className="text-xs font-semibold tabular-nums text-teal-200">{percent}%</span></div>
                  <div className="theme-progress-track relative h-1.5 overflow-hidden rounded-full bg-white/[0.08]" role="progressbar" aria-label={`${axis.label}: ${percent}% em direção a ${axis.high}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent}><div className="h-full rounded-full bg-gradient-to-r from-violet-400 to-teal-300" style={{ width: `${percent}%` }} /></div>
                  <div className="mt-1 flex justify-between gap-1 text-[10px] leading-3 text-white/40"><span>{axis.low}</span><span className="text-right">{axis.high}</span></div>
                </div>;
              })}</div>
            </div>
            <section className="theme-panel rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4 sm:p-5" aria-labelledby="quadrant-title">
              <h2 id="quadrant-title" className="text-base font-semibold">Seu posicionamento no quadrante</h2>
              <p className="mt-0.5 text-[11px] leading-4 text-white/45">Uma visualização complementar baseada nos seus seis eixos.</p>
              <div className="mx-auto mt-4 w-full max-w-md">
                <p className="text-center text-xs font-medium text-white/65">Libertário</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="w-12 shrink-0 text-right text-[10px] font-medium text-white/55 sm:w-14 sm:text-xs">Esquerda</span>
                  <div
                    role="img"
                    aria-label={`Posição aproximada: ${quadrantCoordinates.x < 49 ? "esquerda" : quadrantCoordinates.x > 51 ? "direita" : "centro horizontal"} e ${quadrantCoordinates.y < 49 ? "libertária" : quadrantCoordinates.y > 51 ? "autoritária" : "centro vertical"}.`}
                    className="quadrant-surface relative aspect-square min-w-0 flex-1 overflow-hidden rounded-xl border border-white/10 bg-white/[0.025]"
                  >
                    <span aria-hidden="true" className="quadrant-grid-line absolute bottom-0 left-1/2 top-0 w-px -translate-x-1/2" />
                    <span aria-hidden="true" className="quadrant-grid-line absolute left-0 right-0 top-1/2 h-px -translate-y-1/2" />
                    <span
                      aria-hidden="true"
                      className="quadrant-dot absolute h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-slate-950 bg-teal-300 shadow-[0_0_0_5px_rgba(94,234,212,.2),0_0_18px_rgba(94,234,212,.75)]"
                      style={{ left: `${quadrantCoordinates.x}%`, top: `${quadrantCoordinates.y}%` }}
                    />
                  </div>
                  <span className="w-12 shrink-0 text-[10px] font-medium text-white/55 sm:w-14 sm:text-xs">Direita</span>
                </div>
                <p className="mt-2 text-center text-xs font-medium text-white/65">Autoritário</p>
              </div>
              <p className="mt-3 text-center text-[10px] leading-4 text-white/40">Este quadrante é apenas uma representação simplificada do resultado.</p>
            </section>
            </div>
          </section>
        )}

        {stage === "result" && (
          <section className="theme-panel mb-4 w-full self-center rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4 sm:mb-6 sm:p-5" aria-labelledby="share-result-title">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <h2 id="share-result-title" className="text-base font-semibold">Compartilhar resultado</h2>
                <p className="mt-0.5 text-xs text-white/45">Leve seu perfil e os seis eixos para a conversa.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button onClick={copyResult} className="rounded-lg border border-white/15 bg-white/[0.06] px-3 py-2 text-xs font-semibold text-white/85 transition hover:border-violet-300/40 hover:bg-violet-300/[0.1]">Copiar resultado</button>
                <button onClick={copyResultImage} className="rounded-lg border border-white/15 bg-white/[0.06] px-3 py-2 text-xs font-semibold text-white/85 transition hover:border-violet-300/40 hover:bg-violet-300/[0.1]">Copiar imagem</button>
                <button onClick={downloadResultImage} disabled={isGeneratingImage} className="rounded-lg border border-white/15 bg-white/[0.06] px-3 py-2 text-xs font-semibold text-white/85 transition hover:border-teal-300/40 hover:bg-teal-300/[0.1] disabled:cursor-wait disabled:opacity-50">{isGeneratingImage ? "Gerando imagem…" : "Baixar imagem PNG"}</button>
                <button onClick={shareResult} className="rounded-lg bg-violet-400 px-3 py-2 text-xs font-semibold text-[#11101d] transition hover:bg-violet-300">Compartilhar</button>
              </div>
            </div>
            {shareMessage && <p role="status" className="mt-2 inline-flex items-center gap-2 text-xs text-teal-200">{shareMessage === "Imagem copiada para a área de transferência." && <CircleCheck aria-hidden="true" className="h-4 w-4 shrink-0" />}{shareMessage}</p>}
          </section>
        )}

        {stage === "result" && (
          <section className="theme-panel mb-6 w-full self-center rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 sm:p-8" aria-labelledby="calculation-title">
            <h2 id="calculation-title" className="text-lg font-semibold">Como calculamos seu resultado?</h2>
            <p className="mt-2 text-sm leading-6 text-white/60">Suas respostas são analisadas em seis dimensões:</p>
            <ul className="mt-3 grid gap-2 text-sm text-white/75 sm:grid-cols-2 lg:grid-cols-3">
              {axisInfo.map((axis) => <li key={axis.key} className="flex items-center gap-2"><span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-violet-300" />{axis.label}</li>)}
            </ul>
            <p className="mt-4 text-sm leading-6 text-white/60">Cada resposta ajuda a mostrar sua posição em um ou mais desses eixos. Depois, comparamos seu perfil com diferentes perfis políticos e mostramos os que mais se aproximam das suas respostas.</p>
            <p className="mt-3 text-xs leading-5 text-white/45">Este resultado é uma aproximação baseada nas respostas que você deu e não representa toda a complexidade das suas opiniões políticas.</p>
          </section>
        )}

        {stage === "result" && (
          <section className="theme-panel mb-6 w-full self-center rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 sm:p-6" aria-labelledby="support-title">
            <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center">
              <div className="shrink-0 rounded-2xl bg-white p-3 shadow-sm" aria-label="QR Code Pix">
                <QRCodeSVG value={pixPayload} size={156} level="M" marginSize={2} bgColor="#ffffff" fgColor="#111827" title="QR Code Pix para apoiar o DNA Político" />
              </div>
              <div className="w-full text-center sm:text-left">
                <h2 id="support-title" className="flex items-center justify-center gap-2 text-lg font-semibold sm:justify-start"><Coffee aria-hidden="true" className="h-5 w-5 text-violet-300" />Apoie o DNA Político</h2>
                <p className="mt-2 text-sm leading-6 text-white/65">Se o DNA Político foi útil para você, considere apoiar o projeto.</p>
                <p className="mt-2 text-xs leading-5 text-white/45">As contribuições são totalmente opcionais e ajudam a manter a ferramenta online, desenvolver novas funcionalidades e continuar oferecendo o teste gratuitamente para mais pessoas.</p>
                <button type="button" onClick={copyPix} className="mt-4 inline-flex items-center justify-center gap-2 rounded-lg border border-violet-300/25 bg-violet-300/[0.08] px-4 py-2.5 text-sm font-semibold text-violet-200 transition hover:bg-violet-300/[0.14] focus:outline-none focus:ring-2 focus:ring-violet-300">
                  <Copy aria-hidden="true" className="h-4 w-4" />Copiar Pix
                </button>
                {pixMessage && <p role="status" aria-live="polite" className="mt-2 text-xs text-teal-200">{pixMessage}</p>}
              </div>
            </div>
          </section>
        )}

        <footer className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.07] pt-5 text-[11px] text-white/35"><span>DNA Político</span><span>Suas respostas são processadas neste navegador.</span></footer>
      </div>
    </main>
  );
}
