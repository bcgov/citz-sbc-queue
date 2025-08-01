export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Appointment Details
          </h1>
          <p className="text-gray-600">
            Viewing appointment: <span className="font-semibold">{id}</span>
          </p>
        </header>
      </div>
    </div>
  );
}
