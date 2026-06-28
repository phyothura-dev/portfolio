import { useEffect, useState } from 'react';
import 'aos/dist/aos.css';
import Social from '../../components/Social';
// import Service from './Service';
import Skill from './Skill';
import WorkExperience from './WorkExperience';
import Projects from './Projects';
import Client from './Client';
import Contact from './Contact';
import useTypingEffect from '../../hooks/useTypingEffect';

export default function Home() {
  const [loading, setLoading] = useState(false);
  const text = useTypingEffect([' Software Developer']);

  useEffect(() => {
    let isMounted = true;

    import('aos').then(({ default: AOS }) => {
      if (!isMounted) return;
      AOS.init({
        duration: 800,
        once: true,
        offset: 24,
        easing: 'ease-out-cubic',
      });
      AOS.refresh();
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const downloadCV = () => {
    setLoading(true);
    const url = '/cv_dev.png';
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Phyo Thura_CV.png');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setLoading(false);
  };

  return (
    <section id="about">
      {/* Home */}
      <div className="w-full mx-auto min-h-screen justify-between grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        <div data-aos="fade-right" className="w-full  lg:mt-0  animate-fade-in">
          <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 text-center lg:text-left">Hello! I’m</p>
          <h1 className="mt-1 text-3xl md:text-5xl font-bold tracking-tight text-center lg:text-left">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-400">PHYO THURA</span>
          </h1>
          <h2 className="mt-2 text-xl md:text-2xl font-semibold tracking-tight text-center lg:text-left dark:text-slate-100">
            Junior <span className="text-slate-800 dark:text-slate-200">{text}</span>
          </h2>

          <p className="mt-4 text-sm md:text-base text-center lg:text-left text-slate-600 dark:text-slate-300 leading-relaxed md:leading-7 max-w-2xl">
            I build fast, accessible and delightful web apps. I love helping people grow their business with clean code and thoughtful design.
          </p>

          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 mt-8 animate-slide-up">
            <a href="mailto:pthuya381@gmail.com" className="btn-primary text-sm md:text-base font-bold">
              Hire Me
            </a>
            <button onClick={downloadCV} className="btn-outline text-sm md:text-base">
              {loading ? 'Loading' : 'Download CV'}
            </button>
          </div>

          <Social />
        </div>

        {/*  Profile */}
        <div data-aos="fade-left" className="w-full flex justify-center lg:justify-end items-center lg:justify-self-end">
          <div className="relative group animate-float lg:mr-0">
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-primary/20 to-blue-400/20 blur-2xl scale-110 -z-10" />
            <img
              src="/Phyo.jpg"
              alt="Profile of Phyo Thura"
              className="w-56 h-56 lg:w-96 lg:h-96 object-cover rounded-full shadow-2xl ring-2 ring-primary/10 border border-primary/50 transition-transform duration-500 group-hover:scale-[1.02]"
            />
            <div className="absolute inset-0 rounded-full bg-black/20 opacity-0 group-hover:opacity-100 transition duration-300 flex items-center justify-center">
              <p className="text-sm font-semibold text-white">Hello, I&apos;m Phyo Thura</p>
            </div>
          </div>
        </div>
      </div>

      {/* <About /> */}
      {/* <Service /> */}
      <WorkExperience />
      <Skill />
      <Projects />
      <Client />
      <Contact />
    </section>
  );
}
