const sections = [
  {id:'verbal', name:'Verbal Comprehension', count:160, drill:[8,3], standard:[16,6], icon:'type', detail:'Vocabulary, sentence completion and word relationships.'},
  {id:'mechanical', name:'Mechanical Comprehension', count:80, drill:[4,2], standard:[12,6], icon:'gear', detail:'Read diagrams of forces, motion and simple machines.'},
  {id:'numerical', name:'Numerical Reasoning', count:80, drill:[6,3], standard:[12,6], icon:'math', detail:'Work through ratios, measurements, rates and arithmetic.'},
  {id:'technical', name:'Technical Understanding', count:80, drill:[4,2], standard:[12,6], icon:'list', detail:'Apply written procedures, tables and exceptions.'}
];

function item(section, key, topic, level, prompt, responses, explanation, extra = {}) {
  const options = responses.map(String);
  let state = 2166136261;
  for (const char of section + key) state = Math.imul(state ^ char.charCodeAt(0), 16777619);
  const correct = options[0];
  for (let i = 4; i > 0; i--) {
    state = Math.imul(state, 1664525) + 1013904223 | 0;
    const j = (state >>> 0) % (i + 1);
    [options[i],options[j]] = [options[j],options[i]];
  }
  return {id:section + '-' + key, section, topic, level, prompt, options, answer:options.indexOf(correct), explanation, ...extra};
}

const verbal = verbalSets.flatMap(([topic, data], group) => data.trim().split('\n').map((line,i) => {
  const [target, correct, ...rest] = line.split('|');
  const prompt = group === 0 ? 'Which word or phrase is closest in meaning to “' + target + '”?' :
    group === 1 ? 'Which word is most nearly opposite in meaning to “' + target + '”?' : target;
  const explanation = group === 0 ? '“' + target + '” can mean “' + correct + '”.' :
    group === 1 ? '“' + correct + '” expresses the contrasting meaning of “' + target + '”.' : rest[4];
  const advanced = /^(abate|ambiguous|candid|concur|consolidate|curtail|discern|elapse|facilitate|feasible|imminent|impartial|imperative|inadvertent|inhibit|invalidate|meticulous|mitigate|provisional|rectify|authentic|peripheral|conformity|credible|deficit|explicit|finite|lenient|liberate|opaque|contingent|infer|accommodate|outlier|chronology|archipelago|impermeable)$/;
  const foundational = /^(abrupt|adequate|alter|cease|conceal|demonstrate|maintain|notify|verify|accept|active|ascend|attach|bold|clear|complex|constant|construct|decline|dense|durable|efficient|exclude|external|flexible|frequent|gradual|humid|idle|increase|manual|maximum|mobile|optional|permanent|protect|visible|partial|watertight|agree|resume|follow|play|loosen|deep|rowboat|pottery|books|see|hinge|mass)$/;
  const keyword=group<2?target:correct;
  const level=advanced.test(keyword)?3:foundational.test(keyword)?1:2;
  return item('verbal', group + '-' + i, topic, level, prompt, [correct,...rest.slice(0,4)], explanation);
}));

