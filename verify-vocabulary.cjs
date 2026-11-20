const fs=require('node:fs/promises');
const path=require('node:path');
const vm=require('node:vm');
const assert=require('node:assert/strict');

async function verify(){
  const context=vm.createContext({});
  for(const file of ['verbal.js','vocabulary-data.js','vocabulary-examples.js']){
    await fs.readFile(path.join(__dirname,file),'utf8').then(source=>vm.runInContext(source,context));
  }
  const {vocabulary,verbalSets,vocabularyRelations,vocabularyExamples}=vm.runInContext(
    '({vocabulary,verbalSets,vocabularyRelations,vocabularyExamples})',context);
  const byWord=new Map(vocabulary.map(entry=>[entry.word,entry]));
  assert.equal(byWord.size,vocabulary.length);
  for(const [group,[,rows]] of verbalSets.entries()){
    for(const row of rows.trim().split('\n')){
      for(const word of row.split('|').slice(group<2?0:1,6)){
        assert(byWord.has(word),'Missing word: '+word);
      }
    }
  }
  assert.equal(vocabularyRelations.length,120);
  assert(vocabulary.every(entry=>entry.ru && entry.meaning));
  for(const [word,pair] of Object.entries(vocabularyExamples)){
    assert(byWord.has(word),word);
    assert(pair[0]&&pair[1],word);
  }
  console.log('Vocabulary coverage passed: '+vocabulary.length+' entries, 120 relations and '+Object.keys(vocabularyExamples).length+' examples.');
  const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
  const browser=await chromium.launch({executablePath:process.env.BROWSER_EXECUTABLE||undefined,headless:true,args:['--disable-gpu']});
  try{
    const page=await browser.newPage({viewport:{width:820,height:1180},hasTouch:true,isMobile:true});
    const errors=[];
    page.on('pageerror',error=>errors.push(error.message));
    page.on('dialog',dialog=>dialog.accept());
    await page.route('https://trainer.invalid/trainer/**',async route=>{
      const name=new URL(route.request().url()).pathname.split('/').pop()||'index.html';
      if(!/^[a-z.-]+\.(?:js|css|html)$/.test(name)) return route.fulfill({status:404});
      const type=name.endsWith('.js')?'text/javascript':name.endsWith('.css')?'text/css':'text/html';
      await route.fulfill({path:path.join(__dirname,name),contentType:type+'; charset=utf-8'});
    });
    const open=hash=>page.goto('https://trainer.invalid/trainer/vocabulary.html#'+hash);
    const action=doName=>page.locator('[data-do="'+doName+'"]');
    const saved=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('mb-trades-vocabulary-v1')));
    const noOverflow=()=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth);

    await open('home');
    // Existing test progress must survive every vocabulary flow.
    await page.evaluate(()=>localStorage.setItem('mb-trades-trainer-v1','{"progress":{"test-item":{"attempts":9}},"active":{"mode":"practice"}}'));
    const original=await page.evaluate(()=>localStorage.getItem('mb-trades-trainer-v1'));
    assert.match(await page.locator('.stats').innerText(),/766/);
    if(process.env.VOCAB_SCREENSHOT_DIR) await page.screenshot({path:path.join(process.env.VOCAB_SCREENSHOT_DIR,'vocabulary-home.png'),fullPage:true});
    await page.getByRole('link',{name:'Learn words →',exact:true}).click();
    await page.locator('[name=count]').selectOption('5');
    await page.getByRole('button',{name:'Start learning →'}).click();
    const first=(await saved()).session.items[0].word;
    assert.equal(await page.locator('.reveal-box').count(),0);
    await action('reveal').click();
    assert(await page.locator('.translation').isVisible());
    await page.reload();
    assert.equal((await saved()).session.items[0].word,first);
    assert(await page.locator('.translation').isVisible());
    await action('again').click();
    assert.equal((await saved()).progress[first].unknown,true);
    assert.equal((await saved()).session.items[4].word,first);
    await open('my-words');
    await page.getByRole('heading',{name:first,exact:true}).waitFor();
    await action('study').click();
    await action('reveal').click();
    await action('know').click();
    await page.getByRole('heading',{name:'Session complete'}).waitFor();
    assert.equal((await saved()).progress[first].unknown,false);
    assert((await saved()).progress[first].due>Date.now()+23*3600000);

    await open('words');
    await page.locator('#word-search').fill('reluctant');
    assert.equal(await page.locator('.dictionary-row').count(),1);
    await page.locator('summary').click();
    assert.match(await page.locator('.word-meaning').innerText(),/неохотно/);
    await action('toggle-word').click();
    assert.equal((await saved()).progress.reluctant.unknown,true);
    await page.reload();
    assert.equal((await saved()).progress.reluctant.unknown,true);
    await page.locator('#word-search').fill('неохотно');
    assert.equal(await page.locator('.dictionary-row').count(),1);

    // Observe a speech request without relying on a speaker or installed voices.
    await page.evaluate(()=>{
      window.__speech=[];
      speechSynthesis.speak=utterance=>window.__speech.push({text:utterance.text,lang:utterance.lang});
    });
    await action('listen').click();
    assert.equal(await page.evaluate(()=>window.__speech[0].text),'reluctant');
    assert.match(await page.evaluate(()=>window.__speech[0].lang),/^en/);

    await open('practice');
    await page.locator('[name=type]').selectOption('synonym');
    await page.getByRole('button',{name:'Start practice →'}).click();
    let session=(await saved()).session;
    let item=session.items[0];
    const correctIndex=item.options.indexOf(item.answer);
    await action('option-help').nth(0).click();
    assert(await page.locator('.option-definition').isVisible());
    await action('choose').nth(correctIndex).click();
    await action('check').click();
    await page.locator('#feedback').waitFor();
    assert.match(await page.locator('#feedback').innerText(),/Correct with help/);
    assert.equal((await saved()).progress[item.word].unknown,true);
    assert.equal((await saved()).session.correct,0);
    await page.reload();
    assert(await page.locator('#feedback').isVisible());
    if(process.env.VOCAB_SCREENSHOT_DIR) await page.screenshot({path:path.join(process.env.VOCAB_SCREENSHOT_DIR,'vocabulary-practice.png'),fullPage:true});
    await open('practice');
    await page.locator('[name=type]').selectOption('antonym');
    await page.getByRole('button',{name:'Start practice →'}).click();
    item=(await saved()).session.items[0];
    assert.equal(item.type,'antonym');
    await action('choose').nth(item.options.indexOf(item.answer)).click();
    await action('check').click();
    assert.equal((await saved()).progress[item.word].unknown,false);
    assert.equal((await saved()).session.correct,1);

    await open('practice');
    await page.locator('[name=type]').selectOption('meaning');
    await page.getByRole('button',{name:'Start practice →'}).click();
    item=(await saved()).session.items[0];
    assert.equal(item.type,'meaning');
    await action('reveal').click();
    await action('choose').nth((item.options.indexOf(item.answer)+1)%5).click();
    await action('check').click();
    assert.equal((await saved()).progress[item.word].unknown,true);

    // A due item must appear again based on its saved timestamp.
    await page.evaluate(()=>{
      const data=JSON.parse(localStorage.getItem('mb-trades-vocabulary-v1'));
      for(const p of Object.values(data.progress)) p.due=Date.now()+86400000;
      data.progress.reluctant.due=Date.now()-1;
      localStorage.setItem('mb-trades-vocabulary-v1',JSON.stringify(data));
    });
    await open('learn');
    await page.locator('[name=scope]').selectOption('due');
    await page.getByRole('button',{name:'Start learning →'}).click();
    assert.equal((await saved()).session.items[0].word,'reluctant');
    for(const viewport of [{width:1180,height:820},{width:390,height:844},{width:820,height:1180}]){
      await page.setViewportSize(viewport);
      for(const route of ['home','session','words']){
        await open(route);
        assert(await noOverflow(),route+' width '+viewport.width);
      }
    }
    assert.equal(await page.evaluate(()=>localStorage.getItem('mb-trades-trainer-v1')),original);
    await page.goto('https://trainer.invalid/trainer/index.html#home');
    await page.getByRole('link',{name:'Vocabulary Cards',exact:true}).click();
    await page.getByRole('heading',{name:'Make unfamiliar words familiar.'}).waitFor();
    assert.deepEqual(errors,[]);
    console.log('Browser checks passed: learning, retries, translation search, pronunciation request, aided and unaided answers, due review, persistence, original-progress preservation and responsive layouts.');
  }finally{await browser.close();}
}
verify().catch(error=>{console.error(error);process.exitCode=1;});
