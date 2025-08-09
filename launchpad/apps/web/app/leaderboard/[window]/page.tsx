export default function Leaderboard({ params }: { params: { window: string } }) {
  return (
    <main style={{ padding: 24 }}>
      <h2>排行榜 - {params.window}</h2>
    </main>
  );
}