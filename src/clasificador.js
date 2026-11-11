// Mismo preprocesado y predicción que entrenar.py / reconocer_practica.py, en JavaScript
import M from './modelo.json'

export function normalizar(frames) { // 30 frames x 63 -> vector de 1890
  const out = []
  for (const f of frames) {
    const p = new Array(63)
    for (let i = 0; i < 21; i++) for (let k = 0; k < 3; k++) p[3 * i + k] = f[3 * i + k] - f[k]
    let e = Math.hypot(p[27], p[28], p[29]); if (e === 0) e = 1
    for (let i = 0; i < 63; i++) out.push(p[i] / e)
  }
  return out
}

export function predecir(frames) {
  const x = normalizar(frames), acc = new Float64Array(M.clases.length)
  for (const t of M.arboles) {
    let i = 0
    while (t.f[i] >= 0) i = Math.fround(x[t.f[i]]) <= t.t[i] ? t.l[i] : t.r[i]
    for (const [c, p] of t.v[i]) acc[c] += p
  }
  let b = 0; for (let c = 1; c < acc.length; c++) if (acc[c] > acc[b]) b = c
  return { letra: M.clases[b], conf: acc[b] / M.arboles.length }
}
