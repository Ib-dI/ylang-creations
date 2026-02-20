"use client";

import React from "react";

interface PremiumLoaderProps {
  title?: string;
  subtitle?: string;
}

export function PremiumLoader({
  title = "Ylang Creations",
  subtitle = "Chargement...",
}: PremiumLoaderProps) {
  // Array to map the 6 petals with their respective animation delays
  const petals = [0, 0.3, 0.6, 0.9, 1.2, 1.5];

  return (
    <div className="bg-ylang-beige/80 fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 backdrop-blur-md">
      <div className="relative flex items-center justify-center">
        {/* Subtle Outer Ring */}
        <div className="absolute h-32 w-32 rounded-full border border-ylang-rose/10" />
        
        {/* Spinning Accent Ring */}
        <div className="border-ylang-rose absolute h-28 w-28 animate-[spin_4s_linear_infinite] rounded-full border-t-2 border-r-2 opacity-40 shadow-sm" />

        {/* The Ylang Flower */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 100 100"
          className="h-36 w-36 drop-shadow-md"
        >
          <defs>
            <path
              id="ylang-petal"
              d="M 0 0 C 8 15, 6 35, 0 45 C -6 35, -8 15, 0 0 Z"
              fill="#E4D00A"
              stroke="#B8A900"
              strokeWidth="0.5"
            />
          </defs>

          <g>
            {/* Smooth slow rotation of the whole flower */}
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 50 50"
              to="360 50 50"
              dur="12s"
              repeatCount="indefinite"
            />

            {petals.map((delay, index) => (
              <g key={index} transform={`translate(50, 50) rotate(${index * 60})`}>
                <g>
                  <animateTransform
                    attributeName="transform"
                    type="scale"
                    values="0.3; 1.05; 0.3"
                    keyTimes="0; 0.5; 1"
                    dur="2.5s"
                    begin={`${delay}s`}
                    repeatCount="indefinite"
                  />
                  <use href="#ylang-petal" opacity="0.85" />
                </g>
              </g>
            ))}

            {/* Organic Center */}
            <circle cx="50" cy="50" r="4" fill="#8B8000" />
            <circle cx="50" cy="50" r="1.5" fill="#524C00" opacity="0.6" />
          </g>
        </svg>
      </div>

      {/* Text Content */}
      <div className="flex flex-col items-center gap-1.5 text-center">
        <h2 className="font-family-abramo-script text-ylang-charcoal text-xl tracking-[0.2em]">
          {title}
        </h2>
        <div className="h-px w-8 bg-ylang-rose/30 my-1" />
        <p className="font-body text-ylang-charcoal/60 text-xs italic tracking-wide">
          {subtitle}
        </p>
      </div>
    </div>
  );
}