const numericTemplates = [
 ['Unit price',1,n=>{const packs=n+4,cost=n+11;return ['A carton of '+packs+' clamps costs $'+packs*cost+'. At the same unit price, what do '+(packs+3)+' clamps cost?',(packs+3)*cost,'$','First divide the carton price by '+packs+', then multiply $'+cost+' by '+(packs+3)+'.'];}],
 ['Percent remaining',1,n=>{const volume=20*(n+4), pct=5*(1+n%15);return ['A tank contains '+volume+' L. After '+pct+'% is drawn off, how many litres remain?',volume*(100-pct)/100,'L', 'Multiply '+volume+' by '+(100-pct)+'/100 to find the amount remaining.'];}],
 ['Production rate',1,n=>{const rate=n+5,m=15+n;return ['A jig produces '+rate+' clips each minute. How many clips are made in 2 hours and '+m+' minutes?',rate*(120+m),'clips','Convert the time to '+(120+m)+' minutes, then multiply by '+rate+'.'];}],
 ['Metric conversion',1,n=>{const m=n+2, cm=17+n%80;return ['A strip measures '+m+' m and '+cm+' cm. What is its full length in millimetres?',m*1000+cm*10,'mm','Each metre is 1,000 mm and each centimetre is 10 mm. Add the converted lengths.'];}],
 ['Ratios',2,n=>{const a=n+3,b=n+2,k=n+7;return ['A '+(a+b)*k+' m cable is cut into two parts in the ratio '+a+':'+b+'. How long is the larger part?',a*k,'m','Divide by the '+(a+b)+' ratio units to get '+k+' m per unit. The longer piece uses '+a+' units.'];}],
 ['Composite area',2,n=>{const w=n+12,h=n+9,c=n+3;return ['A '+w+' cm by '+h+' cm rectangular plate has a '+c+' cm by 3 cm notch removed. What area remains?',w*h-3*c,'cm²','Find the full rectangle area and subtract the '+3*c+' cm² notch.'];}],
 ['Fractions',2,n=>{const d=n+4,t=d*(n+8);return ['A reel has '+t+' m of wire. The installer uses 3/'+d+' of the full reel. How many metres are used?',3*(n+8),'m','Divide '+t+' by '+d+' and multiply the result by 3.'];}],
 ['Mean',2,n=>{const a=n+28;return ['Four readings are '+a+', '+(a+6)+', '+(a+8)+' and '+(a+14)+' kPa. What is their arithmetic mean?',a+7,'kPa','Add the four readings and divide the sum by 4.'];}],
 ['Spacing',2,n=>{const gaps=n+12,gap=4+n%9;return ['A '+gaps*gap+' cm edge needs one mark every '+gap+' cm, including a mark at each end. How many marks are needed?',gaps+1,'marks','There are '+gaps+' intervals. Counting both endpoints gives one additional mark.'];}],
 ['Percent increase',2,n=>{const a=25*(n+4),p=4*(n%15+1);return ['The planned order of '+a+' washers increases by '+p+'%. How many washers are now on the order?',a+a*p/100,'washers','Add '+p+'% of '+a+' to the original quantity.'];}],
 ['Work time',2,n=>{const jobs=n+11,minutes=4+n%12,rest=5+n%25;return ['A task consists of '+jobs+' pieces, each taking '+minutes+' minutes, plus one '+rest+'-minute setup. How many minutes are required?',jobs*minutes+rest,'min','Multiply pieces by minutes per piece, then add the single setup.'];}],
 ['Rectangular volume',1,n=>{const a=n+9,b=n+6,c=n+2;return ['A rectangular box has internal dimensions '+a+' cm by '+b+' cm by '+c+' cm. What is its internal volume?',a*b*c,'cm³','Multiply internal length × width × height.'];}],
 ['Scale drawings',2,n=>{const s=5*(n+3),m=n+8;return ['A plan has a scale of 1:'+s+'. A line is '+m+' mm long on the plan. What actual length does it represent?',s*m,'mm','Each plan millimetre represents '+s+' actual millimetres.'];}],
 ['Successive percentages',3,n=>{const base=100*(n+2),p=5*(n%10+1);return ['A $'+base+' quote increases by '+p+'% and then the increased price is discounted by '+p+'%. What is the final price?',base*(100+p)*(100-p)/10000,'$','Multiply the base by '+(100+p)+'/100 and then by '+(100-p)+'/100. The second percentage uses a different base.'];}],
 ['Combined rates',3,n=>{const a=n+11,b=n+7,t=n+13;return ['Two pumps deliver '+a+' L/min and '+b+' L/min into the same tank. After '+t+' minutes, how many litres have they delivered together?',(a+b)*t,'L','Add the flow rates and multiply by the number of minutes both pumps run.'];}],
 ['Usable stock',3,n=>{const p=n+11,len=3*n+41,scrap=n+7;return ['A bar is '+(p*len+scrap)+' mm long. First remove '+scrap+' mm of waste. Each usable blank takes '+len+' mm plus 1 mm of cutting loss. How many complete blanks can be made?',Math.floor(p*len/(len+1)),'blanks','Subtract the initial waste, divide by '+(len+1)+' mm per blank and round down.'];}]
];

function numericQuestion(template, n) {
  const [topic,level,build] = numericTemplates[template];
  const [prompt,value,unit,explanation] = build(n);
  const step = template === 8 || template === 15 ? 1 : Math.max(1,Math.round(value/12));
  const candidates = calculationOptions(value,step,template+n);
  const format = v => unit === '$' ? '$'+v.toFixed(2) : v+' '+unit;
  return item('numerical',template+'-'+n,topic,level,prompt,candidates.map(format),explanation);
}

function calculationOptions(value,step,variant) {
  const offsets = [[-4,-2,-1,2],[-3,-1,1,3],[-1,1,3,6],[1,2,4,7],[-5,-3,-2,-1]];
  return [value,...offsets[variant%offsets.length].map(k=>value+k*step)];
}

