export default function AppPublic({ params }: { params: { id: string } }) {
  return (
    <main style={{ padding: 24 }}>
      <h2>应用 {params.id}</h2>
    </main>
  );
}