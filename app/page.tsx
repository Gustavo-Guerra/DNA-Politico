"use client";

import { useState } from "react";
import { questions } from "@/data/questions";
import { answerOptions, axisInfo, calculateScores, getArchetype, getAxisPercent, getPoliticalPosition, type Answer } from "@/utils/politics";

type Stage = "home" | "quiz" | "result";

const axisIcons = {
  economy: "💰",
  customs: "🎭",
  security: "🛡️",
  individualFreedom: "🕊️",
  nationalism: "🧭",
  institutions: "🏛️",
} as const;

const archetypeIcons: Record<string, string> = {
  "Social Democrata": "🏛️",
  "Liberal de Mercado": "📈",
  "Progressista Comunitário": "🌈",
  "Conservador Tradicional": "🌳",
  "Libertário Civil": "🗝️",
  Punitivista: "🚨",
  "Nacional Desenvolvimentista": "🏭",
  "Soberanista Popular": "🇧🇷",
  "Liberal Institucional": "⚖️",
  "Centro Reformista": "🧭",
  "Ecologista Global": "🌿",
  "Comunitarista Local": "🏘️",
  "Tecnocrata de Ordem": "⚙️",
  "Anarquista Individual": "🪶",
  "Social Conservador": "🤝",
  "Moderado Pluralista": "🗣️",
};

type ShareAxis = { label: string; icon: string; percent: number };

