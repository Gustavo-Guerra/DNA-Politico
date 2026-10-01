"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowUpRight,
  CircleCheck,
  CircleX,
  ChevronDown,
  Clock3,
  Compass,
  Coffee,
  Copy,
  Download,
  Dna,
  Factory,
  Feather,
  Flag,
  Gauge,
  Handshake,
  House,
  Image,
  KeyRound,
  Landmark,
  Leaf,
  Link2,
  Mail,
  MessagesSquare,
  Scale,
  Shield,
  Share2,
  TrendingUp,
  TreePine,
  Users,
  type LucideIcon,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { questions } from "@/data/questions";
import { answerOptions, axisInfo, calculateScores, getArchetype, getArchetypeSimilarities, getAxisPercent, getPoliticalPosition, type Answer, type Scores } from "@/utils/politics";
import type { Axis, Question } from "@/data/questions";

type Stage = "home" | "quiz" | "result";
type EmailCopyLocation = "contact" | "footer";

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

const ideologicalReferences = [
  { id: "libertarian", label: "Libertário", x: 75, y: 20, description: "Mais autonomia individual e menos intervenção estatal." },
  { id: "liberal", label: "Liberal", x: 70, y: 40, description: "Mais mercado e maior liberdade econômica." },
  { id: "conservative", label: "Conservador", x: 65, y: 65, description: "Valorização de tradições, ordem e estabilidade." },
  { id: "social-democrat", label: "Social-democrata", x: 40, y: 45, description: "Economia de mercado com forte proteção social." },
  { id: "progressive", label: "Progressista", x: 35, y: 35, description: "Maior abertura a mudanças sociais e pautas de inclusão." },
  { id: "nationalist", label: "Nacionalista", x: 60, y: 55, description: "Maior valorização da soberania nacional." },
] as const;

const homeProfiles = [
  { name: "Centro Reformista", description: "Mudanças graduais, negociação e foco em resultados.", examples: ["Tancredo Neves", "Fernando Henrique Cardoso"] },
  { name: "Social Democrata", description: "Mercado com forte proteção social e redução de desigualdades.", examples: ["Lula", "Eduardo Suplicy"] },
  { name: "Liberal de Mercado", description: "Economia mais livre e menor intervenção estatal.", examples: ["Roberto Campos", "Paulo Guedes"] },
  { name: "Progressista Comunitário", description: "Inclusão social, diversidade e fortalecimento coletivo.", examples: ["Benedita da Silva", "Erika Hilton"] },
  { name: "Conservador Tradicional", description: "Preservação de valores, costumes e instituições sociais.", examples: ["Carlos Lacerda", "Edmund Burke"] },
  { name: "Libertário Civil", description: "Máxima autonomia individual e pouca intervenção do Estado.", examples: ["Maria Lacerda de Moura", "Hélio Beltrão"] },
  { name: "Punitivista", description: "Segurança pública baseada em punição e policiamento rigorosos.", examples: ["Guilherme Derrite", "Wilson Witzel"] },
  { name: "Nacional Desenvolvimentista", description: "Crescimento econômico com protagonismo nacional.", examples: ["Getúlio Vargas", "Juscelino Kubitschek"] },
  { name: "Soberanista Popular", description: "Ênfase em soberania nacional e liderança popular.", examples: ["Enéas Carneiro", "Leonel Brizola"] },
  { name: "Liberal Institucional", description: "Liberdades individuais com forte respeito às instituições.", examples: ["José Serra", "Ulysses Guimarães"] },
  { name: "Ecologista Global", description: "Sustentabilidade e cooperação internacional.", examples: ["Marina Silva", "Chico Mendes"] },
  { name: "Comunitarista Local", description: "Soluções locais e fortalecimento das comunidades.", examples: ["Luiza Erundina", "Zilda Arns"] },
  { name: "Tecnocrata de Ordem", description: "Gestão técnica, eficiência e estabilidade institucional.", examples: ["Henrique Meirelles", "João Doria"] },
  { name: "Social Conservador", description: "Proteção social combinada com valores tradicionais.", examples: ["Jair Bolsonaro", "Nikolas Ferreira"] },
  { name: "Moderado Pluralista", description: "Busca equilíbrio entre diferentes correntes políticas.", examples: ["Itamar Franco", "Simone Tebet"] },
  { name: "Anarquista Individual", description: "Máxima autonomia pessoal e rejeição à autoridade central.", examples: ["Edgard Leuenroth", "José Oiticica"] },
];

const pixPayload = "00020126580014BR.GOV.BCB.PIX0136c39d45db-82be-4237-861e-ba554e50cdcd5204000053039865802BR5920Gustavo Guerra Sales6009SAO PAULO621405101suPsiyNgr63047223";

type ShareAxis = { label: string; percent: number; low: string; high: string };
type QuadrantCoordinates = { x: number; y: number };
type IdeologicalIntensity = { percent: number; label: string; description: string };

function XIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M18.9 1.2h3.7l-8.1 9.2L24 23.3h-7.4l-5.8-7.6-6.7 7.6H.4L9 13.5 0 1.2h7.6l5.2 6.9 6.1-6.9Zm-1.3 19.8h2L6.5 3.3H4.4l13.2 17.7Z" />
    </svg>
  );
}

function getIdeologicalIntensity(axes: ShareAxis[]): IdeologicalIntensity {
  const averageDistance = axes.reduce((sum, axis) => sum + Math.abs(axis.percent - 50), 0) / axes.length;
  const percent = Math.round((averageDistance / 50) * 100);

  if (percent <= 20) {
    return { percent, label: "Muito moderado", description: "Suas respostas ficaram próximas do centro na maioria dos temas." };
  }
  if (percent <= 40) {
    return { percent, label: "Moderado", description: "Você demonstra algumas inclinações políticas, mas mantém equilíbrio entre diferentes posições." };
  }
  if (percent <= 60) {
    return { percent, label: "Posições definidas", description: "Suas respostas mostram preferências políticas consistentes em vários temas." };
  }
  if (percent <= 80) {
    return { percent, label: "Convicções fortes", description: "Você tende a adotar posições claras em diversos assuntos." };
  }
  return { percent, label: "Perfil muito definido", description: "Suas respostas mostram inclinações fortes e consistentes em vários eixos." };
}

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

function parseSharedPercentages(search: string): Record<Axis, number> | null {
  const value = new URLSearchParams(search).get("s");
  if (!value || !/^\d{1,3}(,\d{1,3}){5}$/.test(value)) return null;

  const percentages = value.split(",").map(Number);
  if (percentages.some((percent) => percent < 0 || percent > 100)) return null;

  return Object.fromEntries(axisInfo.map((axis, index) => [axis.key, percentages[index]])) as Record<Axis, number>;
}

function scoresFromPercentages(percentages: Record<Axis, number>, questions: Question[]): Scores {
  return Object.fromEntries(axisInfo.map((axis) => {
    const maxScore = questions.reduce((sum, question) => sum + Math.abs(question.effects[axis.key] ?? 0) * 3, 0);
    return [axis.key, ((percentages[axis.key] / 100) * 2 - 1) * maxScore];
  })) as Scores;
}

