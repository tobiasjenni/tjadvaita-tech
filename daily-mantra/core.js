export const KEY = 'daily-mantra-v1';
export function dayKey(now = Date.now(), zone = Intl.DateTimeFormat().resolvedOptions().timeZone) {
  const parts = new Intl.DateTimeFormat('en-US', {timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now);
  const get = type => parts.find(p => p.type === type).value;
  return `${get('year')}-${get('month')}-${get('day')}`;
}
export function dayNumber(key) { return Date.parse(`${key}T00:00:00Z`) / 86400000; }
export function initialState() { return {version:1,startDate:null,zone:null,bell:false,voice:true,voiceURI:null,music:false,musicVolume:25,gongVolume:55,override:null,session:null}; }
export function plan(state, now = Date.now()) {
  const today = dayKey(now, state.zone || undefined);
  const day = state.startDate ? Math.max(0, dayNumber(today)-dayNumber(state.startDate))+1 : 1;
  const suggested = 5 + day;
  return {today,day,suggested,minutes:state.override?.date===today ? state.override.minutes : suggested};
}
export function remaining(session, now = Date.now()) {
  if (!session) return 0;
  return session.status === 'running' ? Math.min(session.totalMs,Math.max(0,session.endAt-now)) : session.remainingMs;
}
export function begin(state, now = Date.now(), zone = Intl.DateTimeFormat().resolvedOptions().timeZone) {
  const next = structuredClone(state);
  if (!next.startDate) { next.zone=zone; next.startDate=dayKey(now,zone); }
  const totalMs=plan(next,now).minutes*60000;
  next.session={status:'running',totalMs,remainingMs:totalMs,endAt:now+totalMs};
  return next;
}
export function pause(state, now = Date.now()) {
  if (state.session?.status!=='running') return state;
  const ms=remaining(state.session,now);
  return {...state,session:{...state.session,status:ms ? 'paused':'done',remainingMs:ms,endAt:null}};
}
export function resume(state, now = Date.now()) {
  if(state.session?.status!=='paused') return state;
  return {...state,session:{...state.session,status:'running',endAt:now+state.session.remainingMs}};
}
export function settle(state,now=Date.now()) {
  return state.session?.status==='running' && remaining(state.session,now)===0
    ? {...state,session:{...state.session,status:'done',remainingMs:0,endAt:null}} : state;
}
export function decode(raw) {
  const fallback=initialState();
  if(!raw) return fallback;
  try {
    const s=JSON.parse(raw);
    if(s.version!==1) return fallback;
    if(s.startDate!==null && (typeof s.startDate!=='string' || !/^\d{4}-\d{2}-\d{2}$/.test(s.startDate) || !Number.isFinite(dayNumber(s.startDate)))) return fallback;
    if(s.startDate && typeof s.zone!=='string') return fallback;
    if(s.zone) dayKey(Date.now(),s.zone);
    const result={...fallback,startDate:s.startDate,zone:s.zone || null,bell:s.bell===true,voice:s.voice!==false,voiceURI:typeof s.voiceURI==='string' ? s.voiceURI:null,music:s.music===true};
    for(const field of ['musicVolume','gongVolume']) if(Number.isFinite(s[field]) && s[field]>=0 && s[field]<=100)result[field]=s[field];
    if(s.override && /^\d{4}-\d{2}-\d{2}$/.test(s.override.date) && Number.isInteger(s.override.minutes) && s.override.minutes>=1 && s.override.minutes<=180) result.override=s.override;
    const t=s.session;
    if(t && s.startDate && ['running','paused','done'].includes(t.status) && Number.isFinite(t.totalMs) && t.totalMs>0 && Number.isFinite(t.remainingMs) && t.remainingMs>=0 && t.remainingMs<=t.totalMs && (t.status!=='running' || Number.isFinite(t.endAt))) result.session=t;
    return result;
  } catch { return fallback; }
}
