export function playSoftBeep(): void {
  try {
    const audioContextRef = window as Window & { __amiwiAudioCtx?: AudioContext };
    const ctx = audioContextRef.__amiwiAudioCtx ?? new window.AudioContext();
    audioContextRef.__amiwiAudioCtx = ctx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = 720;
    gain.gain.value = 0.04;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.18);
  } catch {
    // noop
  }
}
