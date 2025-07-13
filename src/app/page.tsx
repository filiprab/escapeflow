import Link from 'next/link';
import { 
  ShieldCheckIcon, 
  ChartBarIcon, 
  CubeTransparentIcon, 
  ArrowTrendingUpIcon,
  DocumentMagnifyingGlassIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';

export default function Home() {
  return (
    <div className="relative min-h-[calc(100vh-88px)] overflow-hidden">
      {/* Animated background grid */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-16">
        {/* Hero Section */}
        <div className="text-center mb-20">
          
          <h1 className="text-7xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-500 to-red-500 bg-clip-text text-transparent animate-pulse">
            EscapeFlow
          </h1>
          
          <p className="text-2xl text-gray-300 mb-4 max-w-3xl mx-auto leading-relaxed">
            Interactive browser security attack surface visualization tool for security researchers
          </p>
          
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Understand browser sandbox escape techniques and privilege escalation paths through interactive flow diagrams
          </p>
        </div>

        {/* Main Features */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          <div className="group bg-gray-800/30 backdrop-blur-lg rounded-2xl p-8 border border-gray-700/50 hover:border-blue-500/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-500/10">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-blue-500/20 rounded-xl group-hover:bg-blue-500/30 transition-colors">
                <CubeTransparentIcon className="w-8 h-8 text-blue-400" />
              </div>
              <h2 className="text-3xl font-semibold text-blue-400">Attack Flow Visualization</h2>
            </div>
            
            <p className="text-gray-300 mb-6 text-lg leading-relaxed">
              Visualize browser sandbox escape techniques and privilege escalation paths from V8 heap sandbox to system/root access through interactive diagrams.
            </p>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <ArrowTrendingUpIcon className="w-4 h-4" />
                Multi-stage privilege escalation
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <ChartBarIcon className="w-4 h-4" />
                Interactive flow diagrams
              </div>
            </div>
            
            <Link 
              href="/flow"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-3 rounded-xl transition-all duration-300 font-semibold shadow-lg hover:shadow-blue-500/25"
            >
              Launch Visualization
              <ArrowTrendingUpIcon className="w-5 h-5" />
            </Link>
          </div>

          <div className="group bg-gray-800/30 backdrop-blur-lg rounded-2xl p-8 border border-gray-700/50 hover:border-purple-500/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/10">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-purple-500/20 rounded-xl group-hover:bg-purple-500/30 transition-colors">
                <DocumentMagnifyingGlassIcon className="w-8 h-8 text-purple-400" />
              </div>
              <h2 className="text-3xl font-semibold text-purple-400">CVE Database</h2>
            </div>
            
            <p className="text-gray-300 mb-6 text-lg leading-relaxed">
              Browse and filter 2,366 Chromium CVEs with detailed metadata, CVSS scores, and categorization by OS and components.
            </p>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <ChartBarIcon className="w-4 h-4" />
                CVSS scoring system
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <DocumentMagnifyingGlassIcon className="w-4 h-4" />
                Advanced filtering
              </div>
            </div>
            
            <Link 
              href="/catalog"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-8 py-3 rounded-xl transition-all duration-300 font-semibold shadow-lg hover:shadow-purple-500/25"
            >
              Browse CVEs
              <DocumentMagnifyingGlassIcon className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* Key Features Section */}
        <div className="mb-16">
          <h3 className="text-3xl font-bold text-center mb-12 bg-gradient-to-r from-gray-200 to-gray-400 bg-clip-text text-transparent">
            Key Features
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <ShieldCheckIcon className="w-8 h-8 text-blue-400" />
              </div>
              <h4 className="text-xl font-semibold mb-3 text-gray-200">Security Research</h4>
              <p className="text-gray-400 leading-relaxed">
                Comprehensive browser security research platform with real CVE data and attack vectors
              </p>
            </div>
            
            <div className="text-center group">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-500/20 to-red-500/20 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <AcademicCapIcon className="w-8 h-8 text-purple-400" />
              </div>
              <h4 className="text-xl font-semibold mb-3 text-gray-200">Educational Tool</h4>
              <p className="text-gray-400 leading-relaxed">
                Interactive learning platform for understanding browser security architecture
              </p>
            </div>
            
            <div className="text-center group">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <CubeTransparentIcon className="w-8 h-8 text-red-400" />
              </div>
              <h4 className="text-xl font-semibold mb-3 text-gray-200">Visualization</h4>
              <p className="text-gray-400 leading-relaxed">
                Advanced interactive diagrams showing attack chains and privilege escalation paths
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 bg-gray-800/50 backdrop-blur-sm rounded-full px-6 py-3 border border-gray-700/50">
            <ShieldCheckIcon className="w-5 h-5 text-green-400" />
            <span className="text-gray-300">
              Defensive security education tool documenting browser security architecture and mitigations
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
