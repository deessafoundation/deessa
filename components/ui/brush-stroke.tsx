"use client"

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface BrushStrokeProps {
  color?: string;
  width?: string | number;
  height?: string | number;
  animate?: boolean;
  animationDuration?: number;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  
  // Premium customizable layout props
  variant?: 'blob' | 'calligraphy';
  gradient?: 'teal-blue' | 'golden-amber' | 'purple-pink' | 'none';
  tilt?: number;
  padding?: string;
  opacity?: number;
}

export const BrushStroke: React.FC<BrushStrokeProps> = ({
  color = '#8B8DD4',
  width = '100%',
  height = '100%',
  animate = true,
  animationDuration = 1.2,
  className = '',
  style = {},
  children,
  
  // Default values for new premium props
  variant = 'blob',
  gradient = 'none',
  tilt = 0,
  padding = '',
  opacity = 0.85,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const brushRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!animate || !brushRef.current || !containerRef.current) return;

    // Use GSAP timeline for premium multi-layer staggered reveal
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top 85%",
        toggleActions: "play none none none"
      }
    });

    const layers = brushRef.current.querySelectorAll('.brush-layer');

    tl.fromTo(
      layers,
      { scaleX: 0, opacity: 0 },
      {
        scaleX: 1,
        opacity: (i, target) => parseFloat(target.getAttribute('data-target-opacity') || '1'),
        duration: animationDuration,
        ease: "power3.inOut",
        transformOrigin: "left center",
        stagger: 0.12 // Smooth staggered paint stroke effect
      }
    );

    return () => {
      if (tl.scrollTrigger) tl.scrollTrigger.kill();
      tl.kill();
    };
  }, [animate, animationDuration]);

  // Determine if using default purple for premium gradients
  const usePremiumPurple = color === '#8B8DD4' && gradient === 'none';

  // Determine fills for the three SVG layers
  let fillLayer1 = color;
  let fillLayer2 = color;
  let fillLayer3 = color;

  if (gradient === 'teal-blue') {
    fillLayer1 = "url(#brush-grad-teal-base)";
    fillLayer2 = "url(#brush-grad-teal-mid)";
    fillLayer3 = "url(#brush-grad-teal-top)";
  } else if (gradient === 'golden-amber') {
    fillLayer1 = "url(#brush-grad-gold-base)";
    fillLayer2 = "url(#brush-grad-gold-mid)";
    fillLayer3 = "url(#brush-grad-gold-top)";
  } else if (gradient === 'purple-pink') {
    fillLayer1 = "url(#brush-grad-purp-base)";
    fillLayer2 = "url(#brush-grad-purp-mid)";
    fillLayer3 = "url(#brush-grad-purp-top)";
  } else if (usePremiumPurple) {
    fillLayer1 = "url(#brush-grad-base)";
    fillLayer2 = "url(#brush-grad-mid)";
    fillLayer3 = "url(#brush-grad-top)";
  }

  // Set default padding based on variant if not specified
  // Tight padding wraps the text block while absolute offsets provide visually generous thick highlights
  const finalPadding = padding || (variant === 'calligraphy' ? '0.6rem 0.8rem' : '3rem 4rem');

  return (
    <>
      {/* Mobile-only padding override */}
      <style>{`
        @media (max-width: 767px) {
          .brush-content-inner {
            padding-top: ${variant === 'calligraphy' ? '0.6rem' : '2.5rem'} !important;
            padding-bottom: ${variant === 'calligraphy' ? '0.6rem' : '2.5rem'} !important;
            padding-left: ${variant === 'calligraphy' ? '0.8rem' : '1.25rem'} !important;
            padding-right: ${variant === 'calligraphy' ? '0.8rem' : '1.25rem'} !important;
          }
        }
      `}</style>
      <div
        ref={containerRef}
        className={`brush-stroke-container ${className}`}
        style={{
          position: 'relative',
          display: variant === 'calligraphy' ? 'inline-flex' : 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: width || (variant === 'calligraphy' ? 'fit-content' : '100%'),
          // Soft ambient glow around the painted section
          filter: (usePremiumPurple || gradient !== 'none') ? 'drop-shadow(0px 6px 15px rgba(41, 182, 200, 0.1))' : 'none',
          ...style,
        }}
      >
        {/* SVG background — absolute, overflows the text container symmetrically to create a 3x thick highlight */}
        <div
          ref={brushRef}
          className="brush-stroke-background"
          style={{
            position: 'absolute',
            top: variant === 'calligraphy' ? '-14px' : 0,
            bottom: variant === 'calligraphy' ? '-14px' : 0,
            left: variant === 'calligraphy' ? '-24px' : 0,
            right: variant === 'calligraphy' ? '-24px' : 0,
            zIndex: 0,
            willChange: 'transform, opacity',
            pointerEvents: 'none',
            opacity,
            transform: tilt ? `rotate(${tilt}deg)` : 'none',
          }}
        >
          {variant === 'calligraphy' ? (
            <svg
              preserveAspectRatio="none"
              viewBox="0 0 1000 150"
              xmlns="http://www.w3.org/2000/svg"
              style={{ width: '100%', height: '100%', display: 'block', overflow: 'visible' }}
            >
              <defs>
                {/* === Teal-to-Sky-Blue Gradients === */}
                <linearGradient id="brush-grad-teal-base" x1="0%" y1="0%" x2="100%" y2="10%">
                  <stop offset="0%" stopColor="#148595" />
                  <stop offset="50%" stopColor="#1f9fb0" />
                  <stop offset="100%" stopColor="#0b6795" />
                </linearGradient>
                <linearGradient id="brush-grad-teal-mid" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#29b6c8" />
                  <stop offset="60%" stopColor="#00BCD4" />
                  <stop offset="100%" stopColor="#3FABDE" />
                </linearGradient>
                <linearGradient id="brush-grad-teal-top" x1="0%" y1="50%" x2="100%" y2="50%">
                  <stop offset="0%" stopColor="#7fe7f3" />
                  <stop offset="50%" stopColor="#a0f0fa" />
                  <stop offset="100%" stopColor="#9adef8" />
                </linearGradient>

                {/* === Golden-Amber Gradients === */}
                <linearGradient id="brush-grad-gold-base" x1="0%" y1="0%" x2="100%" y2="10%">
                  <stop offset="0%" stopColor="#b87309" />
                  <stop offset="50%" stopColor="#d98c14" />
                  <stop offset="100%" stopColor="#c9930c" />
                </linearGradient>
                <linearGradient id="brush-grad-gold-mid" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#F5A623" />
                  <stop offset="60%" stopColor="#f7b43b" />
                  <stop offset="100%" stopColor="#FFCB47" />
                </linearGradient>
                <linearGradient id="brush-grad-gold-top" x1="0%" y1="50%" x2="100%" y2="50%">
                  <stop offset="0%" stopColor="#ffe0a3" />
                  <stop offset="50%" stopColor="#fff0cc" />
                  <stop offset="100%" stopColor="#ffebd4" />
                </linearGradient>

                {/* === Purple-Pink Gradients === */}
                <linearGradient id="brush-grad-purp-base" x1="0%" y1="0%" x2="100%" y2="10%">
                  <stop offset="0%" stopColor="#4A154B" />
                  <stop offset="100%" stopColor="#611f69" />
                </linearGradient>
                <linearGradient id="brush-grad-purp-mid" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#8A2387" />
                  <stop offset="50%" stopColor="#E94057" />
                  <stop offset="100%" stopColor="#F27121" />
                </linearGradient>
                <linearGradient id="brush-grad-purp-top" x1="0%" y1="50%" x2="100%" y2="50%">
                  <stop offset="0%" stopColor="#F27121" />
                  <stop offset="100%" stopColor="#ffb300" />
                </linearGradient>

                {/* Organic roughness filter for hand-painted outline */}
                <filter id="calligraphy-roughness" x="-10%" y="-10%" width="120%" height="120%">
                  <feTurbulence type="fractalNoise" baseFrequency="0.05 0.15" numOctaves="4" result="noise" seed="35"/>
                  <feDisplacementMap in="SourceGraphic" in2="noise" scale="8" xChannelSelector="R" yChannelSelector="G" />
                </filter>
              </defs>

              <g filter="url(#calligraphy-roughness)">
                {/* Layer 1: Elegant, 3x thicker base stroke */}
                <path
                  className="brush-layer"
                  data-target-opacity="0.8"
                  fill={fillLayer1}
                  d="M 20,75 C 150,15 300,10 500,12 C 700,15 850,20 960,45 C 985,55 995,75 985,105 C 970,135 910,145 820,142 C 600,135 320,140 220,138 C 120,136 60,120 20,75 Z"
                />

                {/* Layer 2: Confident thicker middle body */}
                <path
                  className="brush-layer"
                  data-target-opacity="0.9"
                  fill={fillLayer2}
                  d="M 35,74 C 160,20 310,15 500,18 C 690,20 830,25 945,50 C 968,60 978,78 968,102 C 955,128 890,138 810,134 C 600,128 350,134 240,132 C 140,130 75,115 35,74 Z"
                />

                {/* Layer 3: Dynamic top highlight / light bristle overlay */}
                <path
                  className="brush-layer"
                  data-target-opacity="0.6"
                  fill={fillLayer3}
                  d="M 55,70 C 180,24 350,20 620,24 C 750,26 860,28 920,44 C 940,50 930,70 885,82 C 650,75 400,90 200,94 C 125,95 80,88 55,70 Z"
                />

                {/* Dry brush bristle texture paths (fine horizontal paint streak lines) */}
                <path
                  className="brush-layer"
                  data-target-opacity="0.25"
                  fill="none"
                  stroke={fillLayer3}
                  strokeWidth="2.5"
                  strokeDasharray="25, 30, 45, 15"
                  d="M 50,75 C 200,65 500,70 800,68 C 880,67 920,68 950,70"
                />
                <path
                  className="brush-layer"
                  data-target-opacity="0.2"
                  fill="none"
                  stroke={fillLayer2}
                  strokeWidth="1.8"
                  strokeDasharray="50, 15, 30, 40"
                  d="M 100,55 C 250,45 550,52 820,50 C 880,49 920,51 940,53"
                />
                <path
                  className="brush-layer"
                  data-target-opacity="0.18"
                  fill="none"
                  stroke={fillLayer1}
                  strokeWidth="2.2"
                  strokeDasharray="15, 55, 20, 25"
                  d="M 80,95 C 220,92 520,96 780,92 C 860,90 900,92 930,94"
                />

                {/* Calligraphy bristle ends aligned with thicker body */}
                <path
                  className="brush-layer"
                  data-target-opacity="0.5"
                  fill={fillLayer1}
                  d="M 10,48 C 18,48 28,50 38,50 C 28,52 18,52 10,48 Z"
                />
                <path
                  className="brush-layer"
                  data-target-opacity="0.5"
                  fill={fillLayer2}
                  d="M 10,108 C 18,106 28,104 38,104 C 28,107 18,109 10,108 Z"
                />
                <path
                  className="brush-layer"
                  data-target-opacity="0.6"
                  fill={fillLayer2}
                  d="M 940,45 C 960,40 985,35 995,32 C 980,42 960,45 940,45 Z"
                />
                <path
                  className="brush-layer"
                  data-target-opacity="0.45"
                  fill={fillLayer3}
                  d="M 935,115 C 955,122 975,130 985,135 C 965,130 950,124 935,115 Z"
                />

                {/* Calligraphy ink splatters */}
                <circle className="brush-layer" data-target-opacity="0.4" fill={fillLayer1} cx="985" cy="45" r="2" />
                <circle className="brush-layer" data-target-opacity="0.5" fill={fillLayer2} cx="972" cy="120" r="2.5" />
                <circle className="brush-layer" data-target-opacity="0.3" fill={fillLayer3} cx="990" cy="85" r="1.5" />
                <circle className="brush-layer" data-target-opacity="0.3" fill={fillLayer1} cx="20" cy="45" r="1.5" />
                <circle className="brush-layer" data-target-opacity="0.4" fill={fillLayer2} cx="25" cy="105" r="2" />
              </g>
            </svg>
          ) : (
            <svg
              preserveAspectRatio="none"
              viewBox="0 0 1000 200"
              xmlns="http://www.w3.org/2000/svg"
              style={{ width: '100%', height: '100%', display: 'block', overflow: 'visible' }}
            >
              <defs>
                {/* Multi-tone purple gradients for realistic paint depth */}
                <linearGradient id="brush-grad-base" x1="0%" y1="0%" x2="100%" y2="10%">
                  <stop offset="0%" stopColor="#5A5CA8" />
                  <stop offset="50%" stopColor="#6f72c6" />
                  <stop offset="100%" stopColor="#4A4C88" />
                </linearGradient>

                <linearGradient id="brush-grad-mid" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#7E80CA" />
                  <stop offset="60%" stopColor="#8B8DD4" />
                  <stop offset="100%" stopColor="#6D6FBC" />
                </linearGradient>

                <linearGradient id="brush-grad-top" x1="0%" y1="50%" x2="100%" y2="50%">
                  <stop offset="0%" stopColor="#B3B5EB" />
                  <stop offset="50%" stopColor="#9C9EE3" />
                  <stop offset="100%" stopColor="#8B8DD4" />
                </linearGradient>

                {/* Premium organic roughness filter with noise */}
                <filter id="premium-roughness" x="-20%" y="-20%" width="140%" height="140%">
                  <feTurbulence type="fractalNoise" baseFrequency="0.04 0.12" numOctaves="5" result="noise" seed="22"/>
                  <feDisplacementMap in="SourceGraphic" in2="noise" scale="16" xChannelSelector="R" yChannelSelector="G" />
                </filter>
              </defs>

              <g filter="url(#premium-roughness)">
                {/* Layer 1: Wide base stroke */}
                <path
                  className="brush-layer"
                  data-target-opacity="0.85"
                  fill={fillLayer1}
                  d="M 8,100 C 35,4 80,2 155,5 C 310,3 600,2 755,4 C 855,5 935,15 965,45 C 985,70 995,110 990,148 C 980,178 935,196 855,196 C 605,195 310,197 255,197 C 155,196 82,188 42,176 C 10,162 -10,140 8,100 Z"
                />

                {/* Layer 2: Main stroke body */}
                <path
                  className="brush-layer"
                  data-target-opacity="0.95"
                  fill={fillLayer2}
                  d="M 18,100 C 48,8 102,3 205,6 C 408,4 705,3 808,6 C 908,10 948,22 968,55 C 984,82 990,118 984,152 C 974,182 928,197 858,194 C 708,190 408,193 255,193 C 155,190 104,181 52,168 C 18,152 2,128 18,100 Z"
                />

                {/* Layer 3: Top highlight */}
                <path
                  className="brush-layer"
                  data-target-opacity="0.65"
                  fill={fillLayer3}
                  d="M 38,100 C 152,12 455,5 858,10 C 928,11 952,24 958,65 C 954,110 908,180 808,178 C 455,172 152,178 62,186 C 28,188 18,150 38,100 Z"
                />
              </g>
            </svg>
          )}
        </div>

        {/* Text Content Wrapper */}
        <div
          className="brush-content-inner"
          style={{
            position: 'relative',
            zIndex: 1,
            padding: finalPadding,
            width: '100%',
            boxSizing: 'border-box',
            textShadow: '0px 1.5px 8px rgba(0,0,0,0.12)'
          }}
        >
          {children}
        </div>
      </div>
    </>
  );
};
