import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {KEY} from './core.js';

test('Start speaks once; pause/resume, reload, storage synchronization and ticks never replay it',async()=>{
  const elements=new Map();
  for(const [,id] of readFileSync(new URL('./index.html',import.meta.url),'utf8').matchAll(/id="([^"]+)"/g)) {
    elements.set(id,{style:{},value:'6',checked:false,disabled:false,hidden:false,textContent:'',innerHTML:'',listeners:{},addEventListener(name,callback){this.listeners[name]=callback;},showModal(){}});
  }
  const windowEvents={};const documentEvents={};const speech=[];const data=new Map();
  globalThis.document={title:'',visibilityState:'visible',getElementById:id=>elements.get(id),addEventListener:(e,fn)=>documentEvents[e]=fn};
  globalThis.window={addEventListener:(e,fn)=>windowEvents[e]=fn,speechSynthesis:{getVoices:()=>[],cancel(){},speak:u=>speech.push(u)},SpeechSynthesisUtterance:class{constructor(text){this.text=text;}}};
  let toneCount=0;
  const param=()=>({value:0,setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){},cancelScheduledValues(){},setTargetAtTime(){}});
  window.AudioContext=class{constructor(){this.currentTime=0;this.state='running';this.destination={};}async resume(){}createGain(){return {gain:param(),connect(){},disconnect(){}};}createOscillator(){toneCount++;return {frequency:param(),detune:param(),connect(){},disconnect(){},start(){},stop(){}};}};
  globalThis.localStorage={getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v)};
  const realInterval=globalThis.setInterval;let tick;
  globalThis.setInterval=fn=>{tick=fn;return 0;};
  const realNow=Date.now;let now=Date.parse('2026-09-10T10:00:00Z');Date.now=()=>now;
  try {
    await import('./app.js?first');
    assert.equal(speech.length,0);assert.equal(data.size,0);assert.equal(elements.get('countdown').textContent,'06:00');
    elements.get('start').listeners.click();assert.equal(speech.length,1);
    now+=10000;tick();assert.equal(elements.get('countdown').textContent,'05:50');
    elements.get('start').listeners.click();now+=30000;tick();assert.equal(elements.get('countdown').textContent,'05:50');
    elements.get('start').listeners.click();assert.equal(speech.length,1);
    await import('./app.js?reload');assert.equal(speech.length,1);
    windowEvents.storage({key:KEY,newValue:data.get(KEY)});documentEvents.visibilitychange();assert.equal(speech.length,1);
    now+=500000;tick();assert.equal(elements.get('countdown').textContent,'00:00');assert.equal(elements.get('start-label').textContent,'Meditate again');
    elements.get('start').listeners.click();assert.equal(speech.length,2);
    elements.get('reset').listeners.click();assert.equal(elements.get('countdown').textContent,'06:00');
    assert.ok(JSON.parse(data.get(KEY)).startDate);
    elements.get('voice').checked=false;elements.get('voice').listeners.change();
    elements.get('bell').checked=true;elements.get('bell').listeners.change();
    elements.get('music').checked=true;elements.get('music').listeners.change();
    elements.get('music-volume').value='14';elements.get('music-volume').listeners.input();
    elements.get('start').listeners.click();
    for(let i=0;i<8;i++)await Promise.resolve();
    assert.equal(speech.length,2,'disabled opening voice must remain silent');assert.equal(toneCount,12,'music begins on Start');
    elements.get('voice').checked=true;elements.get('voice').listeners.change();assert.equal(speech.length,2,'enabling voice mid-session must not speak');
    now+=400000;tick();for(let i=0;i<8;i++)await Promise.resolve();assert.equal(toneCount,18,'one gong contains exactly six partials');
    tick();tick();assert.equal(toneCount,18,'completion gong cannot repeat on timer ticks');
    elements.get('silence').listeners.click();
    const muted=JSON.parse(data.get(KEY));assert.equal(muted.voice,false);assert.equal(muted.bell,false);assert.equal(muted.music,false);assert.equal(muted.musicVolume,14);
    elements.get('start').listeners.click();for(let i=0;i<8;i++)await Promise.resolve();assert.equal(speech.length,2);assert.equal(toneCount,18,'silent sessions create no sound');
  } finally {globalThis.setInterval=realInterval;Date.now=realNow;}
});
