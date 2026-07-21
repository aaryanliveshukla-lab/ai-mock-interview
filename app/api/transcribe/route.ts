import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as Blob;
    
    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    const cfAccountId = process.env.CLOUDFLARE_ACCOUNT_ID || '2f9448e5cf8f860b8a4685c26b610574';
    const cfApiToken = process.env.CLOUDFLARE_API_TOKEN;

    if (!cfApiToken || cfApiToken === 'your-cloudflare-token-here') {
      return NextResponse.json({ error: 'Cloudflare API token missing' }, { status: 500 });
    }

    // Cloudflare Workers AI expects the raw audio bytes as a blob in the body
    const arrayBuffer = await audioFile.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${cfAccountId}/ai/run/@cf/openai/whisper-tiny-en`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${cfApiToken}`,
        'Content-Type': 'application/octet-stream'
      },
      body: uint8Array
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Whisper API Error:', errorText);
      return NextResponse.json({ error: `Cloudflare API error: ${response.statusText}` }, { status: response.status });
    }

    const result = await response.json();
    return NextResponse.json({ text: result.result.text }, { status: 200 });
  } catch (error) {
    console.error('Error during transcription:', error);
    return NextResponse.json({ error: 'Failed to transcribe audio' }, { status: 500 });
  }
}
