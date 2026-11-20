(() => {
  const testKey='mb-trades-trainer-v1';
  const vocabKey='mb-trades-vocabulary-v1';
  const footer=document.querySelector('footer');
  const openButton=document.createElement('button');
  openButton.type='button';
  openButton.className='quiet reset-open';
  openButton.textContent='Reset progress';
  footer.append(document.createElement('br'),openButton);
  const dialog=document.createElement('dialog');
  dialog.className='progress-dialog';
  document.body.append(dialog);
  const scopes={
    test:{label:'Test progress',question:'Reset all test progress?',description:'This deletes practice and exam results, the review list and the current test session.',keys:[testKey],button:'Reset test progress'},
    vocabulary:{label:'Vocabulary progress',question:'Reset all vocabulary progress?',description:'This deletes learned-word progress, My words and the current vocabulary session.',keys:[vocabKey],button:'Reset vocabulary progress'},
    everything:{label:'Everything',question:'Reset all test and vocabulary progress?',description:'This deletes progress, review lists, results and current sessions in both sections.',keys:[testKey,vocabKey],button:'Reset everything'}
  };
  openButton.addEventListener('click',()=>{
    dialog.innerHTML='<h2>What would you like to reset?</h2><div class="reset-choices">'+
      Object.entries(scopes).map(([id,scope])=>'<button type="button" class="outline" data-scope="'+id+'"><strong>'+scope.label+'</strong><span>'+scope.description+'</span></button>').join('')+
      '</div><div class="actions"><button type="button" class="quiet" data-cancel>Cancel</button></div>';
    dialog.showModal();
  });
  let selected=null;
  dialog.addEventListener('click',event=>{
    if(event.target.closest('[data-cancel]')) return dialog.close();
    const choice=event.target.closest('[data-scope]');
    if(choice){
      selected=scopes[choice.dataset.scope];
      dialog.innerHTML='<h2>'+selected.question+'</h2><p>'+selected.description+' This cannot be undone.</p>'+
        '<div class="actions"><button type="button" class="danger" data-confirm>'+selected.button+'</button><button type="button" class="outline" data-cancel>Cancel</button></div>';
      dialog.querySelector('[data-cancel]').focus();
      return;
    }
    if(!event.target.closest('[data-confirm]')||!selected) return;
    const before=new Map();
    try{
      for(const key of selected.keys) before.set(key,localStorage.getItem(key));
      for(const key of selected.keys) localStorage.removeItem(key);
    }catch{
      for(const [key,value] of before){
        try{if(value!==null)localStorage.setItem(key,value);}catch{}
      }
      dialog.innerHTML='<h2>Reset could not be completed</h2><p>Browser storage is unavailable. Please try again.</p><button type="button" class="outline" data-cancel>Close</button>';
      return;
    }
    location.replace(location.pathname+'#home');
    location.reload();
  });
  window.addEventListener('storage',event=>{
    if(event.key===testKey||event.key===vocabKey) location.reload();
  });
})();
