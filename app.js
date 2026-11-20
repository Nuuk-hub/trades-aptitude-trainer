const app = document.getElementById('app');
const storageKey = 'mb-trades-trainer-v1';
const letters = 'ABCDE';
const levels = ['','Foundational','Intermediate','Advanced'];
const byId = Object.fromEntries(bank.map(q=>[q.id,q]));
let durable = true;
let data = {progress:{}, numericCursor:0, active:null, results:null, lastExam:null, settings:{}};
try {
  const saved = JSON.parse(localStorage.getItem(storageKey));
  if (saved?.progress) data = {...data,...saved};
} catch { durable = false; }
for (const p of Object.values(data.progress)) {
  if (p.review === undefined) p.review=Boolean(p.missed || p.attempts>p.correct);
}

function save() {
  try {
    localStorage.setItem(storageKey,JSON.stringify(data));
    durable = true;
  } catch { durable = false; }
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

function shuffle(items) {
  const output = [...items];
  for (let i=output.length-1;i>0;i--) {
    const j=Math.floor(Math.random()*(i+1));
    [output[i],output[j]]=[output[j],output[i]];
  }
  return output;
}

const sectionFor = id=>sections.find(s=>s.id===id);
const questionFor = id=>byId[id] || generation.byId(id);
const score = (correct,total)=>total ? Math.round(100*correct/total)+'%' : '—';
const blank = (answers,id)=>answers[id]===undefined;
const currentRoute = ()=>location.hash.slice(1) || 'home';

function metrics(id) {
  const records = Object.values(data.progress).filter(p=>p.section===id);
  return records.reduce((m,p)=>({
    seen:m.seen+1, attempts:m.attempts+p.attempts, correct:m.correct+p.correct,
    seconds:m.seconds+p.seconds, review:m.review+Number(Boolean(p.review))
  }),{seen:0,attempts:0,correct:0,seconds:0,review:0});
}

function record(q, correct, seconds, now=Date.now(),selected=null) {
  const p = data.progress[q.id] || {section:q.section,topic:q.topic,attempts:0,correct:0,seconds:0,streak:0};
  p.attempts++;
  p.correct+=Number(correct);
  p.seconds+=Math.max(0,Math.round(seconds));
  p.streak=correct?p.streak+1:0;
  p.missed=!correct;
  p.lastSeen=now;
  if (!correct) {
    p.review=true;
    p.wrongAnswer=selected;
  }
  data.progress[q.id]=p;
}

function topicStats(id) {
  const weak={};
  for (const p of Object.values(data.progress)) {
    if (p.section!==id) continue;
    weak[p.topic] ||= {wrong:0,attempts:0};
    weak[p.topic].wrong+=p.attempts-p.correct;
    weak[p.topic].attempts+=p.attempts;
  }
  return weak;
}

function practiceItems(id,count,level,kind) {
  const all=bank.filter(q=>q.section===id);
  if (id==='numerical' && kind==='review') {
    const generated=Object.keys(data.progress).filter(key=>!byId[key]).map(generation.byId).filter(Boolean);
    all.push(...generated);
  }
  const selected=all.filter(q=>kind==='review' || !level || q.level===level);
  const weak=topicStats(id);
  const weakness=q=>{
    const topic=weak[q.topic];
    return topic ? topic.wrong/topic.attempts : 0;
  };
  const m=metrics(id);
  const target=m.attempts>=8 && m.correct/m.attempts>=0.8 ? 3 :
    m.attempts>=5 && m.correct/m.attempts<0.55 ? 1 : 2;
  const rank=q=>{
    const p=data.progress[q.id];
    if (kind==='review') return 0;
    if (kind==='weak') return weakness(q)*5+(!p?2:0);
    return (p?.missed?12:!p?8:0)-Math.abs(q.level-target);
  };
  const candidates=kind==='review'?selected.filter(q=>data.progress[q.id]?.review):selected;
  if (kind==='review') return candidates.sort((a,b)=>{
    const x=data.progress[a.id], y=data.progress[b.id];
    return Number(y.missed)-Number(x.missed)||(x.lastSeen||0)-(y.lastSeen||0);
  }).slice(0,count);
  return shuffle(candidates).sort((a,b)=>rank(b)-rank(a)).slice(0,count);
}

function startPractice(id, count, level, kind) {
  const picked=kind==='numeric'?generation.numeric(count,data.numericCursor):practiceItems(id,count,level,kind);
  if (!picked.length) {
    showNotice('No mistakes to review yet. Questions you answer incorrectly will appear here.');
    return;
  }
  if (!mayReplaceSession()) return;
  if (kind==='numeric') data.numericCursor+=picked.length;
  data.active={
    mode:'practice',section:id,kind,count,level,ids:picked.map(q=>q.id),pos:0,selected:null,
    checked:null,started:Date.now(),tries:0,right:0,requeued:[],history:[]
  };
  save();
  navigate('session');
}

function mayReplaceSession() {
  return !data.active || window.confirm('Replace your current session? Practice already recorded will stay in your progress.');
}

function startExam(form) {
  if (!mayReplaceSession()) return;
  const fields=new FormData(form);
  const plan=sections.map(section=>{
    const count=Number(fields.get(section.id+'Count'));
    const minutes=Number(fields.get(section.id+'Time'));
    return {id:section.id,count,minutes,ids:shuffle(bank.filter(q=>q.section===section.id)).slice(0,count).map(q=>q.id)};
  });
  data.settings={profile:fields.get('profile'), plan:plan.map(({id,count,minutes})=>({id,count,minutes}))};
  data.active={mode:'exam',plan,index:0,pos:0,answers:{},spent:{},entered:null,done:[],deadline:null};
  save();
  navigate('session');
}

function activateExam() {
  const s=data.active;
  if (!s || s.mode!=='exam' || s.deadline) return;
  s.entered=Date.now();
  s.deadline=s.entered+s.plan[s.index].minutes*60000;
  save();
  render();
}

function accrue(s,now=Date.now()) {
  if (!s.entered) return;
  const id=s.plan[s.index].ids[s.pos];
  const until=Math.min(now,s.deadline);
  s.spent[id]=(s.spent[id]||0)+Math.max(0,(until-s.entered)/1000);
  s.entered=until;
}

function finishExamSection(timedOut=false) {
  const s=data.active;
  if (!s || s.mode!=='exam' || !s.deadline) return;
  const now=Date.now();
  accrue(s,now);
  const plan=s.plan[s.index];
  let correct=0, unanswered=0;
  const review=[];
  for (const id of plan.ids) {
    if (blank(s.answers,id)) {
      unanswered++;
      review.push({id,selected:null});
      continue;
    }
    const q=byId[id];
    const hit=s.answers[id]===q.answer;
    correct+=Number(hit);
    record(q,hit,s.spent[id]||0,now,s.answers[id]);
    if (!hit) review.push({id,selected:s.answers[id]});
  }
  s.done.push({section:plan.id,count:plan.count,correct,unanswered,timedOut,review});
  s.index++;
  s.pos=0;
  s.answers={};
  s.spent={};
  s.deadline=null;
  s.entered=null;
  if (s.index>=s.plan.length) {
    data.results={mode:'exam',parts:s.done};
    data.lastExam=data.results;
    data.active=null;
    save();
    navigate('results');
    return;
  }
  save();
  if (currentRoute()==='session') render();
}

function timedOut() {
  const s=data.active;
  if (s?.mode==='exam' && s.deadline && Date.now()>=s.deadline) {
    finishExamSection(true);
    return true;
  }
  return false;
}

function questionContent(q,showTopic=true,help=false) {
  return (q.context?'<div class="reference"><span class="eyebrow">Reference instructions</span><p>'+escapeHTML(q.context)+'</p></div>':'')+
    (q.diagram?'<figure>'+drawDiagram(q.diagram)+'</figure>':'')+
    (showTopic?'<p class="eyebrow">'+escapeHTML(q.topic)+' · '+levels[q.level]+'</p>':'')+
    '<h1 id="question">'+(help?wordHelp.text(q.prompt):escapeHTML(q.prompt))+'</h1>';
}

const icons = {
  type:'<path d="M4 6h16M12 6v13m-4 0h8"/>',
  gear:'<path d="m12 2 1.2 3 3 .8 2.7-1 2 3.4-2.2 2.3v3l2.2 2.3-2 3.4-2.7-1-3 .8L12 22l-1.2-3-3-.8-2.7 1-2-3.4 2.2-2.3v-3L3.1 8.2l2-3.4 2.7 1 3-.8Z"/><circle cx="12" cy="12" r="3"/>',
  math:'<path d="M5 7h6M8 4v6m6 7h6m-6 4h6M5 15l6 6m0-6-6 6"/>',
  list:'<path d="M9 6h11M9 12h11M9 18h11M4 6h1m-1 6h1m-1 6h1"/>'
};
function icon(type) {
  return '<span class="icon '+type+'"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+icons[type]+'</svg></span>';
}

const button=(label,action,style='',attrs='')=>'<button type="button" class="'+style+'" data-action="'+action+'" '+attrs+'>'+label+'</button>';
const link=(label,route,style='')=>'<a class="button '+style+'" href="#'+route+'">'+label+'</a>';
const stat=(label,value)=>'<div class="stat"><strong>'+value+'</strong><span>'+label+'</span></div>';
const optionsCount=[5,10,15,20];
const warning=()=>durable?'':'<p class="notice">This browser is currently blocking saved progress. Work in this tab will last until you reload or close it.</p>';
function home() {
  const all=sections.map(s=>metrics(s.id));
  const total=key=>all.reduce((sum,m)=>sum+m[key],0);
  const last=data.lastExam?link('View last exam results','last-exam','quiet'):'';
  return '<section class="hero">'+
    '<div class="hero-copy"><p class="eyebrow">Trades aptitude preparation</p><h1>Trades Aptitude Trainer</h1>'+
    '<p>Build your skills with practice exercises or run all four sections under timed conditions.</p>'+
    '<div class="actions">'+link('Exam Simulation <span aria-hidden="true">→</span>','exam','light')+last+'</div></div>'+
    '<div class="hero-portrait"><img src="./electrician.png" alt="Electrician wearing a hard hat and a belt of tools" width="1024" height="1536"></div></section>'+
    '<section class="stats" aria-label="Progress">'+stat('Answers recorded',total('attempts'))+stat('Accuracy',score(total('correct'),total('attempts')))+stat('Mistakes to review',total('review'))+
    stat('Avg. answer time',total('attempts')?Math.round(total('seconds')/total('attempts'))+'s':'—')+'</section>'+
    (data.active?'<div class="resume"><span>You have a '+(data.active.mode==='exam'?'simulation':'practice set')+' in progress.</span>'+link('Resume session','session','primary')+'</div>':'')+
    '<div class="section-head"><h2>Practice by section</h2><span>400 practice questions</span></div>'+
    '<div class="cards">'+sections.map((s,index)=>{
      const m=all[index];
      return '<article class="card">'+icon(s.icon)+'<div><p class="eyebrow">'+s.count+' questions</p><h3>'+s.name+'</h3><p>'+s.detail+'</p></div>'+
        '<div class="card-foot"><span>'+ (m.attempts?score(m.correct,m.attempts)+' accuracy · '+m.review+' to review':'Ready to start')+'</span>'+
        link('Practice <span aria-hidden="true">→</span>','practice/'+s.id,'outline')+'</div></article>';
    }).join('')+'</div>';
}

function practiceSetup(id) {
  const s=sectionFor(id);
  if (!s) return home();
  const m=metrics(id);
  const weak=Object.entries(topicStats(id)).filter(([,p])=>p.wrong>0)
    .sort((a,b)=>b[1].wrong-a[1].wrong).slice(0,3);
  return '<div class="setup"><a class="back" href="#home">← All sections</a><section class="panel">'+icon(s.icon)+
    '<p class="eyebrow">Practice</p><h1>'+s.name+'</h1><p class="muted">'+s.detail+'</p>'+
    '<div class="mini-stats">'+stat('Accuracy',score(m.correct,m.attempts))+stat('Mistakes to review',m.review)+stat('Questions covered',m.seen)+'</div>'+
    (weak.length?'<p class="weak-topics"><strong>Topics with the most mistakes</strong> '+weak.map(([topic,p])=>escapeHTML(topic)+' ('+p.wrong+')').join(' · ')+'</p>':'')+
    '<form id="practice-form" data-section="'+s.id+'"><div class="fields"><label>Difficulty<select name="level"><option value="0">Adaptive</option>'+
    levels.slice(1).map((l,i)=>'<option value="'+(i+1)+'">'+l+'</option>').join('')+'</select></label><label>Questions<select name="count">'+
    optionsCount.map(n=>'<option '+(n===10?'selected':'')+' value="'+n+'">'+n+'</option>').join('')+'</select></label></div>'+
    '<div class="actions"><button class="primary" type="submit">Start practice</button>'+
    button('Review mistakes','review','outline')+button('Practice weak areas','weak','outline')+'</div></form>'+
    '<div class="actions">'+link('View review list ('+m.review+')','review/'+id,'quiet')+'</div>'+
    '<p class="notice" id="notice" role="status" hidden></p></section>'+
    '<section class="panel generation"><h2>Generate new questions</h2><p class="muted">'+(id==='numerical'?'Create fresh numerical variants from built-in templates.':'Choose Numerical Reasoning to create variants from built-in templates.')+'</p>'+
    '<div class="actions">'+(id==='numerical'?button('Generate numeric variants','numeric','outline'):link('Numerical Reasoning','practice/numerical','outline'))+
    button('AI generation','ai','quiet','disabled')+'</div><small>AI generation is currently unavailable.</small></section></div>';
}

function examSetup() {
  const profile=data.settings.profile||'standard';
  return '<div class="setup"><a class="back" href="#home">← Practice dashboard</a><section class="panel"><p class="eyebrow">Timed practice</p>'+
    '<h1>Exam Simulation</h1><p class="muted">Complete four separately timed sections. Skip and revisit questions within a section. Take a break before starting the next one.</p>'+
    '<form id="exam-form"><label class="preset">Timing preset<select name="profile"><option value="standard" '+(profile==='standard'?'selected':'')+'>Extended simulation</option>'+
    '<option value="drill" '+(profile==='drill'?'selected':'')+'>Prep booklet drill</option><option value="custom" '+(profile==='custom'?'selected':'')+'>Custom</option></select></label>'+
    '<div class="exam-grid"><div class="exam-row exam-labels"><span>Section</span><span>Questions</span><span>Minutes</span></div>'+
    sections.map(s=>{
      const saved=data.settings.plan?.find(p=>p.id===s.id);
      const fallback=s[profile]||s.standard;
      return '<div class="exam-row"><strong>'+s.name+'</strong><input aria-label="'+s.name+' questions" type="number" name="'+s.id+'Count" min="1" max="'+s.count+'" value="'+(saved?.count??fallback[0])+'" required>'+
        '<input aria-label="'+s.name+' minutes" type="number" name="'+s.id+'Time" min="1" max="120" value="'+(saved?.minutes??fallback[1])+'" required></div>';
    }).join('')+'</div><p class="muted">The drill uses the prep booklet’s suggested pacing. Extended and custom timings are training settings. Your test administrator provides the real limits.</p>'+
    '<div class="actions"><button type="submit" class="primary">Set up simulation →</button>'+
    (data.active?.mode==='exam'?link('Resume simulation','session','outline'):'')+'</div></form></section></div>';
}

function answerOptions(q,selected,reveal=false,help=false) {
  return '<div class="options" aria-labelledby="question" role="group">'+q.options.map((value,i)=>{
    const chosen=selected===i;
    const flag=reveal?(i===q.answer?' correct':chosen?' incorrect':''):'';
    const note=reveal?(i===q.answer?' <em>Correct answer</em>':chosen?' <em>Your answer</em>':''):'';
    return '<div><button type="button" class="option'+(chosen?' selected':'')+flag+'" data-action="choose" data-index="'+i+'" aria-pressed="'+chosen+'" '+(reveal?'disabled':'')+'><span class="letter">'+letters[i]+'</span><span>'+escapeHTML(value)+note+'</span></button>'+
      (help?'<div class="answer-meanings">'+wordHelp.text(value)+'</div>':'')+'</div>';
  }).join('')+'</div>';
}

function endPractice(s) {
  data.results={mode:'practice',section:s.section,correct:s.right,total:s.tries,count:s.count,level:s.level,kind:s.kind,history:s.history||[],partialHistory:s.partialHistory};
  data.active=null;
  save();
  navigate('results');
}

function checkPractice() {
  const s=data.active;
  if (s.mode!=='practice'||s.checked!==null||s.selected===null) return;
  const q=questionFor(s.ids[s.pos]);
  const correct=s.selected===q.answer;
  record(q,correct,(Date.now()-s.started)/1000,Date.now(),s.selected);
  if (!s.history) {
    s.partialHistory=s.tries>0;
    s.history=[];
  }
  s.history.push({id:q.id,selected:s.selected,correct});
  s.checked=correct;
  s.tries++;
  s.right+=Number(correct);
  if (!correct && !s.requeued.includes(q.id) && s.ids.length-s.pos>=3) {
    s.ids.splice(Math.min(s.ids.length,s.pos+4),0,q.id);
    s.requeued.push(q.id);
  }
  save();
  render('feedback');
}

function practiceSession(s) {
  const q=questionFor(s.ids[s.pos]);
  const reveal=s.checked!==null;
  return '<div class="work"><div class="work-head"><a class="back" href="#home">← Dashboard</a><span>Question '+(s.pos+1)+' of '+s.ids.length+'</span></div>'+
    '<progress aria-label="Practice progress" max="'+s.ids.length+'" value="'+(s.pos+Number(reveal))+'"></progress>'+
    '<section class="panel question"><p class="section-name">'+sectionFor(s.section).name+(s.requeued.includes(q.id)&&s.ids.indexOf(q.id)!==s.pos?' · Retry':'')+'</p>'+
    questionContent(q,true,q.section==='verbal')+
    (q.section==='verbal'?'<p class="muted word-help-tip">Tap an underlined word for its meaning. Meaning buttons below answers open the vocabulary help.</p>':'')+
    answerOptions(q,s.selected,reveal,q.section==='verbal')+
    (reveal?'<div id="feedback" tabindex="-1" role="status" class="feedback '+(s.checked?'good':'miss')+'"><strong>'+
      (s.checked?'Correct':'Correct answer: '+escapeHTML(q.options[q.answer]))+'</strong><p>'+escapeHTML(q.explanation)+'</p></div>':'')+
    '<div class="actions">'+(reveal?button(s.pos+1===s.ids.length?'See results →':'Next question →','next','primary'):
      button('Check answer','check','primary',s.selected===null?'disabled':''))+'</div></section></div>';
}

function examSession(s) {
  const section=s.plan[s.index];
  const name=sectionFor(section.id).name;
  if (!s.deadline) {
    const previous=s.done.at(-1);
    return '<div class="setup"><a class="back" href="#exam">← Exam setup</a><section class="panel"><p class="eyebrow">Section '+(s.index+1)+' of 4</p><h1>'+name+'</h1>'+
      (previous?'<p class="muted">'+(previous.timedOut?'Time expired.':'Section submitted.')+' Take a break before continuing.</p>':'')+
      '<p>'+section.count+' questions · '+section.minutes+' minutes</p><p class="muted">The timer starts when you begin this section.</p><div class="actions">'+button('Start timed section →','activate','primary')+'</div></section></div>';
  }
  const id=section.ids[s.pos];
  const q=byId[id];
  const remaining=section.ids.filter(key=>blank(s.answers,key)).length;
  return '<div class="work exam-work"><div class="work-head"><span>'+name+' · '+(s.index+1)+'/4</span><span id="timer" class="timer" role="timer" aria-label="Time remaining"></span></div>'+
    '<div class="exam-layout"><section class="panel question"><p class="eyebrow">Question '+(s.pos+1)+' of '+section.count+'</p>'+
    questionContent(q,false)+answerOptions(q,s.answers[id])+ 
    '<div class="actions">'+button('Previous','previous','outline',s.pos===0?'disabled':'')+
    button(s.pos===section.ids.length-1?'Find unanswered':'Next / Skip →','forward','primary',s.pos===section.ids.length-1&&remaining<=Number(blank(s.answers,id))?'disabled':'')+
    button('Clear answer','clear','quiet',blank(s.answers,id)?'disabled':'')+'</div></section>'+
    '<aside class="panel navigator"><h2>Question navigator</h2><p class="muted">'+remaining+' unanswered</p><div class="jump-grid">'+
    section.ids.map((key,i)=>button(String(i+1),'jump',(!blank(s.answers,key)?'answered ':'')+(i===s.pos?'current':''),
      'data-index="'+i+'" aria-label="Question '+(i+1)+(!blank(s.answers,key)?', answered':', unanswered')+'" '+(i===s.pos?'aria-current="step"':''))).join('')+
    '</div>'+button('Submit section','submit-section','outline')+'</aside></div></div>';
}

function mistakeCard(q,selected,corrected,answerLabel='First incorrect answer') {
  const p=data.progress[q.id];
  const help=q.section==='verbal';
  return '<article class="review-item"><h3>'+ (help?wordHelp.text(q.prompt):escapeHTML(q.prompt))+'</h3>'+
    (q.context?'<p class="reference">'+escapeHTML(q.context)+'</p>':'')+
    (q.diagram?drawDiagram(q.diagram):'')+
    '<p>'+answerLabel+': '+(selected===null||selected===undefined?'Not recorded in this earlier result':escapeHTML(q.options[selected]))+'</p>'+
    '<p class="good">Correct answer: '+escapeHTML(q.options[q.answer])+'</p><p>'+escapeHTML(q.explanation)+'</p>'+
    '<p class="muted">'+(corrected?'Corrected on retry':'Needs another try')+'</p>'+
    (p?.review?button('Remove from review','remove-review','quiet','data-id="'+q.id+'"'):'<p class="muted">Removed from review</p>')+'</article>';
}

function reviewList(id) {
  const section=sectionFor(id);
  if (!section) return home();
  const questions=practiceItems(id,10000,0,'review');
  return '<div class="setup"><a class="back" href="#practice/'+id+'">← Practice setup</a><section class="panel"><p class="eyebrow">'+section.name+'</p><h1>Review mistakes</h1>'+
    '<p class="muted">Review these questions any time. Correct answers keep them in this list until you choose Remove from review.</p>'+
    '<div class="actions">'+button('Start review','start-review','primary','data-section="'+id+'" '+(!questions.length?'disabled':''))+'</div>'+
    (questions.length?questions.map(q=>mistakeCard(q,data.progress[q.id].wrongAnswer,!data.progress[q.id].missed,'Last incorrect answer')).join(''):
      '<p class="notice">No mistakes to review yet. Questions you answer incorrectly will appear here.</p>')+'</section></div>';
}

function practiceBreakdown(r) {
  if (!r.history?.length || r.partialHistory) return '<div class="mini-stats">'+stat('Correct answers · all attempts',r.correct+' / '+r.total)+'</div><p class="muted">This session began before detailed attempt tracking was available. First-attempt and retry totals are available for new sessions.</p>';
  const first=new Map(), retries=[];
  for (const attempt of r.history) {
    if (!first.has(attempt.id)) first.set(attempt.id,attempt);
    else retries.push(attempt);
  }
  const initial=[...first.values()];
  const firstCorrect=initial.filter(a=>a.correct).length;
  const corrected=initial.filter(a=>!a.correct&&r.history.some(later=>later.id===a.id&&later.correct)).length;
  const misses=initial.filter(a=>!a.correct);
  return '<div class="mini-stats">'+stat('First attempt',firstCorrect+' / '+initial.length+' · '+score(firstCorrect,initial.length))+
    stat('Retry answers correct',retries.filter(a=>a.correct).length+' / '+retries.length)+stat('Mistakes corrected',corrected+' / '+misses.length)+'</div>'+
    '<h2>Mistakes from this session</h2>'+
    (misses.length?misses.map(a=>mistakeCard(questionFor(a.id),a.selected,r.history.some(later=>later.id===a.id&&later.correct))).join(''):
      '<p class="notice">No mistakes in this session.</p>');
}

function results(r=data.results) {
  if (!r) return home();
  if (r.mode==='practice') return '<div class="setup"><a class="back" href="#home">← Dashboard</a><section class="panel"><p class="eyebrow">'+sectionFor(r.section).name+'</p>'+
    '<h1>Practice complete</h1>'+practiceBreakdown(r)+
    '<p class="muted">Mistakes remain available in Review mistakes until you remove them.</p><div class="actions">'+
    button(r.kind==='numeric'?'Generate another set':'Next questions','next-set','primary')+
    button('Review mistakes','result-review','outline')+link('View review list','review/'+r.section,'outline')+link('Practice setup','practice/'+r.section,'quiet')+'</div><p id="notice" role="status" hidden></p></section></div>';
  const correct=r.parts.reduce((sum,p)=>sum+p.correct,0);
  const total=r.parts.reduce((sum,p)=>sum+p.count,0);
  return '<div class="setup"><a class="back" href="#home">← Dashboard</a><section class="panel"><p class="eyebrow">Exam Simulation</p><h1>Simulation complete</h1>'+
    '<div class="mini-stats">'+stat('Overall accuracy',score(correct,total))+stat('Correct',correct+' / '+total)+'</div>'+
    '<div class="result-list">'+r.parts.map(p=>'<article><div><h3>'+sectionFor(p.section).name+'</h3><p class="muted">'+p.unanswered+' unanswered'+(p.timedOut?' · Time expired':'')+'</p></div><strong>'+p.correct+' / '+p.count+' · '+score(p.correct,p.count)+'</strong></article>'+
      (p.review.length?'<details><summary>Review missed and skipped questions</summary>'+p.review.map(({id,selected})=>{
        const q=byId[id];
        return '<div class="review-item"><strong>'+escapeHTML(q.prompt)+'</strong>'+(q.diagram?drawDiagram(q.diagram):'')+
        (q.context?'<p class="reference">'+escapeHTML(q.context)+'</p>':'')+'<p>Your answer: '+(selected===null?'Skipped':escapeHTML(q.options[selected]))+
        '</p><p class="good">Correct: '+escapeHTML(q.options[q.answer])+'</p><p>'+escapeHTML(q.explanation)+'</p></div>';
      }).join('')+'</details>':'')).join('')+'</div><div class="actions">'+link('New simulation','exam','primary')+link('Practice dashboard','home','outline')+'</div></section></div>';
}

function updateTimer() {
  const el=document.getElementById('timer');
  if (!el||!data.active?.deadline) return;
  const t=Math.max(0,Math.ceil((data.active.deadline-Date.now())/1000));
  el.textContent=Math.floor(t/60)+':'+String(t%60).padStart(2,'0');
  el.classList.toggle('urgent',t<=30);
}

function render(focus) {
  const route=currentRoute();
  const s=data.active;
  const screen=route==='exam'?examSetup():route==='results'?results():route==='last-exam'?results(data.lastExam):route.startsWith('review/')?reviewList(route.split('/')[1]):route.startsWith('practice/')?practiceSetup(route.split('/')[1]):
    route==='session'&&s?(s.mode==='practice'?practiceSession(s):examSession(s)):home();
  app.innerHTML=warning()+screen;
  document.querySelectorAll('nav a').forEach(a=>{
    if (!a.hash) return;
    const isExam=route==='exam'||route==='last-exam'||route==='session'&&s?.mode==='exam'||route==='results'&&data.results?.mode==='exam';
    if (isExam===(a.hash==='#exam')) a.setAttribute('aria-current','page');
    else a.removeAttribute('aria-current');
  });
  updateTimer();
  if (focus) (document.getElementById(focus)||app).focus();
}

function navigate(route) {
  if (currentRoute()===route) render('app');
  else location.hash=route;
}
function showNotice(message) {
  const el=document.getElementById('notice');
  if (el) {
    el.hidden=false;
    el.textContent=message;
  }
}

app.addEventListener('submit',event=>{
  event.preventDefault();
  const form=event.target;
  if (form.id==='exam-form') startExam(form);
  if (form.id==='practice-form') startPractice(form.dataset.section,Number(form.elements.count.value),Number(form.elements.level.value),'normal');
});

app.addEventListener('change',event=>{
  const form=event.target.form;
  if (form?.id!=='exam-form') return;
  if (event.target.name!=='profile') {
    form.elements.profile.value='custom';
    return;
  }
  const profile=event.target.value;
  if (profile==='custom') return;
  for (const section of sections) {
    const [count,time]=section[profile];
    form.elements[section.id+'Count'].value=count;
    form.elements[section.id+'Time'].value=time;
  }
});

app.addEventListener('click',event=>{
  const control=event.target.closest('button[data-action]');
  if (!control) return;
  const {action,index}=control.dataset;
  const n=Number(index);
  const form=document.getElementById('practice-form');
  const r=data.results;
  const s=data.active;
  if (action==='remove-review') {
    const p=data.progress[control.dataset.id];
    if (p) {p.review=false;save();render();}
    return;
  }
  if (action==='start-review') {
    startPractice(control.dataset.section,10,0,'review');
    return;
  }
  if (form&&['review','weak','numeric'].includes(action)) {
    startPractice(form.dataset.section,Number(form.elements.count.value),action==='numeric'?0:Number(form.elements.level.value),action);
    return;
  }
  if (action==='next-set'||action==='result-review') {
    startPractice(r.section,r.count,action==='result-review'?0:r.level,action==='result-review'?'review':r.kind);
    return;
  }
  if (!s||timedOut()) return;
  if (action==='activate') return activateExam();
  if (action==='check') return checkPractice();
  if (s.mode==='practice') {
    if (action==='choose'&&s.checked===null) s.selected=n;
    if (action==='next') {
      if (s.pos+1===s.ids.length) return endPractice(s);
      s.pos++;
      s.selected=null;
      s.checked=null;
      s.started=Date.now();
    }
  } else {
    const ids=s.plan[s.index].ids;
    const id=ids[s.pos];
    if (action==='submit-section') {
      const count=ids.filter(key=>blank(s.answers,key)).length;
      if (!count||window.confirm('Submit this section with '+count+' unanswered?')) finishExamSection();
      return;
    }
    if (action==='choose') s.answers[id]=n;
    if (action==='clear') delete s.answers[id];
    if (['previous','forward','jump'].includes(action)) {
      accrue(s);
      s.pos=action==='jump'?n:action==='previous'?s.pos-1:s.pos<ids.length-1?s.pos+1:ids.findIndex((key,i)=>i!==s.pos&&blank(s.answers,key));
      s.entered=Date.now();
    }
  }
  save();
  render(action==='next'||['previous','forward','jump'].includes(action)?'app':undefined);
  if (action==='choose') app.querySelector('[data-action="choose"][data-index="'+n+'"]')?.focus({preventScroll:true});
});
window.addEventListener('hashchange',()=>{
  if (!timedOut()) render('app');
  else if (currentRoute()!=='results') render();
  window.scrollTo(0,0);
});
document.addEventListener('visibilitychange',()=>{timedOut();updateTimer();});
setInterval(()=>{timedOut();updateTimer();},250);
if (!timedOut() || currentRoute()!=='results') render();
