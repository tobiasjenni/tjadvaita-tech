import test from 'node:test';
import assert from 'node:assert/strict';
import {Soundscape} from './soundscape.js';

function fakeAudio(){
  const nodes=[];
  const param=()=>({value:0,events:[],setValueAtTime(...a){this.events.push(['set',...a]);},linearRampToValueAtTime(...a){this.events.push(['ramp',...a]);},exponentialRampToValueAtTime(...a){this.events.push(['exp',...a]);},cancelScheduledValues(){},setTargetAtTime(){}});
  const context={currentTime:10,state:'running',destination:{},resume:async()=>{},createGain:()=>({gain:param(),connect(){},disconnect(){}}),createOscillator:()=>{const n={frequency:param(),detune:param(),stops:[],connect(){},disconnect(){},start(){},stop(t){this.stops.push(t);}};nodes.push(n);return n;}};
  return {context,nodes};
}
test('music fades and every oscillator stops at the session deadline even without timer callbacks',async()=>{
  const {context,nodes}=fakeAudio();const sound=new Soundscape(()=>context);
  await sound.startMusic(60000,25);assert.equal(nodes.length,12);
  assert.ok(nodes.every(n=>n.stops[0]===70));
  assert.deepEqual(sound.music.gain.gain.events.at(-1),['ramp',0,70]);
  sound.stopMusic();assert.equal(sound.music,null);assert.ok(nodes.every(n=>n.stops.at(-1)===10.15));
});
test('mute cancels pending audio starts, preventing a late resume promise from restarting music or gong',async()=>{
  const {context,nodes}=fakeAudio();const resolvers=[];context.resume=()=>new Promise(resolve=>resolvers.push(resolve));
  const sound=new Soundscape(()=>context);const music=sound.startMusic(60000,25);const gong=sound.playGong(55);
  sound.stopAll();resolvers.forEach(resolve=>resolve());await Promise.all([music,gong]);assert.equal(nodes.length,0);
});
test('gong is one bounded strike and zero volume creates no audio nodes',async()=>{
  const {context,nodes}=fakeAudio();const sound=new Soundscape(()=>context);
  await sound.playGong(0);await sound.startMusic(60000,0);assert.equal(nodes.length,0);
  await sound.playGong(55);assert.equal(nodes.length,6);assert.ok(nodes.every(n=>n.stops.length===1));
  sound.stopAll();assert.equal(sound.gong,null);
});
