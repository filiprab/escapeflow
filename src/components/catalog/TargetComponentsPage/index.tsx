'use client';

export default function TargetComponentsPage() {
  return (
    <div className="space-y-6">
      <div className="bg-gray-800/30 backdrop-blur-lg rounded-2xl p-8 border border-gray-700/50">
        <h2 className="text-2xl font-bold text-white mb-4">Target Components</h2>
        <p className="text-gray-300 mb-6">
          Manage browser components that can be targeted during privilege escalation attacks.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-700/30 rounded-lg p-6 border border-gray-600/50">
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-lg font-semibold text-white">V8 Heap Sandbox</h3>
              <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded">Active</span>
            </div>
            <p className="text-gray-400 text-sm mb-3">
              Target the V8 JavaScript engine&apos;s heap sandbox isolation
            </p>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="bg-gray-600/50 px-2 py-1 rounded">V8 Heap Sandbox → Renderer Process</span>
            </div>
          </div>

          <div className="bg-gray-700/30 rounded-lg p-6 border border-gray-600/50">
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-lg font-semibold text-white">IPC Component</h3>
              <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded">Active</span>
            </div>
            <p className="text-gray-400 text-sm mb-3">
              Exploit IPC mechanisms between renderer and browser processes
            </p>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="bg-gray-600/50 px-2 py-1 rounded">Renderer Process → Browser/GPU Process</span>
            </div>
          </div>

          <div className="bg-gray-700/30 rounded-lg p-6 border border-gray-600/50">
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-lg font-semibold text-white">GPU Driver</h3>
              <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded">Active</span>
            </div>
            <p className="text-gray-400 text-sm mb-3">
              Target GPU driver vulnerabilities for escalation
            </p>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="bg-gray-600/50 px-2 py-1 rounded">GPU Process → Browser Process</span>
            </div>
          </div>

          <div className="bg-gray-700/30 rounded-lg p-6 border border-gray-600/50">
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-lg font-semibold text-white">Kernel</h3>
              <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded">Active</span>
            </div>
            <p className="text-gray-400 text-sm mb-3">
              Exploit kernel vulnerabilities for root access
            </p>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="bg-gray-600/50 px-2 py-1 rounded">Browser Process → System/Root</span>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <p className="text-blue-300 text-sm">
            <strong>Coming soon:</strong> Add, edit, and delete target components with associated exploitation techniques.
          </p>
        </div>
      </div>
    </div>
  );
}
