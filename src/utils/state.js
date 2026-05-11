// Unified state object for wave visualizer
// Direct property access preferred: state.audioCtx = ...; const c = state.canvas;
// Getter/setter functions kept for backward compatibility with existing imports.

export const state = {
  selectedBgColor: '#252525',
  selectedTextColor: '#ffffff',
  selectedBgAccentColor: '#ff0000',

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

  usageTime: 0,
  videoTime: 0,
  shortsTime: 0,
  activeVideo: null,
  activeType: null,
};

export const getState = () => state;

// Backward-compatible setter exports
export const setWaveStyle = v => { state.waveStyle = v; };
export const setCurrentVideo = v => { state.currentVideo = v; };
export const setAudioCtx = v => { state.audioCtx = v; };
export const setAnalyser = v => { state.analyser = v; };
export const setSource = v => { state.source = v; };
export const setAnimationId = v => { state.animationId = v; };
export const setCanvas = v => { state.canvas = v; };
export const setCtx = v => { state.ctx = v; };
export const setControlPanel = v => { state.controlPanel = v; };
export const setBufferLength = v => { state.bufferLength = v; };
export const setDataArray = v => { state.dataArray = v; };
export const setSmoothedData = v => { state.smoothedData = v; };
export const setIsSetup = v => { state.isSetup = v; };
export const setUsageTime = v => { state.usageTime = v; };
export const setVideoTime = v => { state.videoTime = v; };
export const setShortsTime = v => { state.shortsTime = v; };
export const setActiveVideo = v => { state.activeVideo = v; };
export const setActiveType = v => { state.activeType = v; };
export const setSelectedBgColor = v => { state.selectedBgColor = v; };
export const setSelectedTextColor = v => { state.selectedTextColor = v; };
export const setSelectedBgAccentColor = v => { state.selectedBgAccentColor = v; };
