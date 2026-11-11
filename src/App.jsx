import { useEffect, useState } from 'react'
import Abecedario from './Abecedario.jsx'
import QueSenaEs from './QueSenaEs.jsx'

/* ---------- Datos (edita aquí los textos) ---------- */
const clases = [
  ['saludosbasicos', 'Saludos Básicos', 'Principiante', '#fff1b8'],
  ['numeros', 'Números: 1 - 10', 'Principiante', '#ffd9b3'],
  ['colores', 'Colores', 'Principiante', '#dff5d0'],
  ['familia', 'Familia', 'Intermedio', '#cdf5e4'],
  ['animales', 'Animales', 'Intermedio', '#d9d0ff'],
  ['emociones', 'Emociones', 'Intermedio', '#ecd0ff'],
]
const videos = [
  ['Introducción a la lengua de señas', 'Profe: Ana Torres, 2024', 'video1.jpg'],
  ['El alfabeto en señas', 'Profe: Luis Gómez, 2024', 'video2.jpg'],
  ['Señas para niños', 'Profe: María López, 2024', 'video3.jpg'],
  ['Conversaciones cotidianas', 'Profe: Ana Torres, 2024', 'video4.jpg'],
  ['Historia de la comunidad sorda', 'Profe: Pedro Ruiz, 2024', 'video5.jpg'],
]
const insignias = [
  ['🌱', 'Primer paso', 'Completaste tu primera clase'],
  ['🔥', 'En racha', '3 días seguidos'],
  ['🧠', 'Memoriza', 'Completaste flashcards'],
]
const tabs = { home: 'home', abecedario: 'home', quesena: 'home', grabadas: 'clases', clases: 'clases', evalua: 'progreso', progreso: 'progreso', detalle: 'progreso', perfil: 'perfil' }
const go = id => { location.hash = id }
const img = n => ({ '--img': `url(/assets/img/${n})` })

const Top = ({ children }) => <div className="top"><button className="back" onClick={() => go('home')}>‹</button>{children}</div>
const Cta = ({ to, children, onClick }) => <div className="cta"><button className="btn" onClick={onClick || (() => go(to))}>{children}</button></div>

