export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b px-4 py-2">
        <h1 className="text-xl font-semibold">SessionHub</h1>
      </nav>
      <main>{children}</main>
    </div>
  );
}
