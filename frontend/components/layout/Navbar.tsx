export default function Navbar() {
  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900 flex items-center justify-between px-8">
      <div>
        <h2 className="text-xl font-semibold text-white">
          Constituency Dashboard
        </h2>
        <p className="text-sm text-slate-400">
          AI-powered development planning
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
          MP
        </div>
      </div>
    </header>
  );
}