export default function App() {
  const [id, setId] = useState(location.hash.slice(1) || 'inicio1')
  useEffect(() => {
    const h = () => setId(location.hash.slice(1) || 'inicio1')
    addEventListener('hashchange', h); return () => removeEventListener('hashchange', h)
  }, [])
  useEffect(() => { // Secuencia de arranque: Inicio 1 → 2 → 3 → Login
    window.scrollTo(0, 0)
    const next = { inicio1: ['inicio2', 1200], inicio2: ['inicio3', 1800], inicio3: ['login', 2200] }[id]
    if (!next) return
    const t = setTimeout(() => go(next[0]), next[1]); return () => clearTimeout(t)
  }, [id])

  const S = ({ cls = '', children }) => <section className={`scr ${cls} on`} data-s={id}>{children}</section>
  const submit = e => { e.preventDefault(); go('home') }

  const pantallas = {
    inicio1: () => <S cls="navy" />,
    inicio2: () => <S cls="navy"><img className="logo sm" src="/assets/logo.svg" alt="Leen-Señas" /><div className="stick" /></S>,
    inicio3: () => <S cls="s3"><img className="logo" src="/assets/logo.svg" alt="Leen-Señas" /><h2>Hasta que la inclusión se haga <b>costumbre</b></h2></S>,
    login: () => <S cls="auth login"><form className="form" onSubmit={submit}>
      <input className="in" type="email" placeholder="Correo Electrónico" />
      <input className="in" type="password" placeholder="Contraseña" />
      <button className="btn" type="submit">Ingresar</button>
      <button className="lnk" type="button" onClick={() => go('registro')}>Registrarse</button></form></S>,
    registro: () => <S cls="auth reg"><button className="x" onClick={() => go('login')} aria-label="Cerrar">X</button>
      <form className="form" onSubmit={submit}>
        <div className="fields">
          <input className="in" placeholder="Primer nombre" /><input className="in" placeholder="Segundo nombre" />
          <input className="in" type="email" placeholder="Correo Electrónico" />
          <input className="in" type="password" placeholder="Contraseña" /><input className="in" type="password" placeholder="Repetir contraseña" />
        </div>
        <div className="bottom"><button className="btn" type="submit">Registrarse</button>
          <button className="lnk" type="button" onClick={() => go('login')}>Ingresar</button></div></form></S>,
    home: () => <S>
      <div className="hero"><div className="vid ph" style={img('home-clase.jpg')} />
        <div className="hero-row"><b>Clase 1: Abecedario</b><button className="play" aria-label="Reproducir" /></div>
        <small>Continúa donde lo dejaste</small></div>
      <div className="tabs"><a href="#clases">Clases</a><a href="#home" className="on">Juegos</a><a href="#evalua">Evalúate</a><a href="#grabadas">Clases grabadas</a></div>
      <div className="games">
        <a className="g g1" href="#quesena"><img src="/assets/que-sena-es.png" alt="" /><span>¿Qué seña es?</span><i /></a>
        <a className="g g2" href="#abecedario"><img src="/assets/haz-la-sena.png" alt="" /><span>¡Haz la seña!</span><i /></a>
        <a className="g g3" href="#detalle"><img src="/assets/mas-veloz.png" alt="" /><span>Más veloz</span><i /></a>
        <a className="g g4" href="#detalle"><img src="/assets/abc-manos.png" alt="" /><span>ABC o manos?</span><i /></a>
      </div></S>,
    abecedario: () => <Abecedario go={go} />,
    quesena: () => <QueSenaEs go={go} />,
    clases: () => <S cls="pink"><Top><h3>Aprende +</h3></Top>
      <div className="wrap"><div className="list two">{clases.map(c =>
        <button key={c[0]} className="row" onClick={() => go('grabadas')}>
          <span className="sq" style={{ background: c[3] }}><img src={`/assets/clases/${c[0]}.png`} alt="" /></span>
          <span><b>{c[1]}</b><span className={`pill ${c[2] === 'Principiante' ? 'p' : ''}`}>{c[2]}</span></span></button>)}</div></div></S>,
    grabadas: () => <S><Top><h3>Conecta con LSC</h3></Top>
      <div className="wrap"><div className="list two">{videos.map(v =>
        <div key={v[2]} className="vrow"><div className="vth ph" style={img(v[2])}><span className="play" /></div>
          <div><p>{v[0]}</p><small>{v[1]}</small><span className="pill">Principiante</span></div></div>)}</div></div></S>,
    evalua: () => <S><Top><span className="chip">Pon aprueba tu <b><i>Conocimiento</i></b></span></Top>
      <div className="wrap"><p className="intro">Responde 5 preguntas y sube de nivel, cada respuesta correcta vale 20 puntos</p>
        <div className="ev">
          <div><span className="sq" style={{ background: '#cdeed8' }}><img src="/assets/evaluate/preguntas.png" alt="" /></span><p>5 preguntas de opción múltiple</p></div>
          <div><span className="sq" style={{ background: '#dfe3ff' }}><img src="/assets/evaluate/100xp.png" alt="" /></span><p>Hasta 100 XP<br />por evaluación</p></div>
          <div><span className="sq" style={{ background: '#f5d6ff' }}><img src="/assets/evaluate/subenivel.png" alt="" /></span><p>Sube de nivel y guarda<br />el progreso</p></div>
        </div></div><Cta to="progreso">¡A jugar!</Cta></S>,
    progreso: () => <S cls="prog">
      <div className="phead"><h2>Mi Progreso</h2><div className="stats"><div><b>1</b>Nivel</div><div><b>200</b>XP Total</div><div><b>3</b>Insignias</div></div></div>
      <div className="wrap"><div className="lvl"><div className="lr"><span>Nivel 1 - Nivel 2</span><span>250 XP</span></div>
        <div className="meter"><span style={{ width: '80%' }} /></div><small>50 XP para el siguiente nivel</small></div>
        <h4 className="ins">Insignias</h4>
        <div className="badges">{insignias.map(b => <div key={b[1]} className="badge"><em>{b[0]}</em><b>{b[1]}</b>{b[2]}</div>)}</div></div>
      <Cta to="detalle">¡A jugar!</Cta></S>,
    detalle: () => <S><Top />
      <div className="wrap"><div className="flash ph" style={img('flashcards.jpg')}><span>Nivel: Hola</span></div>
        <div className="trow"><h3>Flashcards</h3><span className="tag">▢</span></div>
        <p className="meta">◷ 120 cartas &nbsp;★ 5</p>
        <div className="cols"><div><small>Fecha</small><p>Agosto 17, 2024</p></div>
          <div><small>Clasificación</small><p><span className="pill y">Vocabulario</span> <span className="pill y">Básico</span></p></div></div>
        <h4>Sinopsis</h4>
        <p className="syn">Aprende y repasa el vocabulario básico de lengua de señas mediante tarjetas interactivas. Observa la seña, piensa su significado y revisa si fue correcta para avanzar de nivel.</p></div>
      <Cta onClick={() => alert('¡Comienza el juego!')}>¡A jugar!</Cta></S>,
    perfil: () => <S><Top><h3>Profile</h3></Top>
      <div className="wrap center">
        <svg className="ava" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="7" r="4.6" /><path d="M2.5 22c0-5.2 4.2-8.4 9.5-8.4s9.5 3.2 9.5 8.4z" /></svg>
        <b>Perfil</b><p className="mail">correo@gmail.com</p>
        <input className="fld" placeholder="Primer nombre" /><input className="fld" placeholder="Segundo nombre" />
        <input className="fld" type="email" placeholder="Correo electrónico" /><input className="fld" type="tel" placeholder="Número de celular" />
        <button className="btn" onClick={() => alert('Perfil actualizado')}>Actualizar perfil</button>
        <button className="lnk out" onClick={() => go('login')}>Cerrar sesión</button></div></S>,
  }

  const pantalla = (pantallas[id] || pantallas.inicio1)()
  if (!(id in tabs)) return pantalla
  const nav = [['home', 'Inicio'], ['clases', 'Clases'], ['progreso', 'Progreso'], ['perfil', 'Perfil']]
  return (
    <div className="app on" id="app">
      <main className="pane">{pantalla}</main>
      <nav className="nav" aria-label="Principal">
        {nav.map(([t, alt]) => <a key={t} href={`#${t}`} className={tabs[id] === t ? 'on' : ''}><img src={`/assets/nav/${t}.png`} alt={alt} /></a>)}
      </nav>
    </div>
  )
}
