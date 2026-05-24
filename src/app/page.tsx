import CSVTranslator from "@/components/CSVTranslator";

export default function Home() {
  return (
    <main className="relative min-h-screen bg-[#070708] overflow-hidden">
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(245, 158, 11, 0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(245, 158, 11, 0.025) 1px, transparent 1px)
          `,
          backgroundSize: "64px 64px",
        }}
      />
      <div
        className="fixed top-[-10%] left-1/4 w-[800px] h-[800px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(245,158,11,0.04) 0%, transparent 70%)",
        }}
      />
      <div
        className="fixed bottom-[-20%] right-1/4 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(245,158,11,0.025) 0%, transparent 70%)",
        }}
      />
      <div className="relative z-10 py-10 md:py-16 px-4">
        <CSVTranslator />
      </div>
    </main>
  );
}
