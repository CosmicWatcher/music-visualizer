import { FFTSIZE, SAMPLERATE } from "./config";

export function analyzeAudioData1(freqDataArray, timeDataArray = null) {
  let freqDataBins = [];
  let binAvgFreq = [];

  freqDataBins[0] = freqDataArray.slice(0, freqDataArray.length / 4 - 1);
  freqDataBins[1] = freqDataArray.slice(
    freqDataArray.length / 4 - 1,
    freqDataArray.length / 2 - 1
  );
  freqDataBins[2] = freqDataArray.slice(
    freqDataArray.length / 2 - 1,
    (freqDataArray.length * 3) / 4 - 1
  );
  freqDataBins[3] = freqDataArray.slice(
    (freqDataArray.length * 3) / 4 - 1,
    freqDataArray.length - 1
  );

  binAvgFreq[0] = avg(freqDataBins[0]);
  binAvgFreq[1] = avg(freqDataBins[1]);
  binAvgFreq[2] = avg(freqDataBins[2]);
  binAvgFreq[3] = avg(freqDataBins[3]);

  let timeRms = 0;
  if (timeDataArray != null) {
    let sumSquares = 0.0;
    for (const amplitude of timeDataArray) {
      sumSquares += amplitude * amplitude;
    }
    timeRms = Math.sqrt(sumSquares / timeDataArray.length);
  }

  return { binAvgFreq, timeRms };
}

export function analyzeAudioData(
  analyser,
  freqDataArray,
  bandAtt,
  bandSmoothed
) {
  const freqRanges = [0, 250, 2000, 20000];
  const ranges = freqRanges.map((x) => Math.ceil((FFTSIZE * x) / SAMPLERATE));

  analyser.getByteFrequencyData(freqDataArray);

  const bassIntensity = freqDataArray
    .slice(ranges[0], ranges[1])
    .reduce((sum, cv) => sum + cv);
  let [bass, bassAtt] = updateBand(
    bandAtt.bassAtt,
    bassIntensity,
    bandSmoothed.bassSmoothed
  );

  const midIntensity = freqDataArray
    .slice(ranges[1], ranges[2])
    .reduce((sum, cv) => sum + cv);
  let [mid, midAtt] = updateBand(
    bandAtt.midAtt,
    midIntensity,
    bandSmoothed.midSmoothed
  );

  const trebIntensity = freqDataArray
    .slice(ranges[2], ranges[3])
    .reduce((sum, cv) => sum + cv);
  let [treb, trebAtt] = updateBand(
    bandAtt.trebAtt,
    trebIntensity,
    bandSmoothed.trebSmoothed
  );

  const volIntensity = bassIntensity + midIntensity + trebIntensity;
  let [vol, volAtt] = updateBand(
    bandAtt.volAtt,
    volIntensity,
    bandSmoothed.volSmoothed
  );

  // console.log(bass, mid, treb);

  return [bass, bassAtt, mid, midAtt, treb, trebAtt, vol, volAtt];
}

function updateBand(bandAtt, bandIntensity, bandSmoothed) {
  bandSmoothed.update(bandIntensity);
  let band = bandIntensity / Math.max(0.0001, bandSmoothed.current);
  bandAtt = 0.6 * bandAtt + 0.4 * band;
  bandAtt = Math.min(bandAtt, 100);
  band = Math.min(band, 100);

  // console.log(band);

  return [band, bandAtt];
}

export class LowPassFilter {
  constructor() {
    this.bufferLength = 100;
    this.buffer = Array(this.bufferLength).fill(0);
    this.bufferPos = 0;
    this.current = 0;
  }

  update(nextValue) {
    this.current -= this.buffer[this.bufferPos] / this.bufferLength;
    this.current += nextValue / this.bufferLength;
    this.buffer[this.bufferPos] = nextValue;

    ++this.bufferPos;
    this.bufferPos %= this.bufferLength;
  }
}

function fractionate(val, minVal, maxVal) {
  return (val - minVal) / (maxVal - minVal);
}

export function modulate(val, minVal, maxVal, outMin, outMax) {
  var fr = fractionate(val, minVal, maxVal);
  var delta = outMax - outMin;
  return outMin + fr * delta;
}

export function avg(arr) {
  var total = arr.reduce(function (sum, b) {
    return sum + b;
  });
  return total / arr.length;
}

export function max(arr) {
  return arr.reduce(function (a, b) {
    return Math.max(a, b);
  });
}
