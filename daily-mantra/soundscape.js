// An original ambient chord and gong, synthesized locally. No remote audio or loops of speech.
export class Soundscape {
  constructor(createContext,onError=()=>{}) {this.createContext=createContext;this.onError=onError;this.context=null;this.music=null;this.gong=null;this.generation=0;this.gongGeneration=0;}
  unlock() {
    try {
      this.context ||= this.createContext();
      if(!this.context)throw new Error('Audio unavailable');
      return this.context.resume().then(()=>this.context.state==='running').catch(()=>{this.onError();return false;});
    } catch {this.onError();return Promise.resolve(false);}
  }
  stopGroup(group,fade=.15) {
    if(!group)return;
    const now=this.context.currentTime;
    group.gain.gain.cancelScheduledValues(now);
    group.gain.gain.setTargetAtTime(0,now,.04);
    for(const node of group.nodes){try{node.stop(now+fade);}catch{}}
  }
  stopMusic() {this.generation++;this.stopGroup(this.music);this.music=null;}
  stopGong() {this.gongGeneration++;this.stopGroup(this.gong);this.gong=null;}
  stopAll() {this.stopMusic();this.stopGong();}
  async startMusic(milliseconds,volume) {
    this.stopMusic();const generation=this.generation;
    if(milliseconds<=0 || volume<=0)return;
    if(!await this.unlock() || generation!==this.generation)return;
    const ctx=this.context,now=ctx.currentTime,end=now+milliseconds/1000;
    const gain=ctx.createGain();gain.connect(ctx.destination);
    const level=volume/100*.12;
    gain.gain.setValueAtTime(0,now);
    gain.gain.linearRampToValueAtTime(level,now+Math.min(2,milliseconds/3000));
    gain.gain.setValueAtTime(level,Math.max(now+milliseconds/3000,end-2));
    gain.gain.linearRampToValueAtTime(0,end);
    const nodes=[];
    [130.8128,195.9977,261.6256,329.6276,391.9954,587.3295].forEach((frequency,index)=>{
      const tone=ctx.createOscillator(),envelope=ctx.createGain(),swell=ctx.createOscillator(),depth=ctx.createGain();
      tone.type='sine';tone.frequency.value=frequency;tone.detune.value=index%2 ? 2:-2;
      envelope.gain.value=.45/(1+index*.35);swell.frequency.value=.028+index*.007;depth.gain.value=.12/(1+index*.35);
      swell.connect(depth);depth.connect(envelope.gain);tone.connect(envelope);envelope.connect(gain);
      tone.start(now);swell.start(now);tone.stop(end);swell.stop(end);nodes.push(tone,swell);
      tone.onended=()=>{tone.disconnect();envelope.disconnect();swell.disconnect();depth.disconnect();};
    });
    this.music={gain,nodes};
  }
  async playGong(volume) {
    this.stopGong();const generation=this.gongGeneration;if(volume<=0)return;
    if(!await this.unlock() || generation!==this.gongGeneration)return;
    const ctx=this.context,now=ctx.currentTime,gain=ctx.createGain(),nodes=[];
    gain.gain.value=volume/100*.36;gain.connect(ctx.destination);
    // Inharmonic partials give a soft struck-metal timbre and a long, diminishing tail.
    [1,1.48,2.09,2.57,3.31,4.13].forEach((ratio,index)=>{
      const tone=ctx.createOscillator(),envelope=ctx.createGain();
      tone.frequency.value=174.61*ratio;
      envelope.gain.setValueAtTime(0,now);envelope.gain.linearRampToValueAtTime(.5/(index+1),now+.015);
      envelope.gain.exponentialRampToValueAtTime(.0001,now+7-index*.6);
      tone.connect(envelope);envelope.connect(gain);tone.start(now);tone.stop(now+7.2);
      tone.onended=()=>{tone.disconnect();envelope.disconnect();};nodes.push(tone);
    });
    this.gong={gain,nodes};
  }
}
