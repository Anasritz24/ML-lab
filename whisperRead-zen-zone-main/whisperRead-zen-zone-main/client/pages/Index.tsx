import PdfReaderApp from "@/components/pdf/PdfReaderApp";

export default function Index() {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-background via-background to-background">
      <div
        className="absolute inset-0 -z-20 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://cdn.builder.io/api/v1/image/assets%2Fab86846ea87343d99f382ac53f72714c%2F24f07a40aba24e1e9a88d7ae3aa9b002?format=webp&width=800')",
        }}
      />
      <div className="absolute inset-0 -z-15 bg-[linear-gradient(135deg,#c9e0ff_0%,#ffe1bf_100%)] opacity-95 dark:opacity-0" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60rem_40rem_at_50%_-10%,hsl(var(--primary)/0.15),transparent_60%),radial-gradient(40rem_30rem_at_90%_10%,#a78bfa20,transparent_60%),radial-gradient(30rem_20rem_at_10%_20%,#22d3ee20,transparent_60%)]" />
      <div
        className="pointer-events-none absolute inset-0 -z-5 opacity-[0.08] mix-blend-overlay dark:opacity-10"
        style={{
          backgroundImage:
            "radial-gradient(currentColor 1px, transparent 1px), radial-gradient(currentColor 1px, transparent 1px)",
          backgroundSize: "18px 18px, 24px 24px",
          backgroundPosition: "0 0, 12px 12px",
          color: "#9aa3b2",
        }}
      />

      {/* Flowing water decorative footer with subtle fish */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-5">
        <svg viewBox="0 0 1440 240" width="100%" height="200" preserveAspectRatio="none">
          <defs>
            <linearGradient id="waveGrad1" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--primary)/0.35)" />
              <stop offset="100%" stopColor="#7dd3fc55" />
            </linearGradient>
            <linearGradient id="waveGrad2" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#a78bfa55" />
              <stop offset="100%" stopColor="#22d3ee33" />
            </linearGradient>
            <path id="fishPath1" d="M -120,170 C 120,140 360,200 600,170 S 1080,200 1440,170" fill="none" />
            <path id="fishPath2" d="M -200,150 C 80,120 360,180 720,150 S 1300,190 1600,150" fill="none" />
            <symbol id="fish" viewBox="-10 -8 48 16">
              <g fill="#93a4b5" opacity="0.8">
                <path d="M0,0 c 10,-6 26,-6 36,0 c -10,6 -26,6 -36,0 z" />
                <path d="M0,0 L-8,-6 L-8,6 Z" />
                <circle cx="30" cy="-1.5" r="1.2" fill="#6b7c8d" />
              </g>
            </symbol>
          </defs>
          <g opacity="0.8">
            <path id="wave1" fill="url(#waveGrad1)" d="M0,96 C160,128 320,64 480,88 C640,112 800,200 960,176 C1120,152 1280,80 1440,112 L1440,240 L0,240 Z">
              <animate attributeName="d" dur="12s" repeatCount="indefinite"
                values="M0,96 C160,128 320,64 480,88 C640,112 800,200 960,176 C1120,152 1280,80 1440,112 L1440,240 L0,240 Z;
                        M0,110 C160,80 320,140 480,120 C640,100 800,160 960,140 C1120,120 1280,90 1440,130 L1440,240 L0,240 Z;
                        M0,96 C160,128 320,64 480,88 C640,112 800,200 960,176 C1120,152 1280,80 1440,112 L1440,240 L0,240 Z" />
            </path>
          </g>
          <g opacity="0.7">
            <path id="wave2" fill="url(#waveGrad2)" d="M0,130 C180,160 360,110 540,120 C720,130 900,190 1080,170 C1260,150 1350,120 1440,150 L1440,240 L0,240 Z">
              <animate attributeName="d" dur="16s" repeatCount="indefinite"
                values="M0,130 C180,160 360,110 540,120 C720,130 900,190 1080,170 C1260,150 1350,120 1440,150 L1440,240 L0,240 Z;
                        M0,120 C180,140 360,160 540,132 C720,110 900,172 1080,160 C1260,148 1350,140 1440,160 L1440,240 L0,240 Z;
                        M0,130 C180,160 360,110 540,120 C720,130 900,190 1080,170 C1260,150 1350,120 1440,150 L1440,240 L0,240 Z" />
            </path>
          </g>
          <g>
            <use href="#fish" width="36" height="16">
              <animateMotion dur="18s" repeatCount="indefinite" rotate="auto">
                <mpath xlinkHref="#fishPath1" />
              </animateMotion>
              <animateTransform attributeName="transform" attributeType="XML" type="scale" values="1;1.1;1" dur="3s" repeatCount="indefinite" />
            </use>
            <use href="#fish" width="28" height="12" opacity="0.7">
              <animateMotion dur="22s" begin="-6s" repeatCount="indefinite" rotate="auto">
                <mpath xlinkHref="#fishPath2" />
              </animateMotion>
              <animateTransform attributeName="transform" attributeType="XML" type="scale" values="0.9;1;0.9" dur="3.5s" repeatCount="indefinite" />
            </use>
            <use href="#fish" width="24" height="10" opacity="0.6">
              <animateMotion dur="20s" begin="-12s" repeatCount="indefinite" rotate="auto">
                <mpath xlinkHref="#fishPath1" />
              </animateMotion>
              <animateTransform attributeName="transform" attributeType="XML" type="scale" values="0.85;0.95;0.85" dur="3.2s" repeatCount="indefinite" />
            </use>
          </g>
        </svg>
      </div>

      <PdfReaderApp />
    </div>
  );
}
