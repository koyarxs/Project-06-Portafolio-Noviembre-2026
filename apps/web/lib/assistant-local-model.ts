import type { AssistantKnowledge } from './assistant-replies';

type LanguageOptions = {
  expectedInputs: { type: 'text'; languages: string[] }[];
  expectedOutputs: { type: 'text'; languages: string[] }[];
};
type LocalSession = { prompt(text: string, options: { signal: AbortSignal }): Promise<string>; destroy(): void };
type BrowserModel = {
  availability(options: LanguageOptions): Promise<string>;
  create(options: LanguageOptions & { signal: AbortSignal }): Promise<LocalSession>;
};

const language: LanguageOptions = {
  expectedInputs: [{ type: 'text', languages: ['es'] }],
  expectedOutputs: [{ type: 'text', languages: ['es'] }],
};

function browserModel() {
  return (globalThis as typeof globalThis & { LanguageModel?: BrowserModel }).LanguageModel;
}

export async function localModelAvailable() {
  try {
    return await browserModel()?.availability(language) === 'available';
  } catch {
    return false;
  }
}

export async function recognizeQuestion(question: string, knowledge: AssistantKnowledge) {
  const model = browserModel();
  if (!model || !await localModelAvailable()) return;
  const choices = [
    'Ver proyectos', 'Proyectos completados', 'Proyectos en desarrollo', 'Proyectos nuevos',
    'Demos en video', 'Capturas', 'Mi stack', 'CV', 'Trayectoria', 'Contacto', 'GitHub',
    ...knowledge.faqs.map(faq => faq.question),
    ...knowledge.topics.map(topic => topic.question),
    ...knowledge.projects.flatMap(project => [project.name, `Stack de ${project.name}`, `Video de ${project.name}`]),
  ];
  const signal = AbortSignal.timeout(4500);
  let session: LocalSession | undefined;
  try {
    session = await model.create({ ...language, signal });
    const output = await session.prompt(
      `Clasifica la consulta del visitante del portafolio. Responde solo con el número de la opción equivalente, o 0 si ninguna corresponde.\n${choices.map((choice, index) => `${index + 1}. ${choice}`).join('\n')}\nConsulta: ${JSON.stringify(question)}`,
      { signal },
    );
    const index = output.trim();
    if (/^[1-9]\d*$/.test(index)) return choices[Number(index) - 1];
  } catch {
    return;
  } finally {
    session?.destroy();
  }
}
