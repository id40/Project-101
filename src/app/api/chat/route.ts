import { NextResponse } from 'next/server';
import { queryCampusKnowledge } from '@/lib/campusKnowledge';

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    if (!message || typeof message !== 'string') {
      return NextResponse.json({
        reply: "What campus information or directions do you need?",
        quickReplies: ['Where is Saarsh Salon?', 'Where is Block 34 CSE?', 'Library hours?']
      }, { status: 400 });
    }

    const result = queryCampusKnowledge(message);

    return NextResponse.json({
      reply: result.reply,
      actionLocationId: result.actionLocationId,
      actionType: result.actionType,
      quickReplies: result.quickReplies,
    });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json(
      {
        reply: "Campus directory is temporarily unavailable. For emergency help, contact 01824-517000.",
      },
      { status: 500 }
    );
  }
}