const numerical = numericTemplates.flatMap((_,i)=>Array.from({length:5},(_,n)=>numericQuestion(i,n+1)));

const mechanics = [
 ['Lever balance',2,'lever',(n)=>{const f=20+10*n,a=2+n,b=a+2;return ['What downward force at B balances the beam?',f*a/b,'N','The moments must match. Divide '+f+' × '+a+' by '+b+'.',[f+' N',a+' m',b+' m']];}],
 ['Meshed gears',2,'gear',n=>{const a=12+2*n,b=2*a,r=40+8*n;return ['Gear A drives gear B. What is B’s speed?',r/2,'rpm','Meshed gears have equal tooth passage rates. B has twice as many teeth and runs at half the speed.',[a+' teeth',b+' teeth',r+' rpm']];}],
 ['Belt drives',2,'belt',n=>{const a=6+n,b=3*a,r=90+9*n;return ['The open belt does not slip. What is the driven pulley’s speed?',r/3,'rpm','The rim speeds match. The driven pulley has triple the diameter, so its speed is one third.',[a+' cm Ø',b+' cm Ø',r+' rpm']];}],
 ['Surface pressure',1,'pressure',n=>{const a=5+n,p=12+2*n;return ['What average pressure does the block exert on its flat base?',p,'Pa','Pressure is force divided by contact area in square metres.',[(p*a)+' N',a+' m²']];}],
 ['Hydraulic force',3,'hydraulic',n=>{const a=2+n,b=a*(n+2),f=20+5*n;return ['Ignoring losses, what output force acts at piston B?',f*(n+2),'N','Both pistons have equal fluid pressure. Multiply the input force by the ratio of output area to input area.',[f+' N',a+' cm²',b+' cm²']];}],
 ['Inclined planes',2,'ramp',n=>{const h=2+n,l=h*4,w=80+20*n;return ['Ignoring friction, what force parallel to the ramp keeps the crate moving uphill at constant speed?',w/4,'N','Equal work gives force × ramp length = weight × vertical rise.',[w+' N',l+' m',h+' m']];}],
 ['Pulley systems',1,'pulley',n=>{const w=100+20*n;return ['In this ideal system, how hard must you pull at the free end to hold the load still?',w/2,'N','Two rope segments support the moving pulley. Each carries half of the load.',[w+' N']];}],
 ['Net force',1,'forces',n=>{const a=18+n*3,b=a+7+n;return ['What is the magnitude of the net horizontal force?',b-a,'N','The forces oppose each other. Subtract the smaller magnitude from the larger.',[a+' N',b+' N']];}],
 ['Spring extension',2,'spring',n=>{const x=n+2,f=n+7,k=2+n%3;return ['The spring remains in its linear range. What extension does the larger load produce?',k*x,'cm','Within the linear range, extension is proportional to force. The second load is '+k+' times as large.',[f+' N',x+' cm',f*k+' N']];}],
 ['Torque',3,'torque',n=>{const a=n+2,f=8+n;return ['What is the torque magnitude about the bolt centre?',a*f,'N·m','The force is perpendicular to the handle. Multiply force by the distance to the bolt axis.',[a+' m',f+' N']];}]
];

const mechanical = mechanics.flatMap(([topic,level,type,build],t)=>Array.from({length:8},(_,i)=>{
  const [question,value,unit,explanation,labels] = build(i+1);
  const diagram = {type,labels};
  if (i>=4) {
    const [prompt,choices,why]=mechanicalConcepts[t][i-4];
    return item('mechanical',t+'-'+i,topic,[1,2,2,3][i-4],prompt,choices.split('|'),why,{diagram});
  }
  const step = Math.max(1,Math.round(value/10));
  const round = x=>Number(x.toFixed(2));
  const prompt = question + (value !== round(value) ? ' Round to two decimal places.' : '');
  return item('mechanical',t+'-'+i,topic,level,prompt,calculationOptions(value,step,t+i).map(x=>round(x)+' '+unit),explanation,{diagram});
}));

