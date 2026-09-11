// Comprehensive Verified Lovely Professional University Campus Knowledge Base & Query Engine

export interface CampusKnowledgeEntry {
  id: string;
  category: 'academic' | 'food' | 'service' | 'hostel' | 'sports' | 'emergency' | 'admin' | 'transport';
  keywords: string[];
  patterns?: RegExp[];
  title: string;
  reply: string;
  actionLocationId?: string;
  actionType?: 'navigate' | 'indoor' | 'focus';
  quickReplies?: string[];
}

export const LPU_KNOWLEDGE_BASE: CampusKnowledgeEntry[] = [
  // ==========================================
  // LOVELY SWEETS & BAKE STUDIO
  // ==========================================
  {
    id: 'food-lovely-sweets',
    category: 'food',
    keywords: ['sweets', 'bakery', 'lovely sweets', 'lovely bake studio', 'pastry', 'cake', 'birthday cake', 'mithai', 'dessert'],
    title: 'Lovely Sweets & Lovely Bake Studio (UniMall)',
    reply: `🎂 **Lovely Sweets & Lovely Bake Studio** is located on the **Ground Floor of UniMall** [Block 15].
• **Timings:** 09:00 AM – 09:30 PM (Daily)
• **Specialties:** Authentic traditional sweets, customized celebratory birthday cakes for hostellers, fresh pastries, patties, and artisanal breads.
• **Service:** On-campus birthday cake delivery to hostel reception desks!`,
    actionLocationId: 'b-15-unimall',
    actionType: 'navigate',
    quickReplies: ['Navigate to UniMall', 'UniMall food options', 'Show Central Library'],
  },
  {
    id: 'salon-query',
    category: 'service',
    keywords: ['salon', 'haircut', 'barber', 'saarsh'],
    title: 'Grooming & Salon Information',
    reply: `✂️ **Grooming Information:** Note that there is no "Saarsh Salon" inside the LPU campus. For personal grooming, haircuts, and salons, students typically use established barbers and salons at Law Gate / GT Road commercial markets right outside Gate 1. Inside UniMall, verified student stores include **Lovely Bake Studio & Sweets**, **WH Smith Bookstore**, **Titan Eye+**, **Campus Pharmacy**, **Banking/ATMs**, and the **Central Food Court**.`,
    actionLocationId: 'b-15-unimall',
    actionType: 'navigate',
    quickReplies: ['UniMall shops', 'Where is Gate 1 (GT Road)?', 'Uni-Hospital Pharmacy'],
  },

  // ==========================================
  // FOOD, DINING & CAFES
  // ==========================================
  {
    id: 'food-unimall',
    category: 'food',
    keywords: ['food', 'eat', 'dinner', 'lunch', 'breakfast', 'canteen', 'unimall food', 'dominos', 'subway', 'ccd', 'dosa plaza', 'baskin robbins', 'chatkazz', 'pizza', 'burger', 'hungry'],
    title: 'UniMall Central Food Court',
    reply: `🍔 **UniMall Central Food Court (Ground Floor)** is the primary commercial dining hub on campus:
• **Top Outlets:** Domino's Pizza, Subway Fresh, Café Coffee Day (CCD), Dosa Plaza, Baskin Robbins, and Chatkazz.
• **Hours:** 09:00 AM – 10:30 PM
• **Payment:** Cashless campus card, UPI, debit/credit cards accepted everywhere.
• You can also find high-speed Wi-Fi and indoor seating for 500+ students.`,
    actionLocationId: 'b-15-unimall',
    actionType: 'navigate',
    quickReplies: ['Navigate to UniMall', 'Tell me about LIT Market food', 'Where is Nescafe?'],
  },
  {
    id: 'food-lit-market',
    category: 'food',
    keywords: ['lit market', 'korean', 'bokki', 'tokki', 'rolls empire', 'shawarma', 'momos', 'tuck shop', 'street food', 'kiosk'],
    title: 'LIT Market Student Food Hub (Block 18 & 20)',
    reply: `🍜 **LIT Market** (beside Blocks 18 & 20 Law & Journalism):
• Famous student-driven startup culinary street featuring:
  - **Bokki Tokki:** Authentic Korean street food (Tteokbokki, K-Corn Dogs, Ramen).
  - **Rolls Empire:** Kathi rolls, Paneer tikka wraps, and egg rolls.
  - Fresh fruit juice and waffle stalls.
• **Vibe:** Highly popular evening hangout for hostellers after 5:00 PM.`,
    actionLocationId: 'b-18-20',
    actionType: 'navigate',
    quickReplies: ['Navigate to LIT Market', 'Where is Block 18?', 'UniMall food options'],
  },
  {
    id: 'food-bh-food-street',
    category: 'food',
    keywords: ['bh food', 'hostel food', 'night canteen', 'bh1 food', 'bh2 food', 'late night', 'midnight snack', 'maggi'],
    title: 'Boys Hostel Food Court & Night Canteen',
    reply: `🌙 **Boys Hostel Food Square (Near BH-1 & BH-2)**:
• Features late-night eateries, juice corners, Maggi points, and tandoori paratha kiosks.
• **Night Canteen Hours:** Open until 01:00 AM for hostellers studying late or ordering midnight snacks.
• Located adjacent to the open roller-skating rink.`,
    actionLocationId: 'bh-1-2',
    actionType: 'navigate',
    quickReplies: ['Navigate to BH Food Square', 'Hostel curfew timings', 'UniMall food options'],
  },

  // ==========================================
  // COMPUTER SCIENCE & TECH (BLOCK 33/34)
  // ==========================================
  {
    id: 'acad-cse',
    category: 'academic',
    keywords: ['cse', 'computer science', '34', '33', 'block 34', 'block 33', 'software', 'ai lab', 'coding', 'programming', 'data science', 'b.tech cse'],
    title: 'School of Computer Science & Engineering (Blocks 33 & 34)',
    reply: `💻 **School of Computer Science & Engineering (Blocks 33 & 34)**:
• **Hub:** LPU's premier computing facility with 40+ high-end computer laboratories.
• **Key Labs:**
  - **AI Research & Deep Learning Lab 203** (1st Floor)
  - **Systems & Cloud Computing Lab** (2nd Floor)
  - **Cisco Networking Academy & Software Architecture Hall 201**
• **Facilities:** Multi-floor indoor turn-by-turn guidance available, ground-floor Nescafe kiosk, and express printing desk.`,
    actionLocationId: 'b-33-34',
    actionType: 'indoor',
    quickReplies: ['Open Block 34 Indoor Blueprint', 'Walk to Block 34', 'Where is Central Library?'],
  },

  // ==========================================
  // CENTRAL LIBRARY (BLOCKS 36-38)
  // ==========================================
  {
    id: 'service-library',
    category: 'service',
    keywords: ['library', 'central library', 'books', 'reading hall', 'study room', 'quiet', 'borrow book', 'rfid', '36', '37', '38', 'block 36', 'block 38'],
    title: 'Central Library & Knowledge Hub (Blocks 36–38)',
    reply: `📚 **LPU Central Library (Blocks 36, 37 & 38)**:
• **Floor Guide:**
  - **Ground Floor:** RFID book borrowing/returns, circulation desk, new periodicals.
  - **1st Floor:** 500-seat Silent Reading Hall and science/engineering book stacks.
  - **2nd Floor:** Digital Resource Lab, IEEE/ACM journals, and research carrels.
• **Timings:**
  - Regular Days: 08:00 AM – 10:00 PM
  - **24/7 Reading Hall:** Open all night during mid-term and end-term examinations!
• **Borrowing Limit:** 4 books for 14 days with standard student digital ID card.`,
    actionLocationId: 'b-36-38',
    actionType: 'indoor',
    quickReplies: ['Open Library Indoor Blueprint', 'Navigate to Library', 'Where can I print documents?'],
  },

  // ==========================================
  // UNIPOLIS & EVENTS
  // ==========================================
  {
    id: 'landmark-unipolis',
    category: 'service',
    keywords: ['unipolis', 'concert', 'event', 'amphitheatre', 'open air', 'youth fest', 'stage', 'fest', 'celebrity', 'shows'],
    title: 'Baldev Raj Mittal Uni-Polis Amphitheater',
    reply: `🎪 **Baldev Raj Mittal Uni-Polis**:
• **Capacity:** 10,000+ spectators under a grand translucent tensile canopy.
• **Function:** The cultural crown jewel of LPU, hosting One World, One India, Youth Vibes, Coke Studio concerts, and star performances.
• **Location:** Adjacent to UniMall and Central Promenade.
• **Current Status:** Open for student leisure and evening walking when no private rehearsals are underway.`,
    actionLocationId: 'unipolis',
    actionType: 'navigate',
    quickReplies: ['Navigate to Unipolis', 'Where is Shanti Devi Auditorium?', 'Go to UniMall'],
  },

  // ==========================================
  // BUSINESS & STUDENT WELFARE (BLOCKS 13 & 14)
  // ==========================================
  {
    id: 'acad-business-dsw',
    category: 'academic',
    keywords: ['business', 'mba', 'bba', 'mittal school', 'dsw', 'student welfare', 'clubs', 'societies', 'cultural', 'complaint', 'block 13', 'block 14'],
    title: 'Mittal School of Business & DSW (Blocks 13 & 14)',
    reply: `📊 **Mittal School of Business & Division of Student Welfare (DSW)**:
• **Block 13 & 14** houses:
  - **DSW (Division of Student Welfare):** Student clubs, community services, cultural registration, sports authorizations, and student grievances.
  - **Mittal School of Business:** Executive lecture theaters, case study presentation rooms, and incubation hub.
• **Office Hours:** 08:30 AM – 05:30 PM (Mon – Sat).`,
    actionLocationId: 'b-13-14',
    actionType: 'navigate',
    quickReplies: ['Navigate to DSW (Block 13/14)', 'Where is Central Admissions?', 'How to reach Block 34?'],
  },

  // ==========================================
  // ADMISSIONS & ADMINISTRATION (BLOCKS 29-32)
  // ==========================================
  {
    id: 'admin-main',
    category: 'admin',
    keywords: ['admission', 'admissions', 'fee', 'accounts', 'exam cell', 'chancellor', 'vice chancellor', 'admin', 'block 29', 'block 30', 'block 31', 'block 32', 'documents', 'transcript', 'degree', 'ums'],
    title: 'Central Administration & Admissions Complex (Blocks 29 to 32)',
    reply: `🏛️ **Central Administration & Admissions (Blocks 29 to 32)**:
• **Key Offices:**
  - **Ground Floor Block 29:** Central Admissions Helpdesk & Prospectus Verification.
  - **Block 30:** Examination Division, Marks-sheet dispatch, and Degree Registry.
  - **Block 31:** University Accounts, Fee Payment Counters, and Scholarship Section.
  - **Block 32:** Executive Offices of Chancellor & Vice-Chancellor.
• **Timings:** 09:00 AM – 05:30 PM (Mon – Sat).`,
    actionLocationId: 'b-29-32',
    actionType: 'navigate',
    quickReplies: ['Navigate to Admissions', 'Where is DSW?', 'How to pay fees?'],
  },

  // ==========================================
  // EMERGENCY, HOSPITAL & PHARMACY
  // ==========================================
  {
    id: 'emergency-hospital',
    category: 'emergency',
    keywords: ['hospital', 'doctor', 'emergency', 'ambulance', 'medical', 'sick', 'clinic', 'medicine', 'pharmacy', 'health', 'fever', 'pulse pharmacy', 'first aid', 'injury'],
    title: 'Uni-Hospital & Pulse Campus Pharmacy',
    reply: `🏥 **Uni-Hospital & Medical Support Services**:
• **Location:** East Medical Sector [HOSP], easily accessible from academic blocks and hostels.
• **Emergency Phone:** **01824-517000** or Extension **1122**
• **Ambulance:** 24/7 dedicated campus ambulance on standby.
• **Services:** Outpatient clinics, trauma center, pathology labs, dental care, and female physician cabins.
• **Pulse Campus Pharmacy:** Open 24/7 with verified prescriptions and OTC healthcare medicines.`,
    actionLocationId: 'uni-hospital',
    actionType: 'navigate',
    quickReplies: ['Navigate to Uni-Hospital', 'Call Emergency Desk', 'Where is Block 3 Physiotherapy?'],
  },

  // ==========================================
  // RESIDENTIAL HOSTELS & RULES
  // ==========================================
  {
    id: 'hostels-curfew-rules',
    category: 'hostel',
    keywords: ['curfew', 'timing', 'hostel timing', 'gate timing', 'biometric', 'hostel rules', 'late slip', 'entry time', 'leave', 'out pass', 'warden', 'turnstile'],
    title: 'LPU Hostel Timings & Security Guidelines',
    reply: `⏰ **LPU Hostel Curfew & Safety Regulations**:
• **Standard Hosteller In-Time:** **10:00 PM** sharp across all Boys & Girls Hostels.
• **Biometric Punching:** Mandatory fingerprint / smart card punch at turnstiles between 09:00 PM and 10:00 PM.
• **Night Out-Pass:** Must be applied via LPU Touch / UMS portal at least 6 hours in advance with parent SMS approval.
• **Late Slips:** Issued exclusively at Chief Warden / Security desk in emergency situations.
• **Wardens:** 24/7 residential wardens available on Ground Floor of every hostel block.`,
    actionLocationId: 'bh-1-2',
    actionType: 'navigate',
    quickReplies: ['Show Boys Hostels', 'Show Girls Hostels', 'Where is Uni-Hospital?'],
  },
  {
    id: 'hostels-boys',
    category: 'hostel',
    keywords: ['bh', 'boys hostel', 'bh1', 'bh2', 'bh3', 'bh4', 'bh5', 'bh6', 'bh7', 'bh8', 'bh 1', 'bh 2', 'bh 3'],
    title: 'Boys Hostels (BH-1 to BH-8)',
    reply: `🏢 **Boys Residential Sector (West Perimeter)**:
• **BH-1 & BH-2:** Premium cluster with internal dining mess, roller-skating rink, and evening food court.
• **BH-3 & BH-4:** Adjacent to university athletic playground and gym.
• **BH-5, 6, 7, 8:** Modern multi-story wings with reading rooms, elevator access, and laundry services.
• **Facilities:** High-speed Wi-Fi, 24/7 power backup, RO water, and indoor sports (Table Tennis, Badminton).`,
    actionLocationId: 'bh-1-2',
    actionType: 'navigate',
    quickReplies: ['Navigate to BH-1/2', 'What are hostel timings?', 'Where is the sports ground?'],
  },
  {
    id: 'hostels-girls',
    category: 'hostel',
    keywords: ['gh', 'girls hostel', 'gh9', 'gh10', 'gh11', 'gh12', 'gh21', 'gh 9', 'gh 10', 'gh 11'],
    title: 'Girls Hostels (GH-9, 10, 11, 12 & 21)',
    reply: `🌸 **Girls Residential Sector (East Perimeter)**:
• Secure enclosed gated community with 24/7 female security personnel and biometric turnstiles.
• **Amenities:** Dedicated multi-cuisine dining hall, indoor beauty salon, badminton & basketball courts, reading library, and midnight tuck shop.
• **Visiting Hours:** Visitors allowed strictly in the Reception Foyer until 07:00 PM.`,
    actionLocationId: 'gh-cluster',
    actionType: 'navigate',
    quickReplies: ['Navigate to Girls Hostels', 'Hostel curfew timings', 'Where is UniMall?'],
  },

  // ==========================================
  // SPORTS, GYM & SWIMMING POOL
  // ==========================================
  {
    id: 'sports-facilities',
    category: 'sports',
    keywords: ['sports', 'cricket', 'football', 'pool', 'swimming', 'swimming pool', 'gym', 'badminton', 'running', 'track', 'ground', 'athletic', 'block 47', 'fitness'],
    title: 'Sports Complex, Olympic Pool & Stadium',
    reply: `🏅 **LPU Sports & Athletics Infrastructure**:
• **Cricket & Football Stadium:** Full-size floodlit grass pitch with a synthetic 400m international-standard athletic running track.
• **Olympic Swimming Pool Complex:** 50m temperature-controlled 8-lane racing pool with certified lifeguards (diving board + warmup pool).
• **Block 47 Indoor Sports Arena:** Wooden squash courts, badminton halls, table tennis bays, and multi-station gymnasium.
• **Timings:** Morning 06:00 AM – 08:30 AM | Evening 04:30 PM – 08:30 PM.`,
    actionLocationId: 'cricket-stadium',
    actionType: 'navigate',
    quickReplies: ['Navigate to Cricket Stadium', 'Where is Swimming Pool?', 'Show Block 47 Indoor Sports'],
  },

  // ==========================================
  // PRINTING, PHOTOCOPY & STATIONERY
  // ==========================================
  {
    id: 'service-print',
    category: 'service',
    keywords: ['print', 'printing', 'photocopy', 'xerox', 'stationery', 'spiral binding', 'project report', 'printout', 'assignment'],
    title: 'Printing, Photocopy & Binding Centers',
    reply: `🖨️ **Printing & Stationery Centers on Campus**:
• **UniMall 1st Floor:** Campus High-Speed Printing & Bindery (ideal for hardbound project reports, CAD plots, and large volumes).
• **Block 34 Ground Floor:** CS Express Print Kiosk (fast printouts for assignments & lab journals).
• **Central Library Ground Floor:** Photostat counter beside the main circulation desk.
• **Pricing:** Black & White: ₹2/page | Color: ₹10/page | Spiral Binding: from ₹25.`,
    actionLocationId: 'b-15-unimall',
    actionType: 'indoor',
    quickReplies: ['Show UniMall 1st Floor', 'Go to Block 34 Print Hub', 'Where is Central Library?'],
  },

  // ==========================================
  // ATMS & BANKING
  // ==========================================
  {
    id: 'service-atm',
    category: 'service',
    keywords: ['atm', 'bank', 'sbi', 'hdfc', 'pnb', 'cash', 'withdraw', 'money', 'banking'],
    title: 'Campus ATMs & Banking Branches',
    reply: `🏧 **Banking & 50+ ATMs Across Campus**:
• **Full Banking Branches:**
  - **State Bank of India (SBI):** UniMall 2nd Floor (Full service branch with passbook printing).
  - **HDFC Bank:** UniMall 2nd Floor.
  - **Punjab National Bank (PNB):** Near Gate 1 Entry Plaza.
• **24/7 ATM Locations:**
  - UniMall Ground & 2nd Floor
  - Main Gate 1 Welcome Complex
  - BH-1 & BH-2 Food Square
  - Girls Hostel Complex Gate.`,
    actionLocationId: 'b-15-unimall',
    actionType: 'navigate',
    quickReplies: ['Navigate to UniMall ATMs', 'Show Gate 1 ATMs', 'Where is Lovely Sweets?'],
  },

  // ==========================================
  // GATES & TRANSPORTATION
  // ==========================================
  {
    id: 'transport-gates',
    category: 'transport',
    keywords: ['gate', 'gate 1', 'gate 2', 'gate 3', 'entry', 'exit', 'rickshaw', 'e-rickshaw', 'bus', 'parking', 'gt road', 'nh-1', 'auto', 'fare'],
    title: 'Campus Gates & Transport System',
    reply: `🚖 **Campus Gates & E-Rickshaw Transit**:
• **Main Gate 1 (Grand Trunk Road / NH-1):** Primary monumental entrance for all visitors, intercity buses, taxis, and cars.
• **E-Rickshaw Network:** 200+ green electric rickshaws continuously traverse the campus loop.
  - **Standard Fare:** Fixed ₹10 – ₹20 to any campus location.
• **Bus Terminal:** Scheduled buses to Jalandhar, Phagwara, and Ludhiana depart from Gate 1 Bus Bay every 15 minutes.`,
    actionLocationId: 'gate-01',
    actionType: 'navigate',
    quickReplies: ['Navigate to Gate 1', 'How far is Gate 1 to Block 34?', 'Where is UniMall?'],
  },

  // ==========================================
  // SPECIFIC ACADEMIC SCHOOLS
  // ==========================================
  {
    id: 'acad-fashion',
    category: 'academic',
    keywords: ['fashion', 'textile', 'garment', 'pattern', 'design studio', 'block 1'],
    title: 'School of Fashion Design (Block 1)',
    reply: `👗 **School of Fashion Design (Block 1)**:
• Located along the Entry Boulevard right near Main Gate 1.
• Houses pattern drafting studios, industrial garment stitching bays, textile chemistry labs, and exhibition ramp.`,
    actionLocationId: 'b-01',
    actionType: 'navigate',
    quickReplies: ['Walk to Block 1', 'Show Gate 1', 'Where is Architecture Block 6?'],
  },
  {
    id: 'acad-architecture',
    category: 'academic',
    keywords: ['architecture', 'drafting', 'urban planning', 'laser cutting', 'model making', 'block 6'],
    title: 'School of Architecture & Design (Block 6)',
    reply: `📐 **School of Architecture & Design (Block 6)**:
• Houses spacious drafting studios with natural northern daylight, 3D laser cutters, carpentry model shops, and Block 6 outdoor food courtyard.`,
    actionLocationId: 'b-06',
    actionType: 'navigate',
    quickReplies: ['Navigate to Block 6', 'Where is Fine Arts Block 8?', 'Show Unipolis'],
  },
  {
    id: 'acad-pharmacy',
    category: 'academic',
    keywords: ['pharmacy', 'pharmaceutical', 'pharmacology', 'drug', 'medicinal', 'block 4', 'block 7'],
    title: 'School of Pharmaceutical Sciences (Blocks 4 & 7)',
    reply: `💊 **School of Pharmaceutical Sciences (Blocks 4 & 7)**:
• Equipped with modern drug synthesis bays, pharmacology dissection simulations, and medicinal chemistry research laboratories.`,
    actionLocationId: 'b-04-07',
    actionType: 'navigate',
    quickReplies: ['Navigate to Block 4/7', 'Where is Physiotherapy Block 3?', 'Uni-Hospital info'],
  },
  {
    id: 'acad-law-media',
    category: 'academic',
    keywords: ['law', 'advocate', 'moot court', 'journalism', 'mass comm', 'film', 'media', 'news studio', 'block 18', 'block 20'],
    title: 'School of Law, Media & Journalism (Blocks 18 & 20)',
    reply: `⚖️ **School of Law & School of Journalism (Blocks 18 & 20)**:
• Features a high-court replica Moot Court Hall, broadcast television production floor, sound recording suites, and student legal aid clinic.
• Steps away from the popular LIT Market kiosks!`,
    actionLocationId: 'b-18-20',
    actionType: 'navigate',
    quickReplies: ['Navigate to Block 18/20', 'Show LIT Market food', 'Where is Block 34?'],
  },
  {
    id: 'acad-agriculture-bio',
    category: 'academic',
    keywords: ['agriculture', 'biotech', 'biotechnology', 'agronomy', 'chemical', 'chemistry', 'plants', 'greenhouse', 'block 25', 'block 26', 'block 27', 'block 28'],
    title: 'Bioengineering & Agriculture Sciences (Blocks 25 to 28)',
    reply: `🌱 **Bioengineering & Agriculture Complex (Blocks 25 to 28)**:
• Spans plant tissue culture facilities, molecular biology chambers, agricultural demonstration fields, and chemical analysis laboratories.`,
    actionLocationId: 'b-25-28',
    actionType: 'navigate',
    quickReplies: ['Navigate to Block 25-28', 'Where is Central Admissions?', 'Show Central Library'],
  },
  {
    id: 'acad-engineering-heavy',
    category: 'academic',
    keywords: ['mechanical', 'civil', 'polytechnic', 'workshop', 'automobile', 'baja', 'formula', 'sae', 'welding', 'block 55', 'block 56', 'block 57', 'block 58'],
    title: 'Heavy Engineering & Workshops (Blocks 55 to 58)',
    reply: `⚙️ **Mechanical, Civil & Automotive Engineering (Blocks 55 to 58)**:
• Houses high-tonnage universal testing machines, foundry and CNC machining bays, fluid mechanics flumes, and dedicated workshop sheds for BAJA SAE and Formula Student racecars.`,
    actionLocationId: 'b-55-56',
    actionType: 'navigate',
    quickReplies: ['Navigate to Mechanical Block', 'Where is Cricket Stadium?', 'Go to Block 34'],
  }
];

