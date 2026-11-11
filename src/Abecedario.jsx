import { useEffect, useRef, useState } from 'react'
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision'
import { predecir } from './clasificador.js'

const LETRAS = [...'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ']
const CONN = [[0,1],[1,2],[2,3],[3,4],[0,5],[5,6],[6,7],[7,8],[5,9],[9,10],[10,11],[11,12],[9,13],[13,14],[14,15],[15,16],[13,17],[17,18],[18,19],[19,20],[0,17]]
const INICIAL = 'Pulsa «Empezar» para activar la cámara.'
const PISTA = 'Haz la seña de la letra y mantenla quieta.'

let lmP = null
const cargar = () => (lmP ??= FilesetResolver.forVisionTasks('/wasm').then(v =>
  HandLandmarker.createFromOptions(v, { baseOptions: { modelAssetPath: '/modelos/hand_landmarker.task' }, runningMode: 'VIDEO', numHands: 1 })))

export default function Abecedario({ go }) {
  const cv = useRef(), vid = useRef()
  const R = useRef({ on: false, idx: 0, buf: [], ultimo: null, tF: 0, tP: 0, ts: 0, ac: 0, bloq: 0, raf: 0, stream: null, lm: null })
  const [idx, setIdx] = useState(0)
  const [on, setOn] = useState(false)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState(INICIAL)
  const [ok, setOk] = useState(false)
  const decir = (t, o = false) => { setMsg(t); setOk(o) }

  const parar = () => {
    const r = R.current; r.on = false; cancelAnimationFrame(r.raf)
    r.stream?.getTracks().forEach(t => t.stop()); r.stream = null
    const c = cv.current; if (c) c.getContext('2d').clearRect(0, 0, c.width, c.height)
    setOn(false); setOk(false)
  }
  useEffect(() => parar, []) // apaga la cámara al salir de la pantalla

  const bucle = now => {
    const r = R.current, c = cv.current, v = vid.current
    if (!r.on || !c) return
    r.raf = requestAnimationFrame(bucle)
    if (now - r.tF < 33) return                       // ~30 cuadros/s, como al capturar los datos
    r.tF = now
    const ctx = c.getContext('2d')
    ctx.save(); ctx.scale(-1, 1); ctx.drawImage(v, -c.width, 0, c.width, c.height); ctx.restore() // espejo (cv2.flip)
    r.ts = Math.max(Math.round(now), r.ts + 1)
    const mano = r.lm.detectForVideo(c, r.ts).landmarks?.[0]
    if (mano) {
      r.ultimo = mano.flatMap(p => [p.x, p.y, p.z])
      ctx.strokeStyle = '#2ecc71'; ctx.lineWidth = 2; ctx.beginPath()
      CONN.forEach(([a, b]) => { ctx.moveTo(mano[a].x * c.width, mano[a].y * c.height); ctx.lineTo(mano[b].x * c.width, mano[b].y * c.height) })
      ctx.stroke(); ctx.fillStyle = '#3b6cff'
      mano.forEach(p => { ctx.beginPath(); ctx.arc(p.x * c.width, p.y * c.height, 4, 0, 7); ctx.fill() })
    }
    if (r.ultimo) { r.buf.push(r.ultimo); if (r.buf.length > 30) r.buf.shift() }
    if (!mano) { r.ac = 0; return }
    if (r.buf.length < 30 || now < r.bloq || now - r.tP < 250) return
    r.tP = now
    const { letra } = predecir(r.buf), meta = LETRAS[r.idx]
    r.ac = letra === meta ? r.ac + 1 : 0
    if (r.ac < 2) return decir(`Detecto: ${letra} · busco: ${meta}`)
    // ¡Correcto! solo aquí se avanza
    r.ac = 0; r.buf = []; r.idx++; r.bloq = now + 1200; setIdx(r.idx)
    if (r.idx >= LETRAS.length) { decir('¡Completaste el abecedario! 🎉', true); return void setTimeout(parar, 1500) }
    decir(`¡Correcto! ${meta} ✓`, true)
    setTimeout(() => R.current.on && decir(PISTA), 1200)
  }

  const empezar = async () => {
    const r = R.current; setBusy(true); decir('Cargando el reconocedor…')
    try {
      r.lm = await cargar()
      r.stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 640, height: 480 }, audio: false })
      vid.current.srcObject = r.stream; await vid.current.play()
      cv.current.width = vid.current.videoWidth; cv.current.height = vid.current.videoHeight
    } catch (e) {
      console.error(e); lmP = null; setBusy(false)
      return decir('No se pudo iniciar: revisa el permiso de la cámara.')
    }
    Object.assign(r, { idx: 0, buf: [], ultimo: null, ac: 0, on: true })
    setIdx(0); setOn(true); setBusy(false); decir(PISTA)
    r.raf = requestAnimationFrame(bucle)
  }

  const l = LETRAS[Math.min(idx, LETRAS.length - 1)]
  return (
    <section className="scr on" data-s="abecedario">
      <div className="top"><button className="back" onClick={() => go('home')}>‹</button><h3>¡Haz la seña!</h3></div>
      <div className="wrap abc">
        <div className="abc-meta"><span>Letra {Math.min(idx + 1, LETRAS.length)} de {LETRAS.length}</span>
          <div className="meter"><span style={{ width: `${idx / LETRAS.length * 100}%` }} /></div></div>
        <div className="abc-target"><img src={`/assets/senas/${l === 'Ñ' ? 'enie' : l.toLowerCase()}.png`} alt={`Seña de la letra ${l}`} /><b>{l}</b></div>
        <div className="abc-cam">
          <canvas ref={cv} width="480" height="360" className={ok ? 'ok' : ''} />
          <video ref={vid} playsInline muted style={{ position: 'absolute', width: 1, height: 1, opacity: 0, pointerEvents: 'none' }} />
        </div>
        <p className={'abc-msg' + (ok ? ' ok' : '')}>{msg}</p>
      </div>
      <div className="cta"><button className="btn" disabled={busy} onClick={on ? parar : empezar}>{on ? 'Detener' : 'Empezar'}</button></div>
    </section>
  )
}
