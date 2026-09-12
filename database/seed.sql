-- LPU 3D Campus Navigator seed data
-- Source: LPU_Campus_Guide.xlsx supplied by the user.
-- The workbook itself says this is practical/user-supplied information and
-- not an official allocation chart. Exact current locations should be confirmed with LPU.

INSERT INTO facilities (name, description, icon) VALUES
('WiFi', 'Wi-Fi for academic use subject to policy.', 'wifi'),
('Washroom', 'Washroom facility.', 'toilet'),
('Elevator', 'Elevator access.', 'elevator'),
('Parking', 'Designated parking area.', 'parking'),
('Wheelchair Accessible', 'Accessibility feature.', 'accessibility'),
('Library', 'Library or study resource.', 'library'),
('Food Court', 'Food and seating area.', 'restaurant'),
('ATM', 'ATM / financial service access.', 'credit-card'),
('Printing', 'Printing, scanning or stationery service.', 'printer'),
('Laundry', 'Laundry service or arrangement.', 'shirt'),
('Salon', 'Haircut / salon service.', 'scissors'),
('Parcel Pickup', 'Courier / online-order pickup.', 'package'),
('Security', 'Security / CCTV / supervision.', 'shield'),
('Mess', 'Residential food/mess facility.', 'utensils'),
('Study Area', 'Common study or academic area.', 'book'),
('Recreation', 'Sports / recreation area.', 'activity'),
('AC / Air Cooler', 'AC or air-cooler by room selection.', 'wind'),
('Attached Washroom', 'Attached washroom in normal room categories.', 'bath'),
('Hot Water', 'Scheduled hot water in winter.', 'droplet'),
('Power Backup', 'Light-load power backup.', 'battery'),
('Warden Supervision', 'Warden/security supervision.', 'shield'),
('Common Study Space', 'Common study/recreation space.', 'book'),
('Gym', 'Optional paid gym access.', 'dumbbell')
ON CONFLICT (name) DO NOTHING;

