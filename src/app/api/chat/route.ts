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

    // 1. Check for Saarsh Unisex Salon or salon
    if (q.includes('salon') || q.includes('haircut') || q.includes('grooming') || q.includes('saarsh')) {
      const salon = LPU_VENDORS.find((v) => v.category === 'salon')!;
      return NextResponse.json({
        reply: `Saarsh Unisex Salon & Grooming Hub is located at Campus Food Court & Uni-Mall (Block FC). Hours: ${salon.opening_hours}. Special: ${salon.discount_info}!`,
        actionLocationId: 'loc-003',
      });
    }

    // 2. Check for Library
    if (q.includes('library') || q.includes('books') || q.includes('study') || q.includes('lib')) {
      const lib = LPU_LOCATIONS.find((l) => l.id === 'loc-001')!;
      return NextResponse.json({
        reply: `The Central Library (Block LIB) is located on the East Campus. Timings: ${lib.opening_hours?.monday}. Facilities include ${lib.facilities.join(', ')}.`,
        actionLocationId: 'loc-001',
      });
    }

    // 3. Check for Block 34 / Academic Block A
    if (q.includes('34') || q.includes('block a') || q.includes('cse') || q.includes('engineering') || q.includes('classroom')) {
      const blockA = LPU_LOCATIONS.find((l) => l.id === 'loc-002')!;
      return NextResponse.json({
        reply: `Academic Block A (Block 34) hosts Computer Science, AI & Robotics Labs, and lecture halls. It features a multi-floor indoor turn-by-turn map!`,
        actionLocationId: 'loc-002',
      });
    }

    // 4. Check for Food Court / Uni-Mall / food / eat
    if (q.includes('food') || q.includes('eat') || q.includes('unimall') || q.includes('mall') || q.includes('canteen')) {
      return NextResponse.json({
        reply: `Uni-Mall & Central Food Court (Block FC) has Subway, Domino's, and local eateries. Open 09:00 - 21:00 daily!`,
        actionLocationId: 'loc-003',
      });
    }

    // 5. Check for Hospital / Doctor / Medicine / Emergency
    if (q.includes('hospital') || q.includes('doctor') || q.includes('medical') || q.includes('medicine') || q.includes('pharmacy') || q.includes('emergency')) {
      const hosp = LPU_LOCATIONS.find((l) => l.id === 'loc-007')!;
      return NextResponse.json({
        reply: `Uni-Hospital & Medical Center (Block HOSP) is open 24/7 with doctors on duty and an in-house Pulse Campus Pharmacy.`,
        actionLocationId: 'loc-007',
      });
    }

    // 6. Check for Sports / Gym / Ground
    if (q.includes('sports') || q.includes('gym') || q.includes('badminton') || q.includes('swimming') || q.includes('ground')) {
      return NextResponse.json({
        reply: `Campus Sports Complex (Block SPORTS) features an athletic track, gym, swimming pool, and indoor badminton courts. Open 06:00 - 21:00.`,
        actionLocationId: 'loc-005',
      });
    }

    // 7. Check for Auditorium
    if (q.includes('auditorium') || q.includes('event') || q.includes('hall') || q.includes('mittall')) {
      return NextResponse.json({
        reply: `Shanti Devi Mittal Auditorium (Block AUD) hosts major campus conferences, convocations, and cultural events.`,
        actionLocationId: 'loc-006',
      });
    }

    // 8. Check for Hostels
    if (q.includes('hostel') || q.includes('bh') || q.includes('gh') || q.includes('room')) {
      return NextResponse.json({
        reply: `Hostels include Boys Hostel BH-1 and Girls Hostel GH-1, equipped with dining messes, study lounges, and 24/7 security.`,
        actionLocationId: 'loc-008',
      });
    }

    // 9. Generic query search in locations
    const matched = LPU_LOCATIONS.find((l) =>
      l.name.toLowerCase().includes(q) || l.block_code.toLowerCase() === q
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
