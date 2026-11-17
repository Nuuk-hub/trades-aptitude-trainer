const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const vm = require('node:vm');

const sourceFiles = ['verbal.js','mechanical-concepts.js','technical-scenarios.js','bank.js','diagrams.js'];
const base = __dirname;

async function bankChecks() {
  const context = vm.createContext({});
  for (const name of sourceFiles) vm.runInContext(await fs.readFile(path.join(base,name),'utf8'),context);
  const {bank, sections, generation, validateQuestion, drawDiagram} =
    vm.runInContext('({bank, sections, generation, validateQuestion, drawDiagram})',context);
  assert.equal(bank.length,400);
  assert.equal(new Set(bank.map(q=>q.id)).size,400);
  assert.equal(new Set(bank.map(q=>JSON.stringify([q.prompt,q.context,q.diagram]))).size,400);
  for (const s of sections) {
    const group=bank.filter(q=>q.section===s.id);
    assert.equal(group.length,s.count);
    assert(group.every(validateQuestion));
    assert.deepEqual([...new Set(group.map(q=>q.answer))].sort(),[0,1,2,3,4]);
    assert.deepEqual([...new Set(group.map(q=>q.level))].sort(),[1,2,3]);
  }
  const extract = line=>[...line.matchAll(/\d+(?:\.\d+)?/g)].map(m=>Number(m[0]));
  const numericKeys = [
    ([pack,cost,purchased])=>cost/pack*purchased,
    ([litres,pct])=>litres-litres*pct/100,
    ([rate,hours,minutes])=>rate*(hours*60+minutes),
    ([metres,cm])=>metres*1000+cm*10,
    ([length,left,right])=>length*left/(left+right),
    ([width,height,cutWidth,cutHeight])=>width*height-cutWidth*cutHeight,
    ([length,numerator,denominator])=>length*numerator/denominator,
    values=>values.reduce((sum,x)=>sum+x,0)/values.length,
    ([edge,gap])=>edge/gap+1,
    ([washers,pct])=>washers*(1+pct/100),
    ([pieces,minutes,setup])=>pieces*minutes+setup,
    ([width,height,depth])=>width*height*depth,
    ([,scale,plan])=>scale*plan,
    ([price,increase,discount])=>price*(1+increase/100)*(1-discount/100),
    ([a,b,time])=>(a+b)*time,
    ([stock,waste,blank,loss])=>Math.floor((stock-waste)/(blank+loss))
  ];
  const variants=generation.numeric(1600,0);
  assert.equal(new Set(variants.map(q=>q.id)).size,variants.length);
  for (const q of [...bank.filter(q=>q.section==='numerical'),...variants]) {
    assert(validateQuestion(q),q.id);
    const template=Number(q.id.split('-')[1]);
    const expected=Number(numericKeys[template](extract(q.prompt)).toFixed(2));
    const actual=extract(q.options[q.answer])[0];
    assert.equal(actual,expected,q.id+' '+q.prompt);
    if (generation.byId(q.id)) assert.equal(generation.byId(q.id).prompt,q.prompt);
  }
  const mechanicalKeys = [
    ([force,a,b])=>force*a/b,
    ([a,b,rpm])=>a*rpm/b,
    ([a,b,rpm])=>a*rpm/b,
    ([force,area])=>force/area,
    ([force,a,b])=>force*b/a,
    ([weight,length,height])=>weight*height/length,
    ([weight])=>weight/2,
    ([left,right])=>Math.abs(right-left),
    ([force,extension,newForce])=>newForce*extension/force,
    ([arm,force])=>arm*force
  ];
  for (const q of bank.filter(q=>q.section==='mechanical')) {
    assert.match(drawDiagram(q.diagram),/role="img".+<\/svg>/);
    const [,template,index]=q.id.split('-').map(Number);
    if (index<4) {
      const labels=q.diagram.labels.map(label=>extract(label)[0]);
      assert.equal(extract(q.options[q.answer])[0],Number(mechanicalKeys[template](labels).toFixed(2)),q.id);
    }
  }
  assert.equal((await generation.ai()).status,'disabled');
  console.log('Passed bank checks for 400 items, 80 diagram outputs and 1,600 numeric variants.');
}

