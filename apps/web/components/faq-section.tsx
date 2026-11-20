import type { CSSProperties } from 'react';
import Link from 'next/link';
import { Arrow } from './icons';
import styles from './faq-section.module.css';

const questionIcons = [
  'm8 6-6 6 6 6m8-12 6 6-6 6M14 4l-4 16',
  'M3 5h18v14H3zM3 6l9 7 9-7',
  'M12 3 3 8l9 5 9-5-9-5ZM3 12l9 5 9-5M3 16l9 5 9-5',
  'M3 12l9-9h8v8l-9 9-8-8Zm13-5h.01',
  'M4 6h16v14H4zM8 3v6m8-6v6M4 11h16',
  'M13 4h7v7m0-7-9 9m6 0v7H4V7h7',
] as const;

export const questions = [
  {
    question: '¿Qué tipo de proyectos desarrollas?',
    answer: 'Desarrollo sitios web, sistemas a medida y plataformas SaaS. También trabajo en integraciones y APIs para conectar aplicaciones, automatizar tareas y compartir datos entre herramientas.',
  },
  {
    question: '¿Puedo contactarte si mi idea todavía está tomando forma?',
    answer: 'Sí. Cuéntame qué problema quieres resolver, quién usaría la herramienta y cómo funciona ese proceso hoy. Esa información sirve para definir por dónde conviene empezar.',
  },
  {
    question: '¿También trabajas sobre sistemas existentes?',
    answer: 'Sí. Podemos revisar una mejora puntual, una integración o un flujo que necesite hacerse más simple. Para estimarlo, primero revisamos qué tecnología usa el sistema y cómo se integra con el resto.',
  },
  {
    question: '¿Cómo se define el precio y el plazo?',
    answer: 'Dependen del alcance, las integraciones y lo que ya esté disponible. La cotización puede separar las funciones esenciales de las mejoras futuras para que sepas qué incluye cada etapa.',
  },
  {
    question: '¿Qué pasa después de entregar el proyecto?',
    answer: 'El alcance de la entrega, el despliegue y el soporte posterior se conversa al definir el proyecto. Si necesitas seguimiento o nuevas funciones, se pueden considerar como parte de una etapa siguiente.',
  },
  {
    question: '¿Dónde puedo ver ejemplos de tu trabajo?',
    answer: 'En el portafolio puedes revisar las fichas de Pawly, Zenvik, FlyMaster y otros proyectos. Cada ficha reúne la descripción, el stack y las capturas o videos que están disponibles.',
    href: '/#portafolio',
  },
] as const;

export function FaqSection() {
  return <section id="preguntas-frecuentes" className={styles.section} aria-labelledby="faq-title">
    <div className={styles.inner}>
      <div className={styles.intro}>
        <div className={styles.art} aria-hidden="true">
          <svg viewBox="0 0 56 56" fill="none">
            <path d="M14 14h26a5 5 0 0 1 5 5v13a5 5 0 0 1-5 5H25l-9 7v-7h-2a5 5 0 0 1-5-5V19a5 5 0 0 1 5-5Z"
              stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            <path d="M22 23h14m-14 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
        <h2 id="faq-title">Preguntas <span>frecuentes</span></h2>
        <p>Lo que conviene conversar antes de empezar un proyecto.</p>
        <Link href="/contacto" className={styles.contact}>Cuéntame tu idea <Arrow diagonal /></Link>
      </div>
      <div className={styles.questions}>
        {questions.map((item, index) => <details key={item.question}>
          <summary>
            <span className={styles.questionIcon} aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round">
                <path d={questionIcons[index]} />
              </svg>
            </span>
            <span>{item.question}</span>
            <span className={styles.toggle} aria-hidden="true" />
          </summary>
          <div className={styles.answer}>
            <span className={styles.spark} aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M10 2c.7 5 2 6.3 7 7-5 .7-6.3 2-7 7-.7-5-2-6.3-7-7 5-.7 6.3-2 7-7Z" fill="currentColor" />
                <path d="M18 13c.4 2.4 1.6 3.6 4 4-2.4.4-3.6 1.6-4 4-.4-2.4-1.6-3.6-4-4 2.4-.4 3.6-1.6 4-4Z" fill="currentColor" />
              </svg>
            </span>
            <p>{item.answer.split(' ').map((word, wordIndex) => <span key={wordIndex} className={styles.word}
              style={{ '--word-index': wordIndex } as CSSProperties}>{word}{' '}</span>)}</p>
            {'href' in item && <Link href={item.href}>Explorar el portafolio <Arrow /></Link>}
          </div>
        </details>)}
      </div>
    </div>
  </section>;
}
