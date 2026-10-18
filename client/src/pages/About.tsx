import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import HDG from '@/lib/images/HDG.png';
import aniket from '@/lib/images/aniket.png';
import aditya from '@/lib/images/aditya.png';
import { TeamCard } from '@/components/TeamCard';

function AnimatedCard({ side = 'left', children }: { side?: 'left' | 'right'; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            obs.unobserve(el);
          }
        });
      },
      { threshold: 0.2 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const base = 'transition-transform transition-opacity duration-700 ease-out';
  const hiddenClass = side === 'left' ? 'translate-x-[-30px] translate-y-8 opacity-0' : 'translate-x-[30px] translate-y-8 opacity-0';
  const visibleClass = 'translate-x-0 translate-y-0 opacity-100 scale-100';

  return (
    <div
      ref={ref}
      className={`${base} ${visible ? visibleClass : hiddenClass} will-change-transform`}
      style={{ transformOrigin: side === 'left' ? 'left center' : 'right center' }}
    >
      {children}
    </div>
  );
}

function AnimatedCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
      <AnimatedCard side="left">
        <div className="text-left">
          <h3 className="text-3xl font-bold mb-6 text-blue-400">AI-Powered Diagnostics</h3>
          <p className="text-lg text-violet-200 leading-relaxed">
            Every diagnosis is enhanced through advanced machine learning algorithms that
            provide accurate liver fibrosis grading from ultrasound images.
          </p>
        </div>
      </AnimatedCard>

      <AnimatedCard side="right">
        <div className="text-left">
          <div className="bg-gradient-to-br from-pink-500 to-purple-600 w-fit px-1 py-1 rounded-lg mb-6">
            <div className="bg-gray-900 px-4 py-2 rounded-lg">
              <h3 className="text-3xl font-bold text-pink-400">Seamless Workflow</h3>
            </div>
          </div>
          <p className="text-lg text-violet-200 leading-relaxed">
            We believe in intuitive interfaces and streamlined processes that
            enhance clinical efficiency and patient care.
          </p>
        </div>
      </AnimatedCard>

      <AnimatedCard side="left">
        <div className="text-left">
          <h3 className="text-3xl font-bold mb-6 text-orange-400">Medical Standards</h3>
          <p className="text-lg text-violet-200 leading-relaxed">
            Our platform adheres to the highest medical standards, keeping healthcare
            professionals ahead of diagnostic accuracy requirements.
          </p>
        </div>
      </AnimatedCard>

      <AnimatedCard side="right">
        <div className="text-left">
          <h3 className="text-3xl font-bold mb-6 text-green-400">Accessibility First</h3>
          <p className="text-lg text-violet-200 leading-relaxed">
            Building inclusive healthcare technology is at the heart of our development
            approach, with dyslexia-friendly fonts and reading comfort features.
          </p>
        </div>
      </AnimatedCard>
    </div>
  );
}

const About: React.FC = () => (
  <div className="min-h-screen" style={{ backgroundColor: '#13072e' }}>
    {/* Hero Section - Our Journey */}
    <section className="relative overflow-hidden py-20">
      <div className="max-w-7xl mx-auto px-6 text-center">
        {/* Back to Dashboard Button */}
        <div className="absolute top-8 left-6">
          <Link href="/doctor/dashboard">
            <Button className="bg-violet-600 hover:bg-violet-700 text-white">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
        
        <div className="relative z-10 mt-16">
          <h1 className="text-6xl font-bold mb-8 text-white">Our Journey</h1>
          <div className="max-w-4xl mx-auto">
            <p className="text-xl text-violet-200 mb-12 leading-relaxed">
              Founded with a vision to revolutionize medical ultrasound diagnostics, TR-LivSafe has grown from 
              a college project to a comprehensive AI-powered liver fibrosis detection platform, empowering healthcare professionals 
              with cutting-edge technology and seamless user experience.
            </p>
          </div>
          
          {/* Medical devices background image */}
          <div className="mt-16 relative">
            <div className="relative overflow-hidden rounded-3xl shadow-2xl bg-gradient-to-br from-violet-800 to-purple-900">
              {/* Use a fixed aspect ratio for consistent layout and full bleed image */}
              <div className="relative w-full aspect-[16/9] sm:aspect-[21/9]">
                <img
                  src={HDG}
                  alt="Medical Device"
                  className="absolute inset-0 h-full w-full object-cover object-[50%_45%]"
                />
                {/* Optional soft gradient overlay for text legibility (kept subtle) */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* Philosophy Section */}
    <section className="py-20 bg-black/20">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <h2 className="text-5xl font-bold mb-6 text-white">Our Philosophy</h2>
        <p className="text-xl text-violet-200 max-w-3xl mx-auto">
          We believe in the power of AI-assisted diagnostics and seamless healthcare workflows.
        </p>
      </div>
    </section>

    {/* Features Grid */}
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-6">
        {/* AnimatedCard - inline helper component */}
        {/* eslint-disable-next-line react/prop-types */}
        <>
          {/** AnimatedCard component */}
          {/** It uses IntersectionObserver to trigger pop-in animations */}
          <AnimatedCards />
        </>
      </div>
    </section>

    {/* Our Community Section */}
    <section className="py-20 bg-gradient-to-b from-gray-900/50 to-black/30">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-5xl font-bold mb-8 text-white text-center">Meet our Experts</h2>
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-lg text-violet-200 leading-relaxed mb-12">
            Each of our team members is very much good are super talented and passionate about developing innovative 
            medical AI solutions for the next generation of healthcare professionals.
          </p>
          
          {/* Team Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mt-12">
            <TeamCard name="Aditya Bhongade" role="ML developer" imgSrc={aditya} />
            <TeamCard name="Aniket Bhandwalkar" role="Full stack developer" imgSrc={aniket} />
  
          </div>
          
          {/* Team Description */}
          <div className="mt-12 bg-gradient-to-br from-violet-800/30 to-purple-900/30 rounded-2xl p-8 backdrop-blur-sm">
            <p className="text-violet-200 leading-relaxed text-center">
              We are a team of students from Yeshwantrao Chavan College of Engineering, Nagpur, Maharashtra. 
              This project was developed as our final year project, combining AI capabilities for solving 
              the complex and commonly encountered liver fibrosis diagnosis with modern web development 
              to ensure a professional and smooth user experience.
            </p>
          </div>
        </div>
      </div>
    </section>
  </div>
);

export default About;
