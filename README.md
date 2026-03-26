## Aria – Psicóloga IA (frontend)

## Getting Started

## Estructura principal

- `app/layout.tsx`: layout raíz, fuente Geist y metadatos de la app.
- `app/page.tsx`: renderiza el componente principal `AIVideocall`.
- `components/AIVideocall.tsx`:
  - Maneja los estados de sesión: `idle`, `active`, `ended`.
  - Pide permisos de **cámara** y **micrófono**.
  - Controla:
    - Mute (`isMuted`)
    - Cámara encendida/apagada (`isCamOff`)
    - Grabación de audio para enviar al backend (`isRecording`)
    - Estado de la IA: `idle | thinking | speaking`
  - Administra el **timer** de la sesión y el ID de sesión (`sessionId`) que le da el backend.
  - Llama a:
    - `TopBar` (barra superior con estado de sesión y tiempo).
    - `UserVideo` (PIP con tu vídeo o un placeholder si la cámara está apagada).
    - `Transcript` (chat de usuario ⇄ Aria).
    - `ControlBar` (botones de micrófono, cámara, grabar, transcripción y terminar sesión).

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

npm run dev  
>> # or               
>> yarn dev
>> # or
>> pnpm dev
>> # or
>> bun dev
