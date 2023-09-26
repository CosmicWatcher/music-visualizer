import { useRef } from "react";
import { LowPassFilter, analyzeAudioData } from "./utils";
import { addEffect } from "@react-three/fiber";

export default function useAudioData(analyser) {
  const freqDataArray = useRef(null);
  const bassSmoothed = useRef(new LowPassFilter());
  const midSmoothed = useRef(new LowPassFilter());
  const trebSmoothed = useRef(new LowPassFilter());
  const volSmoothed = useRef(new LowPassFilter());
  const audioData = useRef({
    bass: 0,
    mid: 0,
    treb: 0,
    vol: 0,
    bassAtt: 0,
    midAtt: 0,
    trebAtt: 0,
    volAtt: 0,
  });

  addEffect(() => {
    if (analyser.current != null) {
      if (freqDataArray.current == null) {
        freqDataArray.current = new Uint8Array(
          analyser.current.frequencyBinCount
        );
      }

      const [
        newBass,
        newBassAtt,
        newMid,
        newMidAtt,
        newTreb,
        newTrebAtt,
        newVol,
        newVolAtt,
      ] = analyzeAudioData(
        analyser.current,
        freqDataArray.current,
        {
          bassAtt: audioData.current.bassAtt,
          midAtt: audioData.current.midAtt,
          trebAtt: audioData.current.trebAtt,
          volAtt: audioData.current.volAtt,
        },
        {
          bassSmoothed: bassSmoothed.current,
          midSmoothed: midSmoothed.current,
          trebSmoothed: trebSmoothed.current,
          volSmoothed: volSmoothed.current,
        }
      );

      audioData.current.bassAtt = newBassAtt;
      audioData.current.midAtt = newMidAtt;
      audioData.current.trebAtt = newTrebAtt;
      audioData.current.volAtt = newVolAtt;

      audioData.current.bass = newBass;
      audioData.current.mid = newMid;
      audioData.current.treb = newTreb;
      audioData.current.vol = newVol;
    }
  });

  return audioData;
}
