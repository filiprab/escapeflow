import Link from 'next/link';

export default function Home() {
  return (
    <div className="relative h-[calc(100vh-88px)] flex items-center justify-center">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <div className="mb-8">
          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-500 to-red-500 bg-clip-text text-transparent">
            EscapeFlow
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Interactive browser security attack surface visualization tool for security researchers
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
            <h2 className="text-2xl font-semibold mb-3 text-blue-400">Attack Flow Visualization</h2>
            <p className="text-gray-300 mb-4">
              Visualize browser sandbox escape techniques and privilege escalation paths from V8 heap sandbox to system/root access.
            </p>
            <Link 
              href="/flow"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Launch Visualization
            </Link>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
            <h2 className="text-2xl font-semibold mb-3 text-purple-400">CVE Database</h2>
            <p className="text-gray-300 mb-4">
              Browse and filter 2,366 Chromium CVEs with detailed metadata, CVSS scores, and categorization by OS and components.
            </p>
            <Link 
              href="/catalog"
              className="inline-block bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Browse CVEs
            </Link>
          </div>
        </div>

        <div className="text-sm text-gray-400">
          <p>
            This is a defensive security education tool that documents browser security architecture and attack mitigations.
          </p>
        </div>
      </div>
    </div>
  );
}
