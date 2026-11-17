/* Each row gives a target, keyed response and four distractors. */
const verbalSets = [
['Synonyms', `
abate|subside|begin|persist|spread|return
abrupt|sudden|steady|planned|gentle|gradual
adequate|sufficient|excessive|optional|unusual|fragile
adjacent|adjoining|distant|overhead|sealed|opposing
adverse|unfavourable|predictable|routine|beneficial|temporary
allocate|assign|collect|hide|return|measure
alter|modify|inspect|preserve|record|reject
ambiguous|unclear|accurate|specific|urgent|reliable
anticipate|expect|forget|ignore|approve|repeat
apparent|evident|hidden|unlikely|costly|permanent
assess|evaluate|assemble|divide|install|deliver
attain|achieve|attempt|retain|withdraw|avoid
candid|frank|cautious|silent|forceful|indifferent
cease|stop|begin|continue|increase|confirm
coherent|logical|scattered|lengthy|rapid|minor
comply|conform|object|negotiate|explain|listen
conceal|hide|expose|include|repair|display
concise|brief|accurate|formal|complete|vague
concur|agree|differ|hesitate|suggest|reconsider
consecutive|successive|occasional|simultaneous|scattered|separate
consolidate|combine|separate|delay|discard|protect
constrain|restrict|release|explain|obtain|expect
convey|communicate|conceal|compare|calculate|withdraw
curtail|reduce|expand|initiate|copy|authorize
defer|postpone|accelerate|complete|deny|organize
deliberate|intentional|accidental|swift|reluctant|partial
demonstrate|show|seek|guess|doubt|summarize
deplete|use up|set aside|build up|take apart|hand over
discern|detect|dismiss|predict|assume|create
disperse|scatter|assemble|confine|seal|classify
diverge|separate|unite|follow|stabilize|descend
elapse|pass|pause|begin|limit|repeat
endorse|support|question|exclude|record|withdraw
enhance|improve|replace|conceal|impede|review
equivalent|equal in value|different in size|easy to move|hard to find|limited in time
erratic|irregular|reliable|constant|balanced|fixed
exempt|excused|qualified|required|included|supervised
facilitate|ease|hinder|forbid|audit|intercept
feasible|practicable|mandatory|remote|unlikely|completed
fluctuate|vary|settle|pause|vanish|accumulate
foresee|predict|observe|clarify|remember|confirm
frugal|thrifty|careless|wealthy|generous|hesitant
imminent|impending|remote|uncertain|finished|recurring
impartial|unbiased|lenient|inexperienced|strict|unaware
imperative|essential|suggested|ordinary|irrelevant|delayed
inadvertent|unintentional|deliberate|unavoidable|necessary|minor
infer|deduce|state|measure|estimate|recite
inhibit|hinder|promote|ignore|resume|verify
intermittent|sporadic|continuous|permanent|predictable|constant
invalidate|nullify|confirm|renew|examine|explain
maintain|preserve|discard|inspect|abandon|obtain
mandatory|required|recommended|prohibited|flexible|routine
meticulous|painstaking|hasty|evasive|doubtful|casual
mitigate|lessen|cause|intensify|predict|ignore
notify|inform|remind|restrain|delay|commend
obsolete|outdated|valuable|adaptable|accurate|current
provisional|temporary|definite|illegal|handmade|complete
rectify|correct|detect|repeat|assume|remove
replenish|refill|reduce|clean|collect|discard
verify|confirm|assume|invent|reject|copy
`],
['Opposite relationships', `
abundant|scarce|ample|useful|loose|fresh
accept|reject|approve|offer|retain|inspect
accumulate|disperse|gather|sort|count|obtain
active|inactive|capable|regular|stable|partial
advance|withdraw|move|proceed|arrive|follow
aggressive|peaceful|hostile|steady|anxious|energetic
approximate|exact|rough|small|common|likely
ascend|descend|arrive|accelerate|climb|advance
attach|detach|fasten|align|inspect|adjust
authentic|counterfeit|original|unusual|ordinary|local
bold|timid|proud|calm|brave|cheerful
central|peripheral|essential|hidden|direct|uniform
clear|cloudy|bright|transparent|warm|calm
compact|spacious|small|narrow|solid|portable
complex|simple|severe|detailed|careful|critical
compress|expand|fold|flatten|reduce|divide
concrete|abstract|solid|dense|visible|heavy
confirm|disprove|show|examine|attest|report
conformity|deviation|compliance|strength|approval|unity
constant|variable|normal|uniform|limited|specific
construct|demolish|maintain|plan|build|repair
credible|implausible|accurate|confirmed|official|trustworthy
decline|increase|decrease|prevent|renew|stabilize
deficit|surplus|shortage|loss|balance|estimate
dense|sparse|packed|heavy|solid|thick
detain|release|hold|escort|follow|brief
diminish|enlarge|shrink|reduce|assess|examine
durable|fragile|lasting|heavy|flexible|weatherproof
efficient|wasteful|effective|costly|compact|accurate
eligible|ineligible|available|suitable|certified|interested
enclose|expose|surround|assemble|suspend|remove
exclude|include|omit|approve|erase|retain
explicit|implicit|direct|specific|accurate|logical
external|internal|informal|adjacent|distant|opposite
finite|unlimited|bounded|countable|temporary|approximate
flexible|rigid|portable|collapsible|elastic|modest
frequent|rare|regular|common|gradual|urgent
genuine|fake|valuable|novel|unusual|authentic
gradual|sudden|slow|predictable|repeated|steady
humid|dry|warm|misty|damp|cold
idle|working|resting|waiting|small|clean
increase|decrease|rise|remain|hold|grow
intact|damaged|whole|missing|repaired|solid
intentional|accidental|deliberate|expected|planned|certain
lenient|strict|flexible|cautious|helpful|patient
liberate|confine|free|escort|persuade|follow
manual|automatic|physical|paper|local|portable
maximum|minimum|average|total|median|capacity
migrate|remain|travel|relocate|transfer|return
mobile|stationary|portable|variable|distant|nearby
moderate|extreme|reasonable|adequate|average|regular
novice|expert|beginner|assistant|student|applicant
opaque|transparent|solid|dark|shiny|matte
optional|compulsory|preferable|permitted|recommended|available
permanent|temporary|stable|firm|consistent|unlikely
plentiful|limited|common|ample|available|extra
precise|inexact|accurate|careful|scalable|proven
productive|unproductive|efficient|active|energetic|constant
protect|endanger|guard|preserve|cover|shelter
visible|invisible|apparent|bright|clear|evident
`],
['Sentence completion', `
Because the first reading seemed unusually high, the operator took a second measurement to ___ it.|verify|postpone|remove|ignore|replace|A second reading can check whether the first is accurate.
The replacement fitting had the same dimensions and rating, so it was an ___ substitute.|equivalent|obsolete|unrelated|uncertain|inferior|Matching the relevant specifications makes the fitting equivalent.
The label had two possible meanings and needed to be rewritten because it was ___.|ambiguous|concise|legible|redundant|precise|Ambiguous wording allows more than one interpretation.
The supplier could only ship half the order, so the shipment was ___.|partial|complete|surplus|immediate|sealed|A partial shipment contains only part of the order.
The test could not start until the required documents had been received. They were a ___.|prerequisite|consequence|substitute|coincidence|supplement|A prerequisite is a condition that must be met first.
A ___ seal allows no liquid to pass through it.|watertight|porous|flexible|temporary|removable|Watertight specifically means that water cannot pass through.
Mira grouped the scattered entries in one file to ___ the records.|consolidate|obscure|duplicate|discard|suspend|Consolidate means bring together into one place.
To ___ vibration, the designer added a soft mount that absorbed part of the motion.|dampen|amplify|detect|report|measure|Dampen means to reduce the strength of the vibration.
The load varied each minute, alternately rising and falling. It was ___.|fluctuating|constant|stationary|uniform|cumulative|Fluctuating describes repeated changes up and down.
The discrepancy between two totals prompted a check because the figures did not ___.|agree|decline|alternate|recur|stabilize|Two figures agree when they match.
The revised plan was ___ on approval from the coordinator.|contingent|redundant|competing|immune|contrary|Contingent on means dependent on a condition.
Because the fixture blocks the opening, it ___ access to the panel.|obstructs|enables|extends|defines|restores|To obstruct access is to block it.
Even though the note was short, it gave exact dimensions and was ___.|precise|vague|speculative|casual|contradictory|Precise information supplies exact details.
They agreed to ___ the inspection until the replacement gauge arrived.|defer|expedite|complete|cancel permanently|approve|Defer means postpone to a later time.
The instructions give a suggested method, but using it is ___.|optional|mandatory|compulsory|prohibited|required|A suggestion leaves the choice open.
The investigator could not see the cause directly but could ___ it from the pattern of marks.|infer|erase|witness|invent|document directly|Infer means draw a conclusion from evidence.
After the warning was withdrawn, the crew could ___ its interrupted work.|resume|initiate|forfeit|suspend|abandon|Resume means continue something that was interrupted.
The installer left a small gap to ___ expansion as the material warmed.|accommodate|prevent|measure|disguise|reverse|Accommodate means allow room for something.
The map omits unnecessary details so that the route is easier to ___.|follow|extend|conceal|close|abandon|The details were removed to make the route easier to trace.
One faulty entry was an ___ because the other readings formed a tight cluster.|outlier|average|reference|sequence|interval|An outlier lies unusually far from the other values.
`],
['Analogies', `
Chapter is to book as scene is to ___.|play|actor|theatre|stage|ticket|A chapter is a part of a book and a scene is a part of a play.
Thermometer is to temperature as stopwatch is to ___.|elapsed time|speed|distance|pressure|length|Each instrument measures the quantity paired with it.
Expand is to contract as tighten is to ___.|loosen|fasten|pull|hold|twist|Both pairs are opposites.
Author is to manuscript as composer is to ___.|score|instrument|concert|stage|audience|A manuscript and a score are the written products of these creators.
Map is to geography as timeline is to ___.|chronology|distance|direction|weather|height|A map arranges places and a timeline arranges events in time.
Beginner is to expert as shallow is to ___.|deep|wide|narrow|long|short|Each pair contrasts opposite ends of a scale.
Pedal is to bicycle as oar is to ___.|rowboat|road|train|dock|sailboat|Each is a means of manually propelling the paired vehicle.
Flour is to bread as clay is to ___.|pottery|glass|metal|rubber|cloth|The raw ingredient or material is used to make the product.
Question is to answer as request is to ___.|response|permission|order|problem|doubt|An answer responds to a question and a response addresses a request.
Orchard is to trees as library is to ___.|books|loans|shelves|rooms|visitors|Each place is primarily associated with a collection of the paired items.
Listen is to hear as look is to ___.|see|think|speak|turn|stand|The first is an intentional action and the second is the associated perception.
Wheel is to axle as door is to ___.|hinge|lock|knob|handle|panel|The axle and hinge provide the axis about which the paired object turns.
Litre is to volume as kilogram is to ___.|mass|area|force|pressure|speed|These are the quantities measured by the given units.
Cautious is to reckless as reserved is to ___.|outgoing|patient|watchful|quiet|thoughtful|Each first word contrasts with its pair.
Island is to archipelago as star is to ___.|constellation|orbit|comet|telescope|planet|An island is part of an island group and a star is part of a named star pattern.
Insulation is to heat transfer as a sound barrier is to ___.|noise transmission|air temperature|water pressure|ground movement|light reflection|Each barrier limits the associated transfer.
Draft is to final version as sketch is to ___.|finished drawing|eraser|blank paper|outline|pencil|The first item in each pair is a preliminary version.
Transparent is to opaque as permeable is to ___.|impermeable|flexible|absorbent|perforated|durable|The pairs contrast letting something pass with blocking it.
Ingredient is to recipe as component is to ___.|assembly|supplier|invoice|tool|scale|Each smaller element belongs to the larger group or plan.
Rehearsal is to performance as trial run is to ___.|full operation|equipment storage|a written agreement|routine cleaning|parts delivery|Each first activity is practice for the second.
`]
];
