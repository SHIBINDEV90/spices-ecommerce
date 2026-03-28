import { Settings } from 'lucide-react';

export default function AdminSettingsPage() {
  return (
    <div className="w-full flex flex-col items-center justify-center min-h-[70vh] animate-in fade-in duration-500">
      <div className="p-6 rounded-full bg-gray-500/10 border border-gray-500/20 mb-6 group-hover:rotate-180 transition-transform">
        <Settings className="w-16 h-16 text-gray-400 opacity-50" />
      </div>
      <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-400 to-gray-200 mb-2">
        System Settings
      </h2>
      <p className="text-gray-400 max-w-lg text-center leading-relaxed">
        Tax rates, global shipping zones, team roles, and API integrations can be toggled here once the final architecture configuration is completed.
      </p>
    </div>
  );
}
