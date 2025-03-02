import React from 'react';
import { motion } from 'framer-motion'

export const HologramFeed = ({ messages }: { messages: string[] }) => (
  <div className="space-y-4 p-6">
    {messages.map((msg, i) => (
      <motion.div
        key={i}
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        className="p-4 bg-cyber-black/50 backdrop-blur-lg border-l-4 border-neon-blue">
        <div className="text-cyan-300 font-mono text-sm">{msg}</div>
        <div className="mt-2 h-[1px] bg-gradient-to-r from-transparent via-neon-blue to-transparent" />
      </motion.div>
    ))}
  </div>
)
