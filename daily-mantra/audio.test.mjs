import test from 'node:test';
import assert from 'node:assert/strict';
import {speakMantra} from './audio.js';
class Utterance {constructor(text){this.text=text;}}
test('one utterance, Hindi pronunciation when a Hindi voice is available',()=>{
  const spoken=[];const hindi={lang:'hi-IN'};
  const synth={getVoices:()=>[{lang:'en-US'},hindi],cancel(){},speak:u=>spoken.push(u)};
  assert.equal(speakMantra(synth,Utterance),true);assert.equal(spoken.length,1);
  assert.equal(spoken[0].text,'बाबा नाम केवलम्');assert.equal(spoken[0].voice,hindi);
});
test('English and loading voice-list fallbacks still speak exactly once',()=>{
  for(const voices of [[],[{lang:'en-IN'}] ]){
    const spoken=[];speakMantra({getVoices:()=>voices,cancel(){},speak:u=>spoken.push(u)},Utterance);
    assert.equal(spoken.length,1);assert.equal(spoken[0].text,'Baba Naam Kevalam');assert.equal(spoken[0].lang,'en-IN');
  }
});
test('missing speech and synthesis errors report failure without retries',()=>{
  let failures=0;assert.equal(speakMantra(null,Utterance,()=>failures++),false);
  assert.equal(speakMantra({getVoices(){throw Error();}},Utterance,()=>failures++),false);
  assert.equal(failures,2);
});
test('a chosen installed English voice overrides the automatic Hindi voice and speaks once',()=>{
  const selected={lang:'en-GB',voiceURI:'natural-english',name:'Natural English'};const spoken=[];
  speakMantra({getVoices:()=>[{lang:'hi-IN',voiceURI:'hindi'},selected],cancel(){},speak:u=>spoken.push(u)},Utterance,()=>{},selected.voiceURI);
  assert.equal(spoken.length,1);assert.equal(spoken[0].voice,selected);assert.equal(spoken[0].text,'Baba Naam Kevalam');
});