async function browserChecks() {
  const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
  let browser;
  try {
    browser=await chromium.launch({executablePath:process.env.BROWSER_EXECUTABLE||undefined,headless:true,args:['--disable-gpu']});
    const page=await browser.newPage({viewport:{width:820,height:1180},isMobile:true,hasTouch:true});
    const errors=[];
    page.on('pageerror',error=>errors.push(error.message));
    page.on('dialog',dialog=>dialog.accept());
    const url='https://trainer.invalid/trainer/';
    await page.route('**/*',async route=>{
      const parts=new URL(route.request().url());
      const asset=parts.pathname.slice('/trainer/'.length)||'index.html';
      if (parts.origin!=='https://trainer.invalid'||!parts.pathname.startsWith('/trainer/')||
          !['index.html','style.css','app.js',...sourceFiles].includes(asset)) {
        await route.fulfill({status:404});
        return;
      }
      const type=asset.endsWith('.js')?'text/javascript':asset.endsWith('.css')?'text/css':'text/html';
      await route.fulfill({path:path.join(base,asset),contentType:type+'; charset=utf-8'});
    });
    const saved=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('mb-trades-trainer-v1')));
    const action=name=>page.locator('[data-action="'+name+'"]');
    const open=route=>page.goto(url+'#'+route);
    const noOverflow=()=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth);
    await open('home');
    assert.equal(await page.locator('.card').count(),4);
    assert(await noOverflow());
    if (process.env.TRAINER_SCREENSHOT) await page.screenshot({path:process.env.TRAINER_SCREENSHOT,fullPage:true});

    await page.locator('.card a').nth(1).click();
    await page.locator('#practice-form select[name="count"]').selectOption('5');
    await page.getByRole('button',{name:'Start practice'}).click();
    await page.locator('figure svg[role="img"]').waitFor();
    const initial=await saved();
    const first=initial.active.ids[0];
    const answer=await page.evaluate(id=>byId[id].answer,first);
    await action('choose').nth((answer+1)%5).tap();
    await action('check').tap();
    await page.locator('#feedback').waitFor();
    assert.equal((await saved()).progress[first].missed,true);
    assert.equal((await saved()).active.ids[4],first);
    await page.reload();
    await page.locator('#feedback').waitFor();
    await action('next').click();
    assert.equal((await saved()).active.pos,1);
    await open('practice/mechanical');
    await action('review').click();
    await page.locator('#question').waitFor();
    assert.equal((await saved()).active.ids[0],first);
    await action('choose').nth(answer).click();
    await action('check').click();
    const reviewed=(await saved()).progress[first];
    assert.equal(reviewed.streak,1);
    assert.equal(reviewed.missed,false);
    assert(reviewed.due>Date.now()+23*3600000);
    await action('next').click();
    await page.getByRole('heading',{name:'Practice complete'}).waitFor();
    assert.equal((await saved()).results.correct,1);

    await open('practice/numerical');
    await action('numeric').click();
    await page.locator('#question').waitFor();
    const generated=(await saved()).active.ids[0];
    assert.match(generated,/^numerical-0-6$/);
    const key=await page.evaluate(id=>generation.byId(id).answer,generated);
    await action('choose').nth((key+1)%5).click();
    await action('check').click();
    await open('practice/numerical');
    await action('review').click();
    await page.locator('#question').waitFor();
    assert.equal((await saved()).active.ids[0],generated);

    await open('exam');
    await page.locator('[name=profile]').selectOption('drill');
    assert.equal(await page.locator('[name=verbalCount]').inputValue(),'8');
    assert.equal(await page.locator('[name=technicalTime]').inputValue(),'2');
    await page.locator('[name=verbalCount]').fill('2');
    await page.locator('[name=verbalTime]').fill('1');
    for(const id of ['mechanical','numerical','technical']) await page.locator('[name='+id+'Count]').fill('1');
    await page.getByRole('button',{name:/Set up simulation/}).click();
    await action('activate').click();
    await page.locator('#timer').waitFor();
    assert.match(await page.locator('#timer').textContent(),/^(1:00|0:59)$/);
    await action('forward').click();
    assert.equal((await saved()).active.pos,1);
    await action('jump').nth(0).click();
    const examId=(await saved()).active.plan[0].ids[0];
    const examKey=await page.evaluate(id=>byId[id].answer,examId);
    await action('choose').nth(examKey).click();
    await action('clear').click();
    assert.equal((await saved()).active.answers[examId],undefined);
    await action('choose').nth(examKey).click();
    assert.equal(await page.locator('#feedback').count(),0);
    const deadline=(await saved()).active.deadline;
    await page.reload();
    assert.equal((await saved()).active.deadline,deadline);
    assert.equal((await saved()).active.answers[examId],examKey);
    await page.evaluate(()=>{data.active.deadline=Date.now()-1;});
    await action('activate').waitFor();
    assert.equal((await saved()).active.done[0].timedOut,true);
    assert.equal((await saved()).active.done[0].unanswered,1);
    for(let i=1;i<4;i++){
      await action('activate').click();
      if (i===1) {
        await page.locator('figure svg[role="img"]').waitFor();
        for(const viewport of [{width:1180,height:820},{width:390,height:844},{width:820,height:1180}]){
          await page.setViewportSize(viewport);
          assert(await noOverflow());
        }
      }
      const part=(await saved()).active;
      const id=part.plan[i].ids[0];
      const key=await page.evaluate(qid=>byId[qid].answer,id);
      await action('choose').nth(key).click();
      await action('submit-section').click();
    }
    await page.getByRole('heading',{name:'Simulation complete'}).waitFor();
    assert.equal((await saved()).lastExam.parts.length,4);
    assert.equal((await saved()).lastExam.parts.reduce((sum,p)=>sum+p.correct,0),4);
    assert.match(await page.locator('.mini-stats').textContent(),/80%/);
    await page.reload();
    await page.getByRole('heading',{name:'Simulation complete'}).waitFor();
    for(const viewport of [{width:1180,height:820},{width:390,height:844}]){
      await page.setViewportSize(viewport);
      await open('home');
      assert(await noOverflow());
      await open('exam');
      assert(await noOverflow());
    }
    assert.deepEqual(errors,[]);
    console.log('Passed browser checks for practice, retries, reload, generated review, exam navigation, timeout, results and responsive layouts.');
  } finally {
    await browser?.close();
  }
}

bankChecks().then(()=>process.argv.includes('--browser')?browserChecks():undefined).catch(error=>{
  console.error(error);
  process.exitCode=1;
});
