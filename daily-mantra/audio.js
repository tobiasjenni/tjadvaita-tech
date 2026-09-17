export function speakMantra(synth, Utterance, onError = () => {}, preferredURI = null) {
  if (!synth || !Utterance) { onError(); return false; }
  try {
    const voices=synth.getVoices();
    const preferred=voices.find(v=>v.voiceURI===preferredURI);
    const voice=preferred || voices.find(v=>/^hi(?:-|$)/i.test(v.lang)) || voices.find(v=>/^en-IN$/i.test(v.lang)) || voices.find(v=>/^en(?:-|$)/i.test(v.lang));
    const hindi=voice && /^hi(?:-|$)/i.test(voice.lang);
    // Hindi voices get native script; the Latin spelling helps other voices lengthen “Naam”.
    const utterance=new Utterance(hindi ? 'बाबा नाम केवलम्' : 'Baba Naam Kevalam');
    if(voice) utterance.voice=voice;
    utterance.lang=voice?.lang || 'en-IN';
    utterance.rate=0.72;
    utterance.pitch=1;
    utterance.volume=1;
    utterance.onerror=event=>{if(!['canceled','interrupted'].includes(event.error)) onError();};
    synth.cancel();
    synth.speak(utterance);
    return true;
  } catch { onError(); return false; }
}
