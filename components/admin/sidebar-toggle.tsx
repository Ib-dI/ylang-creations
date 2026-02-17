"use client";

import { motion } from "framer-motion";

interface SidebarToggleProps {
  isOpen: boolean;
  onClick: () => void;
}

export function SidebarToggle({ isOpen, onClick }: SidebarToggleProps) {
  return (
    <button
      id="toggleButton"
      onClick={onClick}
      className="group relative flex h-10 w-10 items-center justify-center rounded-lg transition-all hover:bg-ylang-terracotta/20 hover:text-ylang-rose"
      aria-label={isOpen ? "Réduire la barre latérale" : "Agrandir la barre latérale"}
    >
      <motion.div
        animate={{ rotate: isOpen ? 0 : 180 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="flex items-center cursor-pointer justify-center text-ylang-charcoal group-hover:text-ylang-rose"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
        >
          <g fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M2 12c0-3.69 0-5.534.814-6.841a4.8 4.8 0 0 1 1.105-1.243C5.08 3 6.72 3 10 3h4c3.28 0 4.919 0 6.081.916c.43.338.804.759 1.105 1.243C22 6.466 22 8.31 22 12s0 5.534-.814 6.841a4.8 4.8 0 0 1-1.105 1.243C18.92 21 17.28 21 14 21h-4c-3.28 0-4.919 0-6.081-.916a4.8 4.8 0 0 1-1.105-1.243C2 17.534 2 15.69 2 12Z" />
            <path strokeLinejoin="round" d="M9.5 3v18" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 7h1m-1 3h1" />
          </g>
        </svg>
      </motion.div>
    </button>
  );
}
