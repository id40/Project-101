import { NextResponse } from 'next/server';
import { LPU_LOCATIONS } from '@/data/lpuSeedData';
import { LPU_VENDORS } from '@/data/lpuVendors';

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    if (!message || typeof message !== 'string') {
      return NextResponse.json({ reply: "Where do you want to go?" }, { status: 400 });
    }

    const q = message.toLowerCase().trim();

    // 1. Fashion (Block 1)
    if (q.includes('fashion') || q.includes('textile') || q.includes('design studio')) {
      return NextResponse.json({
        reply: `School of Fashion Design is in Block 1 [B-01], located right by Main Gate 1 near the welcome promenade.`,
        actionLocationId: 'b-01',
      });
    }

    // 2. Physiotherapy (Block 3)
    if (q.includes('physiotherapy') || q.includes('rehab') || q.includes('anatomy')) {
      return NextResponse.json({
        reply: `School of Physiotherapy is in Block 3 [B-03], featuring health sciences research and clinical rehabilitation labs.`,
        actionLocationId: 'b-03',
      });
    }

    // 3. Pharmacy (Blocks 4 & 7)
    if (q.includes('pharmacy') || q.includes('pharmaceutical')) {
      return NextResponse.json({
        reply: `School of Pharmaceutical Sciences is located in Blocks 4 & 7 [B-04/07], equipped with pharmacology and drug synthesis labs.`,
        actionLocationId: 'b-04-07',
      });
    }

    // 4. Architecture (Block 6)
    if (q.includes('architecture') || q.includes('drafting') || q.includes('urban planning')) {
      return NextResponse.json({
        reply: `School of Architecture is in Block 6 [B-06], featuring open drafting studios, 3D laser-cutting workshops, and Block 6 Food Court.`,
        actionLocationId: 'b-06',
      });
    }

    // 5. Business & DSW (Blocks 13 & 14)
    if (q.includes('business') || q.includes('mba') || q.includes('bba') || q.includes('dsw') || q.includes('student welfare')) {
      return NextResponse.json({
        reply: `Mittal School of Business and Division of Student Welfare (DSW) are located in Blocks 13 & 14 [B-13/14].`,
        actionLocationId: 'b-13-14',
      });
    }

    // 6. Computer Science & Engineering (Blocks 33 & 34)
    if (q.includes('34') || q.includes('33') || q.includes('cse') || q.includes('computer science') || q.includes('software') || q.includes('coding')) {
      return NextResponse.json({
        reply: `School of Computer Science & Engineering is located in Blocks 33 & 34 [B-33/34]. Features AI Research Lab 203 and an indoor multi-floor turn-by-turn navigator!`,
        actionLocationId: 'b-33-34',
      });
    }

    // 7. Central Library (Blocks 36-38)
    if (q.includes('library') || q.includes('books') || q.includes('reading hall')) {
      return NextResponse.json({
        reply: `LPU Central Library is in Blocks 36–38 [B-36-38], spanning 4 floors with 150,000+ volumes, RFID kiosks, and 24/7 reading halls.`,
        actionLocationId: 'b-36-38',
      });
    }

    // 8. UniMall & Saarsh Unisex Salon
    if (q.includes('salon') || q.includes('haircut') || q.includes('grooming') || q.includes('saarsh')) {
      return NextResponse.json({
        reply: `Saarsh Unisex Salon & Grooming Hub is inside UniMall [UNIMALL] on the central promenade. 20% discount with your LPU Student ID!`,
        actionLocationId: 'b-15-unimall',
      });
    }

    if (q.includes('unimall') || q.includes('mall') || q.includes('domino') || q.includes('dosa plaza') || q.includes('shopping')) {
      return NextResponse.json({
        reply: `UniMall / UniCentre [UNIMALL] is the central shopping, banking, and multi-cuisine dining hub beside Unipolis. Open 09:00 - 22:00.`,
        actionLocationId: 'b-15-unimall',
      });
    }

    // 9. Unipolis (Baldev Raj Mittal Uni-Polis)
    if (q.includes('unipolis') || q.includes('concert') || q.includes('youth fest') || q.includes('open air')) {
      return NextResponse.json({
        reply: `Baldev Raj Mittal Uni-Polis [UNIPOLIS] is the grand covered open-air mega-amphitheater for 10,000+ spectators right beside UniMall.`,
        actionLocationId: 'unipolis',
      });
    }

    // 10. Shanti Devi Mittal Auditorium
    if (q.includes('shanti devi') || q.includes('auditorium') || q.includes('convocation')) {
      return NextResponse.json({
        reply: `Shanti Devi Mittal Auditorium is located in Block 35 [B-35], seating 2,500 delegates for convocations and international summits.`,
        actionLocationId: 'b-35',
      });
    }

    // 11. Mechanical, Civil, Polytechnic & Projects (Blocks 55-58)
    if (q.includes('mechanical') || q.includes('civil') || q.includes('polytechnic') || q.includes('formula') || q.includes('robotics')) {
      return NextResponse.json({
        reply: `Heavy Engineering is located in Blocks 55–58 (Mechanical workshops, civil testing labs, and BAJA SAE Formula Student racecar bays).`,
        actionLocationId: 'b-55-56',
      });
    }

    // 12. Hostels (Boys Hostels & Girls Hostels)
    if (q.includes('bh') || q.includes('boys hostel') || q.includes('hostel')) {
      if (q.includes('gh') || q.includes('girls')) {
        return NextResponse.json({
          reply: `Girls Hostels (GH 9, 10, 11, 12, 21) are located in the East residential sector with dedicated mess halls and security.`,
          actionLocationId: 'gh-cluster',
        });
      }
      return NextResponse.json({
        reply: `Boys Hostels are organized into BH 1/2 (with roller-skating rink & food square), BH 3/4 (near playground), and BH 5-8 at the west perimeter.`,
        actionLocationId: 'bh-1-2',
      });
    }

    // 13. Sports & Swimming Pool
    if (q.includes('sports') || q.includes('pool') || q.includes('swim') || q.includes('stadium') || q.includes('cricket') || q.includes('gym')) {
      return NextResponse.json({
        reply: `Sports facilities include the Olympic 50m Swimming Pool [POOL], Main Cricket Stadium [STADIUM], and Block 47 Indoor Sports Arena [B-47].`,
        actionLocationId: 'cricket-stadium',
      });
    }

    // 14. Hospital / Emergency
    if (q.includes('hospital') || q.includes('doctor') || q.includes('medical') || q.includes('emergency') || q.includes('pharmacy')) {
      return NextResponse.json({
        reply: `Uni-Hospital [HOSP] is open 24/7 with doctors on duty, ambulance services, and an in-house Pulse Campus Pharmacy.`,
        actionLocationId: 'uni-hospital',
      });
    }

    // 15. Student Kiosks in LIT Market (Rolls Empire, Bokki Tokki)
    if (q.includes('korean') || q.includes('bokki') || q.includes('roll') || q.includes('lit market')) {
      return NextResponse.json({
        reply: `LIT Market near Block 18/20 hosts popular student startups including Bokki Tokki (Korean food) and Rolls Empire.`,
        actionLocationId: 'b-18-20',
      });
    }

    // 16. Fallback Search in verified locations
    const matched = LPU_LOCATIONS.find(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.block_code.toLowerCase().includes(q) ||
        l.facilities.some((f) => f.toLowerCase().includes(q))
    );
    if (matched) {
      return NextResponse.json({
        reply: `${matched.name} [${matched.block_code}]: ${matched.description}`,
        actionLocationId: matched.id,
      });
    }

    // Rule 8 requirement: Never fabricate information
    return NextResponse.json({
      reply: "I don't have verified information about that yet.",
    });
  } catch {
    return NextResponse.json(
      { reply: "I don't have verified information about that yet." },
      { status: 500 }
    );
  }
}
