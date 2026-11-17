/* Kept in the same order as the ten diagram families in bank.js. */
const mechanicalConcepts = [
[
 ['If the left force stays fixed and the right force is moved closer to the pivot, what must happen to the right force to maintain balance?','Increase|Decrease|Stay the same|Drop to zero|Reverse direction','A shorter moment arm requires a larger force for the same torque.'],
 ['If A and B both apply the force shown at A, which side moves down?','B, because its moment arm is longer|A, because its moment arm is shorter|Neither, because the forces match|A, because its moment arm is longer|B, because its force is larger','Equal forces produce different moments. B has the longer arm.'],
 ['If the right force is removed, which motion results from the force at A?','A moves down and B moves up|Both ends move down|A moves up and B moves down|The beam slides to the right|Both ends stay level','The downward force left of the pivot rotates the beam so the left end drops.'],
 ['From balance, both forces double at the same positions. What happens?','The beam stays balanced|A drops|B drops|Both arms get shorter|Both arms get longer','Both opposing moments double, so they remain equal.']
],
[
 ['Gear A turns clockwise as viewed in the diagram. Which describes gear B?','Counterclockwise and slower|Clockwise and slower|Counterclockwise and faster|Clockwise and faster|Clockwise at the same speed','External gears reverse direction. The larger gear turns more slowly.'],
 ['One full revolution of gear B requires how many full revolutions of gear A?','Two|One half|One|Three|Four','B has twice the tooth count of A. Two A revolutions advance enough teeth to turn B once.'],
 ['A second gear identical to A is driven by B on B’s right. Compared with A, how does this third gear turn?','Same speed and direction|Same speed, opposite direction|Half the speed, same direction|Half the speed, opposite direction|Double the speed, opposite direction','The two meshes reverse direction twice. Equal first and last tooth counts give equal speeds.'],
 ['At the point where the two gears mesh, what matches?','The tangential speeds of the contacting teeth|The angular speeds of the shafts|The diameters of the gears|The directions of shaft rotation|The number of teeth on the gears','Contacting teeth move together at the mesh, giving equal tangential speeds.']
],
[
 ['A turns clockwise. Viewed from the same side, how does B rotate with this open belt?','Clockwise, more slowly|Counterclockwise, more slowly|Clockwise, more quickly|Counterclockwise, more quickly|It does not rotate','An open belt preserves rotation direction. B is larger and must rotate more slowly.'],
 ['If a crossed belt replaces the open belt and there is still no slip, what changes?','B reverses direction and keeps its speed magnitude|B keeps its direction and doubles its speed|B keeps its direction and halves its speed|B stops while A keeps turning|B reverses direction and triples its speed','Crossing the belt reverses the driven pulley. The pulley diameters still set the speed ratio.'],
 ['How far does the belt move in one rotation of pulley A?','One circumference of A|One radius of A|One diameter of B|Three circumferences of B|Half a circumference of A','With no slip, each complete rotation advances the belt by the rim circumference.'],
 ['If B is replaced by a pulley the same size as A, what happens to the ratio of B’s speed to A’s speed?','It rises to 1:1|It falls to 1:6|It stays 1:3|It changes to 3:1|It changes to 2:1','Equal diameters and equal rim speeds give equal rotational speeds.']
],
[
 ['What happens to the average pressure if the same block is placed on a face with half the contact area?','It doubles|It halves|It stays the same|It quadruples|It drops to zero','Pressure is force divided by area. Halving the area doubles pressure when force is fixed.'],
 ['A second identical block is stacked on top. What happens to the pressure at the surface?','It doubles|It halves|It stays the same|It becomes one quarter|It becomes four times as high','The load doubles while the bottom contact area stays the same.'],
 ['What change reduces the pressure while keeping the same total downward force?','Increase the contact area|Reduce the contact area|Tilt onto an edge|Remove half the base area|Press down through a narrower foot','Distribute the same force over a greater area to reduce pressure.'],
 ['One new block has twice the weight and twice the base area of the block shown. How does its base pressure compare?','It is equal|It is half as large|It is twice as large|It is four times as large|It is one quarter as large','Both force and area double, so their ratio is unchanged.']
],
[
 ['To move piston B a short distance up, how far must piston A move down?','Farther than B moves up|The same distance B moves up|Less far than B moves up|Piston A must move up|Piston A must remain still','The displaced volumes must match. The smaller piston needs a greater travel distance.'],
 ['If the area of piston B doubles and the force on A stays fixed, what happens to the force on B?','It doubles|It halves|It remains the same|It becomes four times as great|It drops to zero','The pressure stays the same. Doubling output area doubles output force.'],
 ['How do the piston face pressures compare at the same height in a stationary ideal fluid?','They are equal|Pressure at A is higher|Pressure at B is higher|Pressure at B is zero|Pressure at A is zero','Fluid pressure is transmitted equally at the same height when losses are neglected.'],
 ['What changes if the two pistons have equal area?','The ideal output force equals the input force|The output force must be zero|The output force doubles|The input force must act upwards|The fluid can no longer transmit pressure','Equal fluid pressures acting on equal areas give equal forces.']
],
[
 ['A second frictionless ramp reaches the same height but is longer. How does the force needed at constant speed compare?','Less force over a longer distance|More force over a longer distance|The same force over a shorter distance|Less force over the same distance|More force over a shorter distance','The same lift takes the same ideal work. A longer ramp requires less force.'],
 ['Compared with lifting the crate vertically to the same height, how much ideal work does the ramp require?','The same work|Half as much work|Four times as much work|One quarter as much work|No work','With no friction, the work depends only on the weight and vertical height gained.'],
 ['While the crate moves uphill at constant speed, what is its net force along the ramp?','Zero|Equal to the crate weight|Equal to twice the pulling force|Equal to the downhill force alone|Equal to the uphill force alone','Constant velocity means no acceleration, so the opposing forces along the ramp balance.'],
 ['If friction is added while the crate still moves uphill at constant speed, what happens to the required pulling force?','It increases|It decreases|It vanishes|It reverses direction|It remains exactly the same','Friction acts downhill during the uphill motion. The pull must overcome it in addition to gravity along the ramp.']
],
[
 ['How far must the free end move to lift the load by 10 cm?','20 cm|5 cm|10 cm|30 cm|40 cm','Each of the two supporting segments shortens by 10 cm, so 20 cm of rope must be pulled through.'],
 ['What is the main purpose of the upper fixed pulley in this arrangement?','Let the user pull down to lift the load|Double the number of load-supporting strands|Make the rope tension zero overhead|Keep the moving pulley from rotating|Increase the weight on the lower pulley','The fixed pulley redirects the free end. The lower pulley receives the support from the two strands.'],
 ['Which supports the moving pulley?','Two upward pulls from the supporting rope segments|One upward pull from the free end only|The horizontal bar directly|Two downward rope pulls|A push up from beneath the load','Both strands leaving the moving pulley pull upwards.'],
 ['If the load doubles in this ideal setup, what happens to the holding force?','It doubles|It halves|It stays the same|It increases fourfold|It becomes zero','The two supporting segments still share the load equally, so each tension doubles.']
],
[
 ['Ignoring friction, which way does the block accelerate?','Right|Left|Up|Down|It does not accelerate','The rightward force is larger than the leftward force.'],
 ['Where should an additional horizontal force act to cancel the net horizontal force?','To the left|To the right|Upward|Downward|Perpendicular to the diagram','The existing net force points right. An equal additional force must point left.'],
 ['If both horizontal forces increase by 5 N, what happens to the net horizontal force?','It stays the same|It rises by 5 N|It drops by 5 N|It rises by 10 N|It drops to zero','Adding the same amount to both opposing forces leaves their difference unchanged.'],
 ['With the same two forces and no friction, a block of twice the mass has what acceleration?','Half as much to the right|Twice as much to the right|The same acceleration to the right|Half as much to the left|Zero acceleration','Acceleration equals net force divided by mass. The net force still acts to the right.']
],
[
 ['For either spring in its linear range, what does a plot of extension against force look like?','A straight line through the origin|A horizontal line above zero|A vertical line|A circle|A curve whose slope continually increases','Proportionality gives a straight line through zero.'],
 ['Both loads are removed without exceeding the springs’ elastic limit. What happens?','Both return to their unloaded lengths|Only the left spring returns|Only the right spring returns|Both retain their full extensions|Both extend farther','Below the elastic limit, the springs recover their unloaded lengths.'],
 ['If a stiffer spring replaces the left spring, how does its extension change under the same force?','It becomes smaller|It becomes larger|It stays the same|It is always exactly doubled|It becomes twice the right extension','Extension is force divided by spring stiffness. A stiffer spring stretches less under the same force.'],
 ['If the right force is halved, still within the linear range, its extension becomes what fraction of its current extension?','One half|One quarter|Two thirds|Three quarters|Twice as much','Extension is proportional to the applied force.']
],
[
 ['Viewed as drawn, in which direction does the force tend to rotate the wrench about the bolt?','Clockwise|Counterclockwise|It has no turning effect|It rotates out of the page|It rotates into the page','A downward force applied to the right of the pivot gives a clockwise moment.'],
 ['Which change produces the same torque magnitude with half the applied force?','Double the distance from the bolt|Halve the distance from the bolt|Apply it at the bolt centre|Turn the force parallel to the handle|Keep the same distance and orientation','Torque equals perpendicular force times moment arm. Doubling the arm offsets halving the force.'],
 ['Which direction of pull gives zero torque when applied at the same point?','Along the handle toward the bolt centre|Straight down|Straight up|At 45° above the handle|At 45° below the handle','A force whose line of action passes through the pivot has zero moment arm.'],
 ['If the force arrow reverses while its magnitude and position remain fixed, what happens?','Same torque magnitude, opposite direction|Half the magnitude, same direction|Double the magnitude, opposite direction|Same magnitude, same direction|No torque remains','Reversing the force reverses the rotational tendency while keeping the moment arm and force magnitude.']
]
];
