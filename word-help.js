const wordHelp = (() => {
  const html=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const key='mb-trades-vocabulary-v1';
  const dialog=document.createElement('dialog');
  dialog.className='word-dialog';
  document.body.append(dialog);
  const words=[...vocabularyEntries.keys()].sort((a,b)=>b.length-a.length);
  const pattern=new RegExp('\\b('+words.map(word=>word.replace(/[^a-z0-9 ]/gi,'\\$&')).join('|')+')\\b','gi');
  let current='';
  function text(value){
    const template=/^(Which word or phrase is closest in meaning to|Which word is most nearly opposite in meaning to)(\s+)/i.exec(value);
    if(template) return html(template[0])+text(value.slice(template[0].length));
    let cursor=0;
    let result='';
    for(const match of value.matchAll(pattern)){
      result+=html(value.slice(cursor,match.index));
      result+='<button type="button" class="inline-word" data-word-help="'+html(match[0].toLowerCase())+'">'+html(match[0])+'</button>';
      cursor=match.index+match[0].length;
    }
    return result+html(value.slice(cursor));
  }
  function show(word){
    const entry=vocabularyEntries.get(word);
    if(!entry) return;
    current=word;
    let added=false;
    try{added=Boolean(JSON.parse(localStorage.getItem(key))?.progress?.[word]?.unknown);}catch{}
    const example=vocabularyExamples[word];
    dialog.innerHTML='<h2>'+html(word)+'</h2><p lang="ru" class="word-translation">'+html(entry.ru)+'</p><p>'+html(entry.meaning)+'</p>'+
      (example?'<p class="word-example">'+html(example[0])+'</p><p lang="ru">'+html(example[1])+'</p>':'')+
      '<div class="actions"><button type="button" class="primary" data-add-word '+(added?'disabled':'')+'>'+(added?'✓ Added to My words':'Add to My words')+'</button><button type="button" class="outline" data-close-word>Close</button></div><p role="status" class="word-save-status"></p>';
    if(!dialog.open) dialog.showModal();
  }
  document.addEventListener('click',event=>{
    const help=event.target.closest('[data-word-help]');
    if(help){show(help.dataset.wordHelp);return;}
    if(event.target.closest('[data-close-word]')) dialog.close();
    if(!event.target.closest('[data-add-word]')) return;
    const status=dialog.querySelector('.word-save-status');
    try{
      const state=JSON.parse(localStorage.getItem(key))||{progress:{},session:null,last:null};
      state.progress ||= {};
      const previous=state.progress[current]||{attempts:0,correct:0,streak:0};
      state.progress[current]={...previous,unknown:true};
      localStorage.setItem(key,JSON.stringify(state));
      const addButton=dialog.querySelector('[data-add-word]');
      addButton.textContent='✓ Added to My words';
      addButton.disabled=true;
      status.textContent='Added to My words. Open Vocabulary Cards to study it.';
    }catch{status.textContent='Could not save this word. Browser storage is unavailable.';}
  });
  return {text};
})();
