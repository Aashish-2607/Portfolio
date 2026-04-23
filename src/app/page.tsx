'use client';
import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView, animate } from 'framer-motion';

// --- 1. REALISTIC BLUE FLAME ENGINE ---
const BlueFlameBackground = () => {
  // TypeScript null safety added
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return; // Fixes the "possibly null" build error

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles: any[] = [];
    let animationFrameId: number;

    const resize = () => {
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };

    class FlameParticle {
      x: number; y: number; size: number; speedY: number; speedX: number; life: number; decay: number; color: string;
      constructor() {
        this.x = 0; this.y = 0; this.size = 0; this.speedY = 0; this.speedX = 0; this.life = 0; this.decay = 0; this.color = '';
        this.reset();
      }
      reset() {
        this.x = Math.random() * canvas!.width;
        this.y = canvas!.height + Math.random() * 50;
        this.size = Math.random() * 25 + 10;
        this.speedY = Math.random() * 2 + 1;
        this.speedX = (Math.random() - 0.5) * 1.5;
        this.life = 1;
        this.decay = Math.random() * 0.015 + 0.005;
        this.color = Math.random() > 0.4 ? '#00d4ff' : '#0077ff';
      }
      update() {
        this.y -= this.speedY; this.x += this.speedX; this.life -= this.decay;
        if (this.life <= 0) this.reset();
      }
      draw() {
        ctx!.globalCompositeOperation = 'lighter';
        ctx!.beginPath();
        const gradient = ctx!.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size);
        gradient.addColorStop(0, this.color + Math.floor(this.life * 255).toString(16).padStart(2, '0'));
        gradient.addColorStop(1, 'transparent');
        ctx!.fillStyle = gradient;
        ctx!.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx!.fill();
      }
    }

    const init = () => {
      particles = [];
      for (let i = 0; i < 80; i++) particles.push(new FlameParticle());
    };

    const animateFlames = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => { p.update(); p.draw(); });
      animationFrameId = requestAnimationFrame(animateFlames);
    };

    window.addEventListener('resize', resize);
    resize(); init(); animateFlames();
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none opacity-40" style={{ zIndex: 0 }} />;
};

// --- 2. COMPONENTS ---
const RollingNumber = ({ value, suffix = "" }: { value: number; suffix?: string }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  useEffect(() => {
    if (isInView && ref.current) {
      const controls = animate(0, value, {
        duration: 2,
        ease: "easeOut",
        onUpdate: (latest) => { if (ref.current) ref.current.textContent = Math.floor(latest) + suffix; }
      });
      return () => controls.stop();
    }
  }, [isInView, value, suffix]);
  return <span ref={ref}>0</span>;
};

const SkillBar = ({ name, level }: { name: string; level: number }) => (
  <div className="mb-5">
    <div className="flex justify-between text-[10px] font-mono mb-2 uppercase tracking-widest text-white/70">
      <span>{name}</span>
      <span className="text-cyan-400">{level}%</span>
    </div>
    <div className="h-[2px] bg-white/5 w-full rounded-full overflow-hidden">
      <motion.div 
        initial={{ width: 0 }} 
        whileInView={{ width: `${level}%` }} 
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="h-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.6)]" 
      />
    </div>
  </div>
);

const TimelineItem = ({ year, title, subtitle, desc, align = "left" }: any) => (
  <div className={`flex w-full mb-12 items-center justify-between ${align === 'right' ? 'flex-row-reverse' : ''}`}>
    <div className="hidden md:block w-[45%]" />
    <div className="relative z-10 flex items-center justify-center w-10">
      <div className="h-3 w-3 rounded-full bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.8)]" />
    </div>
    <motion.div initial={{ opacity: 0, x: align === 'left' ? 20 : -20 }} whileInView={{ opacity: 1, x: 0 }} className="w-full md:w-[45%] bg-white/5 border border-white/10 p-8 rounded-xl backdrop-blur-sm hover:border-cyan-400/30 transition-all">
      <span className="text-cyan-400 font-mono text-[10px] tracking-widest uppercase mb-2 block">{year}</span>
      <h3 className="text-xl font-black uppercase mb-1">{title}</h3>
      <h4 className="text-white/40 text-xs font-mono mb-4">{subtitle}</h4>
      <p className="text-white/60 text-xs leading-relaxed">{desc}</p>
    </motion.div>
  </div>
);