function createShareImage(archetypeName: string, phrase: string, position: string, axes: ShareAxis[]): Blob {
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
  context.fillText("✳  DNA POLÍTICO", 64, 68);
  context.fillStyle = "rgba(255,255,255,.48)";
  context.font = "600 13px Arial, sans-serif";
  context.fillText("MEU RESULTADO", 64, 132);

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
    context.fillText(`${axis.icon}  ${axis.label}`, 604, rowY);
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

  context.fillStyle = "rgba(255,255,255,.38)";
  context.font = "13px Arial, sans-serif";
  context.fillText("Um retrato simplificado das minhas respostas", 64, 582);
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
  const [quizQuestions, setQuizQuestions] = useState(questions);
  const [answers, setAnswers] = useState<(Answer | null)[]>(Array(questions.length).fill(null));
  const [shareMessage, setShareMessage] = useState("");
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

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
    const next = [...answers];
    next[current] = answer;
    setAnswers(next);
    if (current === quizQuestions.length - 1) setStage("result");
    else setCurrent(current + 1);
  }

  function restart() {
    setQuizQuestions(questions);
    setAnswers(Array(questions.length).fill(null));
    setCurrent(0);
    setStage("home");
  }

  const scores = calculateScores(quizQuestions, answers);
  const archetype = getArchetype(scores, quizQuestions);
  const politicalPosition = getPoliticalPosition(scores, quizQuestions);
  const progress = ((current + (answers[current] ? 1 : 0)) / quizQuestions.length) * 100;
  const currentQuestion = quizQuestions[current];
  const currentAxis = axisInfo.find((axis) => currentQuestion?.effects[axis.key] !== undefined)?.label ?? "Questão";
  const shareAxes = axisInfo.map((axis) => ({ label: axis.label, icon: axisIcons[axis.key], percent: getAxisPercent(axis.key, scores[axis.key], quizQuestions) }));
  const shareText = `Meu resultado no DNA Político: ${archetype.name}. Posicionamento geral: ${politicalPosition}. ${shareAxes.map((axis) => `${axis.label}: ${axis.percent}%`).join(" · ")} Confira o seu em ${typeof window !== "undefined" ? window.location.href : "https://dnapolitico.vercel.app"}`;

  async function copyResult() {
    try {
      await navigator.clipboard.writeText(shareText);
      setShareMessage("Resultado copiado!");
    } catch {
      setShareMessage("Não foi possível copiar automaticamente neste navegador.");
    }
  }

  async function downloadResultImage() {
    setIsGeneratingImage(true);
    setShareMessage("");
    try {
      const blob = createShareImage(archetype.name, archetype.phrase, politicalPosition, shareAxes);
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
      const blob = createShareImage(archetype.name, archetype.phrase, politicalPosition, shareAxes);
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
            <span className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/[0.06] text-violet-300">✳</span>
            DNA POLÍTICO
          </button>
          <span className="text-xs text-white/40">Ideias em perspectiva, sem rótulos rígidos</span>
        </header>

        {stage === "home" && (
          <section className="my-auto grid items-center gap-12 py-16 md:grid-cols-[1.2fr_.8fr]">
            <div>
              <div className="mb-6 flex flex-wrap items-center gap-2 text-xs font-medium">
                <span className="inline-flex items-center gap-2 rounded-full border border-violet-300/20 bg-violet-300/[0.07] px-3.5 py-2 text-violet-200"><span className="h-1.5 w-1.5 rounded-full bg-teal-300" />30 perguntas · 6 eixos políticos</span>
                <span className="inline-flex items-center rounded-full border border-white/[0.08] bg-white/[0.035] px-3.5 py-2 text-white/55">⏱️ Cerca de 4 minutos</span>
              </div>
              <h1 className="max-w-2xl text-5xl font-semibold leading-[1.08] tracking-[-0.04em] sm:text-6xl lg:text-7xl">Descubra seu <span className="bg-gradient-to-r from-violet-300 to-teal-200 bg-clip-text text-transparent">DNA Político</span></h1>
              <p className="mt-6 max-w-xl text-base leading-7 text-white/55 sm:text-lg">Responda 30 questões sobre economia, costumes, segurança e outros temas para conhecer as ideias que mais se aproximam das suas.</p>
              <button onClick={continueQuiz} className="mt-9 inline-flex items-center gap-3 rounded-xl bg-violet-400 px-6 py-4 text-sm font-semibold text-[#11101d] transition hover:bg-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-200 focus:ring-offset-2 focus:ring-offset-[#090b12]">{current > 0 || answers.some(Boolean) ? "Continuar questionário" : "Iniciar questionário"} <span aria-hidden="true">→</span></button>
              <p className="mt-4 text-xs text-white/35">Não há respostas certas. Escolha a opção que melhor representa sua opinião.</p>
            </div>
            <div className="relative mx-auto flex aspect-square w-full max-w-[340px] items-center justify-center">
              <div className="absolute inset-5 rounded-full border border-white/[0.08]" />
              <div className="absolute inset-[16%] rounded-full border border-dashed border-white/[0.12]" />
              <div className="absolute left-1/2 top-5 bottom-5 w-px bg-white/[0.09]" />
              <div className="absolute left-5 right-5 top-1/2 h-px bg-white/[0.09]" />
              <div className="absolute left-[22%] top-[22%] h-16 w-16 rounded-full bg-violet-500/20 blur-2xl" />
              <div className="absolute right-[22%] bottom-[22%] h-16 w-16 rounded-full bg-teal-400/20 blur-2xl" />
              <div className="relative grid h-28 w-28 place-items-center rounded-[2rem] border border-white/10 bg-[#151624] shadow-[0_0_80px_rgba(113,91,230,.16)]"><span className="text-5xl text-violet-200">✳</span></div>
              <span className="absolute left-0 top-1/2 text-[10px] uppercase tracking-widest text-white/30">Economia</span>
              <span className="absolute right-0 top-1/2 text-[10px] uppercase tracking-widest text-white/30">Liberdades</span>
              <span className="absolute top-0 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-widest text-white/30">Sociedade</span>
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-widest text-white/30">Instituições</span>
            </div>
          </section>
        )}

        {stage === "quiz" && (
          <section className="my-auto w-full max-w-3xl self-center py-12">
            <div className="mb-8 flex items-center justify-between text-xs font-medium text-white/45"><span>Pergunta {current + 1} <span className="text-white/25">/ {quizQuestions.length}</span></span><span>{Math.round((current / quizQuestions.length) * 100)}% concluído</span></div>
            <div className="mb-10 h-1 overflow-hidden rounded-full bg-white/[0.08]"><div className="h-full rounded-full bg-gradient-to-r from-violet-400 to-teal-300 transition-all duration-300" style={{ width: `${progress}%` }} /></div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[.18em] text-violet-300">{currentAxis}</p>
            <h1 key={currentQuestion.id} className="mb-9 text-2xl font-medium leading-relaxed tracking-[-0.02em] sm:text-3xl">{currentQuestion.text}</h1>
            <div key={currentQuestion.id} className="grid grid-cols-1 gap-3">
              {answerOptions.map((option, index) => (
                <button key={`${currentQuestion.id}-${option}`} onClick={() => chooseAnswer(option)} aria-pressed={answers[current] === option} className={`group flex min-h-14 items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition focus:outline-none focus:ring-2 focus:ring-violet-300 ${answers[current] === option ? (index < 3 ? "border-emerald-300/70 bg-emerald-400/15 text-white ring-1 ring-emerald-300/40" : "border-rose-300/70 bg-rose-400/15 text-white ring-1 ring-rose-300/40") : index < 3 ? "border-emerald-300/15 bg-emerald-400/[0.025] text-white/75 hover:border-emerald-300/40 hover:bg-emerald-400/[0.08] hover:text-white" : "border-rose-300/15 bg-rose-400/[0.025] text-white/75 hover:border-rose-300/40 hover:bg-rose-400/[0.08] hover:text-white"}`}>
                  <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg border text-[11px] transition ${answers[current] === option ? (index < 3 ? "border-emerald-300/50 text-emerald-200" : "border-rose-300/50 text-rose-200") : "border-white/10 text-white/40 group-hover:text-white/70"}`}>{index + 1}</span>{option}
                </button>
              ))}
            </div>
            <button disabled={current === 0} onClick={() => setCurrent(current - 1)} className="mt-7 inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/[0.07] px-4 py-2.5 text-sm font-semibold text-white/85 transition hover:border-violet-300/40 hover:bg-violet-300/[0.1] hover:text-white focus:outline-none focus:ring-2 focus:ring-violet-300 disabled:cursor-not-allowed disabled:opacity-30">← Voltar</button>
          </section>
        )}

        {stage === "result" && (
          <section className="my-auto grid w-full gap-6 self-center py-10 md:grid-cols-[.9fr_1.1fr]">
            <div className="relative flex flex-col justify-between overflow-hidden rounded-2xl border border-violet-300/25 bg-gradient-to-br from-violet-500/[0.2] via-[#11131f] to-teal-400/[0.08] p-7 shadow-[0_24px_90px_rgba(113,91,230,.12)] sm:p-9">
              <span aria-hidden="true" className="absolute -right-8 -top-10 text-[150px] opacity-[0.07]">{archetypeIcons[archetype.name] ?? "✳️"}</span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[.18em] text-violet-300">Seu arquétipo principal</p>
                <div className="mt-5 flex items-center gap-4">
                  <span aria-hidden="true" className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl border border-violet-200/20 bg-violet-300/10 text-4xl shadow-[0_0_32px_rgba(167,139,250,.18)]">{archetypeIcons[archetype.name] ?? "✳️"}</span>
                  <h1 className="text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">{archetype.name}</h1>
                </div>
                <p className="mt-4 leading-7 text-white/65">{archetype.description}</p>
                <blockquote className="mt-6 rounded-xl border border-white/[0.08] bg-black/15 px-4 py-4 text-sm leading-6 text-teal-100/90">“{archetype.phrase}”</blockquote>
                <div className="mt-7 rounded-xl border border-violet-300/15 bg-violet-300/[0.06] px-4 py-3.5">
                  <p className="text-[10px] font-semibold uppercase tracking-[.16em] text-violet-200/65">Posicionamento Geral</p>
                  <p className="mt-1 text-xl font-semibold text-white">{politicalPosition}</p>
                  <p className="mt-1 text-xs leading-5 text-white/50">Baseado principalmente nos eixos de Economia e Costumes.</p>
                </div>
              </div>
              <div className="mt-8 border-t border-white/[0.08] pt-5">
                <p className="text-xs leading-5 text-white/40">Um retrato simplificado das suas respostas — não um rótulo definitivo.</p>
                <button onClick={restart} className="mt-5 text-sm font-medium text-violet-200 transition hover:text-white">Refazer questionário <span aria-hidden="true">↗</span></button>
              </div>
            </div>
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-6 sm:p-8"><div className="mb-7"><h2 className="text-lg font-semibold">Seus seis eixos</h2><p className="mt-1 text-sm text-white/45">O resultado completo é representado pelos seis eixos abaixo.</p><p className="mt-1 text-xs text-white/35">50% indica o centro; os extremos mostram sua inclinação.</p></div>
              <div className="space-y-5">{axisInfo.map((axis) => {
                const percent = getAxisPercent(axis.key, scores[axis.key], quizQuestions);
                return <div key={axis.key}>
                  <div className="mb-2 flex items-center justify-between gap-3"><span className="flex items-center gap-2 text-sm font-medium text-white/85"><span aria-hidden="true" className="text-base">{axisIcons[axis.key]}</span>{axis.label}</span><span className="text-sm font-semibold tabular-nums text-teal-200">{percent}%</span></div>
                  <div className="relative h-2 overflow-hidden rounded-full bg-white/[0.08]" role="progressbar" aria-label={`${axis.label}: ${percent}% em direção a ${axis.high}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent}><div className="h-full rounded-full bg-gradient-to-r from-violet-400 to-teal-300" style={{ width: `${percent}%` }} /></div>
                  <div className="mt-1.5 flex justify-between gap-3 text-[10px] leading-4 text-white/40"><span>{axis.low}</span><span className="text-right">{axis.high}</span></div>
                </div>;
              })}</div>
            </div>
          </section>
        )}

        {stage === "result" && (
          <section className="mb-10 w-full self-center rounded-2xl border border-white/[0.08] bg-white/[0.025] p-6 sm:p-8" aria-labelledby="share-result-title">
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
              <div>
                <h2 id="share-result-title" className="text-lg font-semibold">Compartilhar resultado</h2>
                <p className="mt-1 text-sm text-white/45">Leve seu perfil e os seis eixos para a conversa.</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button onClick={copyResult} className="rounded-lg border border-white/15 bg-white/[0.06] px-4 py-2.5 text-sm font-semibold text-white/85 transition hover:border-violet-300/40 hover:bg-violet-300/[0.1]">Copiar resultado</button>
                <button onClick={downloadResultImage} disabled={isGeneratingImage} className="rounded-lg border border-white/15 bg-white/[0.06] px-4 py-2.5 text-sm font-semibold text-white/85 transition hover:border-teal-300/40 hover:bg-teal-300/[0.1] disabled:cursor-wait disabled:opacity-50">{isGeneratingImage ? "Gerando imagem…" : "Baixar imagem PNG"}</button>
                <button onClick={shareResult} className="rounded-lg bg-violet-400 px-4 py-2.5 text-sm font-semibold text-[#11101d] transition hover:bg-violet-300">Compartilhar</button>
              </div>
            </div>
            {shareMessage && <p role="status" className="mt-4 text-sm text-teal-200">{shareMessage}</p>}
          </section>
        )}

        <footer className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.07] pt-5 text-[11px] text-white/35"><span>DNA Político</span><span>Suas respostas são processadas neste navegador.</span></footer>
      </div>
    </main>
  );
}
