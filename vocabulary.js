(() => {
  'use strict';
  const app=document.getElementById('vocabulary-app');
  const key='mb-trades-vocabulary-v1';
  const entries=vocabularyEntries;
  let state={progress:{},session:null,last:null};
  let storageAvailable=true;
  let voiceMessage='';
  let search='';
  let wordFilter='all';
  let wordsLimit=40;
  let undoWord=null;
  let undoTimer=null;
  const html=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const attr=html;
  const route=()=>location.hash.slice(1)||'home';
  const shuffle=values=>{
    const result=[...values];
    for(let i=result.length-1;i>0;i--){
      const j=Math.floor(Math.random()*(i+1));
      [result[i],result[j]]=[result[j],result[i]];
    }
    return result;
  };
  const button=(label,action,cls='',attrs='')=>'<button type="button" class="'+cls+'" data-do="'+action+'" '+attrs+'>'+label+'</button>';
  const link=(label,target,cls='')=>'<a class="button '+cls+'" href="#'+target+'">'+label+'</a>';
  const isUnknown=word=>Boolean(state.progress[word]?.unknown);
  const isHidden=word=>Boolean(state.progress[word]?.hidden);
  const status=word=>isUnknown(word)?'In My words':state.progress[word]?'Studied':'New';
  const hasSpeech=()=>('speechSynthesis' in window && 'SpeechSynthesisUtterance' in window);

  try {
    const saved=JSON.parse(localStorage.getItem(key));
    if(saved && typeof saved.progress==='object' && saved.progress) state={...state,...saved};
    if(state.session && (!Array.isArray(state.session.items)||!state.session.items.length)) state.session=null;
    localStorage.setItem(key,JSON.stringify(state));
  } catch {storageAvailable=false;}

  function persist(){
    try {localStorage.setItem(key,JSON.stringify(state));storageAvailable=true;return true;}
    catch {storageAvailable=false;return false;}
  }
  function go(target){
    if(route()===target) render();
    else location.hash=target;
  }
  function saveWord(word,success,aided=false){
    const previous=state.progress[word]||{attempts:0,correct:0,streak:0};
    previous.attempts++;
    previous.correct+=Number(success);
    previous.streak=success&&!aided?previous.streak+1:0;
    previous.unknown=Boolean(previous.unknown||!success||aided);
    previous.lastSeen=Date.now();
    state.progress[word]=previous;
  }
  function stopSpeech(){
    if(hasSpeech()) window.speechSynthesis.cancel();
  }
  function listen(word){
    if(!hasSpeech()){
      voiceMessage='Pronunciation is unavailable in this browser.';
      updateVoiceStatus();
      return;
    }
    stopSpeech();
    const synth=window.speechSynthesis;
    const utterance=new SpeechSynthesisUtterance(word);
    const voices=synth.getVoices();
    utterance.voice=voices.find(v=>/^en-CA/i.test(v.lang))||voices.find(v=>/^en-GB/i.test(v.lang))||voices.find(v=>/^en/i.test(v.lang))||null;
    utterance.lang=utterance.voice?.lang||'en-GB';
    utterance.rate=0.85;
    utterance.onerror=event=>{
      if(event.error==='interrupted'||event.error==='canceled') return;
      voiceMessage='Audio could not play. Check your volume and try Listen again. An English voice may need an internet connection.';
      updateVoiceStatus();
    };
    voiceMessage='';
    updateVoiceStatus();
    synth.speak(utterance);
  }
  function updateVoiceStatus(){
    const el=document.getElementById('voice-status');
    if(el){el.textContent=voiceMessage;el.hidden=!voiceMessage;}
  }
  function listenButton(word){
    return button('♪ Listen','listen','outline listen','data-word="'+attr(word)+'" '+(!hasSpeech()?'disabled':'')+' aria-label="Listen to '+attr(word)+'"');
  }
  function meaning(word,context=false){
    const entry=entries.get(word);
    if(!entry) return '';
    const example=context?vocabularyExamples[word]:null;
    return '<div class="word-meaning"><p lang="ru" class="translation">'+html(entry.ru)+'</p><p><span class="meaning-label">Meaning</span>'+html(entry.meaning)+'</p>'+
      (example?'<div class="example"><p lang="en">'+html(example[0])+'</p><p lang="ru">'+html(example[1])+'</p></div>':'')+'</div>';
  }
  function counts(){
    return {
      seen:Object.values(state.progress).filter(p=>p.attempts>0||p.views>0).length,
      unknown:vocabulary.filter(e=>isUnknown(e.word)&&!isHidden(e.word)).length,
      attempts:Object.values(state.progress).reduce((sum,p)=>sum+(p.attempts||0),0)
    };
  }
  function filterEntries(scope){
    return vocabulary.filter(e=>!isHidden(e.word)&&(scope==='unknown'?isUnknown(e.word):true));
  }
  function rank(word){
    const p=state.progress[word];
    return p?.unknown?4:!p?.attempts&&!p?.views?3:1;
  }
  function makeMeaningItem(word){
    const answer=entries.get(word).meaning;
    const entry=entries.get(word);
    const tokens=text=>new Set(text.toLowerCase().split(/[^a-zа-яё]+/u).filter(token=>token.length>3));
    const answerTokens=tokens(answer+' '+entry.ru);
    const related=new Set(vocabularyRelations.filter(r=>r.type==='synonym'&&(r.word===word||r.answer===word)).flatMap(r=>[r.word,r.answer]));
    const distinct=new Set(vocabulary.filter(e=>e.word!==word && e.meaning!==answer && !related.has(e.word) &&
      ![...tokens(e.meaning+' '+e.ru)].some(token=>answerTokens.has(token))).map(e=>e.meaning));
    const options=shuffle([answer,...shuffle([...distinct]).slice(0,4)]);
    return {word,type:'meaning',options,answer};
  }
  function makeRelationItem(relation){
    return {word:relation.word,type:relation.type,options:shuffle(relation.options),answer:relation.answer};
  }
  function startSession(form,mode,singleWord){
    const scope=form?.elements.scope.value||'all';
    const type=form?.elements.type?.value||'mixed';
    const count=singleWord?1:Number(form?.elements.count.value||10);
    let candidates=singleWord&&!isHidden(singleWord)?[{word:singleWord}]:singleWord?[]:filterEntries(scope);
    if(mode==='practice'&&['synonym','antonym'].includes(type)){
      const allowed=new Set(candidates.map(e=>e.word));
      candidates=vocabularyRelations.filter(r=>r.type===type&&allowed.has(r.word));
    }
    const chosen=shuffle(candidates).sort((a,b)=>rank(b.word)-rank(a.word)).slice(0,count);
    if(!chosen.length){
      const el=document.getElementById('setup-notice');
      if(el){
        el.hidden=false;
        el.textContent=scope==='unknown'?'My words is empty for this practice type. Add words from the library or choose All words.':
          'No words match these settings. Restore hidden words in the library or choose another practice type.';
      }
      return;
    }
    if(state.session&&!confirm('Replace your current vocabulary session? Recorded word progress will be kept.')) return;
    stopSpeech();
    const items=chosen.map(entry=>{
      if(mode==='learn') return {word:entry.word,type:'learn'};
      if(entry.id) return makeRelationItem(entry);
      const relations=vocabularyRelations.filter(r=>r.word===entry.word);
      return type==='mixed'&&relations.length?makeRelationItem(shuffle(relations)[0]):makeMeaningItem(entry.word);
    });
    state.session={mode,items,pos:0,revealed:false,selected:null,checked:false,aided:false,optionHelp:[],requeued:[],correct:0,attempts:0,history:[]};
    persist();
    go('session');
  }
  function repeatLater(session,item){
    if(session.requeued.includes(item.word)) return;
    const insert=Math.min(session.items.length,session.pos+4);
    session.items.splice(insert,0,{...item,options:item.options?shuffle(item.options):undefined});
    session.requeued.push(item.word);
  }
  function moveNext(){
    const s=state.session;
    if(s.pos+1>=s.items.length){
      state.last={mode:s.mode,attempts:s.attempts,correct:s.correct,words:new Set(s.items.map(item=>item.word)).size,history:s.history||[],partialHistory:s.partialHistory};
      state.session=null;
      persist();
      go('results');
      return;
    }
    s.pos++;
    s.revealed=false;
    s.selected=null;
    s.checked=false;
    s.aided=false;
    s.optionHelp=[];
    stopSpeech();
    persist();
    render(true);
  }
  function logAttempt(s,item,correct,selected){
    if(!s.history){s.history=[];s.partialHistory=s.attempts>0;}
    s.history.push({word:item.word,correct,selected,aided:s.aided,answer:item.answer||'Marked known'});
  }
  function vocabularyBreakdown(last){
    if(!last.attempts) return '<p>No words were answered in this session.</p>';
    if(!last.history?.length||last.partialHistory) return '<p>Earlier session: '+last.correct+' / '+last.attempts+' successful answers, including retries. Detailed breakdown is available for new sessions.</p>';
    const first=new Map(),retries=[];
    for(const a of last.history){
      if(first.has(a.word)) retries.push(a);else first.set(a.word,a);
    }
    const initial=[...first.values()];
    const mistakes=initial.filter(a=>!a.correct);
    return '<div class="mini-stats"><div class="stat"><strong>'+initial.filter(a=>a.correct).length+' / '+initial.length+'</strong><span>First attempt · without help</span></div>'+
      '<div class="stat"><strong>'+retries.filter(a=>a.correct).length+' / '+retries.length+'</strong><span>Retry answers successful</span></div></div>'+
      '<h2>Words from this session to revisit</h2>'+
      (mistakes.length?mistakes.map(a=>'<article class="review-item"><h3>'+html(a.word)+'</h3><p>First response: '+html(a.selected)+(a.aided?' · with meaning help':'')+'</p><p>Expected answer: '+html(a.answer)+'</p>'+
        '<p class="muted">'+(last.history.some(later=>later.word===a.word&&later.correct)?'Corrected on retry':'Needs another try')+'</p>'+meaning(a.word,true)+'</article>').join(''):'<p>No words need another try from this session.</p>');
  }
  function viewLearn(reviewAgain){
    const s=state.session;
    if(!s||s.mode!=='learn')return;
    const item=s.items[s.pos];
    const p=state.progress[item.word]||{attempts:0,correct:0,streak:0};
    p.views=(p.views||0)+1;
    p.lastSeen=Date.now();
    if(reviewAgain)p.unknown=true;
    state.progress[item.word]=p;
    if(!s.history){s.history=[];s.partialHistory=s.attempts>0;}
    s.history.push({word:item.word,kind:'view',reviewRequested:reviewAgain});
    if(reviewAgain) repeatLater(s,item);
    persist();
    moveNext();
  }
  function gradePractice(){
    const s=state.session;
    if(s.checked||s.selected===null) return;
    const item=s.items[s.pos];
    const success=item.options[s.selected]===item.answer;
    saveWord(item.word,success,s.aided);
    logAttempt(s,item,success&&!s.aided,item.options[s.selected]);
    s.correct+=Number(success&&!s.aided);
    s.attempts++;
    s.checked=true;
    s.revealed=true;
    if(!success||s.aided) repeatLater(s,item);
    persist();
    render(false,'feedback');
  }

  function dashboard(){
    const count=counts();
    return '<section class="vocab-hero"><p class="eyebrow">Verbal Comprehension vocabulary</p><h1>Make unfamiliar words familiar.</h1>'+
      '<p>Learn English words with Russian translations, clear English meanings and pronunciation.</p></section>'+
      '<section class="stats">'+[['Words & phrases',vocabulary.length],['Words studied',count.seen],['My words',count.unknown],['Answers recorded',count.attempts]].map(([label,value])=>'<div class="stat"><strong>'+value+'</strong><span>'+label+'</span></div>').join('')+'</section>'+
      (state.session?'<div class="resume"><span>Your '+(state.session.mode==='learn'?'cards':'practice')+' session is saved.</span>'+link('Resume session','session','primary')+'</div>':'')+
      '<div class="cards vocab-modes"><article class="card"><span class="mode-symbol" aria-hidden="true">Aa</span><div><p class="eyebrow">Learn</p><h2>Explore a word</h2><p>Read its translation and English meaning, listen to its pronunciation and choose which words to review again.</p></div><div class="card-foot">'+link('Learn words →','learn','primary')+'</div></article>'+
      '<article class="card"><span class="mode-symbol peach" aria-hidden="true">⇄</span><div><p class="eyebrow">Practice</p><h2>Find the connection</h2><p>Choose a synonym, an antonym or an English meaning. Reveal a word’s meaning whenever you need it.</p></div><div class="card-foot">'+link('Practice words →','practice','primary')+'</div></article></div>'+
      '<div class="actions">'+link('Browse all words','words','outline')+link('My words ('+count.unknown+')','my-words','outline')+'</div>'+
      '<p class="muted help-copy">Study My words any time. Words stay in the list until you choose Remove from My words in the library. Listen uses an English voice supplied by your browser.</p>';
  }
  function setup(mode){
    const learn=mode==='learn';
    return '<div class="setup"><a class="back" href="#home">← Vocabulary home</a><section class="panel"><p class="eyebrow">'+(learn?'Learn':'Practice')+'</p><h1>'+(learn?'Word by word.':'Put your words to work.')+'</h1>'+
      '<p class="muted">'+(learn?'Read each word’s translation and meaning. Choose Next word to continue or Review again to keep it in My words.':'Synonym and antonym tasks use pairs from the verbal question bank. Meaning practice covers the whole vocabulary.')+'</p>'+
      '<form id="vocabulary-setup" data-mode="'+mode+'"><div class="fields">'+
      '<label>Word selection<select name="scope"><option value="all">All words</option><option value="unknown">My words</option></select></label>'+
      '<label>Session length<select name="count"><option value="5">5 words</option><option value="10" selected>10 words</option><option value="20">20 words</option></select></label>'+
      (!learn?'<label>Practice type<select name="type"><option value="mixed">Mixed</option><option value="meaning">English meaning</option><option value="synonym">Synonyms</option><option value="antonym">Antonyms</option></select></label>':'')+
      '</div><div class="actions"><button type="submit" class="primary">Start '+(learn?'learning':'practice')+' →</button></div></form>'+
      '<p id="setup-notice" class="notice" role="status" hidden></p></section></div>';
  }
  function sessionScreen(){
    const s=state.session;
    if(!s) return dashboard();
    const pending=s.items.slice(s.pos).filter((item,i)=>!isHidden(item.word)||(i===0&&s.checked));
    const currentWord=s.items[s.pos]?.word;
    s.items=s.items.slice(0,s.pos).concat(pending);
    if(!pending.length){
      state.last={mode:s.mode,attempts:s.attempts,correct:s.correct,words:new Set((s.history||[]).map(item=>item.word)).size,history:s.history||[],partialHistory:s.partialHistory};
      state.session=null;
      persist();
      return resultScreen();
    }
    if(s.items[s.pos].word!==currentWord){
      s.revealed=false;s.selected=null;s.checked=false;s.aided=false;s.optionHelp=[];
    }
    persist();
    const item=s.items[s.pos];
    const learn=s.mode==='learn';
    const prompt=item.type==='synonym'?'Choose the closest synonym.':item.type==='antonym'?'Choose the closest antonym.':'Choose the English meaning.';
    return '<div class="work vocab-work"><div class="work-head"><a class="back" href="#home">← Vocabulary home</a><span>'+(s.pos+1)+' of '+s.items.length+'</span></div>'+
      '<progress aria-label="Vocabulary session progress" value="'+s.pos+'" max="'+s.items.length+'"></progress>'+
      '<section class="panel word-card"><p class="eyebrow">'+(learn?'Learn':item.type==='meaning'?'Meaning practice':item.type+' practice')+'</p>'+
      '<h1 class="vocab-word" lang="en">'+html(item.word)+'</h1>'+(!learn?'<p class="muted">'+prompt+'</p>':'')+'<div class="actions word-tools">'+listenButton(item.word)+
      (!learn?(!s.revealed?button('Show meaning','reveal','outline'):button('Hide meaning','hide','quiet',s.checked?'disabled':'')):'')+'</div>'+
      (learn||s.revealed?'<div class="reveal-box">'+meaning(item.word,true)+'</div>':'')+
      (!learn?'<div class="vocab-options" role="group" aria-label="Answer choices">'+item.options.map((option,index)=>{
        const selected=s.selected===index;
        const correct=s.checked&&option===item.answer;
        const wrong=s.checked&&selected&&!correct;
        return '<div class="vocab-option-row"><button type="button" class="option'+(selected?' selected':'')+(correct?' correct':'')+(wrong?' incorrect':'')+'" data-do="choose" data-index="'+index+'" aria-pressed="'+selected+'" '+(s.checked?'disabled':'')+'><span class="letter">'+'ABCDE'[index]+'</span><span>'+html(option)+(correct?'<em>Correct answer</em>':wrong?'<em>Your answer</em>':'')+'</span></button>'+
          (item.type!=='meaning'?button((s.optionHelp.includes(index)?'Hide':'Show')+' meaning','option-help','option-help','data-index="'+index+'" aria-expanded="'+s.optionHelp.includes(index)+'" aria-label="Meaning of '+attr(option)+'"'):'')+
          (s.optionHelp.includes(index)?'<div class="option-definition">'+meaning(option)+listenButton(option)+'</div>':'')+'</div>';
      }).join('')+'</div>':'')+
      (s.checked?'<div class="feedback '+(item.options[s.selected]===item.answer?'good':'miss')+'" id="feedback" tabindex="-1" role="status"><strong>'+
        (item.options[s.selected]===item.answer?(s.aided?'Correct with help':'Correct'):'Correct answer: '+html(item.answer))+'</strong><p>'+
        (item.type==='meaning'?html(entries.get(item.word).meaning):
          '“'+html(item.word)+'” and “'+html(item.answer)+'” have '+(item.type==='synonym'?'similar':'opposite')+' meanings.')+'</p>'+
        (item.type!=='meaning'?meaning(item.answer):'')+
        (s.aided?'<p>You opened a meaning. This word will stay in My words for another try.</p>':'')+'</div>':'')+
      '<div class="actions session-actions">'+(learn?button('Next word →','next','outline learn-choice')+button('Review again','again','outline learn-choice'):
        s.checked?button(s.pos+1===s.items.length?'See results →':'Next word →','next','primary'):
        button('Check answer','check','primary',s.selected===null?'disabled':''))+'</div></section>'+
        '<p class="muted help-copy">Each word can be added once more to this session for a retry. My words is available any time from Vocabulary home.</p></div>';
  }
  function filteredWords(){
    const needle=search.trim().toLocaleLowerCase();
    return vocabulary.filter(entry=>(wordFilter==='hidden'?isHidden(entry.word):!isHidden(entry.word)&&(wordFilter==='all'||wordFilter==='unknown'&&isUnknown(entry.word)))&&
      (!needle||[entry.word,entry.ru,entry.meaning].some(text=>text.toLocaleLowerCase().includes(needle))));
  }
  function wordRows(){
    const matching=filteredWords();
    return '<p class="muted search-count" role="status">'+matching.length+' words</p>'+
      (matching.length?matching.slice(0,wordsLimit).map(entry=>'<article class="panel dictionary-row"><div class="dictionary-head"><h2 lang="en">'+html(entry.word)+'</h2><span class="word-status">'+status(entry.word)+'</span></div>'+
        '<details><summary>Show meaning</summary>'+meaning(entry.word,true)+'</details>'+
        '<div class="actions">'+listenButton(entry.word)+button(isUnknown(entry.word)?'Remove from My words':'Add to My words','toggle-word','quiet','data-word="'+attr(entry.word)+'" aria-pressed="'+isUnknown(entry.word)+'"')+
        (!isHidden(entry.word)?button('Study this word','study','quiet','data-word="'+attr(entry.word)+'"'):'')+
        button(isHidden(entry.word)?'Restore word':'Hide word',isHidden(entry.word)?'restore-word':'hide-word','quiet hide-word','data-word="'+attr(entry.word)+'"')+'</div></article>').join(''):
        '<p class="notice">No words match this selection. Try All words or a different search.</p>')+
      (matching.length>wordsLimit?button('Show more words','more','outline'):'');
  }
  function dictionary(){
    return '<div class="work"><a class="back" href="#home">← Vocabulary home</a><div class="section-head"><h1>Word library</h1></div>'+
      '<div class="fields dictionary-filters"><label>Search words or translations<input id="word-search" type="search" placeholder="e.g. reluctant or неохотно" value="'+attr(search)+'" autocomplete="off"></label>'+
      '<label>Show<select id="word-filter"><option value="all" '+(wordFilter==='all'?'selected':'')+'>All words</option><option value="unknown" '+(wordFilter==='unknown'?'selected':'')+'>My words</option><option value="hidden" '+(wordFilter==='hidden'?'selected':'')+'>Hidden words</option></select></label></div><div id="word-list">'+wordRows()+'</div></div>';
  }
  function learnBreakdown(last){
    if(!last.history?.length)return '<p>'+(last.attempts?'This earlier learning session recorded '+last.attempts+' responses. Viewed-word details are available for new sessions.':'No words were viewed in this session.')+'</p>';
    const viewed=new Set(last.history.map(a=>a.word));
    const review=new Set(last.history.filter(a=>a.reviewRequested||a.selected==='Review again').map(a=>a.word));
    return '<div class="mini-stats"><div class="stat"><strong>'+viewed.size+'</strong><span>Words viewed</span></div><div class="stat"><strong>'+review.size+'</strong><span>Marked for review</span></div></div>'+
      (last.partialHistory?'<p class="muted">This breakdown covers the recorded part of an earlier session.</p>':'')+
      (review.size?'<h2>Marked for review</h2>'+[...review].map(word=>'<article class="review-item"><h3>'+html(word)+'</h3>'+meaning(word,true)+'</article>').join(''):'');
  }
  function resultScreen(){
    const last=state.last;
    if(!last) return dashboard();
    return '<div class="setup"><a class="back" href="#home">← Vocabulary home</a><section class="panel"><p class="eyebrow">'+(last.mode==='learn'?'Learn':'Practice')+'</p><h1>Session complete</h1>'+
      (last.mode==='learn'?learnBreakdown(last):vocabularyBreakdown(last))+
      '<p class="muted">My words is available any time. Words stay there until you remove them in the library.</p>'+
      '<div class="actions">'+link('Continue '+(last.mode==='learn'?'learning':'practice'),last.mode,'primary')+link('My words','my-words','outline')+link('Vocabulary home','home','quiet')+'</div></section></div>';
  }
  function updateUndo(){
    let toast=document.getElementById('word-undo');
    if(!undoWord){toast?.remove();return;}
    if(!toast){
      toast=document.createElement('div');
      toast.id='word-undo';
      toast.className='word-undo';
      toast.setAttribute('role','status');
      app.append(toast);
    }
    toast.innerHTML=html(undoWord)+' hidden · '+button('Undo','undo-hide','outline');
  }
  function render(focus=false,focusId){
    const current=route();
    app.innerHTML=(!storageAvailable?'<p class="notice" role="status">Browser storage is unavailable. Progress will last only in this open page.</p>':'')+
      (current==='session'?sessionScreen():current==='learn'||current==='practice'?setup(current):
        current==='words'||current==='my-words'?dictionary():current==='results'?resultScreen():dashboard())+
      '<p class="notice" id="voice-status" role="status" '+(!voiceMessage?'hidden':'')+'>'+html(voiceMessage)+'</p>';
    updateUndo();
    if(focus||focusId) (document.getElementById(focusId)||app).focus();
  }

  app.addEventListener('submit',event=>{
    if(event.target.id!=='vocabulary-setup') return;
    event.preventDefault();
    startSession(event.target,event.target.dataset.mode);
  });
  app.addEventListener('input',event=>{
    if(event.target.id!=='word-search') return;
    search=event.target.value;
    wordsLimit=40;
    document.getElementById('word-list').innerHTML=wordRows();
  });
  app.addEventListener('change',event=>{
    if(event.target.id!=='word-filter') return;
    wordFilter=event.target.value;
    wordsLimit=40;
    document.getElementById('word-list').innerHTML=wordRows();
  });
  app.addEventListener('click',event=>{
    const control=event.target.closest('button[data-do]');
    if(!control) return;
    const action=control.dataset.do;
    const word=control.dataset.word;
    const index=Number(control.dataset.index);
    if(action==='listen') return listen(word);
    if(action==='hide-word'||action==='restore-word'){
      const previous=state.progress[word];
      state.progress[word]={...(previous||{attempts:0,correct:0,streak:0}),hidden:action==='hide-word'};
      if(!persist()){
        if(previous)state.progress[word]=previous;else delete state.progress[word];
        render();
        return;
      }
      clearTimeout(undoTimer);
      undoWord=action==='hide-word'?word:null;
      if(undoWord)undoTimer=setTimeout(()=>{undoWord=null;updateUndo();},10000);
      render();
      return;
    }
    if(action==='undo-hide'&&undoWord){
      const wordToRestore=undoWord;
      state.progress[wordToRestore].hidden=false;
      if(!persist()){state.progress[wordToRestore].hidden=true;render();return;}
      clearTimeout(undoTimer);
      undoWord=null;
      render();
      return;
    }
    if(action==='toggle-word'){
      const p=state.progress[word]||{attempts:0,correct:0,streak:0};
      p.unknown=!p.unknown;
      state.progress[word]=p;
      persist();
      render();
      return;
    }
    if(action==='study') return startSession(null,'learn',word);
    if(action==='more'){wordsLimit+=40;document.getElementById('word-list').innerHTML=wordRows();return;}
    const s=state.session;
    if(!s) return;
    if(action==='reveal'){
      s.revealed=true;
      if(s.mode==='practice'&&!s.checked) s.aided=true;
    }
    if(action==='hide'&&!s.checked) s.revealed=false;
    if(action==='option-help'){
      if(s.optionHelp.includes(index)) s.optionHelp=s.optionHelp.filter(i=>i!==index);
      else s.optionHelp.push(index);
      if(!s.checked) s.aided=true;
    }
    if(action==='choose'&&!s.checked) s.selected=index;
    if(action==='check') return gradePractice();
    if(action==='again') return viewLearn(true);
    if(action==='next') return s.mode==='learn'?viewLearn(false):moveNext();
    persist();
    render();
    if(action==='choose') app.querySelector('[data-do="choose"][data-index="'+index+'"]')?.focus({preventScroll:true});
  });
  window.addEventListener('hashchange',()=>{
    stopSpeech();
    if(route()==='my-words') wordFilter='unknown';
    else if(route()==='words') wordFilter='all';
    wordsLimit=40;
    render(true);
    window.scrollTo(0,0);
  });
  window.addEventListener('pagehide',stopSpeech);
  if(route()==='my-words') wordFilter='unknown';
  render();
})();
