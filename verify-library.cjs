const path=require('node:path');
const assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');

async function verify(){
 const browser=await chromium.launch({executablePath:process.env.BROWSER_EXECUTABLE,headless:true});
 try{
  const page=await browser.newPage({viewport:{width:820,height:1180},hasTouch:true});
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('dialog',d=>d.accept());
  await page.route('https://trainer.invalid/**',async route=>{
   const file=new URL(route.request().url()).pathname.split('/').pop();
   await route.fulfill({path:path.join(__dirname,file),contentType:file.endsWith('.png')?'image/png':file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':'text/html'});
  });
  const key='mb-trades-vocabulary-v1';
  const saved=()=>page.evaluate(key=>JSON.parse(localStorage.getItem(key)),key);
  const open=route=>page.goto('https://trainer.invalid/vocabulary.html#'+route);
  const action=name=>page.locator('[data-do="'+name+'"]');
  await open('words');
  if(process.env.VOCAB_SCREENSHOT_DIR)await page.screenshot({path:path.join(process.env.VOCAB_SCREENSHOT_DIR,'library-hide-controls.png')});
  await page.locator('#word-search').fill('reluctant');
  await action('toggle-word').click();
  assert.equal((await saved()).progress.reluctant.unknown,true);
  await action('hide-word').click();
  assert.equal(await page.locator('.dictionary-row').count(),0);
  assert.equal((await saved()).progress.reluctant.hidden,true);
  await action('undo-hide').click();
  assert.equal(await page.locator('.dictionary-row').count(),1);
  assert.equal((await saved()).progress.reluctant.hidden,false);
  await action('hide-word').click();
  await page.reload();
  await page.locator('#word-filter').selectOption('hidden');
  await page.locator('#word-search').fill('reluctant');
  assert.equal(await page.locator('.dictionary-row').count(),1);
  await action('restore-word').click();
  assert.equal((await saved()).progress.reluctant.hidden,false);
  assert.equal((await saved()).progress.reluctant.unknown,true);
  assert.equal(await page.locator('.dictionary-row').count(),0);

  await page.locator('#word-filter').selectOption('all');
  await action('study').click();
  assert.equal(await action('know').count(),1);
  await action('reveal').click();
  if(process.env.VOCAB_SCREENSHOT_DIR)await page.screenshot({path:path.join(process.env.VOCAB_SCREENSHOT_DIR,'library-matching-buttons.png'),fullPage:true});
  const a=await action('know').boundingBox(),b=await action('again').boundingBox();
  assert.equal(a.width,b.width);
  assert.equal(a.height,b.height);
  await action('know').click();
  assert.equal((await saved()).progress.reluctant.hidden,false);

  // All hidden except one target: both practice types and Learn must respect hiding.
  await page.evaluate(key=>{
   const state=JSON.parse(localStorage.getItem(key));
   for(const e of vocabulary)state.progress[e.word]={...(state.progress[e.word]||{}),hidden:e.word!=='abate'};
   state.session=null;
   localStorage.setItem(key,JSON.stringify(state));
  },key);
  await page.reload();
  for(const [mode,type] of [['learn',null],['practice','meaning'],['practice','synonym']]){
   await open(mode);
   if(type)await page.locator('[name=type]').selectOption(type);
   await page.locator('#vocabulary-setup button[type=submit]').click();
   assert.deepEqual((await saved()).session.items.map(i=>i.word),['abate']);
  }

  // Hiding a pending card also removes it from an existing session on resume.
  await open('words');
  await page.locator('#word-search').fill('abate');
  await action('hide-word').click();
  await page.getByRole('link',{name:'← Vocabulary home',exact:true}).click();
  await page.getByRole('link',{name:'Resume session',exact:true}).click();
  assert.equal(await page.locator('.vocab-word').count(),0);
  assert.match(await page.locator('main').innerText(),/No words were answered/);

  // Tooltip status and only the target term linked in a standard question.
  await page.goto('https://trainer.invalid/index.html#practice/verbal');
  await page.getByRole('button',{name:'Start practice',exact:true}).click();
  assert.equal(await page.locator('#question [data-word-help=word]').count(),0);
  assert.equal(await page.locator('#question [data-word-help=meaning]').count(),0);
  const help=page.locator('#question [data-word-help]').first();
  const word=await help.getAttribute('data-word-help');
  await help.click();
  const add=page.locator('[data-add-word]');
  if(await add.isEnabled())await add.click();
  assert.equal(await add.innerText(),'✓ Added to My words');
  assert.equal(await add.isDisabled(),true);
  await page.locator('[data-close-word]').click();
  await page.locator('#question [data-word-help="'+word+'"]').first().click();
  assert.equal(await add.isDisabled(),true);
  assert.equal(await add.innerText(),'✓ Added to My words');
  await page.locator('[data-close-word]').click();
  for(const file of ['index.html','vocabulary.html']){
   await page.goto('https://trainer.invalid/'+file);
   const sizes=await page.evaluate(()=>({
    note:parseFloat(getComputedStyle(document.querySelector('.footer-note')).fontSize),
    credit:parseFloat(getComputedStyle(document.querySelector('.project-credit')).fontSize),
    gap:parseFloat(getComputedStyle(document.querySelector('.project-credit')).marginTop)
   }));
   assert(Math.abs(sizes.credit/sizes.note-1.5)<.02);
   assert(sizes.gap>=16);
  }
  // Isolate current browser choices from a new visitor.
  const fresh=await browser.newPage();
  await fresh.route('https://trainer.invalid/**',async route=>{
   const file=new URL(route.request().url()).pathname.split('/').pop();
   await route.fulfill({path:path.join(__dirname,file),contentType:file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':'text/html'});
  });
  await fresh.goto('https://trainer.invalid/vocabulary.html');
  assert.equal(await fresh.evaluate(key=>Object.keys(JSON.parse(localStorage.getItem(key)).progress).length,key),0);
  await fresh.close();
  assert.deepEqual(errors,[]);
  console.log('Passed: hide, Undo, restore, reload, preserved My words, existing session filtering, Learn and Practice target selection, equal buttons, added status, template word links, footer sizes and separate browser storage.');
 }finally{await browser.close();}
}
verify().catch(e=>{console.error(e);process.exitCode=1;});
