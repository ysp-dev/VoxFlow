'use strict';

let visualizerAnimationId = null;
let visualizerPhase = 0;

function stopVisualizer() {
  if (visualizerAnimationId) {
    cancelAnimationFrame(visualizerAnimationId);
    visualizerAnimationId = null;
  }
}

function resizeVisualizerCanvas() {
  const canvas = elements.visualizer;
  canvas.width = canvas.parentElement.clientWidth;
  canvas.height = canvas.parentElement.clientHeight || 120;
}

/* ==========================================================================
   Highly Premium Flowing Curves Audio Visualizer
   ========================================================================== */

function startVisualizer() {
  if (visualizerAnimationId || document.hidden) {
    return;
  }

  const canvas = elements.visualizer;
  const ctx = canvas.getContext('2d');

  resizeVisualizerCanvas();
  
  function draw() {
    if (document.hidden) {
      visualizerAnimationId = null;
      return;
    }

    visualizerAnimationId = requestAnimationFrame(draw);
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    let amplitude = 0.1; // Default low idle vibration
    let frequency = 0.015;
    
    // CarPlay-safe mode: playback bypasses Web Audio, so animate by state.
    if (queue.status === 'playing') {
      const pulse = (Math.sin(visualizerPhase * 1.7) + 1) / 2;
      amplitude = 0.75 + pulse * 0.35;
      frequency = 0.016 + pulse * 0.006;
    } else if (queue.status === 'buffering' || queue.status === 'generating') {
      const pulse = (Math.sin(visualizerPhase * 1.2) + 1) / 2;
      amplitude = 0.35 + pulse * 0.2;
      frequency = 0.013;
    }
    
    visualizerPhase += 0.04; // Wave speed
    
    // Draw 3 layered transparent sinewaves for organic look
    const waveCount = 3;
    const waveColors = [
      'rgba(139, 92, 246, 0.4)', // Purple
      'rgba(6, 182, 212, 0.3)',  // Cyan
      'rgba(236, 72, 153, 0.2)'  // Accent Pink
    ];
    
    for (let w = 0; w < waveCount; w++) {
      ctx.beginPath();
      ctx.lineWidth = w === 0 ? 3 : 1.5;
      ctx.strokeStyle = waveColors[w];
      
      const centerY = canvas.height / 2;
      const wavePhase = visualizerPhase + (w * Math.PI / 3);
      const waveAmplitude = (canvas.height / 3) * amplitude * (1 - w * 0.25);
      
      for (let x = 0; x < canvas.width; x++) {
        // Apply smooth fading multipliers at borders to ground the curves nicely
        const borderFading = Math.sin(Math.PI * x / canvas.width);
        
        const y = centerY + Math.sin(x * frequency + wavePhase) * waveAmplitude * borderFading;
        
        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
    }
  }
  
  draw();
}

function isVisualizerRunning() {
  return Boolean(visualizerAnimationId);
}