INSERT INTO locations
(name, slug, type, description, short_description, block_code, model_object_id, source_type, source_details, confidence_level)
VALUES
('Block 1','block-1','academic','Fashion-related academic space used for design study, reference work, portfolio and project preparation.','Fashion','1','block-001','user_supplied','Academic blocks sheet','High within design'),
('Block 3','block-3','academic','Physiotherapy-related academic space used for physiotherapy learning and subject research.','Physiotherapy','3','block-003','user_supplied','Academic blocks sheet','High within health sciences'),
('Blocks 4 & 7','blocks-4-7','academic','Pharmacy / pharmaceutical sciences area used for study, library work and specialised academic activity.','Pharmacy / Pharmaceutical Sciences','4 & 7','blocks-004-007','user_supplied','Academic blocks sheet','High within pharmacy'),
('Block 6','block-6','academic','Architecture-related academic space used for design-oriented study and reference work.','Architecture','6','block-006','user_supplied','Academic blocks sheet','High within architecture'),
('Block 14','block-14','academic','Mittal School of Business. Used for business classes, presentations, case studies and team projects.','Mittal School of Business','14','block-014','user_supplied','Academic blocks sheet','Very high'),
('Block 15B','block-15b','academic','Hotel Management space used for hospitality-focused study and professional preparation.','Hotel Management','15B','block-015b','user_supplied','Academic blocks sheet','High within hospitality'),
('Block 18','block-18','academic','Education, physical education, social science and languages area.','Humanities / Education','18','block-018','user_supplied','Academic blocks sheet','High; broad humanities/education use'),
('Block 20','block-20','academic','Law, Arts and Animation area used for legal study, creative work, animation and arts projects.','Law / Arts / Animation','20','block-020','user_supplied','Academic blocks sheet','Very high for law and creative fields'),
('Blocks 25-27','blocks-25-27','academic','Shared academic corridor. Block 25 has hosted law; Block 27 is associated with physical sciences and chemical engineering.','Shared Academic Corridor','25-27','blocks-025-027','user_supplied','Academic blocks sheet','Very high'),
('Block 28','block-28','academic','Bioengineering and Biosciences historical association. Lecture rooms and labs for biology, genetics and related practical work.','Bioengineering / Biosciences','28','block-028','historical_association','Academic blocks sheet','High within biosciences'),
('Blocks 29-30','blocks-29-30','administrative','Administration and admissions area used for records, support, reporting and admissions visits.','Administration / Admissions','29-30','blocks-029-030','user_supplied','Academic blocks sheet','Very high for all students'),
('Block 32','block-32','academic','Human Resource Development Center. Used for workshops, research-methodology/software training and faculty development.','Human Resource Development Center','32','block-032','user_supplied','Academic blocks sheet','High for workshops'),
('Block 34','block-34','academic','Computer Science / Electronics IoT historical association. Used for workshops, startup pitches and technology/innovation activity.','Computer Science / Electronics IoT','34','block-034','historical_association','Academic blocks sheet','High for tech/innovation activity'),
('Block 37','block-37','library','Central Library used for studying, books, digital resources, research and exam preparation.','Central Library','37','block-037','user_supplied','Overview + Academic blocks sheet','Extremely high'),
('Block 55','block-55','academic','Mechanical Engineering area used for design, simulation, engineering software and workshops.','Mechanical Engineering','55','block-055','user_supplied','Academic blocks sheet','Very high for mechanical students'),
('Block 56','block-56','academic','Civil Engineering area used for structural work, civil software workshops, examinations and large academic activity.','Civil Engineering','56','block-056','user_supplied','Academic blocks sheet','Very high for civil students'),
('Blocks 57 / 57A','blocks-57-57a','academic','Polytechnic, engineering support, agriculture and food technology area used for hands-on/practical activity.','Polytechnic / Engineering / Agriculture / Food Technology','57 / 57A','blocks-057-057a','user_supplied','Academic blocks sheet','Very high'),
('UniMall / UniCentre','unimall-unicentre','commercial','Main mall, shopping, food, banking and services. Approx. Block 15, beside Baldev Raj Mittal Unipolis.','Main commercial hub','15','commercial-unimall','user_supplied','Commerce & food sheet','High'),
('UniMall parking / Food Square','unimall-food-square','food','Parking-side area around UniMall associated with food stalls and a newer food zone.','Food stalls / food zone',NULL,'commercial-food-square','user_supplied','Commerce & food sheet','Medium'),
('Campus Café food court','campus-cafe-food-court','food','Central campus food, coffee and hangout area between major academic areas.','Food court',NULL,'food-campus-cafe','user_supplied','Commerce & food sheet','Medium'),
('LIT Market','lit-market','commercial','Student-run kiosks and special food in the LIT-side market area.','Student-run kiosks and food',NULL,'market-lit','user_supplied','Commerce & food sheet','Medium'),
('Block 6 food court','block-6-food-court','food','Food court near Architecture Block 6 offering snacks and quick meals.','Snacks / quick meals','6','food-block-006','user_supplied','Commerce & food sheet','Medium'),
('Apartment food court','apartment-food-court','food','Food court near Block 41 / apartment residences for hosteller food and seating.','Hosteller food','41','food-apartment','user_supplied','Commerce & food sheet','Medium'),
('BH1 food court','bh1-food-court','food','Hostel-side food area in the Boys Hostel 1 zone.','Hostel food',NULL,'food-bh001','user_supplied','Commerce & food sheet','Medium'),
('BH2 food court','bh2-food-court','food','Hostel-side food area in the Boys Hostel 2 zone.','Hostel food',NULL,'food-bh002','user_supplied','Commerce & food sheet','Medium'),
('Hostel tuck shops','hostel-tuck-shops','commercial','Stationery, printing/scanning, essentials and snacks within or near hostel clusters.','Student essentials',NULL,'commercial-hostel-tuckshops','user_supplied','Commerce & food sheet','Medium'),
('BH1','bh1','residence','Boys Hostel 1. Beside Block 41 apartment cluster; kiosks reported behind BH1.','Boys Hostel 1',NULL,'hostel-bh001','user_supplied','Residences sheet','High'),
('BH2','bh2','residence','Boys Hostel 2. Near roller-skating rink and within the BH2-BH4 residential side.','Boys Hostel 2',NULL,'hostel-bh002','user_supplied','Residences sheet','High'),
('BH3','bh3','residence','Boys Hostel 3 in the BH2-BH4 cluster.','Boys Hostel 3',NULL,'hostel-bh003','user_supplied','Residences sheet','Medium'),
('BH4','bh4','residence','Boys Hostel 4 beside BH4 playgrounds; close to a hall and the GH1/GH2 court.','Boys Hostel 4',NULL,'hostel-bh004','user_supplied','Residences sheet','High'),
('BH5','bh5','residence','Boys Hostel 5 in the BH5/BH6 rear-side residential zone.','Boys Hostel 5',NULL,'hostel-bh005','user_supplied','Residences sheet','Medium'),
('BH6','bh6','residence','Boys Hostel 6 alongside the BH5 residential area.','Boys Hostel 6',NULL,'hostel-bh006','user_supplied','Residences sheet','Medium'),
('BH7','bh7','residence','Boys Hostel 7 in a separate hostel-side zone with dedicated parking/service access.','Boys Hostel 7',NULL,'hostel-bh007','user_supplied','Residences sheet','Low/medium'),
('BH8','bh8','residence','Historic BH building; no public landmark map was supplied.','Boys Hostel 8',NULL,'hostel-bh008','historical_association','Residences sheet','Low'),
('BH9-BH12','bh9-bh12','residence','Current public location unavailable in the supplied material; confirm in the allotment portal.','Boys Hostels 9-12',NULL,'hostel-bh009-bh012','unverified','Residences sheet','Unverified'),
('GH1','gh1','residence','Girls Hostel 1 beside the basketball court between GH1 and GH2.','Girls Hostel 1',NULL,'hostel-gh001','user_supplied','Residences sheet','High'),
('GH2','gh2','residence','Girls Hostel 2 in the GH1/GH2 court zone.','Girls Hostel 2',NULL,'hostel-gh002','user_supplied','Residences sheet','High'),
('GH3','gh3','residence','Girls Hostel 3 in a separate girls hostel zone with entry/parking reference.','Girls Hostel 3',NULL,'hostel-gh003','user_supplied','Residences sheet','Medium'),
('GH4','gh4','residence','Girls Hostel 4 in a girls hostel cluster; no public map pin provided.','Girls Hostel 4',NULL,'hostel-gh004','user_supplied','Residences sheet','Low'),
('GH5','gh5','residence','Girls Hostel 5 in the western-gate-side girls residential area.','Girls Hostel 5',NULL,'hostel-gh005','user_supplied','Residences sheet','Medium'),
('GH6','gh6','residence','Girls Hostel 6 near GH5 in the same western-side cluster.','Girls Hostel 6',NULL,'hostel-gh006','user_supplied','Residences sheet','Medium')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO vendors (location_id, name, category, description, source_type, source_details) VALUES
((SELECT id FROM locations WHERE slug='lit-market'),'Rolls Empire','student_run_food','Student-run rolls kiosk in LIT Market.','current_official_named_outlet','Commerce & food sheet'),
((SELECT id FROM locations WHERE slug='lit-market'),'Bokki Tokki','student_run_food','Student-run Korean-food kiosk in LIT Market.','current_official_named_outlet','Commerce & food sheet'),
((SELECT id FROM locations WHERE slug='unimall-unicentre'),'Student-run cafés/outlets','food_and_retail','Student-run food and retail startups reported in UniMall.','current_official_category','Commerce & food sheet'),
((SELECT id FROM locations WHERE slug='unimall-unicentre'),'Lovely Sweets','sweets_and_bakery','Reported bakery/sweets example; verify on arrival.','community_guide','Commerce & food sheet'),
((SELECT id FROM locations WHERE slug='unimall-unicentre'),'Lovely Bake Studio','sweets_and_bakery','Reported bakery example; verify on arrival.','community_guide','Commerce & food sheet'),
((SELECT id FROM locations WHERE slug='unimall-unicentre'),'Café Coffee Day','coffee_and_drinks','Reported coffee outlet example; verify on arrival.','community_guide','Commerce & food sheet'),
((SELECT id FROM locations WHERE slug='unimall-unicentre'),'Keventers','coffee_and_drinks','Reported drinks outlet example; verify on arrival.','community_guide','Commerce & food sheet'),
((SELECT id FROM locations WHERE slug='unimall-unicentre'),'Sachdeva Juice','coffee_and_drinks','Reported juice/drinks example; verify on arrival.','community_guide','Commerce & food sheet'),
((SELECT id FROM locations WHERE slug='unimall-unicentre'),'Arabica','coffee_and_drinks','Reported coffee/drinks example; verify on arrival.','community_guide','Commerce & food sheet'),
((SELECT id FROM locations WHERE slug='unimall-unicentre'),'Cafenea','coffee_and_drinks','Reported coffee/drinks example; verify on arrival.','community_guide','Commerce & food sheet'),
((SELECT id FROM locations WHERE slug='unimall-unicentre'),'Domino's','food','Reported food outlet example; verify on arrival.','community_guide','Commerce & food sheet'),
((SELECT id FROM locations WHERE slug='unimall-unicentre'),'Dosa Plaza','food','Reported food outlet example; verify on arrival.','community_guide','Commerce & food sheet'),
((SELECT id FROM locations WHERE slug='unimall-unicentre'),'Golden Wok','food','Reported food outlet example; verify on arrival.','community_guide','Commerce & food sheet'),
((SELECT id FROM locations WHERE slug='unimall-unicentre'),'Spicy Cuisine','food','Reported food outlet example; verify on arrival.','community_guide','Commerce & food sheet'),
((SELECT id FROM locations WHERE slug='campus-cafe-food-court'),'Oven Express','community_food','Reported community-guide food listing; verify on arrival.','community_guide','Commerce & food sheet'),
((SELECT id FROM locations WHERE slug='campus-cafe-food-court'),'Protein House','community_food','Reported community-guide food listing; verify on arrival.','community_guide','Commerce & food sheet'),
((SELECT id FROM locations WHERE slug='campus-cafe-food-court'),'JackedUp','community_food','Reported community-guide food listing; verify on arrival.','community_guide','Commerce & food sheet'),
((SELECT id FROM locations WHERE slug='campus-cafe-food-court'),'Momos Villa','community_food','Reported community-guide food listing; verify on arrival.','community_guide','Commerce & food sheet'),
((SELECT id FROM locations WHERE slug='campus-cafe-food-court'),'Cuplate','community_food','Reported community-guide food listing; verify on arrival.','community_guide','Commerce & food sheet'),
((SELECT id FROM locations WHERE slug='campus-cafe-food-court'),'Africana Food Café','community_food','Reported community-guide food listing; verify on arrival.','community_guide','Commerce & food sheet'),
((SELECT id FROM locations WHERE slug='campus-cafe-food-court'),'Eatwell','community_food','Reported community-guide food listing; verify on arrival.','community_guide','Commerce & food sheet'),
((SELECT id FROM locations WHERE slug='campus-cafe-food-court'),'Café Chocolate','community_food','Reported community-guide food listing; verify on arrival.','community_guide','Commerce & food sheet'),
((SELECT id FROM locations WHERE slug='campus-cafe-food-court'),'Froot Shoot','community_food','Reported community-guide food listing; verify on arrival.','community_guide','Commerce & food sheet'),
((SELECT id FROM locations WHERE slug='apartment-food-court'),'Go Go Food','community_food','Reported community-guide food listing; verify on arrival.','community_guide','Commerce & food sheet'),
((SELECT id FROM locations WHERE slug='apartment-food-court'),'Kitchen Garden','community_food','Reported community-guide food listing; verify on arrival.','community_guide','Commerce & food sheet'),
((SELECT id FROM locations WHERE slug='apartment-food-court'),'Rizq Kitchen','community_food','Reported community-guide food listing; verify on arrival.','community_guide','Commerce & food sheet'),
((SELECT id FROM locations WHERE slug='apartment-food-court'),'Kitchen Ette','community_food','Reported community-guide food listing; verify on arrival.','community_guide','Commerce & food sheet'),
((SELECT id FROM locations WHERE slug='apartment-food-court'),'Juice Bar','community_food','Reported community-guide food listing; verify on arrival.','community_guide','Commerce & food sheet'),
((SELECT id FROM locations WHERE slug='bh1-food-court'),'Oven Express','community_food','Reported community-guide food listing; verify on arrival.','community_guide','Commerce & food sheet'),
((SELECT id FROM locations WHERE slug='bh1-food-court'),'GCF Chaap','community_food','Reported community-guide food listing; verify on arrival.','community_guide','Commerce & food sheet'),
((SELECT id FROM locations WHERE slug='bh1-food-court'),'SK Food','community_food','Reported community-guide food listing; verify on arrival.','community_guide','Commerce & food sheet'),
((SELECT id FROM locations WHERE slug='bh1-food-court'),'SS Food Hut','community_food','Reported community-guide food listing; verify on arrival.','community_guide','Commerce & food sheet'),
((SELECT id FROM locations WHERE slug='bh1-food-court'),'Gurudev','community_food','Reported community-guide food listing; verify on arrival.','community_guide','Commerce & food sheet'),
((SELECT id FROM locations WHERE slug='bh1-food-court'),'Andhra Food House','community_food','Reported community-guide food listing; verify on arrival.','community_guide','Commerce & food sheet'),
((SELECT id FROM locations WHERE slug='bh1-food-court'),'Paratha Corner','community_food','Reported community-guide food listing; verify on arrival.','community_guide','Commerce & food sheet'),
((SELECT id FROM locations WHERE slug='bh1-food-court'),'Twelve Tables','community_food','Reported community-guide food listing; verify on arrival.','community_guide','Commerce & food sheet'),
((SELECT id FROM locations WHERE slug='bh2-food-court'),'Pizza Express','community_food','Reported community-guide food listing; verify on arrival.','community_guide','Commerce & food sheet'),
((SELECT id FROM locations WHERE slug='bh2-food-court'),'Govind Food Corner','community_food','Reported community-guide food listing; verify on arrival.','community_guide','Commerce & food sheet'),
((SELECT id FROM locations WHERE slug='bh2-food-court'),'Tandoori Flames','community_food','Reported community-guide food listing; verify on arrival.','community_guide','Commerce & food sheet'),
((SELECT id FROM locations WHERE slug='bh2-food-court'),'Hangouts','community_food','Reported community-guide food listing; verify on arrival.','community_guide','Commerce & food sheet'),
((SELECT id FROM locations WHERE slug='bh2-food-court'),'Kikeez Parathas','community_food','Reported community-guide food listing; verify on arrival.','community_guide','Commerce & food sheet'),
((SELECT id FROM locations WHERE slug='bh2-food-court'),'Campus Fusion','community_food','Reported community-guide food listing; verify on arrival.','community_guide','Commerce & food sheet'),
((SELECT id FROM locations WHERE slug='bh2-food-court'),'PJ Foods','community_food','Reported community-guide food listing; verify on arrival.','community_guide','Commerce & food sheet'),
((SELECT id FROM locations WHERE slug='bh2-food-court'),'Mast Punjabi','community_food','Reported community-guide food listing; verify on arrival.','community_guide','Commerce & food sheet'),
((SELECT id FROM locations WHERE slug='bh2-food-court'),'Protein House','community_food','Reported community-guide food listing; verify on arrival.','community_guide','Commerce & food sheet'),
((SELECT id FROM locations WHERE slug='bh2-food-court'),'Bawarchi','community_food','Reported community-guide food listing; verify on arrival.','community_guide','Commerce & food sheet'),
((SELECT id FROM locations WHERE slug='bh2-food-court'),'Chinese Eatery','community_food','Reported community-guide food listing; verify on arrival.','community_guide','Commerce & food sheet'),
((SELECT id FROM locations WHERE slug='bh2-food-court'),'Thali Wala','community_food','Reported community-guide food listing; verify on arrival.','community_guide','Commerce & food sheet'),
((SELECT id FROM locations WHERE slug='bh2-food-court'),'Talk of the Town','community_food','Reported community-guide food listing; verify on arrival.','community_guide','Commerce & food sheet'),
((SELECT id FROM locations WHERE slug='bh2-food-court'),'Fortune','community_food','Reported community-guide food listing; verify on arrival.','community_guide','Commerce & food sheet'),
((SELECT id FROM locations WHERE slug='bh2-food-court'),'Vascos','community_food','Reported community-guide food listing; verify on arrival.','community_guide','Commerce & food sheet');

INSERT INTO campus_notes (title, category, content, source_type) VALUES
('LPU Campus Guide accuracy note','important_limitation','The workbook says it is a practical, user-supplied guide and not an official allocation chart.','user_supplied'),
('Current allocation authority','authority','Use the LPU allotment portal and Residential Facility office for current hostel allocation information.','user_supplied'),
('Block 56 floor note','important_limitation','The workbook says Block 56 is documented as having an eighth level, but that does not prove its total number of floors.','user_supplied'),
('BH9-BH12 location note','important_limitation','Exact hostel rooms/floors and current locations require confirmation in the allotment portal.','user_supplied'),
('Community food guide note','important_limitation','Community food-guide names are unverified and may have changed.','community_guide'),
('Food policy note','policy','The workbook states that LPU campus policy is vegetarian and non-veg is prohibited; confirm any boundary/outside option locally.','institutional_reference_named_in_workbook'),
('Mess','essential_service','Mess is primarily in or near residential/hostel areas.','user_supplied'),
('ATMs','essential_service','ATMs are reported around UniMall, hostels and other high-footfall areas; the workbook references 50+ campus ATMs.','institutional_reference_named_in_workbook'),
('Printing / scanning / stationery','essential_service','Reported at hostel tuck shops and UniMall.','user_supplied'),
('Haircut / salon','essential_service','Reported at UniMall.','user_supplied'),
('Laundry','essential_service','Washing Basket and hostel-linked arrangements are referenced.','user_supplied'),
('Parcel pickup','essential_service','Courier and online-order pickup is reported at UniMall.','user_supplied'),
('Residential amenities','residential','Separate boys' and girls' accommodation; bed, study table, chair and almirah; mattress except some dormitory-style categories; AC or air-cooler by room selection; attached washroom in normal room categories; scheduled hot water in winter; academic Wi-Fi subject to policy; light-load power backup; security/CCTV/warden supervision; vegetarian mess access; laundry and maintenance support; hospital and ambulance support; common study/recreation spaces; optional paid gym; designated parking only.','user_supplied');

INSERT INTO chatbot_documents (title, content, source_type, is_verified) VALUES
('Campus overview','The supplied guide identifies Block 37 as the Central Library, UniMall / UniCentre around Block 15 as the central commercial hub, Blocks 55-57A as a core practical zone, and Blocks 25-29 as a central academic/administrative movement zone.','campus_guide',FALSE),
('Academic areas','The supplied guide associates Block 14 with Mittal School of Business, Block 20 with Law, Arts and Animation, Block 28 with Biosciences, Block 34 with Computer Science / Electronics IoT historical association, Block 55 with Mechanical Engineering, Block 56 with Civil Engineering, and Blocks 57 / 57A with Polytechnic, engineering support, agriculture and food technology.','campus_guide',FALSE),
('Residential information','The supplied guide describes boys and girls hostel categories, standard rooms, apartments, studio apartments, large-sharing rooms and smaller-sharing options. Exact current allocations should be confirmed through official LPU sources.','campus_guide',FALSE);

-- Major facility mappings
INSERT INTO location_facilities (location_id, facility_id)
SELECT l.id, f.id FROM locations l CROSS JOIN facilities f
WHERE l.slug='block-37' AND f.name IN ('Library','Study Area');

INSERT INTO location_facilities (location_id, facility_id)
SELECT l.id, f.id FROM locations l CROSS JOIN facilities f
WHERE l.slug='unimall-unicentre' AND f.name IN ('Food Court','ATM','Printing','Parcel Pickup','Salon');

INSERT INTO location_facilities (location_id, facility_id)
SELECT l.id, f.id FROM locations l CROSS JOIN facilities f
WHERE l.type='residence' AND f.name IN ('Security','Mess');

-- No fake route data here. Add actual nodes/edges after the 3D map is ready.
