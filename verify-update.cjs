const fs=require('node:fs/promises');
const path=require('node:path');
const assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');

async function verify(){
  const browser=await chromium.launch({executablePath:process.env.BROWSER_EXECUTABLE,headless:true,args:['--disable-gpu']});
  try{
    const page=await browser.newPage({viewport:{width:820,height:1180},hasTouch:true,isMobile:true});
    const errors=[];
    page.on('pageerror',error=>errors.push(error.message));
    page.on('dialog',dialog=>dialog.accept());
    await page.route('https://trainer.invalid/trainer/**',async route=>{
      const name=new URL(route.request().url()).pathname.split('/').pop()||'index.html';
      if(!/^[a-z.-]+\.(?:js|css|html|png)$/.test(name))return route.fulfill({status:404});
      await route.fulfill({path:path.join(__dirname,name),contentType:name.endsWith('.png')?'image/png':name.endsWith('.js')?'text/javascript':name.endsWith('.css')?'text/css':'text/html'});
    });
    const testKey='mb-trades-trainer-v1',vocabKey='mb-trades-vocabulary-v1';
    const saved=key=>page.evaluate(key=>JSON.parse(localStorage.getItem(key)),key);
    const open=route=>page.goto('https://trainer.invalid/trainer/index.html#'+route);
    const action=name=>page.locator('[data-action="'+name+'"]');
    const screenshot=async name=>{
      if(process.env.VOCAB_SCREENSHOT_DIR)await page.screenshot({path:path.join(process.env.VOCAB_SCREENSHOT_DIR,name),fullPage:true});
    };
    await open('home');
    assert(await page.locator('.hero-portrait img').evaluate(img=>img.complete&&img.naturalWidth>0));
    await page.evaluate(key=>{
      const id=bank.find(q=>q.section==='verbal').id;
      localStorage.setItem(key,JSON.stringify({progress:{[id]:{section:'verbal',topic:'Synonyms',attempts:3,correct:2,seconds:4,streak:1,missed:false,due:Date.now()+999999999}}}));
    },testKey);
    await page.reload();
    await open('review/verbal');
    assert.equal(await page.locator('.review-item').count(),1);
    await action('remove-review').click();
    assert.match(await page.locator('.notice').innerText(),/No mistakes to review yet/);
    await page.reload();
    assert.equal(await page.locator('.review-item').count(),0);
    await open('practice/verbal');
    await action('review').click();
    assert.match(await page.locator('#notice').innerText(),/No mistakes/);

    await page.locator('[name=count]').selectOption('5');
    await page.getByRole('button',{name:'Start practice',exact:true}).click();
    const first=(await saved(testKey)).active.ids[0];
    const help=page.locator('[data-word-help]').first();
    const word=await help.getAttribute('data-word-help');
    await help.click();
    await page.getByRole('button',{name:'Add to My words',exact:true}).click();
    assert.equal((await saved(vocabKey)).progress[word].unknown,true);
    assert.equal((await saved(testKey)).active.selected,null);
    await page.getByRole('button',{name:'Close',exact:true}).click();
    let q=await page.evaluate(id=>byId[id],first);
    await action('choose').nth((q.answer+1)%5).click();
    await action('check').click();
    await page.reload();
    while(await page.locator('[data-action=next]').count()){
      await action('next').click();
      if(await page.getByRole('heading',{name:'Practice complete',exact:true}).count())break;
      const active=(await saved(testKey)).active;
      q=await page.evaluate(id=>byId[id],active.ids[active.pos]);
      await action('choose').nth(q.answer).click();
      await action('check').click();
    }
    await page.getByRole('heading',{name:'Practice complete',exact:true}).waitFor();
    const stats=await page.locator('.mini-stats').innerText();
    assert.match(stats,/4 \/ 5 · 80%/);
    assert.match(stats,/1 \/ 1/);
    assert.match(await page.locator('.review-item').innerText(),/Corrected on retry/);
    assert.equal((await saved(testKey)).progress[first].review,true);
    await screenshot('trainer-new-results.png');
    await action('result-review').click();
    assert.equal((await saved(testKey)).active.ids[0],first);

    // Legacy results and a partially completed old session must not invent first answers.
    await page.evaluate(key=>{
      const saved=JSON.parse(localStorage.getItem(key));
      saved.results={mode:'practice',section:'verbal',correct:10,total:11,count:10,level:0,kind:'normal'};
      const id=saved.active.ids[0];
      saved.active={mode:'practice',section:'verbal',kind:'normal',count:1,level:0,ids:[id],pos:0,selected:null,checked:null,started:Date.now(),tries:2,right:1,requeued:[]};
      localStorage.setItem(key,JSON.stringify(saved));
    },testKey);
    await page.reload();
    await open('results');
    assert.match(await page.locator('.panel').innerText(),/before detailed attempt tracking/);
    await open('session');
    await action('choose').nth(0).click();
    await action('check').click();
    assert.equal((await saved(testKey)).active.partialHistory,true);

    // Confirm each reset scope and both Cancel paths against disposable storage.
    for(const scope of ['test','vocabulary','everything']){
      await page.evaluate(({testKey,vocabKey})=>{
        localStorage.setItem(testKey,JSON.stringify({progress:{},numericCursor:44,results:{mode:'practice'},settings:{profile:'custom'}}));
        localStorage.setItem(vocabKey,JSON.stringify({progress:{reluctant:{unknown:true,attempts:2,correct:0}},session:null,last:null}));
        localStorage.setItem('unrelated-site-data','keep');
      },{testKey,vocabKey});
      await open('home');
      await page.getByRole('button',{name:'Reset progress',exact:true}).click();
      await page.locator('[data-cancel]').click();
      assert.equal((await saved(testKey)).numericCursor,44);
      await page.getByRole('button',{name:'Reset progress',exact:true}).click();
      await page.locator('[data-scope="'+scope+'"]').click();
      await page.locator('[data-cancel]').click();
      assert.equal((await saved(vocabKey)).progress.reluctant.unknown,true);
      await page.getByRole('button',{name:'Reset progress',exact:true}).click();
      await page.locator('[data-scope="'+scope+'"]').click();
      if(scope==='everything') await screenshot('trainer-reset-dialog.png');
      await Promise.all([page.waitForEvent('load'),page.locator('[data-confirm]').click()]);
      if(scope!=='vocabulary')assert.equal(await saved(testKey),null);
      else assert.equal((await saved(testKey)).numericCursor,44);
      if(scope!=='test')assert.equal(await saved(vocabKey),null);
      else assert.equal((await saved(vocabKey)).progress.reluctant.unknown,true);
      assert.equal(await page.evaluate(()=>localStorage.getItem('unrelated-site-data')),'keep');
    }

    for(const size of [{width:820,height:1180},{width:1180,height:820},{width:390,height:844}]){
      await page.setViewportSize(size);
      await open('home');
      assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    }
    await page.setViewportSize({width:820,height:1180});
    await open('home');
    await screenshot('trainer-updated-home.png');
    assert.deepEqual(errors,[]);
    console.log('Update checks passed: legacy migration, sticky review and removal, empty list, first/retry results, mistake history, inline translation and My words, all reset scopes and cancellations, preserved unrelated storage, electrician and responsive layout.');
  }finally{await browser.close();}
}
verify().catch(error=>{console.error(error);process.exitCode=1;});
