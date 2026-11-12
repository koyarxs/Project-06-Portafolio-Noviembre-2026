'use client';
export default function ErrorPage({ reset }: { reset: () => void }) {
  return <div className="site-width page-content py-16"><p className="eyebrow">UN MOMENTO PARA RECONECTAR</p><h1 className="text-3xl mt-5 mb-4">Algo interrumpió la visita.</h1><p className="text-muted mb-8">Puedes volver a intentarlo. No hace falta empezar desde cero.</p><button className="button-primary" onClick={reset}>Volver a intentar <span aria-hidden="true">↻</span></button></div>;
}
