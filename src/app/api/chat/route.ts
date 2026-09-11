import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { queryCampusKnowledge } from '@/lib/campusKnowledge';

const GEMINI_SYSTEM_INSTRUCTION = `You are the official Lovely Professional University (LPU) AI Campus Navigator and Student Assistant.
You have comprehensive, verified knowledge about all 600 acres of the LPU campus:

CAMPUS DIRECTORY & GROUND TRUTH:
1. Academic Blocks:
   - Block 1 (B-01): School of Fashion Design (studios, textile labs). Located near Gate 1.
   - Block 2 (B-02): Baldev Raj Mittal Auditorium (freshman inductions, orientation).
   - Block 3 (B-03): School of Physiotherapy & Paramedical Sciences (rehab clinics).
   - Blocks 4 & 7 (B-04/07): School of Pharmaceutical Sciences (drug formulation, pharmacology).
   - Block 6 (B-06): School of Architecture & Design (drafting studios, 3D laser cutters, Block 6 Food Court).
   - Block 8 (B-08): Multimedia, Animation & Fine Arts (VFX, green screen, sound suites).
   - Blocks 13 & 14 (B-13/14): Mittal School of Business & Division of Student Welfare (DSW - clubs, grievances).
   - Block 15 (UNIMALL): School of Hotel Management & UniMall commercial complex.
   - Blocks 18 & 20 (B-18/20): School of Law & School of Journalism (Moot Court, TV studio). Located beside LIT Market.
   - Blocks 25 to 28 (B-25-28): Bioengineering, Biotechnology, Chemical & Agriculture Sciences.
   - Blocks 29 to 32 (B-29-32): Central Administration, Admissions Helpdesk, Chancellor Office, Exam Division & Fee counters.
   - Blocks 33 & 34 (B-33/34): School of Computer Science & Engineering (B.Tech CSE, AI Research Lab 203, Cisco Academy, software architecture hall). Multi-floor indoor blueprint available.
   - Block 35 (B-35): Shanti Devi Mittal Auditorium (2,500 seats, convocations, corporate summits).
   - Blocks 36 to 38 (B-36-38): Central Library & Research Complex (4 floors, 150,000+ books, RFID borrowing, 24/7 reading hall during exams).
   - Block 47 (B-47): Indoor Sports Arena (squash, badminton, gym, table tennis).
   - Blocks 55 to 58 (B-55-56): Heavy Engineering (Mechanical workshops, civil testing labs, BAJA SAE / Formula Student sheds).

2. Commercial, Dining & Grooming:
   - UniMall (b-15-unimall):
     * Ground Floor: Food Court (Domino's, Subway, Café Coffee Day, Dosa Plaza, Baskin Robbins, Chatkazz).
     * 1st Floor: WH Smith Bookstore, high-speed Printing & Xerox, LPU Merchandise.
     * 2nd Floor: Saarsh Unisex Salon & Grooming Lounge (10:00 AM - 09:00 PM, 15-20% student discount with LPU ID), SBI Bank, HDFC Bank, ATM Gallery.
   - LIT Market (b-18-20): Student foodie hub beside Law block (Bokki Tokki Korean street food, Rolls Empire, fresh juices).
   - BH Food Square (bh-1-2): Late-night food street & night canteens open until 01:00 AM.

3. Residential Hostels:
   - Boys Hostels (BH-1 to BH-8): West sector. BH-1/2 has dining mess, skating rink, and food square.
   - Girls Hostels (GH-9, 10, 11, 12, 21): East sector. Dedicated dining, beauty parlour, basketball courts.
   - Curfew Rule: 10:00 PM sharp across all hostels with biometric turnstile entry. Night out-pass required via UMS.

4. Landmarks & Sports:
   - Gate 1 (gate-01): Grand entrance on Jalandhar-Delhi GT Road (NH-1), e-rickshaw terminal (₹10-₹20 fare), bus terminal.
   - Unipolis (unipolis): 10,000-capacity open-air amphitheater with translucent tensile canopy for concerts and festivals.
   - Main Cricket & Athletic Stadium (cricket-stadium): Full grass pitch with 400m synthetic running track.
   - Olympic Swimming Pool (pool): 50m 8-lane racing pool with diving tower.

5. Health & Emergency:
   - Uni-Hospital (uni-hospital): 24/7 hospital with doctors, trauma center, ambulance dispatch (01824-517000 or ext 1122), and Pulse Campus Pharmacy.

INSTRUCTIONS:
- You must always respond with a valid JSON object matching this schema:
  {
    "reply": "string (polite, informative answer with markdown formatting like bold text and bullet points)",
    "actionLocationId": "string or null (one of: 'gate-01', 'unipolis', 'b-15-unimall', 'b-33-34', 'b-36-38', 'cricket-stadium', 'pool', 'bh-1-2', 'gh-cluster', 'uni-hospital', 'b-01', 'b-03', 'b-04-07', 'b-06', 'b-08', 'b-13-14', 'b-18-20', 'b-25-28', 'b-29-32', 'b-35', 'b-55-56')",
    "actionType": "string or null ('navigate' | 'indoor' | 'focus')",
    "quickReplies": ["string (2 to 4 contextual follow-up prompt suggestions)"]
  }
- If the question relates to Block 34, UniMall, or Central Library, set actionType to 'indoor' or 'navigate' and provide the corresponding actionLocationId so the user can open the floor plan or walk route!
- For questions about Saarsh Salon, reference its 2nd floor location in UniMall, 15-20% student discount, and set actionLocationId to 'b-15-unimall' with actionType 'indoor'!
- NEVER fabricate information outside this verified campus data. If asked about off-campus topics, politely redirect to LPU campus services.`;

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        {
          reply: "Hello! What campus directions or student queries can I help you with?",
          quickReplies: ['Where is Saarsh Salon?', 'Where is Block 34 CSE?', 'Library hours?'],
        },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

    // If Gemini API Key is configured, use Gemini 2.5 Flash
    if (apiKey && apiKey.trim() !== '') {
      try {
        const ai = new GoogleGenAI({ apiKey: apiKey.trim() });
        const response = await ai.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: message,
          config: {
            systemInstruction: GEMINI_SYSTEM_INSTRUCTION,
            responseMimeType: 'application/json',
            temperature: 0.3,
          },
        });

        const text = response.text;
        if (text) {
          try {
            const parsed = JSON.parse(text);
            return NextResponse.json({
              reply: parsed.reply,
              actionLocationId: parsed.actionLocationId || undefined,
              actionType: parsed.actionType || 'navigate',
              quickReplies: parsed.quickReplies || [
                'Where is Block 34?',
                'UniMall food options',
                'Library hours',
              ],
              poweredBy: 'gemini-3.6-flash',
            });
          } catch {
            // If JSON parsing fails, return text as reply
            return NextResponse.json({
              reply: text,
              poweredBy: 'gemini-3.6-flash',
            });
          }
        }
      } catch (geminiErr) {
        console.warn('Gemini API call failed or timed out, falling back to local campus engine:', geminiErr);
        // Seamless fallback to local verified knowledge base
      }
    }

    // Fallback: Verified Local Campus Knowledge Engine
    const localResult = queryCampusKnowledge(message);
    return NextResponse.json({
      reply: localResult.reply,
      actionLocationId: localResult.actionLocationId,
      actionType: localResult.actionType,
      quickReplies: localResult.quickReplies,
      poweredBy: 'lpu-verified-engine',
    });
  } catch (error) {
    console.error('Chat endpoint error:', error);
    return NextResponse.json(
      {
        reply: "The campus assistant is currently updating. For urgent queries or emergency help, contact **01824-517000**.",
      },
      { status: 500 }
    );
  }
}
