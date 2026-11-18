import { useEffect, useRef, useState } from 'react'

const s = (r, f) => ({ r, img: `/assets/senas/${f}.png` })
const CATS = {
  Saludos: [s('Hola', 'hola'), s('Chao', 'chao'), s('Buenos días', 'buenos-dias'), s('Buenas tardes', 'buenas-tardes'),
    s('Buenas noches', 'buenas-noches'), s('Gracias', 'gracias'), s('Por favor', 'por-favor'), s('Perdón', 'perdon'), s('Bienvenido', 'bienvenido')],
  Números: ['Uno', 'Dos', 'Tres', 'Cuatro', 'Cinco', 'Seis', 'Siete', 'Ocho', 'Nueve', 'Diez'].map((n, i) => s(n, String(i + 1))),
  Colores: [s('Rojo', 'rojo'), s('Azul', 'azul'), s('Verde', 'verde'), s('Amarillo', 'amarillo'), s('Negro', 'negro'), s('Blanco', 'blanco'), s('Naranja', 'naranja'), s('Morado', 'morado')],
  Abecedario: [...'ABCDEFGHIJ'].map(l => s(l, l.toLowerCase())),
}
const PTS = 10, TIEMPOS = [30, 60, 90], NOPS = 4
const todas = () => Object.values(CATS).flat()
const mezclar = a => [...a].sort(() => Math.random() - .5)
const mejorGuardado = () => { try { return +(localStorage.getItem('senas_mejor') || 0) } catch { return 0 } }

function nueva(cat, ultima) {
  const pool = cat === 'Todas' ? todas() : CATS[cat]
  let it; do { it = pool[Math.floor(Math.random() * pool.length)] } while (pool.length > 1 && it === ultima)
  let otros = pool.filter(x => x !== it)
  if (otros.length < NOPS - 1) otros = todas().filter(x => x.r !== it.r)
  return { it, ops: mezclar([it, ...mezclar(otros).slice(0, NOPS - 1)]) }
}

export default function MasVeloz({ go }) {
  const [fase, setFase] = useState('menu')
  const [cat, setCat] = useState('Todas')
  const [total, setTotal] = useState(60)
  const [restante, setRestante] = useState(60)
  const [q, setQ] = useState(null)
  const [res, setRes] = useState(null)
  const [st, setSt] = useState({ puntos: 0, aciertos: 0, fallos: 0, saltadas: 0, racha: 0, mejorRacha: 0 })
  const [record, setRecord] = useState(false)
  const [sinImg, setSinImg] = useState(false)
  const G = useRef({}), T = useRef(0)
  const sync = () => setSt({ ...G.current })
  useEffect(() => () => { clearInterval(T.current); G.current.acabo = true }, [])

  const siguiente = () => {
    const p = nueva(cat, G.current.ultima); G.current.ultima = p.it; G.current.bloq = false
    setQ(p); setRes(null); setSinImg(false)
  }
  const terminar = () => {
    clearInterval(T.current); G.current.acabo = true
    const r = G.current.puntos > mejorGuardado(); setRecord(r)
    if (r) try { localStorage.setItem('senas_mejor', G.current.puntos) } catch { /* sin almacenamiento */ }
    setFase('fin')
  }
  const empezar = () => {
    G.current = { puntos: 0, aciertos: 0, fallos: 0, saltadas: 0, racha: 0, mejorRacha: 0, bloq: false, ultima: null, acabo: false }
    sync(); setRestante(total); siguiente(); setFase('juego')
    const fin = Date.now() + total * 1000
    clearInterval(T.current)
    T.current = setInterval(() => { const r = Math.max(0, (fin - Date.now()) / 1000); setRestante(r); if (r <= 0) terminar() }, 100)
  }
  const responder = o => {
    const g = G.current; if (g.bloq) return; g.bloq = true
    if (o.r === q.it.r) { g.puntos += PTS; g.aciertos++; g.racha++; g.mejorRacha = Math.max(g.mejorRacha, g.racha) }
    else { g.fallos++; g.racha = 0 }
    setRes(o.r); sync(); setTimeout(() => !G.current.acabo && siguiente(), 600)
  }
  const saltar = () => { const g = G.current; if (g.bloq) return; g.saltadas++; g.racha = 0; sync(); siguiente() }

  return (
    <section className="scr on" data-s="masveloz">
      <div className="top"><button className="back" onClick={() => { clearInterval(T.current); go('home') }}>‹</button><h3>Más veloz</h3></div>
      <div className="wrap mv">
        {fase === 'menu' && <>
          <h2>Señas LSC</h2>
          <p>Señas colombianas · Principiante<br />Mejor puntaje: <b>{mejorGuardado()}</b></p>
          <p>Categoría</p>
          <div className="cats">{['Todas', ...Object.keys(CATS)].map(c => <button key={c} className={c === cat ? 'sel' : ''} onClick={() => setCat(c)}>{c}</button>)}</div>
          <p>Tiempo</p>
          <div className="tiempos">{TIEMPOS.map(t => <button key={t} className={t === total ? 'sel' : ''} onClick={() => setTotal(t)}>{t}s</button>)}</div>
          <button className="principal" onClick={empezar}>¡Jugar!</button>
        </>}
        {fase === 'juego' && q && <>
          <div className="info"><span>⏱ {Math.ceil(restante)}s</span><span>🔥 {st.racha}</span><span>⭐ {st.puntos}</span></div>
          <div className="barra-wrap"><div className="barra" style={{ width: `${restante / total * 100}%` }} /></div>
          <div className="senia">{sinImg ? <span>🤟 Falta imagen</span> : <img alt="Seña" src={q.it.img} onError={() => setSinImg(true)} />}</div>
          <p>¿Qué seña es?</p>
          <div className="opciones">{q.ops.map(o =>
            <button key={o.r} className={res ? (o.r === q.it.r ? 'ok' : o.r === res ? 'mal' : '') : ''} onClick={() => responder(o)}>{o.r}</button>)}</div>
          <button className="saltar" onClick={saltar}>Saltar (0 puntos)</button>
        </>}
        {fase === 'fin' && <>
          <h2>¡Se acabó el tiempo!</h2>
          <div className="grande">{st.puntos}</div>
          <p>puntos {record ? '· 🏆 ¡Nuevo récord!' : ''}</p>
          <p>✅ Aciertos: {st.aciertos} · ❌ Fallos: {st.fallos} · ⏭ Saltadas: {st.saltadas}</p>
          <p>🔥 Mejor racha: {st.mejorRacha}</p>
          <button className="principal" onClick={empezar}>Jugar otra vez</button>
          <button onClick={() => setFase('menu')}>Cambiar categoría</button>
        </>}
      </div>
    </section>
  )
}
