import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState,plan,begin,pause,resume,remaining,settle,decode,dayKey} from './core.js';

test('no countdown or start date exists before the first actual Start',()=>{
  const state=initialState();assert.equal(state.startDate,null);assert.equal(state.session,null);
  assert.equal(plan(state,Date.parse('2030-08-01')).minutes,6);
});
test('six, seven, eight minutes follow local calendar dates and skipped days count',()=>{
  const t=Date.parse('2026-09-10T18:14:00Z');
  const s=begin(initialState(),t,'Asia/Kathmandu');
  assert.equal(s.startDate,'2026-09-10');assert.equal(s.session.totalMs,360000);
  assert.equal(plan(s,t+60000).minutes,7); // Midnight in Nepal, not 24 hours later.
  assert.equal(plan(s,t+86460000).minutes,8);
  assert.equal(plan(s,t+7*86400000).minutes,13);
});
test('DST and year boundaries progress by dates, and traveling preserves the starting timezone',()=>{
  const s=begin(initialState(),Date.parse('2026-03-07T17:00:00Z'),'America/New_York');
  assert.equal(plan(s,Date.parse('2026-03-08T16:00:00Z')).minutes,7);
  assert.equal(plan(s,Date.parse('2026-03-09T16:00:00Z')).minutes,8);
  const ny=begin(initialState(),Date.parse('2026-12-31T23:59:00Z'),'UTC');
  assert.equal(plan(ny,Date.parse('2027-01-01T00:00:00Z')).minutes,7);
  assert.equal(dayKey(Date.parse('2026-01-01T23:00:00Z'),'Asia/Kathmandu'),'2026-01-02');
  assert.equal(plan(s,Date.parse('2026-03-06T17:00:00Z')).minutes,6);
});
test('deadline survives inactive tabs, pause freezes time, resume preserves remaining time',()=>{
  const started=begin(initialState(),1000000,'UTC');
  assert.equal(remaining(started.session,1000000+95000),265000);
  const paused=pause(started,1000000+95000);
  assert.equal(remaining(paused.session,9000000),265000);
  const running=resume(paused,9000000);
  assert.equal(remaining(running.session,9015000),250000);
  assert.equal(settle(running,10000000).session.status,'done');
  assert.equal(settle(running,10000000).session.remainingMs,0);
});
test('reload recovers deadline; completed sessions remain completed',()=>{
  const s=begin(initialState(),Date.now(),'UTC');
  const restored=decode(JSON.stringify(s));
  assert.deepEqual(restored,s);assert.equal(remaining(restored.session,s.session.endAt-1234),1234);
  const done=settle(restored,s.session.endAt+9000);assert.deepEqual(settle(done,s.session.endAt+10000),done);
});
test('today-only duration and reset behavior do not change progression',()=>{
  const t=Date.parse('2026-09-10T12:00:00Z');let s=begin(initialState(),t,'UTC');
  s.override={date:'2026-09-10',minutes:12};s.session=null;
  assert.equal(begin(s,t,'UTC').session.totalMs,720000);
  assert.equal(plan(s,t+86400000).minutes,7);
  assert.equal(s.startDate,'2026-09-10');
  assert.equal(begin(initialState(),t+86400000,'UTC').session.totalMs,360000);
});
test('invalid or unavailable stored data safely falls back',()=>{
  for(const raw of [null,'{','null','{}','{"version":2}',JSON.stringify({...initialState(),startDate:'bad'})]) assert.deepEqual(decode(raw),initialState());
  assert.deepEqual(decode(JSON.stringify({...initialState(),zone:'Invalid/Place'})),initialState());
  assert.equal(decode(JSON.stringify({...initialState(),override:{date:'2026-09-10',minutes:-1}})).override,null);
});
test('existing progress migrates without losing the first-session date and independently saves audio preferences',()=>{
  const old=begin(initialState(),Date.parse('2026-09-10T12:00:00Z'),'UTC');delete old.music;delete old.musicVolume;delete old.gongVolume;
  const migrated=decode(JSON.stringify(old));assert.equal(migrated.startDate,'2026-09-10');assert.equal(migrated.music,false);assert.equal(migrated.musicVolume,25);
  const prefs={...migrated,music:true,voice:false,bell:true,musicVolume:14,gongVolume:70};assert.deepEqual(decode(JSON.stringify(prefs)),prefs);
});
test('a backward clock change cannot extend the countdown beyond the selected session length',()=>{
  const state=begin(initialState(),1000000,'UTC');assert.equal(remaining(state.session,0),360000);
});
