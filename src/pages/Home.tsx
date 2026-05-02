import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  Stethoscope, 
  ShieldCheck, 
  Clock, 
  Video, 
  ArrowRight,
  CheckCircle2,
  Activity,
  Users,
  Calendar
} from 'lucide-react';
import { motion } from 'motion/react';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="space-y-32 pb-32">
      {/* Hero Section - Simple, Modern & Glassy */}
      <section className="relative min-h-[85vh] flex flex-col items-center justify-center text-center px-4 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(14,165,233,0.06),transparent_60%)]" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/3 blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/3 blur-[120px] animate-pulse delay-1000" />
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
          className="relative z-10 max-w-5xl"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-black/5 mb-10">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-ping" />
            <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-accent">Platform v2.0 Live</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl text-display text-text-main mb-10">
            Healthcare <br />
            <span className="text-serif italic text-accent">Simplified.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-text-dim max-w-2xl mx-auto mb-14 leading-relaxed font-light tracking-wide">
            Experience modern medicine through a clear lens. AI-driven diagnostics and specialist matching in a simple, intuitive interface.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button 
              size="lg" 
              className="bg-accent text-white hover:bg-accent/90 px-10 h-16 text-base font-bold rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-xl shadow-accent/20"
              onClick={() => navigate('/symptoms')}
            >
              Check Symptoms
              <ArrowRight className="ml-3 w-5 h-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="glass border-black/5 text-text-main hover:bg-black/5 px-10 h-16 text-base rounded-2xl transition-all hover:scale-105 active:scale-95"
              onClick={() => navigate('/doctors')}
            >
              Find Specialists
            </Button>
          </div>
        </motion.div>

        {/* Floating Stats - Glassy */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-full max-w-6xl px-4 hidden lg:block">
          <div className="grid grid-cols-4 gap-px bg-black/5 border border-black/5 rounded-[2.5rem] overflow-hidden glass">
            {[
              { label: "Diagnostic Accuracy", value: "99.2%" },
              { label: "Verified Specialists", value: "5k+" },
              { label: "Response Time", value: "< 30s" },
              { label: "Patient Satisfaction", value: "4.9/5" }
            ].map((stat, i) => (
              <div key={i} className="p-8 text-center bg-white/40 backdrop-blur-sm">
                <p className="text-3xl font-semibold tracking-tighter text-text-main mb-1">{stat.value}</p>
                <p className="text-[9px] uppercase tracking-[0.3em] text-text-dim font-bold">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bento Grid Features - Clean & Modern */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
          <div className="max-w-xl">
            <h2 className="text-[10px] uppercase tracking-[0.4em] text-accent font-bold mb-6">Capabilities</h2>
            <p className="text-4xl md:text-5xl text-display text-text-main">Designed for <br /><span className="text-serif italic text-accent">Clarity.</span></p>
          </div>
          <p className="text-text-dim max-w-xs text-sm leading-relaxed font-light">
            Our platform simplifies complex medical data into actionable insights using modern AI.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <Card className="md:col-span-8 glass hover-glow p-12 rounded-[3rem] overflow-hidden relative group border-black/5">
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/3 blur-[80px] group-hover:bg-accent/5 transition-colors" />
            <div className="relative z-10 h-full flex flex-col">
              <div className="w-14 h-14 bg-accent/5 rounded-2xl flex items-center justify-center mb-10 border border-accent/10">
                <Stethoscope className="w-7 h-7 text-accent" />
              </div>
              <h3 className="text-3xl font-semibold text-text-main mb-4 tracking-tight">AI Diagnostic Engine</h3>
              <p className="text-text-dim text-lg max-w-md leading-relaxed font-light">
                Intelligent analysis of symptoms and history to provide clear, clinical-grade health insights.
              </p>
              <div className="mt-auto pt-12 flex flex-wrap gap-3">
                {['Smart Analysis', 'Pattern Matching', 'Verified Data'].map(tag => (
                  <span key={tag} className="text-[9px] uppercase tracking-widest px-4 py-1.5 rounded-full border border-black/5 text-text-dim font-bold bg-white/50">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </Card>

          <Card className="md:col-span-4 glass hover-glow p-12 rounded-[3rem] group border-black/5">
            <div className="w-14 h-14 bg-accent/5 rounded-2xl flex items-center justify-center mb-10 border border-accent/10">
              <ShieldCheck className="w-7 h-7 text-accent" />
            </div>
            <h3 className="text-2xl font-semibold text-text-main mb-4 tracking-tight">Secure Vault</h3>
            <p className="text-text-dim text-sm leading-relaxed font-light">
              Your health data is encrypted and private. You have full control over your medical history.
            </p>
          </Card>

          <Card className="md:col-span-4 glass hover-glow p-12 rounded-[3rem] group border-black/5">
            <div className="w-14 h-14 bg-accent/5 rounded-2xl flex items-center justify-center mb-10 border border-accent/10">
              <Users className="w-7 h-7 text-accent" />
            </div>
            <h3 className="text-2xl font-semibold text-text-main mb-4 tracking-tight">Specialist Match</h3>
            <p className="text-text-dim text-sm leading-relaxed font-light">
              Connect with top medical professionals tailored to your specific health needs.
            </p>
          </Card>

          <Card className="md:col-span-8 glass hover-glow p-12 rounded-[3rem] overflow-hidden relative group border-black/5">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/3 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10 flex flex-col md:flex-row gap-12 items-center">
              <div className="flex-1">
                <div className="w-14 h-14 bg-accent/5 rounded-2xl flex items-center justify-center mb-10 border border-accent/10">
                  <Activity className="w-7 h-7 text-accent" />
                </div>
                <h3 className="text-3xl font-semibold text-text-main mb-4 tracking-tight">Real-time Vitals</h3>
                <p className="text-text-dim text-lg leading-relaxed font-light">
                  Continuous monitoring to help you stay ahead of your health goals.
                </p>
              </div>
              <div className="flex flex-col gap-4 w-full md:w-48">
                {[84, 92, 78].map((val, i) => (
                  <div key={i} className="h-14 glass rounded-2xl flex items-center px-6 justify-between border-black/5">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                    <span className="text-xs font-bold text-text-main">{val} bpm</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* CTA Section - Simple & Immersive */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="relative p-16 md:p-24 glass border border-black/5 rounded-[4rem] overflow-hidden text-center shadow-2xl shadow-black/5">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(14,165,233,0.05),transparent_70%)]" />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative z-10"
          >
            <h2 className="text-5xl md:text-7xl text-display text-text-main mb-10">
              Start your <br />
              <span className="text-serif italic text-accent">journey.</span>
            </h2>
            <Button 
              size="lg" 
              className="bg-accent text-white hover:bg-accent/90 px-12 h-16 text-base font-bold rounded-2xl shadow-xl shadow-accent/20"
              onClick={() => navigate('/login?signup=true')}
            >
              Create Account
            </Button>
            <p className="mt-10 text-text-dim text-[10px] uppercase tracking-[0.4em] font-bold">
              Join 50,000+ patients managing their health better.
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