const ProjectCard = ({ title, desc, tech, link, status }: any) => (
  <motion.div whileHover={{ y: -10 }} className="bg-black/60 backdrop-blur-xl border border-white/5 p-8 rounded-2xl group relative overflow-hidden flex flex-col min-h-[380px] transition-all duration-500 hover:border-cyan-500/40 z-10">
    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    <span className={`text-[10px] font-bold uppercase tracking-widest mb-6 ${status === 'Live' ? 'text-cyan-400' : status === 'Completed' ? 'text-green-400' : 'text-purple-400'}`}>{status}</span>
    <h3 className="text-3xl font-black uppercase mb-4 group-hover:text-cyan-400 transition-colors tracking-tighter leading-none">{title}</h3>
    <p className="text-white/50 text-xs font-mono leading-relaxed flex-grow">{desc}</p>
    <div className="flex flex-wrap gap-2 mt-6 mb-8">
      {tech.map((t: string, i: number) => <span key={i} className="text-[9px] border border-white/10 px-3 py-1 rounded-full text-white/40 uppercase bg-white/5">{t}</span>)}
    </div>
    {link && <a href={link} target="_blank" rel="noopener noreferrer" className="relative z-50 text-[10px] font-bold text-cyan-400 uppercase tracking-[0.2em] flex items-center gap-2 hover:text-white transition-all w-fit">Launch Demo ↗</a>}
  </motion.div>
);

const CertCard = ({ org, title, year, isHackathon, fileName }: any) => (
  <motion.div whileHover={{ scale: 1.02 }} className={`bg-black/60 backdrop-blur-xl border ${isHackathon ? 'border-purple-500/30' : 'border-white/5'} p-6 rounded-xl group flex flex-col h-full relative overflow-hidden transition-all z-10`}>
    <h4 className={`text-[10px] font-bold uppercase mb-2 tracking-widest ${isHackathon ? 'text-purple-400' : 'text-cyan-400'}`}>{org}</h4>
    <h3 className="text-sm font-bold text-white/90 uppercase leading-snug mb-4 pr-8">{title}</h3>
    <div className="mt-auto flex justify-between items-center pt-4 border-t border-white/5">
      <span className="text-[10px] text-white/30 font-mono italic">{year}</span>
      <a href={`/certificates/${fileName}`} download className="relative z-50 text-[10px] font-bold text-white/60 hover:text-white uppercase tracking-widest transition-colors">Download ↓</a>
    </div>
  </motion.div>
);