const procedures = [
 ['Tool checkout','a crimping tool','checkout entry','Write the tool number','Match the job code','Record the return time','Unreadable tool number','Send to tool control'],
 ['Sample intake','a water sample','intake record','Read the seal number','Match the route label','Record the storage shelf','Broken seal','Set aside for intake review'],
 ['Drawing revisions','a drawing packet','revision record','Read the drawing number','Match the current revision','Stamp the issue date','Missing revision mark','Return to document control'],
 ['Parts inspection','a bracket','inspection card','Read the lot number','Compare the finish code','Mark the acceptance box','Missing lot number','Move to inspection hold'],
 ['Meter inventory','a training meter','inventory entry','Read the case serial number','Match the inventory tag','Log the cabinet number','Duplicate serial number','Notify the inventory lead'],
 ['Receiving stock','a delivery carton','receiving slip','Read the supplier code','Compare the item count','Mark the receiving date','Unreadable supplier code','Route to receiving review'],
 ['Job folder filing','a work folder','filing record','Read the folder number','Match the site code','Enter the archive drawer','Missing site code','Send to the records desk'],
 ['Equipment return','a demo fixture','return receipt','Read the fixture tag','Check the return reference','Record the condition code','Detached fixture tag','Send to the returns desk'],
];

const technical = procedures.flatMap(([topic,object,record,first,second,third,exception,action],i)=>{
  const code = 'H'+(11+i);
  const context = 'Procedure '+code+' applies when processing '+object+'.\n\n' +
    '1. '+first+'.\n2. '+second+'.\n3. '+third+'.\n\n' +
    'Complete the '+record+' after step 3. Exception: if you find “'+exception.toLowerCase()+'”, stop processing immediately. '+action+' and leave the '+record+' incomplete.';
  const complete = 'Complete the '+record;
  const hold = 'Leave the '+record+' incomplete';
  const draft = [
    ['Under procedure '+code+', which action comes immediately after step 1?',second,[third,first,complete,action],'Step 2 follows step 1. '+second+'.'],
    ['Under procedure '+code+', what should happen immediately after step 3 if nothing triggers the exception?',complete,[hold,first,second,action],'The instructions say to complete the '+record+' after step 3.'],
    ['Under procedure '+code+', the exception is discovered during step 2. Where should the item go?',action,[first,second,third,complete],'The exception overrides the remaining steps. '+action+'.'],
    ['What is the required status of the '+record+' when the exception in '+code+' applies?','Incomplete',['Completed','Filed as approved','Awaiting only a signature','Closed after step 3'],'The last instruction explicitly requires leaving the record incomplete.'],
    ['Which pair gives the first and last steps of the normal procedure '+code+'?',[first,third].join(' → '),[[second,third],[first,second],[third,first],[third,second]].map(pair=>pair.join(' → ')),'The normal sequence begins with step 1 and ends with step 3.']
  ];
  return draft.map(([prompt,answer,wrong,why],j)=>item('technical',i+'-'+j,topic,[1,1,2,2,3][j],prompt,[answer,...wrong],why,{context,group:code}));
});

const rulesQuestions = technicalScenarios.flatMap(([topic,group,context,rows])=>
  rows.map(([prompt,choices,why],i)=>item('technical',group+'-'+i,topic,[2,2,3,3,1][i],prompt,choices.split('|'),why,{context,group})));
const bank = [...verbal,...mechanical,...numerical,...technical,...rulesQuestions];

function validateQuestion(q) {
  return q && typeof q.id === 'string' && sections.some(s=>s.id===q.section) &&
    Number.isInteger(q.level) && q.level>=1 && q.level<=3 &&
    [q.topic,q.prompt,q.explanation].every(value=>typeof value==='string' && value.trim()) &&
    Array.isArray(q.options) && q.options.length===5 &&
    q.options.every(value=>typeof value==='string' && value.trim()) &&
    new Set(q.options.map(value=>value.trim().toLowerCase())).size===5 &&
    Number.isInteger(q.answer) && q.answer>=0 && q.answer<5;
}

const generation = Object.freeze({
  numeric(count, offset) {
    return Array.from({length:count},(_,i)=>{
      const index = offset+i;
      return numericQuestion(index % numericTemplates.length,6+Math.floor(index/numericTemplates.length));
    });
  },
  byId(id) {
    const match = /^numerical-(\d+)-(\d+)$/.exec(id);
    if (!match) return undefined;
    const template = Number(match[1]);
    const variant = Number(match[2]);
    if (template < numericTemplates.length && Number.isSafeInteger(variant) && variant >= 6) {
      return numericQuestion(template,variant);
    }
  },
  async ai() {
    return {status:'disabled', questions:[]};
  }
});

if (typeof module !== 'undefined') module.exports = {sections, bank, validateQuestion, generation, numericTemplates};
