"use client";

import { motion } from "framer-motion";
import React from "react";

export default function FootballLoader() {
  const bounceTransition = {
    y: {
      duration: 0.5,
      repeat: Infinity,
      repeatType: "reverse",
      ease: "easeOut",
    },
    rotate: {
      duration: 1, // Full rotation every 2 bounces (up and down)
      repeat: Infinity,
      ease: "linear",
    },
  };

  const shadowTransition = {
    scale: {
      duration: 0.5,
      repeat: Infinity,
      repeatType: "reverse",
      ease: "easeOut",
    },
    opacity: {
      duration: 0.5,
      repeat: Infinity,
      repeatType: "reverse",
      ease: "easeOut",
    },
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gray-50/90 backdrop-blur-sm">
      
      {/* Container for Ball and Shadow */}
      <div className="relative flex flex-col items-center justify-end h-32 w-32">
        
        {/* The Soccer Ball */}
        <motion.div
          className="relative z-10 w-16 h-16"
          initial={{ y: 0, rotate: 0 }}
          animate={{ y: [-10, -80, -10], rotate: 360 }} // Bounces up to -80px
          // @ts-ignore - Framer motion types can be tricky with complex transitions, this is safe
          transition={bounceTransition}
        >
          {/* Custom SVG Soccer Ball */}
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="w-full h-full text-gray-900 fill-white"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 12L8.5 10L9.5 6H14.5L15.5 10L12 12Z" fill="currentColor" /> {/* Center Pentagon */}
            <path d="M12 12V16" />
            <path d="M8.5 10L6 12" />
            <path d="M15.5 10L18 12" />
            <path d="M9.5 6L8 3" />
            <path d="M14.5 6L16 3" />
            <path d="M12 16L10 19" />
            <path d="M12 16L14 19" />
          </svg>
        </motion.div>

        {/* The Shadow */}
        <motion.div
          className="absolute bottom-0 w-12 h-3 bg-black/20 rounded-[100%]"
          initial={{ scale: 1, opacity: 0.5 }}
          animate={{ scale: [1, 0.5, 1], opacity: [0.5, 0.2, 0.5] }} // Shrinks when ball goes up
          // @ts-ignore
          transition={shadowTransition}
        />
      </div>

      {/* Loading Text */}
      <motion.p
        initial={{ opacity: 0.5 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, repeat: Infinity, repeatType: "reverse" }}
        className="mt-8 text-sm font-semibold text-green-700 tracking-widest uppercase"
      >
        Warming Up...
      </motion.p>
    </div>
  );
}