// --- 3. PAGE MAIN ---
export default function Portfolio() {
  const [bioText, setBioText] = useState("");
  const fullBio = `Hi, I’m Aashish — an aspiring data scientist with a strong interest in AI and building data-driven solutions.\n\nCurrently pursuing my BTech in Computer Science with a specialization in Data Science and ML, I’m constantly learning and experimenting with technologies like Python, C, HTML, and JavaScript to turn raw data into meaningful insights.\n\nI love building products that solve real-world problems, from AI-powered study assistants to financial tracking systems.`;

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => { setBioText(fullBio.slice(0, i)); i++; if (i > fullBio.length) clearInterval(interval); }, 10);
    return () => clearInterval(interval);
  }, [fullBio]);

  const journeyData = [
    { year: "2026 - Upcoming", title: "Summer Internship", subtitle: "Looking for Opportunities", desc: "Actively seeking Data Scientist or software engineering internship for Summer 2026." },
    { year: "2025 - Present", title: "B.Tech in Computer Science", subtitle: "Lovely Professional University , Jalandhar", desc: "Core subjects: Programming, Math, Physics. CGPA: 8.79." },
    { year: "2024 - 2025", title: "Senior Secondary (12th)", subtitle: "KV,ARC,Charbatia,Cuttack,Odisha", desc: "PCM Stream. Explored interest in programming." },
    { year: "2022 - 2023", title: "Class 10th", subtitle: "KV,ARC,Charbatia,Cuttack,Odisha", desc: "Engaged in many projects and programs." }
  ];

  const projects = [
    { title: "Cosmic Tic-Tac-Toe", desc: "Space-themed strategy game with framer-motion transitions.", tech: ["React", "Vite", "Framer"], link: "https://tic-tac-toe-eight-navy-77.vercel.app/", status: "Live" },
    { title: "Calculux", desc: "Modern scientific calculator with high-precision logic.", tech: ["HTML", "CSS", "JS"], link: "https://working-scientific-calc-i47e.vercel.app/", status: "Live" },
    { title: "StudyPilot AI", desc: "AI study companion that analyzes learning patterns.", tech: ["Next.js", "Python", "OpenAI"], status: "Completed" },
    { title: "FinSage", desc: "Automated financial ecosystem for expense tracking.", tech: ["Next.js", "Supabase", "Tailwind"], status: "In Development" },
    { title: "UniPath AI", desc: "ML-driven career mapping platform that analyzes skill gaps.", tech: ["Flask", "SQLAlchemy", "Scikit"], status: "In Development" }
  ];

  const arsenalSkills = [
    { name: "Python", level: 90 },
    { name: "React.js / Next.js", level: 85 },
    { name: "SQL", level: 80 },
    { name: "Machine Learning", level: 25 },
    { name: "Tailwind CSS", level: 95 },
    { name: "C Programming", level: 70 },
    { name: "JavaScript", level: 80 },
    { name: "Java", level: 0 },
    { name: "HTML", level: 85 }
  ];

  return (
    <div className="min-h-screen bg-[#020205] text-white selection:bg-cyan-500/30 overflow-x-hidden pt-12 pb-40 relative font-sans">
      <BlueFlameBackground />
      <div className="fixed top-8 right-8 z-[100]">
        <a href="/Aashish_Resume.pdf" download className="bg-[#00ffd5] text-black font-black text-[10px] tracking-[0.2em] px-8 py-3 rounded-sm hover:bg-white transition-all uppercase shadow-[0_0_20px_rgba(0,255,213,0.3)]">Resume ↓</a>
      </div>

      <div className="max-w-7xl mx-auto px-6 space-y-60 relative z-10">
        
        {/* HERO SECTION */}
        <section className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-16 mt-20">
          <div>
            <span className="text-cyan-400 font-mono text-xs tracking-[0.5em] mb-6 block uppercase font-bold">// SYSTEM_READY: 2607</span>
            <h1 className="text-6xl md:text-[8rem] lg:text-[10rem] font-black tracking-tighter leading-[0.8] uppercase">AASHISH<br/><span className="text-transparent" style={{ WebkitTextStroke: '1px rgba(255, 255, 255, 0.43)' }}>KUMAR</span></h1>
          </div>
          <div className="flex gap-16 border-l border-white/5 pl-8">
            <div className="text-right"><h2 className="text-4xl md:text-6xl text-cyan-400 italic font-black"><RollingNumber value={50} suffix="+" /></h2><p className="text-[9px] text-white/30 tracking-widest uppercase mt-2">Commits</p></div>
            <div className="text-right"><h2 className="text-4xl md:text-6xl text-purple-400 italic font-black"><RollingNumber value={4} /></h2><p className="text-[9px] text-white/30 tracking-widest uppercase mt-2">Projects</p></div>
            <div className="text-right"><h2 className="text-4xl md:text-6xl text-cyan-400 italic font-black"><RollingNumber value={4} /></h2><p className="text-[9px] text-white/30 tracking-widest uppercase mt-2">Certs</p></div>
          </div>
        </section>

        {/* ABOUT ME & TECHNICAL ARSENAL */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
          <div className="space-y-12">
            <h2 className="text-4xl font-black italic uppercase text-cyan-400 tracking-widest">// About_Me</h2>
            <div className="bg-black/80 backdrop-blur-md border border-white/10 rounded-3xl p-10 font-mono text-sm leading-relaxed shadow-2xl relative overflow-hidden">
              <div className="flex gap-2 mb-8 border-b border-white/5 pb-6">
                <div className="w-3 h-3 rounded-full bg-red-500/40" /><div className="w-3 h-3 rounded-full bg-yellow-500/40" /><div className="w-3 h-3 rounded-full bg-green-500/40" />
              </div>
              <p className="text-white/90 whitespace-pre-wrap leading-loose">
                <span className="text-purple-400 font-bold">aashish@system:~#</span> {bioText}
                <span className="animate-pulse inline-block w-2 h-4 bg-cyan-400 ml-1" />
              </p>
            </div>
          </div>

          <div className="space-y-12">
            <h2 className="text-4xl font-black italic uppercase text-purple-400 tracking-widest">// Technical_Arsenal</h2>
            <div className="bg-white/5 border border-white/5 p-10 rounded-3xl backdrop-blur-sm">
              {arsenalSkills.map((skill, i) => (
                <SkillBar key={i} name={skill.name} level={skill.level} />
              ))}
            </div>
          </div>
        </section>

        {/* JOURNEY SECTION */}
        <section id="journey" className="relative">
          <h2 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter mb-24">My <span className="text-cyan-400">Journey</span></h2>
          <div className="relative">
            <div className="absolute left-5 md:left-1/2 transform md:-translate-x-1/2 h-full w-[2px] bg-gradient-to-b from-cyan-400 via-purple-500 to-transparent" />
            {journeyData.map((item, idx) => (<TimelineItem key={idx} {...item} align={idx % 2 === 0 ? "right" : "left"} />))}
          </div>
        </section>

        {/* PROJECTS SECTION */}
        <section id="projects">
          <h2 className="text-5xl md:text-8xl font-black italic uppercase tracking-tighter mb-16">The <span className="text-purple-400">Vault</span></h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {projects.map((proj, i) => <ProjectCard key={i} {...proj} />)}
          </div>
        </section>

        {/* CERTIFICATIONS SECTION */}
        <section id="certs" className="space-y-32">
          <div>
            <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter mb-12">Hackathon <span className="text-purple-400">Circuit</span></h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <CertCard org="LPU" title="Code-a-Haunt" year="2026" isHackathon={true} fileName="Code-a-Haunt.pdf" />
              <CertCard org="byteXL" title="HACK AI" year="2026" isHackathon={true} fileName="HackAL.pdf" />
              <CertCard org="LPU" title="WEB-A-THON" year="2026" isHackathon={true} fileName="Web-a-thon.pdf" />
            </div>
          </div>
          <div>
            <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter mb-12">Skill <span className="text-cyan-400">Credentials</span></h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <CertCard org="HackerRank" title="SQL (Advanced)" year="2026" isHackathon={false} fileName="SQL_Advanced.pdf" />
              <CertCard org="Infosys" title="Cyber Security Essentials" year="2026" isHackathon={false} fileName="infosys_springboard.pdf" />
              <CertCard org="upGrad" title="Advanced Power BI" year="2025" isHackathon={false} fileName="PowerBI.pdf" />
              <CertCard org="Publicis Sapient" title="JavaScript Essentials" year="2025" isHackathon={false} fileName="JS.pdf" />
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="pt-20 border-t border-white/5 flex flex-col md:flex-row justify-between items-center font-mono text-[10px] uppercase tracking-widest text-white/40 gap-8">
           <div className="text-center md:text-left">
             <p className="text-cyan-400 font-bold mb-2 text-2xl tracking-tighter uppercase">Let's Connect</p>
             <p>LPU CSE | 2025-2029 | <a href="mailto:info.aashish26@gmail.com" className="text-white hover:text-cyan-400 transition-colors">info.aashish26@gmail.com</a></p>
           </div>
           <div className="flex gap-8">
             <a href="https://github.com/Aashish-2607" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition-colors z-50">GITHUB</a>
             <a href="https://linkedin.com/in/aashish-kumar-sahoo-631361346/" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition-colors z-50">LINKEDIN</a>
             <a href="mailto:info.aashish26@gmail.com" className="hover:text-cyan-400 transition-colors z-50">MAIL</a>
           </div>
        </footer>
      </div>
    </div>
  );
}
