// frontend/components/layout/CrisMark.js

export default function CrisMark({ compact = false }) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative h-9 w-11 shrink-0">
        <div className="absolute left-0 top-1 h-8 w-8 rounded-full bg-blue-500" />
        <div className="absolute right-0 top-1 h-8 w-8 rounded-full bg-emerald-500/90" />
        <div className="absolute left-[14px] top-1 h-8 w-4 bg-gradient-to-r from-blue-500/70 to-emerald-500/70" />
      </div>

      {!compact && (
        <span className="text-2xl font-bold tracking-tight text-slate-950">
          Cris
        </span>
      )}
    </div>
  );
}