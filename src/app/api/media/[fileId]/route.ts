import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { Readable } from 'stream';

function createDriveClient() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    return null;
  }

  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    'https://developers.google.com/oauthplayground'
  );
  oauth2Client.setCredentials({ refresh_token: refreshToken });

  return google.drive({ version: 'v3', auth: oauth2Client });
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ fileId: string }> }
) {
  try {
    const { fileId } = await params;
    if (!fileId || !/^[a-zA-Z0-9_-]+$/.test(fileId)) {
      return NextResponse.json({ error: 'Invalid file ID' }, { status: 400 });
    }

    const drive = createDriveClient();
    if (!drive) {
      return NextResponse.json({ error: 'Google Drive is not configured' }, { status: 500 });
    }

    const metaRes = await drive.files.get({
      fileId,
      fields: 'mimeType, size, name',
    });

    const mimeType = metaRes.data.mimeType || 'application/octet-stream';
    const fileSize = Number(metaRes.data.size || 0);
    const rangeHeader = req.headers.get('range');

    const mediaRes = await drive.files.get(
      { fileId, alt: 'media' },
      {
        responseType: 'stream',
        headers: rangeHeader ? { Range: rangeHeader } : undefined,
      }
    );

    const nodeStream = mediaRes.data as Readable;
    const webStream = Readable.toWeb(nodeStream) as ReadableStream;

    const headers = new Headers();
    headers.set('Content-Type', mimeType);
    headers.set('Accept-Ranges', 'bytes');
    headers.set('Cache-Control', 'public, max-age=86400');

    const upstreamContentRange = mediaRes.headers?.['content-range'];
    const upstreamContentLength = mediaRes.headers?.['content-length'];

    if (rangeHeader && upstreamContentRange) {
      headers.set('Content-Range', String(upstreamContentRange));
      if (upstreamContentLength) {
        headers.set('Content-Length', String(upstreamContentLength));
      }
      return new NextResponse(webStream, { status: 206, headers });
    }

    if (upstreamContentLength || fileSize > 0) {
      headers.set('Content-Length', String(upstreamContentLength || fileSize));
    }

    return new NextResponse(webStream, { status: 200, headers });
  } catch (error) {
    console.error('Media stream proxy error:', error);
    return NextResponse.json({ error: 'Failed to stream media' }, { status: 500 });
  }
}
