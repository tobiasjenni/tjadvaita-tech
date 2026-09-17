(function(root){
'use strict';
const normalize=x=>String(x).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[’']/g,'').replace(/\bim\b/g,'i am').replace(/\bcant\b/g,'cannot').replace(/\bdont\b/g,'do not').replace(/\bwont\b/g,'will not').replace(/\banxeity\b/g,'anxiety').replace(/\bmeditaion\b/g,'meditation').replace(/\batachement\b/g,'attachment');
const stop=new Set('a an the and or for to of in on at is are am be being been it its this that those these my me i you your we our us how what why where when which who can could would should do does did find show give about tell explain please sutra sutras patanjali yoga want looking related think say says mean meaning something help with from as by if so not have has more feel feeling feels need needs keep keeps really very just someone anyone everyone everything nothing anything people person things thing get gets like know even much many most some all also instead again always sometimes often trying try life own myself yourself them they their there here will cannot can never understand understanding useful helpful stop become becoming going go way question chapter chapters looking look make makes made'.split(' '));
const tokens=x=>normalize(x).match(/[\p{L}\p{N}]+/gu)?.filter(x=>!stop.has(x)&&x.length>1)||[];
const topics=[
 {words:['restless','restlessness','overthinking','racing','scattered','distraction','distracted','busy mind','focus'],refs:['1.2','1.12','1.32','1.33']},
 {words:['anxious','anxiety','stress','stressed','worried','worry','agitated','agitation','calm'],refs:['1.31','1.33','1.32','2.16']},
 {words:['attachment','attached','let go','letting go','detachment','nonattachment','clinging','grasping','renunciation','vairagya'],refs:['1.12','1.15','1.16','2.7']},
 {words:['practice','habit','consistency','consistent','discipline','daily','routine','commitment'],refs:['1.13','1.14','2.1','2.28']},
 {words:['eight limbs','eightfold','ashtanga','eight parts'],refs:['2.29','2.30','2.32','3.4']},
 {words:['breath','breathing','pranayama','inhalation','exhalation'],refs:['2.49','2.50','2.51','1.34','2.53']},
 {words:['posture','asana','sitting','seat','comfortable','comfort','steadiness'],refs:['2.46','2.47','2.48']},
 {words:['death','mortality','dying','survival'],refs:['2.9','2.3','3.23']},
 {words:['fear','afraid','scared'],refs:['2.9','2.3','1.33']},
 {words:['suffering','pain','misery','duhkha','hurt'],refs:['2.15','2.16','2.17','2.3']},
 {words:['compassion','kindness','friendship','friendly','friendliness','equanimity','maitri','karuna'],refs:['1.33','3.24','2.35']},
 {words:['anger','angry','resentment','hatred','violence','harm','ahimsa','nonviolence'],refs:['2.33','2.34','2.30','2.35']},
 {words:['jealous','jealousy','envy','envious'],refs:['1.33','2.33','2.7']},
 {words:['truth','truthful','honesty','honest','lying','satya'],refs:['2.30','2.36','1.7','1.8']},
 {words:['ethics','ethical','moral','yama','vows'],refs:['2.30','2.31','2.34','4.7']},
 {words:['contentment','enough','satisfaction','satisfied','santosha','happiness'],refs:['2.42','2.32','2.15']},
 {words:['possessions','possessiveness','greed','wealth','money','aparigraha','stealing'],refs:['2.30','2.37','2.39']},
 {words:['celibacy','sexuality','sexual','brahmacarya','brahmacharya','continence'],refs:['2.30','2.38']},
 {words:['god','ishvara','isvara','devotion','devotional','surrender'],refs:['1.23','1.24','2.45','2.1']},
 {words:['om','aum','mantra','chant','chanting','recitation'],refs:['1.27','1.28','2.44']},
 {words:['meditation','dhyana','meditate','concentration','dharana'],refs:['3.1','3.2','3.3','3.4']},
 {words:['samadhi','absorption','seedless','seed'],refs:['3.3','1.17','1.18','1.46','1.51']},
 {words:['samyama','combined concentration'],refs:['3.4','3.5','3.6','3.7']},
 {words:['mind reading','telepathy','another mind'],refs:['3.19','3.20']},
 {words:['levitation','levitate','flying','aerial movement'],refs:['3.43','3.38']},
 {words:['invisible','invisibility','disappearance'],refs:['3.21','3.22','3.38']},
 {words:['hunger','thirst'],refs:['3.31']},
 {words:['sun','cosmology','worlds'],refs:['3.27']},
 {words:['moon','stars'],refs:['3.28','3.29']},
 {words:['navel','anatomy'],refs:['3.30']},
 {words:['intuition','intuitive','pratibha'],refs:['3.34','3.37','1.48']},
 {words:['dharma megha','cloud of virtue','cloud of dharma'],refs:['4.29','4.30']},
 {words:['vitarka','vicara','savitarka','nirvitarka','savicara','nirvicara'],refs:['1.17','1.42','1.43','1.44']},
 {words:['powers','siddhis','siddhi','supernatural','extraordinary'],refs:['3.38','3.51','4.1','3.50']},
 {words:['liberation','freedom','kaivalya','enlightenment','release'],refs:['4.34','2.25','3.56','4.29']},
 {words:['ego','identity','asmita','self','awareness','consciousness','purusha','purusa','seer'],refs:['1.3','2.6','2.20','4.25']},
 {words:['karma','rebirth','reincarnation','past lives','previous lives'],refs:['2.12','2.13','2.14','4.7','3.18']},
 {words:['memory','memories','samskara','impressions','patterns','conditioning'],refs:['1.11','1.50','4.9','4.11','4.27']},
 {words:['sleep','dream','dreams','dreaming','nidra'],refs:['1.10','1.38']},
 {words:['knowledge','evidence','inference','reason','testimony','pramana'],refs:['1.7','1.8','1.49','4.15']},
 {words:['ignorance','avidya','misapprehension','afflictions','klesha'],refs:['2.3','2.4','2.5','2.24']},
 {words:['obstacles','doubt','failure','illness','laziness','stuck'],refs:['1.30','1.31','1.32','4.27']},
 {words:['senses','sensory','withdrawal','pratyahara'],refs:['2.54','2.55','3.48']},
 {words:['time','change','impermanence','transformation','future','past'],refs:['3.13','3.15','4.12','4.33']},
 {words:['nature','prakriti','gunas','guna','qualities'],refs:['2.18','2.19','4.13','4.34']},
 {words:['cleanliness','purity','purification','disgust','body image','saucha'],refs:['2.40','2.41','2.32']},
 {words:['reality','real','object','idealism','perception'],refs:['4.15','4.16','4.17','1.8']},
 {words:['beginner','begin','start','starting'],refs:['1.1','1.2','1.12','2.29']}
];
// These are editorial applications to common concerns, not claims that the
// ancient text explicitly discusses modern circumstances.
const concerns=[
 {id:'comparison',label:'comparison and self-worth',patterns:[/compar(?:e|es|ing|ison).*\b(others|people|myself|friends|everyone)/,/\b(others|everyone).*better than/,/\b(jealous|jealousy|envious|envy)\b/,/not good enough|feel inferior|feeling inferior/],refs:[['1.33','Offers appreciative joy in others’ goodness and happiness, a useful counterpoint to comparison.'],['2.42','Connects contentment with a less dependent form of happiness.'],['1.15','Explores loosening dependence on desired experiences and rewards.']]},
 {id:'conflict',label:'difficult relationships',patterns:[/\b(difficult|toxic|rude|annoying|angry|hostile|unfair|demanding|disrespectful)\b.*\b(colleague|coworker|co-worker|boss|partner|parent|family|people|person|friend)/,/\b(colleague|coworker|co-worker|boss|partner|parent|family|friend).*\b(conflict|argu|rude|angry|annoy|unfair|disrespect|difficult)/,/dealing with conflict|handle conflict|relationship conflict|arguments? with/],refs:[['1.33','Offers ways to meet different people with friendliness, compassion and steadiness.'],['2.33','Addresses redirecting harmful impulses before acting on them.'],['2.34','Invites reflection on harm, its motives and the actions we encourage.']]},
 {id:'digital',label:'attention and digital habits',patterns:[/scroll|social media|smartphone|phone|screen time|notifications?|doomscroll|digital distraction/],refs:[['2.54','Examines attention that is less governed by sensory attractions.'],['1.32','Offers a coherent focus as an answer to scattered attention.'],['2.7','Explains how pleasure can leave a drive to repeat the experience.']]},
 {id:'overwhelm',label:'feeling overwhelmed',patterns:[/overwhelm|too much to do|too many things|everything.*(?:need|have) to do|cannot cope|cant cope|juggling|burn(?:ed|t)? out|burnout/],refs:[['1.32','Suggests gathering scattered attention around one focus.'],['1.12','Pairs sustained effort with releasing the grasping around it.'],['2.16','Turns attention toward the suffering that can still be prevented.']]},
 {id:'grief',label:'loss and grief',patterns:[/\b(grief|grieving|bereavement|bereaved|mourning|heartbroken|heartbreak|breakup|divorce)\b/,/lost (?:my|a|someone)|passed away|(?:mother|father|friend|partner|child|someone).*died|partner.*left me|broke up/],refs:[['1.33','Places compassion at the center of meeting suffering.'],['2.15','Acknowledges the vulnerability and loss involved in changing experience.'],['1.12','Offers a balance of gentle continuity and release; it is not a demand to stop grieving.']]},
 {id:'self-criticism',label:'harshness toward yourself',patterns:[/hard on myself|harsh.*myself|hate myself|hating myself|self.?critic|self.?hatred|beat myself up|beating myself up|punish myself|perfectionis|not good enough/],refs:[['1.12','Balances practice with non-attachment rather than making effort an endless struggle.'],['1.14','Emphasizes time and continuity, which can counter demands for immediate perfection.'],['1.33','Centers compassion; extending that attitude to yourself is a contemporary application.']]},
 {id:'future-worry',label:'worry about what may happen',patterns:[/worr(?:y|ied|ying).*\b(future|tomorrow|happen|next|might|could)\b/,/anxi(?:ety|ous).*\b(future|tomorrow|happen)\b/,/what if.*(?:wrong|fail|happen|lose)|catastrophiz/],refs:[['2.16','Distinguishes future suffering that can be addressed from what cannot now be changed.'],['1.32','Offers a stable focus when attention is pulled in many directions.'],['1.12','Combines purposeful effort with loosening anxious grasping.']]},
 {id:'posture-difficulty',label:'finding ease in posture',patterns:[/(?:sit|sitting|posture|asana).*(?:pain|hurt|uncomfort|comfort|strain|cannot|difficult)/,/(?:cannot|cant|struggle|difficult|uncomfort|hurt|pain).*(?:sit|posture|asana)/,/meditat.*(?:back|knees?|hips?|comfort)/],refs:[['2.46','Makes steadiness and ease the defining qualities of posture.'],['2.47','Connects refinement of posture with relaxation of unnecessary effort.'],['2.48','Describes the steadiness sought through this preparation.']]},
 {id:'loneliness',label:'connection with others',patterns:[/lonel|alone|isolated|isolation from|disconnected|no friends|belonging|fit in/],refs:[['1.33','Offers friendliness and compassion as orientations toward other people.'],['3.24','Treats the capacity for friendliness as a strength worth cultivating.']],note:'These are reflections on relating to others; the text does not offer a complete answer to loneliness.'},
 {id:'reactivity',label:'responding with more choice',patterns:[/react(?:ing|ive|ivity)|respond instead|before i (?:react|speak)|lose my temper|losing my temper|lash out|lashing out|snap at|snapping at/],refs:[['2.33','Addresses cultivating a different orientation when harmful thoughts arise.'],['2.34','Examines the motives and consequences of acting, causing and approving harm.'],['1.12','Connects repeated practice with the capacity to release a habitual pull.']]},
 {id:'recognition',label:'praise, recognition and approval',patterns:[/\b(praise|recognition|validation|approval|flattery|fame|prestige)\b/,/what (?:others|people|everyone) think|impress (?:others|people)/],refs:[['3.52','Specifically warns that invitations, flattery and pride can renew attachment.'],['1.15','Explores freedom from dependence on experiences and promised rewards.'],['3.51','Asks for release even from attachment to high achievements.']]},
 {id:'patterns',label:'repeating patterns',patterns:[/repeat(?:ing)? .*mistakes?|same mistakes?|same patterns?|old patterns?|break.*habit|bad habits?|fall(?:ing)? back|backslid|relaps|do it again/],refs:[['4.11','Asks what causes, supports and objects keep a tendency in place.'],['4.27','Acknowledges that old impressions can return even after progress.'],['2.11','Directs meditation toward the present movements of afflictions.']]},
 {id:'decision',label:'discernment in a decision',patterns:[/\b(career|decision|decide|choosing|choices)\b/,/which.*(?:choose|job|path)|do not know.*choose|cannot.*choose/],refs:[['1.7','Distinguishes perception, reasoning and trustworthy testimony as ways to know.'],['1.8','Reminds us that a convincing view can still be mistaken.'],['2.26','Values sustained discernment; applying it to a life decision is a modern extension.']],note:'The sutras cannot choose a job or make the decision for you. These passages can support how you examine it.'},
 {id:'failure',label:'fear of failure',patterns:[/(?:fear|scared|afraid|anxious|worr).*\b(fail|failing|failure|mistake|wrong|work|exam|performance)/,/performance anxiety|fear of failure|scared to try|afraid to try/],refs:[['1.30','Recognizes doubt, difficulty reaching a stage and instability as obstacles in practice.'],['1.12','Balances commitment to practice with release of attachment to results.'],['1.14','Places progress in long-term continuity rather than instant success.']]},
 {id:'balanced-effort',label:'steady practice without strain',patterns:[/(?:consistent|consistency|discipline|practice|effort|meditat).*(?:without|not).*(?:forc|strain|hard|push|harsh|obsess)/,/forcing myself|pushing myself|try too hard|trying too hard|overdo.*practice/],refs:[['1.12','Joins practice and non-attachment, keeping effort and release together.'],['1.14','Supports patient continuity rather than a demand for perfection.'],['2.1','Places disciplined effort alongside study and dedication.']]},
 {id:'thought-identity',label:'identifying with thoughts',patterns:[/thoughts?.*(?:define|who i am|identity|myself|control me)|(?:am i|i am).*thoughts|not my thoughts|thoughts are me/],refs:[['1.4','Describes identification with the changing forms of mental activity.'],['2.6','Distinguishes the seer from the mental instrument through which experience appears.'],['1.3','Presents awareness as distinct from its changing contents.']]},
 {id:'racing-thoughts',label:'a restless mind',patterns:[/mind.*(?:wont|will not|cannot|never|cant).*(?:stop|quiet|settle)|thoughts?.*(?:race|racing|nonstop|non stop)|stop thinking|overthink|busy mind|restless mind|mind is restless/],refs:[['1.2','States yoga’s central concern with stilling the mind’s activity.'],['1.12','Gives practice and non-attachment as the paired means.'],['1.32','Offers one coherent focus to counter distraction.']]},
 {id:'forgiveness',label:'resentment and forgiveness',patterns:[/forgiv|resent|grudge|bitter|betray|cheated on/],refs:[['2.8','Explains how pain can leave a persistent tendency toward rejection.'],['2.33','Invites a different orientation when harmful thoughts take hold.'],['1.33','Offers compassion and equanimity without requiring approval of wrongdoing.']]},
 {id:'boundaries',label:'truthfulness and boundaries',patterns:[/boundar|say no|saying no|people pleas|please everyone|stand up for myself/],refs:[['2.30','Places truthfulness and non-harming together among the ethical restraints.'],['2.36','Examines a sustained commitment to truthfulness.'],['1.33','Keeps steadiness toward difficult conduct distinct from approving it.']],note:'Boundaries are a contemporary application of these ethical principles, not a technique explicitly set out in the sutras.'},
 {id:'sleep-difficulty',label:'settling an unsettled mind',patterns:[/cannot sleep|cant sleep|trouble sleeping|insomnia|awake at night|fall asleep|mind.*night/],refs:[['1.32','Addresses gathering attention when it is scattered.'],['1.33','Names attitudes intended to support mental clarity and calm.'],['1.10','Explains where sleep fits in the text’s account of mental activity.']],note:'These are passages for reflection, not a treatment for sleep difficulties.'},
 {id:'doubt',label:'questioning and reliable understanding',patterns:[/skeptic|sceptic|doubt.*(?:teacher|teaching|yoga|belief)|trust.*(?:teacher|guru)|blind faith|believe everything/],refs:[['1.7','Recognizes reasoning and reliable testimony alongside perception.'],['1.8','Distinguishes a mistaken cognition from its object.'],['1.20','Places confidence alongside wisdom and the other supports of practice.']]},
 {id:'teacher-accountability',label:'ethics and spiritual authority',patterns:[/guru.*(?:abuse|harm|above|ethics)|teacher.*(?:abuse|harm|above|ethics)|beyond (?:morality|ethics)|spiritual abuse/],refs:[['2.31','Presents ethical restraints as a universal vow, not a privilege-dependent rule.'],['2.34','Includes causing and approving harm in ethical responsibility.'],['4.7','Discusses karma without granting a teacher exemption from accountability.']]},
 {id:'fear-of-death',label:'fear of death',patterns:[/(?:fear|afraid|scared|anxi|worr).*(?:death|dying|die|mortality)|death anxiety/],refs:[['2.9','Directly names clinging to life, including its presence in learned people.'],['2.3','Places that tendency among the five afflictions.'],['1.33','Offers compassion as an orientation toward suffering.']]},
 {id:'impatience',label:'patience with progress',patterns:[/impatient|not making progress|no progress|progress.*slow|taking too long|years.*(?:practice|meditat)|practice.*years|stuck.*practice/],refs:[['1.14','Emphasizes duration, continuity and committed regard.'],['1.30','Acknowledges difficulty reaching and maintaining a stage.'],['4.27','Recognizes the return of old impressions even late in the path.']]},
 {id:'rest-and-effort',label:'exhaustion and effort',patterns:[/exhaust|tired all|need (?:a )?rest|rest without guilt|feel guilty.*rest|guilt.*rest/],refs:[['1.12','Keeps sustained effort together with the ability to release.'],['1.30','Acknowledges bodily and mental obstacles rather than assuming unlimited capacity.'],['2.46','Values ease alongside steadiness in posture; extending this balance to daily effort is a modern reflection.']]}
];
const inflections={worrying:'worry',worried:'worry',meditating:'meditation',meditate:'meditation',reacting:'reactivity',reactive:'reactivity',comfortable:'comfort',comfortably:'comfort',failing:'failure',failed:'failure',thought:'thoughts',breathing:'breath',angry:'anger',grieving:'grief',compassionate:'compassion',nonattachment:'attachment',dharanah:'dharana'};
const definitions={
 ahimsa:['2.30','2.35'],viveka:['2.26','3.53','4.26'],dharana:['3.1','3.4'],dhyana:['3.2','3.4'],samadhi:['3.3','1.17'],asana:['2.46','2.47'],abhyasa:['1.13','1.14'],vairagya:['1.15','1.16'],yama:['2.30','2.31'],niyama:['2.32'],pratyahara:['2.54','2.55'],pranayama:['2.49','2.50'],kaivalya:['4.34','2.25'],purusha:['2.20','1.3'],purusa:['2.20','1.3'],ishvara:['1.24','1.23'],isvara:['1.24','1.23'],om:['1.27','1.28'],aum:['1.27','1.28'],citta:['1.2','4.23'],chitta:['1.2','4.23'],klesha:['2.3'],klesa:['2.3'],avidya:['2.5','2.4'],asmita:['2.6'],raga:['2.7'],dvesha:['2.8'],dvesa:['2.8'],abhinivesha:['2.9'],abhinivesa:['2.9'],samskara:['4.9','1.50'],vritti:['1.5','1.6'],vrtti:['1.5','1.6'],pramana:['1.7'],viparyaya:['1.8'],vikalpa:['1.9'],nidra:['1.10'],smriti:['1.11'],smrti:['1.11'],tapas:['2.1','2.43'],svadhyaya:['2.44','2.1'],brahmacharya:['2.38','2.30'],brahmacarya:['2.38','2.30'],aparigraha:['2.39','2.30'],saucha:['2.40','2.41'],sauca:['2.40','2.41'],santosha:['2.42'],samtosa:['2.42'],satya:['2.36','2.30'],asteya:['2.37','2.30'],gunas:['2.18','2.19'],guna:['2.18','2.19'],maitri:['1.33','3.24'],karuna:['1.33'],upeksha:['1.33'],samyama:['3.4','3.5']
};
const terms=x=>tokens(x).map(t=>inflections[t]||t);
function createEngine(sutras){
 const docs=sutras.map((s,order)=>{const primary=[s.main_explanation.text,s.editorial_commentary.reading,s.sanskrit.iast,s.sanskrit.devanagari].join(' ');const secondary=[s.editorial_commentary.assessment,...s.translations.map(t=>t.text)].join(' ');return{s,order,primary:new Set(terms(primary)),words:new Set(terms(primary+' '+secondary))};});
 const frequency=new Map();docs.forEach(d=>d.words.forEach(w=>frequency.set(w,(frequency.get(w)||0)+1)));
 function search(query,limit=4,options={}){
  const q=normalize(query).trim().replace(/\b(?:not about|rather than|instead of)\s+(?:the\s+)?(?:attachment|breath|posture|meditation|sleep|fear|karma|liberation|compassion)\b/g,''),words=[...new Set(terms(q))];if(!q)return[];
  // Do not turn a word shared with the corpus into an answer to an unrelated request.
  if(/\b(weather|forecast|recipe|pancakes|stock price|bitcoin price|football score|flight status|javascript|python code)\b/.test(q)&&!/(?:yoga|sutra|meditat|attachment|mind)/.test(q))return[];
  const chapterFilter=options.chapter||+(q.match(/\bchapter\s*([1-4])\b/)?.[1]||0);
  const boosts=new Map(),reasons=new Map(),types=new Map(),labels=new Map(),notes=new Map();
  const foundConcerns=concerns.filter(c=>c.patterns.some(p=>p.test(q)));
  topics.forEach(t=>{if(t.words.some(w=>new RegExp('(?:^|[^a-z])'+w.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'(?:$|[^a-z])').test(q))){t.refs.forEach((r,i)=>{boosts.set(r,(boosts.get(r)||0)+(foundConcerns.length?8:45)-i*3);types.set(r,'direct_topic');labels.set(r,t.words[0]);});}});
  foundConcerns.forEach((c,ci)=>c.refs.forEach(([r,why],i)=>{boosts.set(r,(boosts.get(r)||0)+110-i*14);if(!reasons.has(r)){reasons.set(r,why);labels.set(r,c.label);notes.set(r,c.note||'');}types.set(r,'everyday_connection');}));
  const definitionBoosts=new Map();
  Object.entries(definitions).forEach(([term,refs])=>{if(new RegExp('\\b'+term+'\\b').test(q)){refs.forEach((r,i)=>{definitionBoosts.set(r,Math.max(definitionBoosts.get(r)||0,170-i*25));if(!reasons.has(r))reasons.set(r,`This is a key passage for understanding ${term} in the text.`);types.set(r,'direct_topic');labels.set(r,term);});}});
  definitionBoosts.forEach((value,ref)=>boosts.set(ref,(boosts.get(ref)||0)+value));
  const results=docs.map(d=>{let lexical=0,hits=0,rareHits=0;for(const w of words){if(d.words.has(w)){hits++;const df=frequency.get(w)||1;if(df<25)rareHits++;lexical+=Math.log(1+196/df)*(d.primary.has(w)?2:1);}}
   // Cap lexical contributions so a clearly recognized concern is not displaced
   // by an incidental word in a long historical translation.
   const score=(boosts.get(d.s.project_ref)||0)+Math.min(lexical,20);
   const topical=boosts.has(d.s.project_ref),coverage=words.length?hits/words.length:0;
   const valid=(!chapterFilter||d.s.chapter===chapterFilter)&&(topical||(!foundConcerns.length&&rareHits>0&&lexical>=6&&coverage>=.35));
   const matchType=types.get(d.s.project_ref)||'text_match';
   return{sutra:d.s,score,topicMatch:topical,matches:hits,valid,order:d.order,why:reasons.get(d.s.project_ref)||(topical?`Addresses ${labels.get(d.s.project_ref)} within the text’s teaching.`:'Shares specific language with your question; its context may help you decide whether it fits.'),matchType,theme:labels.get(d.s.project_ref)||'textual connection',note:notes.get(d.s.project_ref)||'',confidence:matchType==='everyday_connection'?'editorial_connection':topical?'topic_match':'possible_match'};
  }).filter(r=>r.valid&&r.score>6).sort((a,b)=>b.score-a.score||a.order-b.order);
  const best=results[0]?.score||0;
  return results.filter(r=>r.score>=best*.38).slice(0,Math.max(1,Math.min(8,limit)));
 }
 return{search,normalize,tokens};
}
root.SutraSearch={createEngine,normalize};
if(typeof module!=='undefined')module.exports=root.SutraSearch;
})(typeof window!=='undefined'?window:globalThis);
