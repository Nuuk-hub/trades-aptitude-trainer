/* Each set shares a reference. The first choice on each row is the key. */
const technicalScenarios = [
['Gauge calibration', 'CAL-4', 'Apply the first matching rule:\n• A cracked display goes to Repair.\n• A reading more than 2 units from the reference goes to Recalibration.\n• Otherwise the gauge passes. Apply a green label and enter the reference reading in the log.\nUse the absolute difference. A difference of exactly 2 units is within tolerance.', [
['An undamaged gauge displays 48 against a reference of 50. Where does it go?','Pass|Repair|Recalibration|Storage without a result|Return to supplier','The difference is exactly 2 units and therefore within tolerance.'],
['A cracked gauge displays 50 against a reference of 50. What is the disposition?','Repair|Pass|Recalibration|Green label only|No action','A cracked display triggers the first rule regardless of the reading.'],
['An undamaged gauge displays 53 against a reference of 50. What action applies?','Send it to Recalibration|Send it to Repair|Apply a green label|Log a pass|Replace the display','The difference is 3 units, which is above the tolerance.'],
['An undamaged gauge passes after showing 51 against a reference of 50. What reading goes in the log?','50|51|1|2|101','For a passing gauge, enter the reference reading of 50.'],
['Which label goes on a passing gauge?','Green|Yellow|Blue|White|No label','The final rule specifies a green label for a pass.']
]],
['Bin routing', 'BIN-3', 'Use the largest outside dimension to choose a lane.\n0–20 cm inclusive → A\nOver 20 cm through 45 cm inclusive → B\nOver 45 cm → C\nException: any tote marked FRAGILE goes to hand sorting regardless of size. An unreadable size marking goes to the measurement bench before lane assignment.',[
['A regular tote measures 18 × 20 × 12 cm. Which lane applies?','A|B|C|Hand sorting|Measurement bench','Its largest dimension is exactly 20 cm, the inclusive limit for lane A.'],
['A regular tote measures 45 × 19 × 14 cm. Which lane applies?','B|A|C|Hand sorting|Measurement bench','The largest dimension is exactly 45 cm, which is within lane B.'],
['A 55 cm tote is marked FRAGILE. Where does it go?','Hand sorting|Lane A|Lane B|Lane C|Measurement bench','The FRAGILE exception overrides the size lanes.'],
['A regular tote has an unreadable size marking. Where does it go first?','Measurement bench|Lane A|Lane B|Lane C|Hand sorting','The size must be verified before the tote can be assigned a lane.'],
['A regular tote measures 16 × 46 × 19 cm. Which lane applies?','C|A|B|Hand sorting|Measurement bench','The largest dimension is 46 cm, which exceeds the upper limit of B.']
]],
['Inspection records', 'REC-8', 'Enter INSPECTED after the checklist has been completed. Enter RELEASED only when the checklist is complete and the supervisor has signed. If any item fails, enter HOLD and list the failed item. A HOLD overrides both INSPECTED and RELEASED. The inspector initials every entry.',[
['The checklist is complete, there are no failures, and the signature is pending. What status applies?','INSPECTED|RELEASED|HOLD|CANCELLED|ARCHIVED','The complete checklist qualifies for INSPECTED. Release also requires the signature.'],
['A signed checklist includes one failed item. Which status takes priority?','HOLD|RELEASED|INSPECTED|ARCHIVED|PENDING SIGNATURE','A failed item triggers HOLD even if the checklist is signed.'],
['A job is on HOLD. What information must be written in addition to the status and initials?','The failed item|The supervisor’s home address|The next shift’s checklist|The release date|The job’s purchase price','For a HOLD, the procedure requires listing the failed item.'],
['What condition is required in addition to completion of a passing checklist to mark RELEASED?','Supervisor signature|A second blank checklist|A new job number|Inspector reassignment|A failed item','Release requires a completed passing checklist and a supervisor signature.'],
['Whose initials must appear on every entry?','The inspector’s|The supervisor’s|The supplier’s|The customer’s|The apprentice’s','The final sentence assigns this task to the inspector.']
]],
['Water sample labels', 'LAB-6', 'Use a blue label for a source sample, a white label for a treated sample, and an orange label for a duplicate. A duplicate uses orange even if taken from a treated source. Every label requires the time and station code. If the station code is unknown, set the bottle in the pending tray and leave the code blank.',[
['Which label does a treated sample use when it is also a duplicate?','Orange|White|Blue|Green|No label','The duplicate rule overrides the treated-sample rule.'],
['A source sample is the original, and its station is known. What label applies?','Blue|Orange|White|Green|No label','Blue is specified for a source sample without the duplicate exception.'],
['Where does a bottle go when its station code is unknown?','Pending tray|Treated rack|Duplicate rack|Dispatch tray|Archive shelf','The procedure sends an unknown station code to the pending tray.'],
['For a known station, which two fields must every label contain?','Time and station code|Date and volume|Station code and volume|Time and rack number|Name and bottle size','The time and station code are required on every label.'],
['The station code is unknown. What is entered in the code field?','Nothing|The previous station code|The bottle number|The time|The word TREATED','The exception explicitly says to leave the field blank.']
]],
['Bench allocation', 'BEN-2', 'For each reservation, read the job category:\nAssembly → benches 1–3\nMeasurement → benches 4–5\nTraining → benches 6–8\nChoose the lowest available bench within the category. If all are full, wait-list the job. A job marked DEMO always uses bench 8 if available and otherwise goes on the wait list.',[
['Benches 1 and 3 are free. Which bench takes a regular assembly job?','1|2|3|4|8','Choose the lowest free bench in the assembly range.'],
['Only benches 2 and 6 are free. What happens to a regular measurement job?','Wait-list it|Assign bench 2|Assign bench 6|Assign bench 8|Assign bench 1','Only benches 4 and 5 qualify. Neither is free.'],
['A measurement job is marked DEMO. Bench 4 and bench 8 are free. Where does it go?','8|4|5|6|Wait list','DEMO overrides the normal category.'],
['A training job is marked DEMO. Bench 6 is free and bench 8 is full. What happens?','Wait-list it|Assign bench 6|Assign bench 7|Assign bench 5|Assign bench 3','DEMO reservations can use only bench 8.'],
['Benches 5, 7 and 8 are free. Where does a regular training job go?','7|5|8|6|Wait list','Of the free training benches, bench 7 has the lowest number.']
]],
['Document approvals', 'DOC-7', 'Prepare a draft, obtain one peer review, then assign a version number. Publishing requires a version number and the lead’s approval. Spelling-only edits to an already published document retain its version number and still need the lead’s approval. Any change to a measurement must go through the full sequence.',[
['What comes immediately after drafting a new document?','Peer review|Assign a version number|Publishing|Lead approval|Archiving','The sequence puts peer review between drafting and assigning a version.'],
['Which requirement still applies to a spelling-only edit of a published document?','Lead approval|A new version number|A new peer review|Withdrawal of the document|A change to a measurement','Spelling-only edits retain the version and still need the lead’s approval.'],
['What route does a correction to a stated measurement follow?','The full sequence|The spelling-only route|Immediate publication|Approval after publication|Archiving only','The measurement-change rule requires the full sequence.'],
['A new document has a version number but no lead approval. What is missing before publication?','Lead approval|A second version number|A spelling edit|An archive number|A copy of the last edition','Publishing requires both a version number and the lead’s approval.'],
['Which action belongs between peer review and publication for a new document?','Assign a version number|Prepare the initial draft|Erase the measurement|Remove the lead approval|Destroy the review','The version is assigned after peer review and before publishing.']
]],
['Parts priority', 'Q-5', 'Orders tagged urgent are filled first, followed by routine orders. Within the same priority, fill the earliest received order first. An order with an incomplete part number moves to the clarification queue and keeps its original arrival time when corrected.',[
['Routine J arrived at 09:00. Urgent K arrived at 10:00. Both are complete. Which is filled first?','K|J|Both simultaneously|Neither|The one with more parts','Urgent priority is considered before arrival time.'],
['Urgent P arrived at 09:15 and urgent R at 09:05. Both are complete. Which is filled first?','R|P|Both together|Neither|The one with fewer parts','Among orders of the same priority, use the earlier arrival time.'],
['An urgent order has an incomplete part number. Where does it go?','Clarification queue|Front of the urgent queue|End of the routine queue|Dispatch area|Completed orders','An incomplete part number requires clarification regardless of priority.'],
['An order arrived at 09:00 and was corrected at 10:00. What arrival time is used after correction?','09:00|10:00|09:30|The next shift start|The print time','The order retains its original arrival time.'],
['Urgent A at 08:30 needs clarification. Routine B at 08:45 and urgent C at 09:00 are complete. Which eligible order comes first?','C|A|B|A and B together|All three together','A is in clarification. C has higher priority than the eligible routine order.']
]],
['Storage conditions', 'STO-9', 'Store sealant between 5°C and 25°C inclusive. Store adhesive between 10°C and 20°C inclusive. Keep absorbent pads on a dry shelf at any temperature. If no eligible shelf is available, label the item WAIT and leave it on the receiving cart.',[
['Which material is eligible for a 6°C shelf if the shelf is damp?','Sealant|Adhesive|Absorbent pads|All three|None','Sealant is within its temperature range. Adhesive is too cold and the pads require a dry shelf.'],
['Which temperature is within the allowed range for both sealant and adhesive?','20°C|4°C|8°C|22°C|26°C','20°C is the inclusive adhesive limit and is also within the sealant range.'],
['The only available shelf for pads is dry and 3°C. What action applies?','Store the pads on that shelf|Label the pads WAIT|Ask for a warmer shelf|Use a damp shelf instead|Place the pads with adhesive on the cart','Dry shelves at any temperature qualify for the pads.'],
['No eligible shelf is available. Where is the item left after labelling it WAIT?','Receiving cart|Nearest damp shelf|Dispatch counter|Any empty shelf|Archive cabinet','The procedure sends items without an eligible shelf to the receiving cart.'],
['The only shelf is 25°C. Which material meets its stated temperature requirement exactly at the upper limit?','Sealant|Adhesive|Absorbent pads|All three|None','25°C is the sealant limit. Adhesive has a lower limit and pads have no temperature limit.']
]]
];
