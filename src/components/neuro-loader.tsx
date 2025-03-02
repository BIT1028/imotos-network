import React from 'react';

export const NeuroLoader = ({ progress = 0 }: { progress: number }) => (
  <div className="hologram-effect relative h-32 w-64">
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-500/20 to-blue-500/0"/>
    <div className="neuro-progress p-4 space-y-2">
      <span className="font-mono text-cyan-400 animate-pulse">SYNC RATE: </span>
      <div className="h-2 w-full bg-cyan-900/50 overflow-hidden rounded-full">
        <div className="h-full bg-gradient-to-r from-cyan-400 to-blue-600 transition-all duration-1000 ease-out" 
             style={{ width: `${progress}%` }}/>
      </div>
    </div>
    <div className="absolute inset-0 clip-path-low-poly border-2 border-cyan-400/30" />
  </div>
)
