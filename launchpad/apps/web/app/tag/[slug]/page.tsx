export default function TagPage({ params }: { params: { slug: string } }) {
  return (
    <main style={{ padding: 24 }}>
      <h2>标签：{params.slug}</h2>
    </main>
  );
}