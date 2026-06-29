"use client";

import React from "react";

interface PremiumLoaderProps {
  title?: string;
  subtitle?: string;
}

export function PremiumLoader({
  title = "Ylang Créations",
  subtitle = "Chargement...",
}: PremiumLoaderProps) {
  const petals = [0, 0.3, 0.6, 0.9, 1.2, 1.5];

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6"
      style={{ background: "var(--color-paper)" }}
    >
      <div className="relative flex items-center justify-center">
        <div
          className="absolute h-32 w-32 rounded-full"
          style={{ border: "var(--rule-hair)" }}
        />

        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 100 100"
          className="h-36 w-36"
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

            <circle cx="50" cy="50" r="4" fill="#8B8000" />
            <circle cx="50" cy="50" r="1.5" fill="#524C00" opacity="0.6" />
          </g>
        </svg>
      </div>

      <div className="flex flex-col items-center gap-1.5 text-center">
        <h2 className="type-overline" style={{ color: "var(--color-ink)" }}>
          {title}
        </h2>
        <div
          className="my-1 h-px w-8"
          style={{ background: "var(--color-ink-3)", opacity: 0.3 }}
        />
        <p
          className="font-body text-xs italic tracking-wide"
          style={{ color: "var(--color-ink-3)" }}
        >
          {subtitle}
        </p>
      </div>
    </div>
  );
}
