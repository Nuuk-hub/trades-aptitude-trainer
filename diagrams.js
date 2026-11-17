let diagramCount = 0;
function drawDiagram({type,labels:[a,b,c]}) {
  const marker = 'arrowhead-' + (++diagramCount);
  const line = (x,y,u,v,cls='')=>'<line x1="'+x+'" y1="'+y+'" x2="'+u+'" y2="'+v+'" class="'+cls+'"/>';
  const rect = (x,y,w,h)=>'<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="4"/>';
  const circle = (x,y,r)=>'<circle cx="'+x+'" cy="'+y+'" r="'+r+'"/>';
  const txt = (x,y,t)=>'<text x="'+x+'" y="'+y+'">'+t+'</text>';
  const path = d=>'<path d="'+d+'"/>';
  const arrow = (x,y,u,v)=>'<line x1="'+x+'" y1="'+y+'" x2="'+u+'" y2="'+v+'" class="force" marker-end="url(#'+marker+')"/>';
  const gear = (x,y,r)=>circle(x,y,r)+circle(x,y,6)+Array.from({length:r<40?10:16},(_,i)=>{
    const angle=i*(r<40?Math.PI/5:Math.PI/8);
    return line(x+(r-1)*Math.cos(angle),y+(r-1)*Math.sin(angle),x+(r+5)*Math.cos(angle),y+(r+5)*Math.sin(angle));
  }).join('');
  const spring = (x,y)=>path('M'+x+' '+y+' v10 l-12 7 24 9 -24 9 24 9 -24 9 12 7 v10');
  const figures = {
    lever:()=>[line(45,101,395,101),path('M179 101l-24 38h48z'),arrow(55,41,55,96),arrow(386,41,386,96),txt(55,28,'A · '+a),txt(386,28,'B'),txt(117,128,b),txt(280,128,c),txt(179,161,'Pivot')],
    gear:()=>[gear(151,82,30),gear(246,82,60),txt(151,87,'A'),txt(246,87,'B'),txt(130,145,a+' · '+c),txt(275,163,b)],
    belt:()=>[path('M117 64 L303 30 A53 53 0 1 1 303 134 L117 100 A18 18 0 0 1 117 64Z'),circle(120,82,17),circle(312,82,51),txt(120,87,'A'),txt(312,87,'B'),txt(120,151,a+' · '+c),txt(312,151,b)],
    pressure:()=>[rect(146,65,148,58),line(66,125,374,125),arrow(220,32,220,61),txt(220,23,a),txt(220,103,'Base area '+b),txt(220,153,'Surface')],
    hydraulic:()=>[path('M70 77v50h301V76 M127 77v21h146V76'),rect(70,67,57,12),rect(273,67,98,12),arrow(99,30,99,63),txt(99,22,a),txt(98,151,'A · '+b),txt(322,151,'B · '+c),txt(221,119,'Fluid')],
    ramp:()=>[path('M50 145H372V44Z'),'<g transform="rotate(-17 238 82)">'+rect(211,64,52,34)+'</g>',arrow(237,85,237,126),txt(268,127,a),txt(178,90,'Ramp · '+b),txt(398,102,c)],
    pulley:()=>[line(112,22,310,22),line(133,22,133,89),line(202,53,202,89),path('M133 89a34.5 34.5 0 0 0 69 0 M202 53a30 30 0 0 1 60 0v56'),circle(167.5,89,28),circle(232,53,24),line(167.5,116,167.5,132),rect(140,132,55,29),txt(167.5,152,a),arrow(262,110,262,145),txt(324,138,'Free end')],
    forces:()=>[rect(177,56,86,64),arrow(173,88,74,88),arrow(267,88,374,88),txt(112,66,a),txt(328,66,b),line(53,125,387,125)],
    spring:()=>[line(100,24,340,24),spring(145,24),'<g transform="translate(292 24) scale(1 1.2)">'+spring(0,0)+'</g>',rect(117,94,56,29),rect(264,108,56,29),txt(145,114,a),txt(292,128,c),txt(145,151,'Extension '+b),txt(292,159,'Extension ?')],
    torque:()=>[rect(89,86,243,20),circle(99,96,14),arrow(322,34,322,84),txt(322,24,b),txt(210,136,a),line(99,115,99,125),line(322,108,322,125),line(99,120,322,120),txt(100,157,'Bolt centre')]
  };
  const description = {
    lever:'Horizontal beam on a pivot. A downward force of '+a+' acts on the left, '+b+' from the pivot. B is '+c+' to the right.',
    gear:'Two external gears in mesh. Gear A has '+a+' and turns at '+c+'. Gear B has '+b+'.',
    belt:'Two pulleys linked by an open belt. Driver A is '+a+' and turns at '+c+'. Driven pulley B is '+b+'.',
    pressure:'A block pushes down with '+a+' on a contact area of '+b+'.',
    hydraulic:'An input force of '+a+' acts on piston A with area '+b+'. Fluid connects it to piston B with area '+c+'.',
    ramp:'A crate weighs '+a+'. The ramp length is '+b+' and its vertical rise is '+c+'.',
    pulley:'A rope is anchored overhead, passes underneath a moving pulley supporting '+a+', then over a fixed pulley to the free end.',
    forces:'A block is pulled left with '+a+' and right with '+b+'.',
    spring:'One spring extends '+b+' under '+a+'. A second identical spring supports '+c+'.',
    torque:'A force of '+b+' acts at right angles to a wrench handle, '+a+' from the bolt centre.'
  }[type];
  return '<svg class="diagram" viewBox="0 0 440 178" role="img" aria-label="'+description+'"><title>'+description+'</title><defs><marker id="'+marker+'" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0L10 5L0 10Z"/></marker></defs>'+figures[type]().join('')+'</svg>';
}
