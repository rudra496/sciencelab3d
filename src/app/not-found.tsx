export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a1a]">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-4 text-white">404</h1>
        <p className="text-gray-400 mb-6">Experiment not found</p>
        <a href="/" className="text-purple-400 hover:text-purple-300 transition-colors">
          ← Back to Lab
        </a>
      </div>
    </div>
  );
}
