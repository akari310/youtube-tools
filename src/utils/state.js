// Unified state object for wave visualizer
// Preferred usage: import { state } from './state.js'; state.audioCtx = ...;
// The individual setter functions (setAudioCtx, setCanvas, etc.) are DEPRECATED
// and only kept for backward compatibility with existing imports.
// New code should use direct property access on the `state` object.
// getState() is also deprecated — use `state` directly.

export const state = {
  currentVideo: null,
  waveStyle: 'dinamica',
  audioCtx: null,
  analyser: null,
  source: null,
  animationId: null,
  canvas: null,
  ctx: null,
  controlPanel: null,
  bufferLength: 0,
  dataArray: null,
  smoothedData: [],
  isSetup: false,
};

export const getState = () => state;

// Backward-compatible setter exports
export const setWaveStyle = v => {
  state.waveStyle = v;
};
export const setCurrentVideo = v => {
  state.currentVideo = v;
};
export const setAudioCtx = v => {
  state.audioCtx = v;
};
export const setAnalyser = v => {
  state.analyser = v;
};
export const setSource = v => {
  state.source = v;
};
export const setAnimationId = v => {
  state.animationId = v;
};
export const setCanvas = v => {
  state.canvas = v;
};
export const setCtx = v => {
  state.ctx = v;
};
export const setControlPanel = v => {
  state.controlPanel = v;
};
export const setBufferLength = v => {
  state.bufferLength = v;
};
export const setDataArray = v => {
  state.dataArray = v;
};
export const setSmoothedData = v => {
  state.smoothedData = v;
};
export const setIsSetup = v => {
  state.isSetup = v;
};