function createShareImage(
  archetypeName: string,
  description: string,
  position: string,
  shareQuote: string,
  compatibility: number,
  axes: ShareAxis[],
  ideologicalIntensity: IdeologicalIntensity,
  closestProfiles: Array<{ name: string; compatibility: number }>,
  quadrant: QuadrantCoordinates,
): Blob {
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 630;
  const canvasContext = canvas.getContext("2d");
  if (!canvasContext) throw new Error("Não foi possível gerar a imagem.");
  const context: CanvasRenderingContext2D = canvasContext;

  function drawWrappedText(text: string, x: number, y: number, maxWidth: number, lineHeight: number, font: string, color: string, maxLines = 2) {
    context.font = font;
    context.fillStyle = color;
    context.textAlign = "left";
    const lines: string[] = [];
    let line = "";
    for (const word of text.split(" ")) {
      const candidate = line ? `${line} ${word}` : word;
      if (line && context.measureText(candidate).width > maxWidth) {
        lines.push(line);
        line = word;
      } else {
        line = candidate;
      }
    }
    if (line) lines.push(line);

    if (lines.length > maxLines) {
      lines.length = maxLines;
      let lastLine = lines[maxLines - 1];
      while (lastLine.length > 1 && context.measureText(`${lastLine}…`).width > maxWidth) lastLine = lastLine.slice(0, -1);
      lines[maxLines - 1] = `${lastLine}…`;
    }

    lines.forEach((textLine, index) => context.fillText(textLine, x, y + index * lineHeight));
    return y + Math.max(0, lines.length - 1) * lineHeight;
  }

  function drawPanel(x: number, y: number, width: number, height: number, highlight = false) {
    context.fillStyle = highlight ? "rgba(139,124,246,.09)" : "rgba(255,255,255,.035)";
    context.beginPath();
    context.roundRect(x, y, width, height, 18);
    context.fill();
    context.strokeStyle = highlight ? "rgba(139,124,246,.35)" : "rgba(255,255,255,.1)";
    context.lineWidth = 1;
    context.stroke();
  }

  const background = context.createLinearGradient(0, 0, 1200, 630);
  background.addColorStop(0, "#11121e");
  background.addColorStop(0.58, "#17152b");
  background.addColorStop(1, "#102522");
  context.fillStyle = background;
  context.fillRect(0, 0, 1200, 630);
  const ambientGlow = context.createRadialGradient(800, 250, 40, 800, 250, 520);
  ambientGlow.addColorStop(0, "rgba(139,124,246,.12)");
  ambientGlow.addColorStop(1, "rgba(139,124,246,0)");
  context.fillStyle = ambientGlow;
  context.fillRect(240, 0, 960, 540);

  // Cabeçalho com a marca usada na navbar.
  context.fillStyle = "rgba(139,124,246,.12)";
  context.strokeStyle = "rgba(196,181,253,.28)";
  context.lineWidth = 1;
  context.beginPath();
  context.roundRect(40, 18, 38, 38, 11);
  context.fill();
  context.stroke();
  context.strokeStyle = "#b9aaff";
  context.lineWidth = 1.7;
  context.beginPath();
  context.moveTo(51, 24);
  context.bezierCurveTo(67, 28, 48, 37, 65, 42);
  context.bezierCurveTo(69, 45, 55, 48, 60, 51);
  context.stroke();
  context.beginPath();
  context.moveTo(67, 24);
  context.bezierCurveTo(51, 28, 70, 37, 53, 42);
  context.bezierCurveTo(49, 45, 63, 48, 58, 51);
  context.stroke();
  [26, 32, 38, 45].forEach((y) => {
    context.beginPath();
    context.moveTo(53, y);
    context.lineTo(65, y);
    context.stroke();
  });
  context.fillStyle = "#f5f3ff";
  context.font = "700 17px Arial, sans-serif";
  context.textAlign = "left";
  context.fillText("DNA POLÍTICO", 88, 43);

  const cardTop = 72;
  const cardHeight = 424;
  const profileCard = { x: 40, width: 260 };
  const quadrantCard = { x: 314, width: 522 };
  const axesCard = { x: 850, width: 310 };
  drawPanel(profileCard.x, cardTop, profileCard.width, cardHeight, true);
  drawPanel(quadrantCard.x, cardTop, quadrantCard.width, cardHeight, true);
  drawPanel(axesCard.x, cardTop, axesCard.width, cardHeight);

  // Perfil principal e posicionamento.
  const profileX = profileCard.x + 18;
  const profileWidth = profileCard.width - 36;
  context.fillStyle = "#b9aaff";
  context.font = "600 10px Arial, sans-serif";
  context.fillText("SEU PERFIL POLÍTICO", profileX, cardTop + 27);
  const nameBottom = drawWrappedText(archetypeName, profileX, cardTop + 61, profileWidth, 25, "700 21px Arial, sans-serif", "#f7f6ff", 2);
  const badgeText = position.toLocaleUpperCase("pt-BR");
  context.font = "700 10px Arial, sans-serif";
  const badgeWidth = Math.min(profileWidth, context.measureText(badgeText).width + 20);
  const badgeY = nameBottom + 11;
  context.fillStyle = "rgba(139,124,246,.22)";
  context.beginPath();
  context.roundRect(profileX, badgeY, badgeWidth, 21, 11);
  context.fill();
  context.fillStyle = "#d5ceff";
  context.fillText(badgeText, profileX + 10, badgeY + 14);

  const intensityTop = badgeY + 29;
  context.fillStyle = "rgba(94,234,212,.055)";
  context.strokeStyle = "rgba(94,234,212,.2)";
  context.beginPath();
  context.roundRect(profileX, intensityTop, profileWidth, 64, 10);
  context.fill();
  context.stroke();
  context.textAlign = "left";
  context.fillStyle = "#9cefe2";
  context.font = "700 7px Arial, sans-serif";
  context.fillText("INTENSIDADE IDEOLÓGICA", profileX + 9, intensityTop + 12);
  context.textAlign = "right";
  context.fillStyle = "#86e6d5";
  context.font = "700 12px Arial, sans-serif";
  context.fillText(`${ideologicalIntensity.percent}%`, profileX + profileWidth - 9, intensityTop + 13);
  context.fillStyle = "rgba(255,255,255,.13)";
  context.beginPath();
  context.roundRect(profileX + 9, intensityTop + 19, profileWidth - 18, 4, 2);
  context.fill();
  const intensityGradient = context.createLinearGradient(profileX + 9, 0, profileX + profileWidth - 9, 0);
  intensityGradient.addColorStop(0, "#8b7cf6");
  intensityGradient.addColorStop(1, "#42d6bf");
  context.fillStyle = intensityGradient;
  context.beginPath();
  context.roundRect(profileX + 9, intensityTop + 19, (profileWidth - 18) * ideologicalIntensity.percent / 100, 4, 2);
  context.fill();
  context.textAlign = "left";
  context.fillStyle = "#f7f6ff";
  context.font = "700 9px Arial, sans-serif";
  context.fillText(ideologicalIntensity.label, profileX + 9, intensityTop + 35);
  drawWrappedText(ideologicalIntensity.description, profileX + 9, intensityTop + 47, profileWidth - 18, 9, "7px Arial, sans-serif", "rgba(255,255,255,.62)", 2);

  const descriptionBottom = drawWrappedText(description, profileX, intensityTop + 73, profileWidth, 14, "12px Arial, sans-serif", "rgba(255,255,255,.76)", 2);
  const quoteCardY = descriptionBottom + 8;
  context.fillStyle = "rgba(94,234,212,.09)";
  context.strokeStyle = "rgba(94,234,212,.24)";
  context.beginPath();
  context.roundRect(profileX, quoteCardY, profileWidth, 36, 8);
  context.fill();
  context.stroke();
  context.textAlign = "left";
  context.fillStyle = "#86e6d5";
  context.font = "700 23px Georgia, serif";
  context.fillText("“", profileX + 7, quoteCardY + 21);
  drawWrappedText(shareQuote, profileX + 23, quoteCardY + 14, profileWidth - 31, 11, "italic 10px Arial, sans-serif", "#d8fff7", 2);

  const compatibilityTop = quoteCardY + 39;
  const circle = { x: profileX + 39, y: compatibilityTop + 37, radius: 34 };
  context.save();
  context.lineWidth = 5;
  context.strokeStyle = "rgba(94,234,212,.18)";
  context.beginPath();
  context.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2);
  context.stroke();
  context.strokeStyle = "#6ee7d0";
  context.shadowColor = "rgba(94,234,212,.7)";
  context.shadowBlur = 12;
  context.lineCap = "round";
  context.beginPath();
  context.arc(circle.x, circle.y, circle.radius, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * compatibility / 100);
  context.stroke();
  context.restore();
  context.fillStyle = "#86e6d5";
  context.font = "700 20px Arial, sans-serif";
  context.textAlign = "center";
  context.fillText(`${compatibility}%`, circle.x, circle.y + 7);
  context.fillStyle = "rgba(255,255,255,.5)";
  context.font = "600 7px Arial, sans-serif";
  context.fillText("COMPATIBILIDADE", circle.x, circle.y + circle.radius + 14);
  drawWrappedText(`Suas respostas se alinham em ${compatibility}% com este perfil.`, profileX + 86, compatibilityTop + 31, profileWidth - 86, 13, "10px Arial, sans-serif", "rgba(255,255,255,.68)", 4);

  const positionCardY = cardTop + cardHeight - 75;
  context.fillStyle = "rgba(255,255,255,.035)";
  context.strokeStyle = "rgba(255,255,255,.1)";
  context.beginPath();
  context.roundRect(profileX, positionCardY, profileWidth, 59, 12);
  context.fill();
  context.stroke();
  context.textAlign = "left";
  context.fillStyle = "#b9aaff";
  context.font = "600 8px Arial, sans-serif";
  context.fillText("POSICIONAMENTO GERAL", profileX + 10, positionCardY + 14);
  context.fillStyle = "#f7f6ff";
  context.font = "700 13px Arial, sans-serif";
  context.fillText(position, profileX + 10, positionCardY + 32);
  context.fillStyle = "rgba(255,255,255,.55)";
  context.font = "9px Arial, sans-serif";
  context.fillText("Baseado principalmente em Economia e Costumes.", profileX + 10, positionCardY + 48);

  // Quadrante central, ampliado em 25% em relação ao template anterior.
  const quadrantTitleX = quadrantCard.x + 20;
  const quadrantCenterX = quadrantCard.x + quadrantCard.width / 2;
  context.fillStyle = "#f7f6ff";
  context.font = "700 14px Arial, sans-serif";
  context.textAlign = "left";
  context.fillText("SEU POSICIONAMENTO NO QUADRANTE", quadrantTitleX, cardTop + 27);
  context.fillStyle = "rgba(255,255,255,.62)";
  context.font = "10px Arial, sans-serif";
  context.fillText("Seu posicionamento aproximado no espectro político.", quadrantTitleX, cardTop + 45);

  context.textAlign = "center";
  context.fillStyle = "#f5f3ff";
  context.font = "600 12px Arial, sans-serif";
  context.fillText("↑ Libertário", quadrantCenterX, cardTop + 69);
  context.fillStyle = "rgba(255,255,255,.58)";
  context.font = "9px Arial, sans-serif";
  context.fillText("Mais liberdade individual", quadrantCenterX, cardTop + 82);

  const plotSize = 300;
  const plotLeft = quadrantCenterX - plotSize / 2;
  const plotTop = cardTop + 87;
  const plotGradient = context.createLinearGradient(plotLeft, plotTop, plotLeft + plotSize, plotTop + plotSize);
  plotGradient.addColorStop(0, "rgba(139,124,246,.09)");
  plotGradient.addColorStop(.52, "rgba(255,255,255,.025)");
  plotGradient.addColorStop(1, "rgba(66,214,191,.075)");
  context.fillStyle = plotGradient;
  context.beginPath();
  context.roundRect(plotLeft, plotTop, plotSize, plotSize, 15);
  context.fill();
  context.strokeStyle = "rgba(196,181,253,.24)";
  context.lineWidth = 1;
  context.stroke();
  context.strokeStyle = "rgba(255,255,255,.24)";
  context.lineWidth = 1.5;
  context.beginPath();
  context.moveTo(quadrantCenterX, plotTop);
  context.lineTo(quadrantCenterX, plotTop + plotSize);
  context.moveTo(plotLeft, plotTop + plotSize / 2);
  context.lineTo(plotLeft + plotSize, plotTop + plotSize / 2);
  context.stroke();

  const labelY = plotTop + plotSize / 2 - 18;
  const leftLabelX = plotLeft - 80;
  const rightLabelX = plotLeft + plotSize + 10;
  context.fillStyle = "rgba(12,15,25,.78)";
  context.beginPath();
  context.roundRect(leftLabelX, labelY, 70, 38, 7);
  context.roundRect(rightLabelX, labelY, 70, 38, 7);
  context.fill();
  context.fillStyle = "#f7f6ff";
  context.font = "600 10px Arial, sans-serif";
  context.textAlign = "left";
  context.fillText("← Esquerda", leftLabelX + 5, plotTop + plotSize / 2 - 3);
  context.fillText("Mais Estado", leftLabelX + 5, plotTop + plotSize / 2 + 11);
  context.textAlign = "right";
  context.fillText("Direita →", rightLabelX + 65, plotTop + plotSize / 2 - 3);
  context.fillText("Mais mercado", rightLabelX + 65, plotTop + plotSize / 2 + 11);

  const dotX = plotLeft + (quadrant.x / 100) * plotSize;
  const dotY = plotTop + (quadrant.y / 100) * plotSize;
  context.save();
  context.fillStyle = "rgba(66,214,191,.25)";
  context.shadowColor = "rgba(94,234,212,.85)";
  context.shadowBlur = 24;
  context.beginPath();
  context.arc(dotX, dotY, 13, 0, Math.PI * 2);
  context.fill();
  context.shadowBlur = 0;
  context.fillStyle = "#86e6d5";
  context.strokeStyle = "#11121e";
  context.lineWidth = 3;
  context.beginPath();
  context.arc(dotX, dotY, 7, 0, Math.PI * 2);
  context.fill();
  context.stroke();
  context.restore();

  context.textAlign = "center";
  context.fillStyle = "#f5f3ff";
  context.font = "600 12px Arial, sans-serif";
  context.fillText("↓ Autoritário", quadrantCenterX, plotTop + plotSize + 18);
  context.fillStyle = "rgba(255,255,255,.58)";
  context.font = "9px Arial, sans-serif";
  context.fillText("Mais controle e regras", quadrantCenterX, plotTop + plotSize + 31);

  // Eixos com rótulos e barras condensados no mesmo estilo visual da página.
  const axesX = axesCard.x + 17;
  const axesWidth = axesCard.width - 34;
  context.textAlign = "left";
  context.fillStyle = "#f7f6ff";
  context.font = "700 13px Arial, sans-serif";
  context.fillText("SEUS SEIS EIXOS", axesX, cardTop + 27);
  drawWrappedText("50% indica equilíbrio. Quanto mais próximo das extremidades, maior a inclinação.", axesX, cardTop + 45, axesWidth, 12, "9px Arial, sans-serif", "rgba(255,255,255,.58)", 2);
  axes.forEach((axis, index) => {
    const rowY = cardTop + 89 + index * 52;
    context.textAlign = "left";
    context.fillStyle = "#f7f6ff";
    context.font = "600 12px Arial, sans-serif";
    context.fillText(axis.label, axesX, rowY);
    context.textAlign = "right";
    context.fillStyle = "#86e6d5";
    context.font = "700 12px Arial, sans-serif";
    context.fillText(`${axis.percent}%`, axesX + axesWidth, rowY);
    context.fillStyle = "rgba(255,255,255,.13)";
    context.beginPath();
    context.roundRect(axesX, rowY + 8, axesWidth, 5, 3);
    context.fill();
    const bar = context.createLinearGradient(axesX, 0, axesX + axesWidth, 0);
    bar.addColorStop(0, "#8b7cf6");
    bar.addColorStop(1, "#42d6bf");
    context.fillStyle = bar;
    context.beginPath();
    context.roundRect(axesX, rowY + 8, (axesWidth * axis.percent) / 100, 5, 3);
    context.fill();
    context.textAlign = "left";
    context.fillStyle = "rgba(255,255,255,.5)";
    context.font = "8px Arial, sans-serif";
    context.fillText(axis.low, axesX, rowY + 25);
    context.textAlign = "right";
    context.fillText(axis.high, axesX + axesWidth, rowY + 25);
  });

  // Perfis semelhantes em uma faixa enxuta abaixo das três colunas.
  context.textAlign = "left";
  context.fillStyle = "#b9aaff";
  context.font = "600 9px Arial, sans-serif";
  context.fillText("PERFIS MAIS PRÓXIMOS", 40, 518);
  const nearbyGap = 12;
  const nearbyWidth = (1120 - nearbyGap * 2) / 3;
  closestProfiles.forEach((profile, index) => {
    const x = 40 + index * (nearbyWidth + nearbyGap);
    context.fillStyle = "rgba(255,255,255,.04)";
    context.strokeStyle = "rgba(255,255,255,.1)";
    context.beginPath();
    context.roundRect(x, 526, nearbyWidth, 36, 10);
    context.fill();
    context.stroke();
    context.fillStyle = "#f5f3ff";
    context.font = "600 11px Arial, sans-serif";
    context.textAlign = "left";
    context.fillText(profile.name, x + 12, 548, nearbyWidth - 78);
    context.fillStyle = "#86e6d5";
    context.font = "700 11px Arial, sans-serif";
    context.textAlign = "right";
    context.fillText(`${profile.compatibility}%`, x + nearbyWidth - 12, 548);
  });

  context.fillStyle = "rgba(139,124,246,.11)";
  context.beginPath();
  context.roundRect(40, 580, 1120, 24, 9);
  context.fill();
  context.textAlign = "left";
  context.fillStyle = "#ddd6ff";
  context.font = "600 11px Arial, sans-serif";
  context.fillText("Descubra o seu perfil em:", 54, 596);
  context.textAlign = "right";
  context.fillStyle = "#86e6d5";
  context.font = "700 11px Arial, sans-serif";
  context.fillText("dnapolitico.vercel.app", 1146, 596);
  context.textAlign = "left";
  const data = canvas.toDataURL("image/png").split(",")[1];
  if (!data) throw new Error("Não foi possível gerar a imagem.");
  const binary = atob(data);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return new Blob([bytes], { type: "image/png" });
}

