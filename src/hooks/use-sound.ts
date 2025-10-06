import { useCallback } from "react";

// Função para criar som usando Web Audio API
const createBeep = (frequency: number, duration: number, volume: number = 0.3) => {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.frequency.value = frequency;
  oscillator.type = "sine";

  gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + duration);
};

export const useSound = () => {
  // Som para novo pedido - dois toques curtos e agudos
  const playNewOrderSound = useCallback(() => {
    createBeep(800, 0.15, 0.2);
    setTimeout(() => createBeep(1000, 0.15, 0.2), 150);
  }, []);

  // Som para pedido concluído - sequência ascendente agradável
  const playOrderCompletedSound = useCallback(() => {
    createBeep(600, 0.1, 0.15);
    setTimeout(() => createBeep(800, 0.1, 0.15), 100);
    setTimeout(() => createBeep(1000, 0.2, 0.15), 200);
  }, []);

  return {
    playNewOrderSound,
    playOrderCompletedSound,
  };
};
