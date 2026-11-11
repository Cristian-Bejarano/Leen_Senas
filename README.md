### Leen-Señas

Prototipo web para aprender LSC con juegos y reconocimiento de señas 
por cámara en tiempo real.

El modelo de reconocimiento se entrenó en el repositorio contando-dedos
y aqui sse ejecuta directamente en el navegador.

---

## Funcionalidades

# Navegación
- Inicio
- Login
- Registro
- home
- Clases
- Progreso
- Perfil

---

## Estructura del proyecto

```text
leen-senas/
├── public/
│   ├── assets/            # Imágenes de la app y de las señas
│   ├── css/styles.css     # Estilos
│   ├── modelos/           # hand_landmarker.task (MediaPipe)
│   └── wasm/              # Archivos de MediaPipe 
├── src/
│   ├── App.jsx            # Pantallas y navegación
│   ├── Abecedario.jsx     # Módulo ¡Haz la seña! (cámara + modelo)
│   ├── QueSenaEs.jsx      # Juego ¿Qué seña es?
│   ├── clasificador.js    # Preprocesado y predicción del modelo
│   ├── modelo.json        # Modelo entrenado (RandomForest exportado)
│   └── main.jsx
├── index.html
├── package.json
└── vite.config.js
```

---

## Requisitos del sistema

- Node.js
- google Chrome (con camara web)
- Visual Studio Code (Recomendado)

---

## Instrucciones de instalación y uso

```bash
# Clonar el repositorio
git clone https://github.com/Cristian-Bejarano/Leen-Senas.git
cd Leen-Senas

# Instalar dependencias (se guardan solo dentro de la carpeta del proyecto)
npm install

# Ejecutar el servidor local
npm run dev
```

Se abrira el navegador en localhost, para apagar el servidor, presiona control + c en la terminal

--- 

## Solución de problemas

- PowerShell dice que la ejecución de scripts está deshabilitada: ejecuta una sola vez `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`, o usa `npm.cmd install` y `npm.cmd run dev`.
- `npm` no se reconoce: instala Node.js y reinicia Visual Studio Code.
- No se abre la cámara: revisa el permiso de cámara del navegador y que ninguna otra aplicación la esté usando.
- `npm install` dice que no encuentra `package.json`: estás en la carpeta equivocada; entra a la carpeta del proyecto con `cd Leen-Senas`.