export default function DnaPoliticalApp({ sharedRoute = false }: { sharedRoute?: boolean }) {
  const [stage, setStage] = useState<Stage>(sharedRoute ? "result" : "home");
  const [current, setCurrent] = useState(0);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState(questions);
  const [answers, setAnswers] = useState<(Answer | null)[]>(Array(questions.length).fill(null));
  const [sharedPercentages, setSharedPercentages] = useState<Record<Axis, number> | null>(null);
  const [isSharedRouteReady, setIsSharedRouteReady] = useState(!sharedRoute);
  const [invalidSharedLink, setInvalidSharedLink] = useState(false);
  const [shareMessage, setShareMessage] = useState("");
  const shareMessageTimeout = useRef<number | null>(null);
  const [pixMessage, setPixMessage] = useState("");
  const [emailCopyFeedback, setEmailCopyFeedback] = useState<{ location: EmailCopyLocation; text: string } | null>(null);
  const emailCopyTimeout = useRef<number | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("light");
  const [showIdeologicalReferences, setShowIdeologicalReferences] = useState(true);

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

  useEffect(() => {
    if (!sharedRoute) return;

    const percentages = parseSharedPercentages(window.location.search);
    if (percentages) {
      setSharedPercentages(percentages);
      setStage("result");
    } else {
      setInvalidSharedLink(true);
      setStage("home");
    }
    setIsSharedRouteReady(true);
  }, [sharedRoute]);

  useEffect(() => {
    if (stage === "result") window.scrollTo(0, 0);
  }, [stage]);

  useEffect(() => () => {
    if (shareMessageTimeout.current !== null) window.clearTimeout(shareMessageTimeout.current);
    if (emailCopyTimeout.current !== null) window.clearTimeout(emailCopyTimeout.current);
  }, []);

  function clearShareMessage() {
    if (shareMessageTimeout.current !== null) window.clearTimeout(shareMessageTimeout.current);
    shareMessageTimeout.current = null;
    setShareMessage("");
  }

  function showShareMessage(message: string) {
    if (shareMessageTimeout.current !== null) window.clearTimeout(shareMessageTimeout.current);
    setShareMessage(message);
    shareMessageTimeout.current = window.setTimeout(() => {
      setShareMessage("");
      shareMessageTimeout.current = null;
    }, 7000);
  }

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
    if (window.location.pathname === "/r") window.history.replaceState(null, "", "/");
    setQuizQuestions(questions);
    setAnswers(Array(questions.length).fill(null));
    setSharedPercentages(null);
    setCurrent(0);
    setStage("home");
  }

  const scores = sharedPercentages ? scoresFromPercentages(sharedPercentages, quizQuestions) : calculateScores(quizQuestions, answers);
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
  const axisPercentages = sharedPercentages ?? Object.fromEntries(axisInfo.map((axis) => [axis.key, getAxisPercent(axis.key, scores[axis.key], quizQuestions)])) as Record<Axis, number>;
  const quadrantCoordinates = getQuadrantCoordinates(axisPercentages);
  const shareAxes = axisInfo.map((axis) => ({ label: axis.label, percent: axisPercentages[axis.key], low: axis.low, high: axis.high }));
  const ideologicalIntensity = getIdeologicalIntensity(shareAxes);
  const shareClosestProfiles = closestProfiles.map(({ archetype: profile, compatibility }) => ({ name: profile.name, compatibility }));
  const sharedUrl = typeof window !== "undefined"
    ? `${window.location.origin}/r?s=${axisInfo.map((axis) => axisPercentages[axis.key]).join(",")}`
    : `https://dnapolitico.vercel.app/r?s=${axisInfo.map((axis) => axisPercentages[axis.key]).join(",")}`;
  const shareText = `Meu resultado no DNA Político: ${archetype.name}. Posicionamento geral: ${politicalPosition}. ${shareAxes.map((axis) => `${axis.label}: ${axis.percent}%`).join(" · ")} Confira o seu: ${sharedUrl}`;

  async function copyResult() {
    try {
      await navigator.clipboard.writeText(shareText);
      showShareMessage("Resultado copiado!");
    } catch {
      showShareMessage("Não foi possível copiar automaticamente neste navegador.");
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

  async function copyContactEmail(location: EmailCopyLocation) {
    let text = "E-mail copiado.";
    try {
      if (!navigator.clipboard?.writeText) throw new Error("Clipboard API indisponível");
      await navigator.clipboard.writeText("guuhguerra22@gmail.com");
    } catch {
      text = "Não foi possível copiar. Selecione o endereço acima para copiá-lo.";
    }

    if (emailCopyTimeout.current !== null) window.clearTimeout(emailCopyTimeout.current);
    setEmailCopyFeedback({ location, text });
    emailCopyTimeout.current = window.setTimeout(() => {
      setEmailCopyFeedback(null);
      emailCopyTimeout.current = null;
    }, 3500);
  }

  async function copyResultLink() {
    try {
      await navigator.clipboard.writeText(sharedUrl);
      showShareMessage("Link com seu resultado copiado!");
    } catch {
      showShareMessage("Não foi possível copiar o link neste navegador.");
    }
  }

  async function downloadResultImage() {
    setIsGeneratingImage(true);
    clearShareMessage();
    try {
      const blob = createShareImage(archetype.name, archetype.description, politicalPosition, archetype.shareQuote, primaryCompatibility, shareAxes, ideologicalIntensity, shareClosestProfiles, quadrantCoordinates);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "meu-dna-politico.png";
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      showShareMessage("Imagem PNG baixada!");
    } catch {
      showShareMessage("Não foi possível gerar a imagem neste navegador.");
    } finally {
      setIsGeneratingImage(false);
    }
  }

  async function copyResultImage() {
    if (typeof ClipboardItem === "undefined" || typeof navigator.clipboard?.write !== "function") {
      showShareMessage("Este navegador não oferece suporte para copiar imagens. Use “Baixar imagem PNG”.");
      return;
    }

    try {
      const blob = createShareImage(archetype.name, archetype.description, politicalPosition, archetype.shareQuote, primaryCompatibility, shareAxes, ideologicalIntensity, shareClosestProfiles, quadrantCoordinates);
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      showShareMessage("Imagem copiada para a área de transferência.");
    } catch {
      showShareMessage("Este navegador ou suas permissões não permitem copiar imagens. Use “Baixar imagem PNG”.");
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
      showShareMessage("Compartilhamento não disponível. Resultado copiado!");
      return;
    }

    try {
      const blob = createShareImage(archetype.name, archetype.description, politicalPosition, archetype.shareQuote, primaryCompatibility, shareAxes, ideologicalIntensity, shareClosestProfiles, quadrantCoordinates);
      const file = new File([blob], "meu-dna-politico.png", { type: "image/png" });
      const url = sharedUrl;
      if (shareNavigator.canShare?.({ files: [file] })) {
        await shareNavigator.share({ title: "Meu resultado no DNA Político", text: shareText, url, files: [file] });
      } else {
        await shareNavigator.share({ title: "Meu resultado no DNA Político", text: shareText, url });
      }
      showShareMessage("Compartilhamento iniciado!");
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return;
      showShareMessage("Não foi possível compartilhar neste navegador.");
    }
  }

  if (!isSharedRouteReady) {
    return <main className="grid min-h-screen place-items-center px-5 text-sm text-white/60">Carregando resultado compartilhado…</main>;
  }

  return (
    <main className={`min-h-screen px-5 sm:px-8 ${stage === "result" ? "py-4" : "py-8 sm:py-12"}`}>
      <div className={`mx-auto flex ${stage === "result" ? "min-h-[calc(100vh-2rem)]" : "min-h-[calc(100vh-4rem)]"} w-full ${stage === "result" ? "max-w-6xl" : "max-w-5xl"} flex-col`}>
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

        {invalidSharedLink && <p role="alert" className="mt-6 rounded-xl border border-amber-400/20 bg-amber-400/[0.06] px-4 py-3 text-sm text-amber-200">Este link de resultado é inválido ou está incompleto. Você pode fazer o teste novamente.</p>}

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
                    <article key={profile.name} className="theme-panel flex flex-col rounded-xl border border-white/[0.08] bg-white/[0.025] p-4">
                      <span aria-hidden="true" className="mb-3 grid h-9 w-9 place-items-center rounded-lg border border-violet-300/20 bg-violet-300/[0.08] text-violet-300">
                        <ProfileIcon className="h-5 w-5" strokeWidth={1.8} />
                      </span>
                      <h3 className="text-sm font-semibold leading-5">{profile.name}</h3>
                      <p className="mt-1.5 text-xs leading-4 text-white/55">{profile.description}</p>
                      <div className="mt-auto pt-3">
                        <p className="text-[9px] font-semibold uppercase tracking-wide text-white/40">Exemplos frequentemente associados</p>
                        <p className="home-profile-examples mt-0.5 line-clamp-2 text-[10px] leading-4 text-violet-200/80" title={profile.examples.slice(0, 2).join(" • ")}>{profile.examples.slice(0, 2).join(" • ")}</p>
                      </div>
                    </article>
                  );
                })}
              </div>
              <p className="mt-5 text-center text-xs leading-5 text-white/45">Não existem respostas certas ou erradas. Os exemplos são aproximações ilustrativas; pessoas reais raramente correspondem perfeitamente a um único perfil político.</p>
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
          <section className="grid w-full items-stretch gap-3 self-center py-3 md:grid-cols-2 xl:grid-cols-[.78fr_1.4fr_.93fr]">
            <div className="theme-archetype-card relative flex flex-col overflow-hidden rounded-2xl border border-violet-300/25 bg-gradient-to-br from-violet-500/[0.2] via-[#11131f] to-teal-400/[0.08] p-4 shadow-[0_24px_90px_rgba(113,91,230,.12)]">
              <ProfileIcon aria-hidden="true" className="absolute -right-8 -top-10 h-36 w-36 text-violet-300 opacity-[0.07]" strokeWidth={1.2} />
              <p className="text-[11px] font-semibold uppercase tracking-[.16em] text-violet-300">Seu perfil político</p>
              <div className="mt-2 flex items-center gap-2.5">
                <span aria-hidden="true" className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-violet-200/20 bg-violet-300/10 shadow-[0_0_32px_rgba(167,139,250,.18)]"><ProfileIcon className="h-6 w-6 text-violet-200" strokeWidth={1.7} /></span>
                <h1 className="min-w-0 text-xl font-semibold leading-tight tracking-[-0.03em] sm:text-2xl">{archetype.name}</h1>
              </div>
              <span className="mt-2 inline-flex w-fit items-center rounded-full border border-violet-300/30 bg-violet-300/[0.12] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[.08em] text-violet-200">{politicalPosition}</span>
              <div className="mt-2 rounded-xl border border-teal-200/20 bg-teal-200/[0.06] px-3 py-2 shadow-[0_0_22px_rgba(94,234,212,.08)]" aria-label={`Intensidade ideológica: ${ideologicalIntensity.percent}%, ${ideologicalIntensity.label}. ${ideologicalIntensity.description}`}>
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-[9px] font-bold uppercase tracking-[.1em] text-teal-200">Intensidade ideológica</h2>
                  <span className="text-sm font-bold tabular-nums text-teal-200">{ideologicalIntensity.percent}%</span>
                </div>
                <div className="theme-progress-track mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/[0.1]" aria-hidden="true">
                  <div className="h-full rounded-full bg-gradient-to-r from-violet-400 to-teal-300" style={{ width: `${ideologicalIntensity.percent}%` }} />
                </div>
                <p className="mt-1 text-[10px] font-semibold text-white/85">{ideologicalIntensity.label}</p>
                <p className="text-[9px] leading-3 text-white/55">{ideologicalIntensity.description}</p>
              </div>
              <p className="mt-2 text-xs leading-4 text-white/65">{archetype.description}</p>
              <blockquote className="theme-quote mt-2 flex gap-2 rounded-xl border border-teal-200/20 bg-teal-200/[0.06] px-3 py-2 text-sm font-medium italic leading-5 text-teal-100/90 shadow-[0_0_18px_rgba(94,234,212,.06)]"><span aria-hidden="true" className="-mt-1 shrink-0 text-2xl font-semibold not-italic text-violet-300">“</span><span>{archetype.shareQuote}</span></blockquote>
              <div className="mt-3 flex items-center gap-3 text-teal-200" role="img" aria-label={`Compatibilidade: ${primaryCompatibility}%. Suas respostas se alinham em ${primaryCompatibility}% com este perfil.`}>
                <div className="relative grid h-24 w-24 shrink-0 place-items-center">
                  <svg aria-hidden="true" viewBox="0 0 120 120" className="absolute inset-0 h-full w-full -rotate-90">
                    <circle cx="60" cy="60" r="53" fill="none" stroke="currentColor" strokeWidth="5" opacity=".16" />
                    <circle cx="60" cy="60" r="53" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeDasharray={2 * Math.PI * 53} strokeDashoffset={(2 * Math.PI * 53 * (100 - primaryCompatibility)) / 100} className="drop-shadow-[0_0_5px_rgba(45,212,191,.5)]" />
                  </svg>
                  <span className="text-center text-2xl font-bold leading-none tabular-nums">{primaryCompatibility}%</span>
                </div>
                <p className="text-[10px] leading-4 text-white/65">Suas respostas se alinham em <strong className="font-semibold text-teal-200">{primaryCompatibility}%</strong> com este perfil.</p>
              </div>
              <div className="mt-2 rounded-xl border border-white/[0.08] bg-white/[0.025] px-3 py-2">
                <p className="text-[9px] font-semibold uppercase tracking-[.14em] text-violet-200/65">Posicionamento geral</p>
                <p className="mt-0.5 text-sm font-semibold">{politicalPosition}</p>
                <p className="text-[10px] leading-4 text-white/45">Baseado em Economia e Costumes.</p>
              </div>
              <div className="mt-3 border-t border-white/[0.1] pt-2.5">
                <div className="flex items-baseline justify-between gap-2">
                  <h2 id="closest-profiles-title" className="text-xs font-semibold">Perfis mais próximos</h2>
                  <span className="text-[9px] text-white/40">ideias semelhantes</span>
                </div>
                <ol className="mt-2 space-y-2">
                  {closestProfiles.map(({ archetype: profile, compatibility }) => {
                    const NearbyIcon = archetypeIcons[profile.name] ?? Dna;
                    return (
                      <li key={profile.name}>
                        <div className="flex min-w-0 items-center gap-1.5">
                          <NearbyIcon aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-violet-300" strokeWidth={1.8} />
                          <span className="min-w-0 flex-1 truncate text-[10px] font-medium text-white/75">{profile.name}</span>
                          <span className="shrink-0 text-[10px] font-semibold tabular-nums text-teal-200">{compatibility}%</span>
                        </div>
                        <div className="theme-progress-track mt-1 h-1 overflow-hidden rounded-full bg-white/[0.08]" aria-hidden="true">
                          <div className="h-full rounded-full bg-gradient-to-r from-violet-400 to-teal-300" style={{ width: `${compatibility}%` }} />
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </div>
              <button onClick={restart} className="mt-auto self-start pt-3 inline-flex items-center gap-1 text-[11px] font-medium text-violet-200 transition hover:text-white">Refazer questionário <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5" /></button>
            </div>

            <section className="theme-quadrant-card flex flex-col rounded-2xl border border-violet-300/25 bg-gradient-to-br from-violet-500/[0.12] via-white/[0.025] to-teal-400/[0.08] p-3 shadow-[0_20px_70px_rgba(91,75,210,.12)] sm:p-4" aria-labelledby="quadrant-title">
              <div className="text-center">
                <h2 id="quadrant-title" className="text-lg font-semibold sm:text-xl">Seu posicionamento no quadrante</h2>
                <p className="mt-0.5 text-[11px] leading-4 text-white/60">Seu posicionamento aproximado no espectro político.</p>
              </div>
              <label className="mt-2 inline-flex w-fit cursor-pointer items-center gap-2 self-center text-[10px] font-medium text-white/65">
                <input
                  type="checkbox"
                  checked={showIdeologicalReferences}
                  onChange={(event) => setShowIdeologicalReferences(event.target.checked)}
                  className="h-3.5 w-3.5 accent-violet-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                />
                Mostrar referências ideológicas
              </label>
              <div className="flex flex-1 flex-col justify-center">
                <p className="mt-2 text-center text-sm font-semibold text-white/85">↑ Libertário<span className="mt-0.5 block text-[10px] font-normal text-white/55">Mais liberdade individual</span></p>
                <div className="mt-1 grid w-full grid-cols-[3.5rem_minmax(0,1fr)_3.5rem] items-center gap-1.5 sm:grid-cols-[4rem_minmax(0,1fr)_4rem] sm:gap-2">
                  <span aria-hidden="true" className="quadrant-label flex flex-col items-start rounded-md px-1 py-1 text-[9px] font-semibold leading-3 sm:text-[10px]">← Esquerda<span className="text-[8px] font-normal opacity-75 sm:text-[9px]">Mais Estado</span></span>
                  <div
                    role="img"
                    aria-label={`Posição aproximada: ${quadrantCoordinates.x < 49 ? "esquerda" : quadrantCoordinates.x > 51 ? "direita" : "centro horizontal"} e ${quadrantCoordinates.y < 49 ? "libertária" : quadrantCoordinates.y > 51 ? "autoritária" : "centro vertical"}.`}
                    className="quadrant-surface relative mx-auto aspect-square w-full max-w-[20rem] rounded-2xl border border-white/15 bg-white/[0.035] shadow-[inset_0_0_40px_rgba(139,124,246,.07),0_12px_35px_rgba(16,185,129,.05)]"
                  >
                    <span aria-hidden="true" className="quadrant-grid-line absolute bottom-0 left-1/2 top-0 w-px -translate-x-1/2" />
                    <span aria-hidden="true" className="quadrant-grid-line absolute left-0 right-0 top-1/2 h-px -translate-y-1/2" />
                    <span
                      aria-hidden="true"
                      className="quadrant-dot absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-slate-950 bg-teal-300 shadow-[0_0_0_8px_rgba(94,234,212,.22),0_0_32px_rgba(94,234,212,.9)]"
                      style={{ left: `${quadrantCoordinates.x}%`, top: `${quadrantCoordinates.y}%` }}
                    />
                    {showIdeologicalReferences && ideologicalReferences.map((reference) => (
                      <button
                        key={reference.id}
                        type="button"
                        aria-label={`${reference.label}: ${reference.description}`}
                        title={`${reference.label}\n${reference.description}`}
                        className="group absolute z-10 grid h-5 w-5 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full focus:z-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-300 hover:z-30"
                        style={{ left: `${reference.x}%`, top: `${reference.y}%` }}
                      >
                        <span aria-hidden="true" className="quadrant-reference-dot h-2 w-2 rounded-full border transition group-hover:scale-125 group-focus:scale-125" />
                        <span aria-hidden="true" className="quadrant-reference-tooltip pointer-events-none absolute left-1/2 top-full z-20 mt-1.5 w-36 -translate-x-1/2 rounded-lg border px-2.5 py-2 text-left opacity-0 shadow-xl transition-opacity group-hover:opacity-100 group-focus:opacity-100">
                          <span className="quadrant-reference-tooltip-title block text-[10px] font-semibold">{reference.label}</span>
                          <span className="quadrant-reference-tooltip-description mt-0.5 block text-[9px] leading-3">{reference.description}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                  <span aria-hidden="true" className="quadrant-label flex flex-col items-end rounded-md px-1 py-1 text-right text-[9px] font-semibold leading-3 sm:text-[10px]">Direita →<span className="text-[8px] font-normal opacity-75 sm:text-[9px]">Mais mercado</span></span>
                </div>
                <p className="mt-1 text-center text-sm font-semibold text-white/85">↓ Autoritário<span className="mt-0.5 block text-[10px] font-normal text-white/55">Mais controle e regras</span></p>
              </div>
              {showIdeologicalReferences && (
                <div className="mt-auto pt-2">
                  <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-[9px] text-white/55" aria-label="Legenda do quadrante">
                    <span className="inline-flex items-center gap-1.5"><span aria-hidden="true" className="h-2.5 w-2.5 rounded-full border-[2px] border-slate-950 bg-teal-300 shadow-[0_0_8px_rgba(94,234,212,.7)]" />Você</span>
                    <span className="inline-flex items-center gap-1.5"><span aria-hidden="true" className="quadrant-reference-dot h-2 w-2 rounded-full border" />Referência ideológica</span>
                  </div>
                  <p className="mx-auto mt-1.5 max-w-md text-center text-[9px] leading-3 text-white/40">Referências ideológicas são aproximações visuais usadas apenas para facilitar a interpretação do mapa. Não representam partidos, políticos ou organizações.</p>
                </div>
              )}
            </section>

            <section className="theme-panel flex flex-col rounded-2xl border border-white/[0.08] bg-white/[0.025] p-3 md:col-span-2 xl:col-span-1 sm:p-4" aria-labelledby="axes-title">
              <div className="mb-2">
                <h2 id="axes-title" className="text-base font-semibold">Seus seis eixos</h2>
                <p className="mt-0.5 text-[10px] leading-3 text-white/45">50% indica o centro; os extremos mostram a inclinação.</p>
              </div>
              <div className="grid gap-2 xl:grid-cols-1">
                {axisInfo.map((axis) => {
                  const percent = axisPercentages[axis.key];
                  const AxisIcon = axisIcons[axis.key];
                  return (
                    <div key={axis.key}>
                      <div className="mb-0.5 flex items-center justify-between gap-2">
                        <span className="flex min-w-0 items-center gap-1.5 text-[11px] font-medium leading-3 text-white/85"><AxisIcon aria-hidden="true" className="h-3 w-3 shrink-0 text-violet-300" strokeWidth={1.8} />{axis.label}</span>
                        <span className="text-[11px] font-semibold tabular-nums text-teal-200">{percent}%</span>
                      </div>
                      <div className="theme-progress-track relative h-1 overflow-hidden rounded-full bg-white/[0.08]" role="progressbar" aria-label={`${axis.label}: ${percent}% em direção a ${axis.high}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent}><div className="h-full rounded-full bg-gradient-to-r from-violet-400 to-teal-300" style={{ width: `${percent}%` }} /></div>
                      <div className="mt-0.5 flex justify-between gap-1 text-[9px] leading-3 text-white/40"><span>{axis.low}</span><span className="text-right">{axis.high}</span></div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-auto pt-8">
                <div className="rounded-xl border border-white/[0.08] bg-white/[0.025] p-3">
                  <h3 className="text-[11px] font-semibold text-white/75">Como ler os percentuais</h3>
                  <div className="mt-2 flex items-center justify-between text-[9px] font-medium tabular-nums text-white/50">
                    <span>0%</span>
                    <span>50% · centro</span>
                    <span>100%</span>
                  </div>
                  <div aria-hidden="true" className="relative mt-1.5 h-1.5 rounded-full bg-gradient-to-r from-violet-400 via-slate-400 to-teal-300">
                    <span className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-slate-900 bg-white shadow-sm" />
                  </div>
                  <p className="mt-2 text-[10px] leading-4 text-white/55">50% indica equilíbrio entre os lados. Quanto mais perto de 0% ou 100%, maior a inclinação para o lado correspondente indicado abaixo de cada barra.</p>
                </div>
              </div>
            </section>
          </section>
        )}

        {stage === "result" && (
          <section className="theme-share-card mb-4 w-full self-center rounded-2xl border border-violet-300/25 bg-gradient-to-r from-violet-500/[0.13] via-white/[0.035] to-teal-400/[0.10] p-4 shadow-[0_18px_65px_rgba(91,75,210,.12)] sm:mb-6 sm:p-5" aria-labelledby="share-result-title">
            <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
              <div className="max-w-xl lg:max-w-[28rem]">
                <p className="text-[10px] font-semibold uppercase tracking-[.18em] text-violet-300">Leve seu resultado para a conversa</p>
                <h2 id="share-result-title" className="mt-1 text-xl font-semibold sm:text-2xl">Compartilhe seu resultado</h2>
                <p className="mt-1.5 text-sm leading-6 text-white/60">Compare seu resultado com amigos e descubra como cada pessoa se posiciona nos seis eixos.</p>
              </div>
              <div className="grid w-full gap-2 sm:grid-cols-2 lg:max-w-none lg:grid-cols-4">
                <button onClick={shareResult} className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-400 px-3 py-2.5 text-sm font-semibold text-[#11101d] shadow-[0_8px_24px_rgba(139,124,246,.28)] transition hover:bg-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-200"><Share2 aria-hidden="true" className="h-4 w-4 shrink-0" />Compartilhar</button>
                <button onClick={copyResultImage} className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.07] px-3 py-2.5 text-xs font-semibold text-white/85 transition hover:border-violet-300/45 hover:bg-violet-300/[0.1] focus:outline-none focus:ring-2 focus:ring-violet-300"><Image aria-hidden="true" className="h-4 w-4 shrink-0" />Copiar imagem</button>
                <button onClick={downloadResultImage} disabled={isGeneratingImage} className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.07] px-3 py-2.5 text-xs font-semibold text-white/85 transition hover:border-teal-300/45 hover:bg-teal-300/[0.1] focus:outline-none focus:ring-2 focus:ring-teal-300 disabled:cursor-wait disabled:opacity-50"><Download aria-hidden="true" className="h-4 w-4 shrink-0" />{isGeneratingImage ? "Gerando PNG…" : "Baixar PNG"}</button>
                <button onClick={copyResultLink} className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.07] px-3 py-2.5 text-xs font-semibold text-white/85 transition hover:border-violet-300/45 hover:bg-violet-300/[0.1] focus:outline-none focus:ring-2 focus:ring-violet-300"><Link2 aria-hidden="true" className="h-4 w-4 shrink-0" />Copiar link</button>
              </div>
            </div>
            {shareMessage && <p role="status" className="mt-4 inline-flex items-center gap-2 text-xs text-teal-200">{(shareMessage === "Imagem copiada para a área de transferência." || shareMessage.includes("copiado")) && <CircleCheck aria-hidden="true" className="h-4 w-4 shrink-0" />}{shareMessage}</p>}
          </section>
        )}

        {stage === "result" && (
          <div className="mb-6 grid w-full items-start gap-3 self-center lg:grid-cols-[1fr_1.1fr]">
            <details className="methodology-details theme-panel rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4 sm:p-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-violet-300 [&::-webkit-details-marker]:hidden">
                <span>Como calculamos seu resultado?</span>
                <ChevronDown aria-hidden="true" className="methodology-chevron h-4 w-4 shrink-0 text-violet-300 transition-transform" />
              </summary>
              <div className="mt-3 border-t border-white/[0.08] pt-3">
                <p className="text-sm leading-6 text-white/60">Suas respostas são analisadas em seis dimensões:</p>
                <ul className="mt-2 grid gap-2 text-sm text-white/75 sm:grid-cols-2">
                  {axisInfo.map((axis) => <li key={axis.key} className="flex items-center gap-2"><span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-violet-300" />{axis.label}</li>)}
                </ul>
                <p className="mt-3 text-sm leading-6 text-white/60">Cada resposta ajuda a mostrar sua posição em um ou mais eixos. Depois, comparamos suas respostas com diferentes perfis e mostramos os que mais se aproximam.</p>
                <p className="mt-2 text-xs leading-5 text-white/45">Este resultado é uma aproximação, não um diagnóstico político, e não representa toda a complexidade das suas opiniões.</p>
              </div>
            </details>

            <section className="theme-panel flex flex-col gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4 sm:flex-row sm:items-center sm:p-5" aria-labelledby="support-title">
              <div className="mx-auto shrink-0 rounded-xl bg-white p-2 shadow-sm sm:mx-0" aria-label="QR Code Pix">
                <QRCodeSVG value={pixPayload} size={112} level="M" marginSize={2} bgColor="#ffffff" fgColor="#111827" title="QR Code Pix para apoiar o DNA Político" />
              </div>
              <div className="min-w-0">
                <h2 id="support-title" className="flex items-center gap-2 text-base font-semibold"><Coffee aria-hidden="true" className="h-4 w-4 text-violet-300" />Gostou do projeto?</h2>
                <p className="mt-1 text-sm leading-5 text-white/60">Se o teste foi útil para você, considere pagar um café para ajudar a manter o projeto gratuito.</p>
                <button type="button" onClick={copyPix} className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/[0.05] px-3 py-2 text-xs font-semibold text-white/80 transition hover:border-violet-300/35 hover:bg-violet-300/[0.07] focus:outline-none focus:ring-2 focus:ring-violet-300"><Copy aria-hidden="true" className="h-3.5 w-3.5" />Copiar PIX</button>
                {pixMessage && <p role="status" aria-live="polite" className="mt-2 text-xs text-teal-200">{pixMessage}</p>}
              </div>
            </section>
          </div>
        )}

        {stage === "result" && (
          <section className="theme-panel mb-6 w-full rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4 sm:p-5" aria-labelledby="contact-title">
            <div className="max-w-3xl">
              <h2 id="contact-title" className="text-lg font-semibold tracking-tight">Sugestões, críticas ou ideias?</h2>
              <p className="mt-2 text-sm leading-6 text-white/60">Este projeto ainda está evoluindo. Se você encontrou algum erro, tem sugestões de melhorias ou quer acompanhar novos projetos, fique à vontade para entrar em contato.</p>
              <p className="mt-3 text-sm font-medium text-violet-200">Gostou do DNA Político? Compartilhe seu resultado e marque @guuhguerra.</p>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <article className="theme-panel flex flex-col rounded-xl border border-white/10 bg-white/[0.035] p-4">
                <div className="flex items-center gap-3">
                  <span className="theme-brand-mark flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] text-violet-200"><Mail aria-hidden="true" className="h-5 w-5" /></span>
                  <div>
                    <h3 className="font-semibold">E-mail</h3>
                    <p className="mt-1 text-sm text-white/60">Envie sugestões, críticas ou relate um erro.</p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <a href="mailto:guuhguerra22@gmail.com" className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/[0.05] px-3 py-2 text-sm font-semibold text-white/85 transition hover:border-violet-300/45 hover:bg-violet-300/[0.08] focus:outline-none focus:ring-2 focus:ring-violet-300">
                    guuhguerra22@gmail.com <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
                  </a>
                  <button type="button" onClick={() => copyContactEmail("contact")} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/[0.05] px-3 py-2 text-sm font-semibold text-white/85 transition hover:border-violet-300/45 hover:bg-violet-300/[0.08] focus:outline-none focus:ring-2 focus:ring-violet-300">
                    <Copy aria-hidden="true" className="h-4 w-4" />Copiar e-mail
                  </button>
                </div>
                {emailCopyFeedback?.location === "contact" && <p role="status" aria-live="polite" className="mt-2 text-xs text-teal-200">{emailCopyFeedback.text}</p>}
              </article>

              <article className="theme-panel flex flex-col rounded-xl border border-white/10 bg-white/[0.035] p-4">
                <div className="flex items-center gap-3">
                  <span className="theme-brand-mark flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] text-violet-200"><XIcon className="h-4 w-4" /></span>
                  <div>
                    <h3 className="font-semibold">@guuhguerra</h3>
                    <p className="mt-1 text-sm text-white/60">Compartilhe seu resultado ou envie sugestões.</p>
                  </div>
                </div>
                <a href="https://x.com/guuhguerra" target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex min-h-10 items-center justify-center gap-2 self-start rounded-lg border border-white/15 bg-white/[0.05] px-3 py-2 text-sm font-semibold text-white/85 transition hover:border-violet-300/45 hover:bg-violet-300/[0.08] focus:outline-none focus:ring-2 focus:ring-violet-300">
                  Seguir no X <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
                </a>
              </article>
            </div>
          </section>
        )}

        <footer className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.07] pt-5 text-[11px] text-white/35">
          <span>DNA Político</span>
          <span className="mr-auto sm:mr-0">Suas respostas são processadas neste navegador.</span>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-white/50">
            <span className="text-white/45">Entre em contato ou envie sugestões:</span>
            <nav aria-label="Contato" className="flex items-center gap-3">
              <a href="https://x.com/guuhguerra" target="_blank" rel="noopener noreferrer" aria-label="X: @guuhguerra" title="X: @guuhguerra" className="inline-flex items-center gap-1.5 rounded p-1 transition hover:text-violet-200 focus:outline-none focus:ring-2 focus:ring-violet-300"><XIcon className="h-3.5 w-3.5" /><span>@guuhguerra</span></a>
              <a href="mailto:guuhguerra22@gmail.com" aria-label="Enviar e-mail para guuhguerra22@gmail.com" title="E-mail: guuhguerra22@gmail.com" className="inline-flex items-center gap-1.5 rounded p-1 transition hover:text-violet-200 focus:outline-none focus:ring-2 focus:ring-violet-300"><Mail aria-hidden="true" className="h-3.5 w-3.5" /><span>guuhguerra22@gmail.com</span></a>
              <button type="button" onClick={() => copyContactEmail("footer")} aria-label="Copiar endereço de e-mail" className="inline-flex items-center gap-1.5 rounded p-1 transition hover:text-violet-200 focus:outline-none focus:ring-2 focus:ring-violet-300"><Copy aria-hidden="true" className="h-3.5 w-3.5" /><span>{emailCopyFeedback?.location === "footer" ? "E-mail copiado" : "Copiar e-mail"}</span></button>
            </nav>
          </div>
          {emailCopyFeedback?.location === "footer" && <span role="status" aria-live="polite" className="sr-only">{emailCopyFeedback.text}</span>}
        </footer>
      </div>
    </main>
  );
}
