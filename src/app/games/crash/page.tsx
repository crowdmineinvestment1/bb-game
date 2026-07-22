import CrashGame from '@/components/games/crash/CrashGame';

export const metadata = {
  title: 'Crash - Bb.GAME',
  description: 'Watch the multiplier rise and cash out before it crashes!',
};

export default function CrashPage() {
  return (
    <div className="min-h-screen bg-[#0f1923] text-white p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <span className="text-3xl">🚀</span>
            Crash
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Watch the multiplier rise and cash out before it crashes!
          </p>
        </div>
        <CrashGame />
      </div>
    </div>
  );
}
