import { useEffect, useRef, useState } from 'react'

const ROUNDS = 10, PTS = 10, PTS_RETRY = 5
const CONTENT = {
  Letra: [...'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'],
  Número: Array.from({ length: 10 }, (_, i) => String(i + 1)),
  Color: ['Rojo', 'Azul', 'Amarillo', 'Verde', 'Naranja', 'Morado', 'Rosado', 'Café', 'Negro', 'Blanco'],
  Palabra: ['Hola', 'Adiós', 'Gracias', 'Por favor', 'Sí', 'No', 'Mamá', 'Papá', 'Agua', 'Amigo'],
}
const ITEMS = Object.entries(CONTENT).flatMap(([c, ts]) => ts.map(t => [c, t]))
const slug = t => t === 'Ñ' ? 'enie' : t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/ /g, '_')
const shuf = a => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]] } return b }

function opciones(cat, resp) { // respuesta correcta + 3 distractores de la misma categoría
  const same = CONTENT[cat].filter(t => t !== resp)
  let pool = shuf(same).slice(0, 3)
  if (pool.length < 3) pool = pool.concat(shuf(ITEMS.filter(([c]) => c !== cat).map(([, t]) => t)).slice(0, 3 - pool.length))
  return shuf([...pool, resp])
}
const iniciar = () => { const p = shuf(ITEMS).slice(0, ROUNDS); return { p, q: 0, ops: opciones(...p[0]), malas: [], ok: null, fallos: 0, aciertos: 0, puntos: 0, ganado: 0, fin: false } }

export default function QueSenaEs({ go }) {
  const [s, setS] = useState(iniciar)
  const timer = useRef()
  useEffect(() => () => clearTimeout(timer.current), [])
  const [cat, resp] = s.p[Math.min(s.q, ROUNDS - 1)]

  const elegir = op => {
    if (s.ok || s.fin) return
    if (op !== resp) return setS(x => ({ ...x, malas: [...x.malas, op], fallos: x.fallos + 1 }))
    const g = s.fallos === 0 ? PTS : PTS_RETRY
    setS(x => ({ ...x, ok: op, aciertos: x.aciertos + 1, puntos: x.puntos + g, ganado: g }))
    timer.current = setTimeout(() => setS(x => x.q + 1 >= ROUNDS ? { ...x, fin: true, ok: null }
      : { ...x, q: x.q + 1, ops: opciones(...x.p[x.q + 1]), malas: [], ok: null, fallos: 0 }), 1100)
  }

  return (
    <section className="scr on" data-s="quesena">
      <div className="top"><button className="back" onClick={() => go('home')}>‹</button><h3>¿Qué seña es?</h3></div>
      <div className="wrap">
        <div className="abc-meta"><span>Progreso: {s.aciertos} de {ROUNDS} señas · ★ {s.puntos} puntos</span>
          <div className="meter"><span style={{ width: `${s.aciertos / ROUNDS * 100}%` }} /></div></div>
        {s.fin ? <>
          <div className="qs-word">¡Listo!</div>
          <p className="abc-msg ok">Aciertos: {s.aciertos} de {ROUNDS} · ★ {s.puntos} puntos</p>
          <button className="btn" style={{ marginTop: 20 }} onClick={() => setS(iniciar())}>Jugar de nuevo</button>
        </> : <>
          <small className="qs-cat">{cat} · Pregunta {s.q + 1} de {ROUNDS}</small>
          <div className="qs-word" style={{ fontSize: resp.length <= 2 ? 72 : resp.length <= 6 ? 44 : 30 }}>{resp}</div>
          <p className="abc-msg">Elige la seña correcta</p>
          <div className="qs-grid">{s.ops.map(op =>
            <button key={op} disabled={s.malas.includes(op)}
              className={'qs-opt' + (s.ok === op ? ' ok' : '') + (s.malas.includes(op) ? ' bad' : '')} onClick={() => elegir(op)}>
              <img src={`/assets/senas/${slug(op)}.png`} alt="" /></button>)}</div>
          <p className={'abc-msg' + (s.ok ? ' ok' : '')} style={s.malas.length && !s.ok ? { color: '#e53935' } : null}>
            {s.ok ? `¡Correcto! +${s.ganado} puntos` : s.malas.length ? 'Casi… ¡prueba con otra seña!' : ''}</p>
        </>}
      </div>
    </section>
  )
}
