import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Vibe OS Lite - The Social Network That Feels You';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '20px',
          }}
        >
          <div
            style={{
              fontSize: 80,
              fontWeight: 'bold',
              color: 'white',
              textAlign: 'center',
              textShadow: '0 4px 20px rgba(0,0,0,0.3)',
            }}
          >
            Vibe OS Lite
          </div>
          <div
            style={{
              fontSize: 40,
              color: 'white',
              textAlign: 'center',
              opacity: 0.95,
            }}
          >
            ✨ Feel it. Share it. Find your vibe. ✨
          </div>
          <div
            style={{
              fontSize: 28,
              color: 'white',
              textAlign: 'center',
              opacity: 0.85,
              marginTop: '20px',
            }}
          >
            The Social Network That Feels You
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
