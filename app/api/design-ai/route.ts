
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { prompt, style, placement } = await req.json();

    // STUB: This is where you would call Google Gemini or another GenAI API.
    // For now, we return a mock object as requested.

    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Mock Response
    const mockResponse = {
      prompt_used: prompt,
      style: style,
      placement: placement,
      description_summary: `AI Concept: A ${style} style tattoo featuring ${prompt}, designed specifically for the ${placement}. The design emphasizes high contrast and flow with the body's natural curves.`,
      // Return a random placeholder image to allow the Virtual Try-On to function
      // In production, this would be the URL of the generated image from the AI service
      image_url: `https://picsum.photos/seed/${encodeURIComponent(prompt + style)}/800/800`
    };

    return NextResponse.json(mockResponse);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
