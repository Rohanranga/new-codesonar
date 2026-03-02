'use client';

import { motion } from 'framer-motion';
import { RepoInput } from '@/components/input/RepoInput';
import { SplineScene } from '@/components/ui/splite';
import { Brain, GitBranch, Shield, Zap } from 'lucide-react';

interface HeroProps {
  onAnalyze: (type: 'url' | 'file', value: string) => void;
  isLoading: boolean;
}

const features = [
  {
    icon: Brain,
    title: 'Deep Analysis',
    desc: 'AI-powered breakdown of logic, flow, and architecture.',
    color: 'from-blue-500/20 to-blue-600/10 border-blue-500/20 text-blue-400',
  },
  {
    icon: GitBranch,
    title: 'Visual Architecture',
    desc: 'Auto-generated interactive diagrams from your codebase.',
    color: 'from-purple-500/20 to-purple-600/10 border-purple-500/20 text-purple-400',
  },
  {
    icon: Shield,
    title: 'Security & Quality',
    desc: 'Detect bugs, vulnerabilities, and code smells instantly.',
    color: 'from-red-500/20 to-red-600/10 border-red-500/20 text-red-400',
  },
  {
    icon: Zap,
    title: 'Instant Results',
    desc: 'Get actionable insights in seconds, not hours.',
    color: 'from-amber-500/20 to-amber-600/10 border-amber-500/20 text-amber-400',
  },
];

export function Hero({ onAnalyze, isLoading }: HeroProps) {
  return (
    <div className="bg-black">
      {/* ── HERO SPLIT: text LEFT | robot RIGHT ── */}
      <section className="relative min-h-screen flex flex-col lg:flex-row overflow-hidden">

        {/* LEFT — text + input */}
        <div className="relative z-10 flex flex-col justify-center w-full lg:w-1/2 px-6 sm:px-10 md:px-14 lg:px-16 xl:px-24 pt-28 pb-16 lg:pt-0 lg:pb-0">
          {/* subtle ambient glow behind text */}
          <div className="absolute -left-32 top-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 mb-6 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
              </span>
              <span className="text-xs sm:text-sm font-medium text-muted-foreground">
                Powered by Gemini AI
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl xl:text-7xl font-bold tracking-tight leading-[1.1] mb-5">
              Understand any{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500">
                codebase
              </span>
              <br />
              in seconds
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground max-w-md mb-10 leading-relaxed">
              CodeSonar uses advanced AI to analyze repositories, visualize
              architecture, detect bugs, and explain complex logic — instantly.
            </p>
          </motion.div>

          {/* Input */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="w-full max-w-xl"
          >
            <RepoInput onAnalyze={onAnalyze} isLoading={isLoading} />
          </motion.div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-10 flex flex-wrap gap-6 text-sm text-muted-foreground"
          >
            {[
              { val: '100+', label: 'Languages' },
              { val: 'AI', label: 'Powered' },
              { val: '60s', label: 'Max Analysis Time' },
            ].map((s) => (
              <div key={s.label} className="flex items-baseline gap-1.5">
                <span className="text-white font-bold text-lg">{s.val}</span>
                <span>{s.label}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* RIGHT — Spline robot, bright, full height */}
        <div className="relative w-full lg:w-1/2 h-[55vw] sm:h-[50vw] lg:h-auto lg:min-h-screen flex-shrink-0">
          {/* Brightness boost layer */}
          <div className="absolute inset-0 z-10 pointer-events-none">
            {/* White ambient light from centre-right */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_70%_at_60%_40%,rgba(255,255,255,0.06),transparent)]" />
            {/* Blue accent rim light */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_60%_at_80%_50%,rgba(96,165,250,0.10),transparent)]" />
          </div>

          {/* Left edge fade so robot blends into text column */}
          <div className="absolute inset-y-0 left-0 w-32 z-20 pointer-events-none bg-gradient-to-r from-black to-transparent" />
          {/* Bottom fade on mobile */}
          <div className="absolute bottom-0 left-0 right-0 h-20 z-20 pointer-events-none bg-gradient-to-t from-black to-transparent" />

          <SplineScene
            scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
            className="w-full h-full"
          />
        </div>
      </section>

      {/* ── FEATURE CARDS — below robot & text ── */}
      <section className="relative z-10 bg-black border-t border-white/5 py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3">
              Everything you need to{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                understand code
              </span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-sm sm:text-base">
              One tool. Complete visibility into any repository.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={`flex flex-col gap-3 p-5 rounded-2xl bg-gradient-to-br border backdrop-blur-sm hover:scale-[1.02] transition-all duration-300 ${f.color}`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-black/30`}>
                  <f.icon className={`w-5 h-5 ${f.color.split(' ').find(c => c.startsWith('text-'))}`} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white mb-1">{f.title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