// Query Matcher with Smart Scoring
export function queryCampusKnowledge(userQuery: string): {
  reply: string;
  actionLocationId?: string;
  actionType?: 'navigate' | 'indoor' | 'focus';
  quickReplies?: string[];
} {
  const q = userQuery.toLowerCase().trim();
  if (!q) {
    return {
      reply: "Hello! I am your verified LPU Campus AI Buddy. Ask me about any academic block, classroom, food court, hostel curfew, or emergency help!",
      quickReplies: ['Where is Lovely Sweets?', 'Where is Block 34 CSE?', 'Library timings?', 'Hostel curfew?']
    };
  }

  // Check direct pattern matches
  for (const item of LPU_KNOWLEDGE_BASE) {
    if (item.patterns) {
      for (const p of item.patterns) {
        if (p.test(q)) {
          return {
            reply: item.reply,
            actionLocationId: item.actionLocationId,
            actionType: item.actionType || 'navigate',
            quickReplies: item.quickReplies,
          };
        }
      }
    }
  }

  // Calculate score based on keyword hits and token similarity
  let bestScore = 0;
  let bestMatch: CampusKnowledgeEntry | null = null;

  const queryWords = q.split(/\s+/);

  for (const item of LPU_KNOWLEDGE_BASE) {
    let score = 0;

    for (const kw of item.keywords) {
      if (q === kw) score += 15;
      else if (q.includes(kw)) score += kw.length > 3 ? 8 : 4;
      else {
        // Word token match
        for (const word of queryWords) {
          if (word.length > 2 && kw.includes(word)) score += 2;
        }
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestMatch = item;
    }
  }

  if (bestMatch && bestScore >= 4) {
    return {
      reply: bestMatch.reply,
      actionLocationId: bestMatch.actionLocationId,
      actionType: bestMatch.actionType || 'navigate',
      quickReplies: bestMatch.quickReplies,
    };
  }

  // General fallback with helpful university directory
  return {
    reply: `I couldn't find an exact record for that specific query in our verified campus directory.
• **General Campus Assistance:** Please visit the **Central Admissions Helpdesk in Block 29** or **Division of Student Welfare (DSW) in Block 13**.
• **24/7 Campus Emergency / Security Helpline:** **01824-517000**.
• You can also ask me about **Blocks 1 to 58**, **UniMall**, **Lovely Sweets & Bake Studio**, **Hostels BH/GH**, or **Sports & Library hours**.`,
    quickReplies: ['Where is Block 34?', 'UniMall food options', 'Library hours?', 'Hostel rules'],
  };
}
