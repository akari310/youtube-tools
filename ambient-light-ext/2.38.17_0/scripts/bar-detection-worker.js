
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="92a1c4a6-a297-5fb6-9af8-7e45da3f841f")}catch(e){}}();
(function () {
  'use strict';

  
  let console;
  
  (function () {
    const preMessage = 'Ambient light for YouTube™ |';
  
    const enrich = (...args) => {
      if (args.length <= 0) return args;
  
      if (typeof args[0] === 'string') {
        const [firstArg, ...postArgs] = args;
        return [`${preMessage} ${firstArg}`, ...postArgs];
      }
  
      return [preMessage, ...args];
    };
  
    console = {
      log: (...args) => globalThis.console.log(...enrich(...args)),
      debug: (...args) => globalThis.console.debug(...enrich(...args)),
      warn: (...args) => globalThis.console.warn(...enrich(...args)),
      error: (...args) => globalThis.console.error(...enrich(...args)),
      dir: (...args) => globalThis.console.dir(...args),
    };
  })();


  class ImageHelper {
    constructor() {
      this.imageData = void 0;
      this.channels = 4;
    }
    get width() {
      var _this$imageData;
      return ((_this$imageData = this.imageData) === null || _this$imageData === void 0 ? void 0 : _this$imageData.width) ?? 0;
    }
    get height() {
      var _this$imageData2;
      return ((_this$imageData2 = this.imageData) === null || _this$imageData2 === void 0 ? void 0 : _this$imageData2.height) ?? 0;
    }
    getDataOffset(x, y) {
      return (y * this.width + x) * this.channels;
    }
    getPixel(x, y, data, dataOffset, alpha = true) {
      var _this$imageData3, _this$imageData3$data;
      let returnValue = !data;
      if (returnValue) data = new Uint8Array(4);
      if (!dataOffset) dataOffset = 0;
      const offset = this.getDataOffset(x, y);
      if (offset < 0 || offset > (((_this$imageData3 = this.imageData) === null || _this$imageData3 === void 0 ? void 0 : (_this$imageData3$data = _this$imageData3.data) === null || _this$imageData3$data === void 0 ? void 0 : _this$imageData3$data.length) ?? 0)) {
        data[dataOffset + 0] = 0;
        data[dataOffset + 1] = 0;
        data[dataOffset + 2] = 0;
        if (alpha) data[dataOffset + 3] = 0;
      } else {
        var _this$imageData4, _this$imageData4$data, _this$imageData5, _this$imageData5$data, _this$imageData6, _this$imageData6$data, _this$imageData7, _this$imageData7$data;
        data[dataOffset + 0] = (_this$imageData4 = this.imageData) === null || _this$imageData4 === void 0 ? void 0 : (_this$imageData4$data = _this$imageData4.data) === null || _this$imageData4$data === void 0 ? void 0 : _this$imageData4$data[offset];
        data[dataOffset + 1] = (_this$imageData5 = this.imageData) === null || _this$imageData5 === void 0 ? void 0 : (_this$imageData5$data = _this$imageData5.data) === null || _this$imageData5$data === void 0 ? void 0 : _this$imageData5$data[offset + 1];
        data[dataOffset + 2] = (_this$imageData6 = this.imageData) === null || _this$imageData6 === void 0 ? void 0 : (_this$imageData6$data = _this$imageData6.data) === null || _this$imageData6$data === void 0 ? void 0 : _this$imageData6$data[offset + 2];
        if (alpha) data[dataOffset + 3] = (_this$imageData7 = this.imageData) === null || _this$imageData7 === void 0 ? void 0 : (_this$imageData7$data = _this$imageData7.data) === null || _this$imageData7$data === void 0 ? void 0 : _this$imageData7$data[offset + 3];
      }
      if (returnValue) return data;
    }
  }
  let catchedWorkerCreationError = false;
  let canvas;
  let canvasIsCreatedInWorker = false;
  let ctx;
  let globalRunId = 0;
  let globalXOffsetIndex = 0;
  let image = new ImageHelper();
  const scanlinesAmount = 5;
  const postError = ex => {
    if (!catchedWorkerCreationError) {
      catchedWorkerCreationError = true;
      window.postMessage({
        id: -1,
        error: ex
      });
    }
  };
  const sortSizes = averageSize => (a, b) => {
    const aGap = Math.abs(averageSize - a.yIndex);
    const bGap = Math.abs(averageSize - b.yIndex);
    return aGap === bGap ? 0 : aGap > bGap ? 1 : -1;
  };
  const colorChannels = image.channels - 1;
  const colorsLength = 116;
  const averageColorColorsData = new Uint8Array(colorsLength * colorChannels);
  const averageColorsIndexes = new Uint8Array(colorsLength);
  const averageColorsIndexesDiffs = new Uint16Array(colorsLength);
  const averageColorsLength = Math.floor(colorsLength * 0.25);
  const averageColor = new Uint32Array(colorChannels);
  function sortAverageColors(ai, bi) {
    return averageColorsIndexesDiffs[ai] - averageColorsIndexesDiffs[bi];
  }
  function getAverageColor(yAxis) {
    const colors = averageColorColorsData;
    const colorsIndexes = averageColorsIndexes;
    const colorsIndexesDiffs = averageColorsIndexesDiffs;
    for (let i = 0, yMax = image[yAxis], linesY = [2, 4, yMax - 4, yMax - 2], xStep = 16, offset = xStep * 2, xMax = image[yAxis === 'height' ? 'width' : 'height'], colorsOffset = 0; i < linesY.length; i++) {
      for (let x = offset, y = linesY[i]; x <= xMax - offset; x += xStep) {
        if (yAxis === 'height') {
          image.getPixel(x, y, colors, colorsOffset, false);
        } else {
          image.getPixel(y, x, colors, colorsOffset, false);
        }
        colorsOffset += colorChannels;
      }
    }
    for (let i = 0; i < colorsIndexes.length; i++) {
      colorsIndexes[i] = i;
    }
    const shrinkBy = Math.floor(averageColorsLength / 2);
    for (let includedColorsLength = colorsLength; includedColorsLength >= averageColorsLength; includedColorsLength -= shrinkBy) {
      for (let iRGB = 0; iRGB < colorChannels; iRGB++) {
        averageColor[iRGB] = 0;
        for (let i = 0; i < includedColorsLength; i++) {
          const colorsIndex = colorsIndexes[i];
          const colorOffset = colorsIndex * colorChannels + iRGB;
          averageColor[iRGB] += colors[colorOffset];
        }
        averageColor[iRGB] = Math.round(averageColor[iRGB] / includedColorsLength);
      }
      if (includedColorsLength - shrinkBy < averageColorsLength) break;
      for (let i = 0; i < colorsIndexesDiffs.length; i++) {
        const colorsIndex = colorsIndexes[i];
        if (i < includedColorsLength) {
          const pixelOffset = colorsIndex * colorChannels;
          const diff = Math.abs(averageColor[0] - colors[pixelOffset]) + Math.abs(averageColor[1] - colors[pixelOffset + 1]) + Math.abs(averageColor[2] - colors[pixelOffset + 2]);
          colorsIndexesDiffs[colorsIndex] = diff;
        } else {
          colorsIndexesDiffs[colorsIndex] += 1000;
        }
      }
      colorsIndexes.sort(sortAverageColors);
    }
    return Array.from(averageColor);
  }
  function getHueDeviation(a, b) {
    return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]);
  }
  function getBrightnessDeviation(a, b) {
    return Math.abs(a[0] + a[1] + a[2] - (b[0] + b[1] + b[2]));
  }
  const maxBlackDeviation = {
    hue: 16,
    brightness: 8,
    sum: 20,
    score: 155 * 3 + 155 * 3
  };
  const maxDarkDeviation = {
    hue: 22,
    brightness: 22,
    sum: 36,
    score: 155 * 3 + 155 * 3
  };
  const maxLightDeviation = {
    hue: 32,
    brightness: 64,
    sum: 86,
    score: 255 * 3 + 255 * 3
  };
  function getMaxDeviationLimits(color) {
    const brightness = color[0] + color[1] + color[2];
    return brightness > 500 ? maxLightDeviation : brightness > 20 ? maxDarkDeviation : maxBlackDeviation;
  }
  function isColorWithinMaxDeviation(currentColor, referenceColor) {
    const hueDeviation = getHueDeviation(currentColor, referenceColor);
    const brightnessDeviation = getBrightnessDeviation(currentColor, referenceColor);
    const maxDeviation = getMaxDeviationLimits(referenceColor);
    return hueDeviation <= maxDeviation.hue && brightnessDeviation <= maxDeviation.brightness && hueDeviation + brightnessDeviation <= maxDeviation.sum;
  }
  const minDeviationScore = 0.25 ;
  const edgePointXRange = 32;
  const edgePointYRange = 8 ;
  const edgePointYCenter = 2 / edgePointYRange;
  const easeInOutQuad = x => x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
  const getCertaintyColorData = new Uint8Array(4);
  const getCertainty = (pointX, pointY, yAxis, yDirection, color) => {
    const x = pointX - (edgePointXRange );
    const y = pointY - edgePointYRange * 2 * (yDirection === 1 ? edgePointYCenter : 1 - edgePointYCenter);
    const xLength = 1 + (edgePointXRange * 2 );
    const yLength = 1 + edgePointYRange * 2;
    let score = 0;
    for (let dx = 0; dx < xLength; dx += 2) {
      for (let dy = 0; dy < yLength; dy += 2) {
        const dy2 = yDirection === 1 ? dy : yLength - 1 - dy;
        let iColor = getCertaintyColorData;
        if (yAxis === 'height') {
          image.getPixel(x + dx, y + dy2, iColor);
        } else {
          image.getPixel(y + dy2, x + dx, iColor);
        }
        if (iColor[3] === 0) iColor = color;
        const expectWithinDeviation = dy < Math.floor(1 + edgePointYRange * 2 * edgePointYCenter);
        if (!expectWithinDeviation) {
          const maxDeviation = getMaxDeviationLimits(color);
          const hueDeviation = getHueDeviation(iColor, color);
          const brightnessDeviation = getBrightnessDeviation(iColor, color);
          const deviationScore = Math.max(0, Math.min(1 - minDeviationScore, (hueDeviation + brightnessDeviation) / maxDeviation.score / 0.05));
          score += minDeviationScore + deviationScore;
        } else {
          const within = isColorWithinMaxDeviation(iColor, color);
          if (within) score += 1;
        }
      }
    }
    const length = (1 + (xLength - 1) / 2) * (1 + (yLength - 1) / 2);
    const certainty = (score - length / 2) / (length / 2);
    return easeInOutQuad(certainty);
  };
  const largeStep = 4;
  const ignoreEdge = 2;
  const middleYOffset = 10;
  const minCertainty = 0.65;
  const maxCertaintyChecks = 3 ;
  const sureCertainty = 0.65 ;
  const getAverageLineColorRange = 9;
  const getAverageLineColorRangeOffset = (getAverageLineColorRange - 1) / 2;
  const getAverageLineColorData = new Uint8Array(4 * getAverageLineColorRange);
  function getAverageLineColor(x, y, yAxis, iColor) {
    const iColors = getAverageLineColorData;
    const range = getAverageLineColorRange;
    const rangeOffset = getAverageLineColorRangeOffset;
    for (let i = 0; i < range; i++) {
      const x2 = x + (i - rangeOffset) * 2;
      const iColorsOffset = i * 4;
      if (yAxis === 'height') {
        image.getPixel(x2, y, iColors, iColorsOffset);
      } else {
        image.getPixel(y, x2, iColors, iColorsOffset);
      }
    }
    for (let i = 0; i < 4; i++) {
      let sum = 0;
      for (let j = 0; j < range; j++) {
        sum += iColors[j * 4 + i];
      }
      iColor[i] = Math.round(sum / range);
    }
  }
  const detectEdgesColorData = new Uint8Array(4);
  function detectEdges(linesX, color, yAxis) {
    const maxY = image[yAxis];
    const middleY = maxY / 2;
    const topEdges = [];
    const bottomEdges = [];
    const iColor = detectEdgesColorData;
    for (const x of linesX) {
      let step = largeStep;
      let wasDeviating = false;
      let wasUncertain = false;
      let mostCertainEdge;
      let detectedEdges = 0;
      for (let y = ignoreEdge; y < maxY; y += step) {
        if (wasUncertain) {
          wasUncertain = false;
          step = 1;
        }
        getAverageLineColor(x, y, yAxis, iColor);
        const limitNotReached = y < middleY - middleYOffset - 1;
        if (!limitNotReached || detectedEdges > maxCertaintyChecks) {
          var _mostCertainEdge;
          if (((_mostCertainEdge = mostCertainEdge) === null || _mostCertainEdge === void 0 ? void 0 : _mostCertainEdge.certainty) > minCertainty) {
            topEdges.find(edge => x === edge.xIndex && mostCertainEdge.yIndex === edge.yIndex).deviates = false;
          } else {
            topEdges.push({
              xIndex: x,
              yIndex: 0,
              certainty: 0,
              deviates: true
            });
          }
          break;
        }
        const isDeviating = !isColorWithinMaxDeviation(iColor, color);
        if (limitNotReached && wasDeviating && !isDeviating) {
          wasDeviating = false;
          continue;
        }
        if (limitNotReached && wasDeviating === isDeviating) continue;
        if (y !== 0 && step === largeStep) {
          y = Math.max(-1, y - 1 * step);
          step = Math.ceil(1, Math.floor(step / 2));
          continue;
        }
        const certainty = getCertainty(x, y / 1, yAxis, 1, color);
        detectedEdges++;
        if (limitNotReached && certainty < sureCertainty) {
          var _mostCertainEdge2;
          wasUncertain = true;
          wasDeviating = true;
          if (!(((_mostCertainEdge2 = mostCertainEdge) === null || _mostCertainEdge2 === void 0 ? void 0 : _mostCertainEdge2.certainty) >= certainty)) {
            mostCertainEdge = {
              yIndex: y,
              certainty
            };
          }
          topEdges.push({
            xIndex: x,
            yIndex: y,
            certainty: certainty,
            deviates: true
          });
          continue;
        }
        topEdges.push({
          xIndex: x,
          yIndex: y,
          certainty
        });
        break;
      }
      step = largeStep;
      wasDeviating = false;
      wasUncertain = false;
      mostCertainEdge = undefined;
      detectedEdges = 0;
      for (let y = maxY - 1 + ignoreEdge; y >= 0; y -= step) {
        if (wasUncertain) {
          wasUncertain = false;
          step = 1;
        }
        getAverageLineColor(x, y, yAxis, iColor);
        const limitNotReached = y > middleY + middleYOffset;
        if (!limitNotReached || detectedEdges > maxCertaintyChecks) {
          var _mostCertainEdge3;
          if (((_mostCertainEdge3 = mostCertainEdge) === null || _mostCertainEdge3 === void 0 ? void 0 : _mostCertainEdge3.certainty) > minCertainty) {
            bottomEdges.find(edge => x === edge.xIndex && mostCertainEdge.yIndex === edge.yIndex).deviates = false;
          } else {
            bottomEdges.push({
              xIndex: x,
              yIndex: 0,
              certainty: 0,
              deviates: true
            });
          }
          break;
        }
        const isDeviating = !isColorWithinMaxDeviation(iColor, color);
        if (limitNotReached && wasDeviating && !isDeviating) {
          wasDeviating = false;
          continue;
        }
        if (limitNotReached && wasDeviating === isDeviating) continue;
        if (y !== maxY - 1 && step === largeStep) {
          y = Math.min(maxY - 1, y + step);
          step = Math.ceil(1, Math.floor(step / 2));
          continue;
        }
        const certainty = getCertainty(x, y, yAxis, -1, color);
        detectedEdges++;
        if (limitNotReached && certainty < sureCertainty) {
          var _mostCertainEdge4;
          wasUncertain = true;
          wasDeviating = true;
          if (!(((_mostCertainEdge4 = mostCertainEdge) === null || _mostCertainEdge4 === void 0 ? void 0 : _mostCertainEdge4.certainty) >= certainty)) {
            mostCertainEdge = {
              yIndex: maxY - y,
              certainty
            };
          }
          bottomEdges.push({
            xIndex: x,
            yIndex: maxY - y,
            certainty: certainty,
            deviates: true
          });
          continue;
        }
        bottomEdges.push({
          xIndex: x,
          yIndex: maxY - y,
          certainty
        });
        break;
      }
    }
    return {
      topEdges,
      bottomEdges
    };
  }
  const reduceAverageSize = edges => edges.reduce((sum, edge) => sum + edge.yIndex, 0) / edges.length;
  function getExceedsDeviationLimit(edges, topEdges, bottomEdges, linesX, maxSize, scale, allowedAnomaliesPercentage, allowedUnevenBarsPercentage) {
    if (!topEdges.filter(e => !e.deviates).length || !bottomEdges.filter(e => !e.deviates).length) {
      return true;
    }
    const threshold = linesX.length * 2 * (1 - (allowedAnomaliesPercentage - 10) / 100);
    if (edges.filter(e => !e.deviates).length < threshold) {
      return true;
    }
    while (edges.filter(e => !e.deviates).length > threshold) {
      const nonDeviatingEdges = edges.filter(e => !e.deviates);
      const averageSize = reduceAverageSize(nonDeviatingEdges);
      nonDeviatingEdges.sort(sortSizes(averageSize));
      const deviatingEdge = nonDeviatingEdges[nonDeviatingEdges.length - 1];
      deviatingEdge.deviates = true;
    }
    const maxAllowedSideDeviation = maxSize * (0.008 * scale);
    const nonDeviatingTopEdges = topEdges.filter(e => !e.deviates && !e.deviatesTop);
    const maxTopDeviation = Math.abs(Math.max(...nonDeviatingTopEdges.map(e => e.yIndex)) - Math.min(...nonDeviatingTopEdges.map(e => e.yIndex)));
    const topDeviationIsAllowed = maxTopDeviation <= maxAllowedSideDeviation;
    const nonDeviatingBottomEdges = bottomEdges.filter(e => !e.deviates && !e.deviatesBottom);
    const maxBottomDeviation = Math.abs(Math.max(...nonDeviatingBottomEdges.map(e => e.yIndex)) - Math.min(...nonDeviatingBottomEdges.map(e => e.yIndex)));
    const bottomDeviationIsAllowed = maxBottomDeviation <= maxAllowedSideDeviation;
    if (!topDeviationIsAllowed && !bottomDeviationIsAllowed) {
      return true;
    }
    const averageTopSize = reduceAverageSize(nonDeviatingTopEdges);
    const averageBottomSize = reduceAverageSize(nonDeviatingBottomEdges);
    const sidesDeviation = Math.abs(averageTopSize - averageBottomSize);
    const maxAllowedDeviation = maxSize * (0.003 + allowedUnevenBarsPercentage * 0.0008) * scale;
    const minMaxAllowedSideDeviation = maxSize * (0.016 * scale);
    let maxAllowedSidesDeviation = maxAllowedDeviation;
    if (averageTopSize < minMaxAllowedSideDeviation || averageBottomSize < minMaxAllowedSideDeviation) {
      maxAllowedSidesDeviation = 2;
    }
    if (sidesDeviation > maxAllowedSidesDeviation) {
      return true;
    }
    const nonDeviatingEdgeSizes = edges.filter(e => !e.deviates).map(e => e.yIndex);
    const maxDeviation = Math.abs(Math.max(...nonDeviatingEdgeSizes) - Math.min(...nonDeviatingEdgeSizes));
    if (maxDeviation > maxAllowedDeviation) {
      return true;
    }
  }
  function getPercentage(exceedsDeviationLimit, maxSize, scale, edges, linesX, currentPercentage = 0, offsetPercentage = 0) {
    const lowerSizeThreshold = maxSize * ((currentPercentage - 2) / 100);
    const baseOffsetPercentage = 0.3 * ((1 + scale) / 2);
    let certainty = 1;
    let size;
    if (exceedsDeviationLimit) {
      const uncertainLowerEdges = edges.filter(e => e.certainty > 0.02 && e.yIndex < lowerSizeThreshold);
      if (uncertainLowerEdges.length / (linesX.length * 2) < 0.3) return {
        percentage: undefined,
        certainty: 0
      };
      certainty = uncertainLowerEdges.reduce((sum, edge) => sum + edge.certainty, 0) / uncertainLowerEdges.length;
      const lowestEdge = uncertainLowerEdges.sort((a, b) => a.yIndex - b.yIndex)[0];
      size = lowestEdge.yIndex;
      if (size < 0) {
        size = 0;
      } else {
        size += maxSize * (offsetPercentage / 100);
      }
    } else {
      const sortedEdges = edges.filter(e => !e.deviates).sort(sortSizes(0));
      size = reduceAverageSize(sortedEdges.slice(Math.floor(sortedEdges.length / 2)));
      if (size < 0) {
        size = 0;
      } else {
        size += maxSize * ((baseOffsetPercentage + offsetPercentage) / 100);
      }
    }
    let percentage = Math.round(size / maxSize * 10000) / 100;
    const maxPercentage = 38;
    percentage = Math.min(percentage, maxPercentage);
    return {
      percentage,
      certainty
    };
  }
  const workerDetectBarSizeLinesX = new Uint16Array(5);
  try {
    const workerDetectBarSize = (id, xLength, yAxis, scale, detectColored, offsetPercentage, currentPercentage, allowedAnomaliesPercentage, allowedUnevenBarsPercentage, xOffset) => {
      const partSizeBorderMultiplier = -0.1 + 2 * allowedAnomaliesPercentage / 100;
      const partSize = Math.floor(canvas[xLength] / (scanlinesAmount + partSizeBorderMultiplier * 2));
      const linesX = workerDetectBarSizeLinesX;
      let linesXIndex = 0;
      for (let index = Math.ceil(partSize / 2) - 1 + partSizeBorderMultiplier * partSize; index < canvas[xLength] - partSizeBorderMultiplier * partSize; index += partSize) {
        const xIndex = Math.min(Math.max(0, Math.round(index + Math.round(xOffset * (partSize / 2) - partSize / 4))), canvas[xLength] - 1);
        linesX[linesXIndex] = xIndex;
        linesXIndex++;
      }
      const color = getAverageColor(yAxis);
      if (!detectColored && (color[0] + color[1] + color[2] > 16 || Math.abs(color[0] - color[1]) > 3 || Math.abs(color[1] - color[2]) > 3 || Math.abs(color[2] - color[0]) > 3)) {
        const topEdges = linesX.map(x => ({
          xIndex: x,
          yIndex: 0,
          deviates: true
        }));
        const bottomEdges = linesX.map(x => ({
          xIndex: x,
          yIndex: 0,
          deviates: true
        }));
        return {
          percentage: 0,
          topEdges,
          bottomEdges,
          color
        };
      }
      const {
        topEdges,
        bottomEdges
      } = detectEdges(linesX, color, yAxis);
      const maxSize = image[yAxis];
      const edges = topEdges.concat(bottomEdges);
      const exceedsDeviationLimit = getExceedsDeviationLimit(edges, topEdges, bottomEdges, linesX, maxSize, scale, allowedAnomaliesPercentage, allowedUnevenBarsPercentage);
      const {
        percentage,
        certainty
      } = getPercentage(exceedsDeviationLimit, maxSize, scale, edges, linesX, currentPercentage, offsetPercentage);
      if (!(percentage < currentPercentage) && edges.filter(edge => !edge.deviates).length / (linesX.length * 2) < (100 - allowedAnomaliesPercentage) / 100) {
        for (const edge of topEdges) {
          edge.deviates = true;
        }
        for (const edge of bottomEdges) {
          edge.deviates = true;
        }
        return {
          topEdges,
          bottomEdges,
          color
        };
      }
      return {
        percentage,
        certainty,
        topEdges,
        bottomEdges,
        color
      };
    };
    const createContext = () => {
      ctx = canvas.getContext('2d', {
        desynchronized: true,
        willReadFrequently: true
      });
      ctx.imageSmoothingEnabled = false;
    };
    const createCanvas = (width, height) => {
      canvas = new OffscreenCanvas(width, height);
      canvas.addEventListener('contextlost', () => {
        try {
          canvas.width = 1;
          canvas.height = 1;
        } catch (ex) {
          postError(ex);
        }
      });
      canvas.addEventListener('contextrestored', () => {
        try {
          canvas.width = 1;
          canvas.height = 1;
        } catch (ex) {
          postError(ex);
        }
      });
      canvasIsCreatedInWorker = true;
      createContext();
    };
    window.onmessage = async e => {
      const id = e.data.id;
      globalRunId = id;
      try {
        if (e.data.type === 'cancellation') {
          globalXOffsetIndex = 0;
          return;
        }
        if (e.data.type === 'clear') {
          globalXOffsetIndex = 0;
          if (canvas && canvasIsCreatedInWorker && canvas.width !== 1 && canvas.height !== 1) createCanvas(1, 1);
          return;
        }
        const {
          detectColored,
          detectHorizontal,
          detectVertical,
          offsetPercentage,
          currentHorizontalPercentage,
          currentVerticalPercentage,
          allowedAnomaliesPercentage,
          allowedUnevenBarsPercentage,
          canvasInfo,
          xOffsetSize
        } = e.data;
        if (canvasInfo.bitmap) {
          const bitmap = canvasInfo.bitmap;
          if (!canvas) {
            createCanvas(512, 512);
          } else if (canvas.width !== 512 || canvas.height !== 512) {
            canvas.width = 512;
            canvas.height = 512;
            createContext();
          }
          ctx.drawImage(bitmap, 0, 0, 512, 512);
          bitmap.close();
        } else {
          canvas = canvasInfo.canvas;
          canvasIsCreatedInWorker = false;
          ctx = canvasInfo.ctx;
        }
        image.imageData = ctx.getImageData(0, 0, 512, 512);
        globalXOffsetIndex++;
        if (globalXOffsetIndex >= xOffsetSize) globalXOffsetIndex = 0;
        const xOffset = xOffsetSize === 1 ? 0.5 : xOffsetSize === 2 ? globalXOffsetIndex : (Math.ceil(globalXOffsetIndex / 2) + globalXOffsetIndex % 2) / (xOffsetSize - 1);
        let horizontalBarSizeInfo = detectHorizontal ? await workerDetectBarSize(id, 'width', 'height', 1, detectColored, offsetPercentage, currentHorizontalPercentage, allowedAnomaliesPercentage, allowedUnevenBarsPercentage, xOffset) : undefined;
        let verticalBarSizeInfo = detectVertical ? await workerDetectBarSize(id, 'height', 'width', 1, detectColored, offsetPercentage, currentVerticalPercentage, allowedAnomaliesPercentage, allowedUnevenBarsPercentage, xOffset) : undefined;
        if (id !== globalRunId) {
          return;
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        window.postMessage({
          id,
          horizontalBarSizeInfo,
          verticalBarSizeInfo
        });
      } catch (ex) {
        if (id === globalRunId) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
        window.postMessage({
          id,
          error: ex
        });
      }
    };
  } catch (ex) {
    postError(ex);
  }

})();
//# sourceMappingURL=bar-detection-worker.js.map

//# debugId=92a1c4a6-a297-5fb6-9af8-7e45da3f841f
