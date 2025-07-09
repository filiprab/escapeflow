# Browser Security Attack Surface Visualization

This web application was created as part of my Bachelor thesis about browser sandbox escapes. It is an interactive web application designed for security researchers that visualizes attack surfaces and privilege escalation paths in modern browsers. This tool demonstrates various exploitation techniques across different privilege levels, from browser engine sandbox escapes to kernel-level privilege escalation.

Currently focused on Android Chromium with plans to expand to multi-platform browser security research.

## Features

- **Interactive Attack Flow**: Visualize attack surfaces with draggable React Flow components
- **Multi-Level Privilege Escalation**: Simulate attacks across V8 Sandbox, Renderer Process, GPU Process, Browser Process, and System/Root levels
- **Real CVE Data**: Attack vectors based on actual CVEs with proof-of-concept links
- **Attack Chain Visualization**: Complete visual representation of successful attack paths with sliding panel
- **Tree View**: Comprehensive tree visualization modal showing all attack progression paths
- **Platform Selection**: Choose between different OS (Android, iOS, Windows, macOS, Linux) and browser combinations
- **Multiple Export Formats**: Export attack chains as PNG, JSON, PlantUML, and Mermaid diagrams
- **Responsive Design**: Adaptive layout with collapsible panels and detailed attack information
- **Global State Management**: Centralized state management using React Context API

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn package manager

### Local Development

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd casv
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Build

```bash
npm run build
npm start
```

## Docker Deployment

### Build and Run with Docker

1. **Build the Docker image:**
   ```bash
   docker build -t chromium-attack-surface .
   ```

2. **Run the container:**
   ```bash
   docker run -p 3000:3000 chromium-attack-surface
   ```

3. **Access the application:**
   Open [http://localhost:3000](http://localhost:3000)


## Usage Guide

### 1. **Starting an Attack Simulation**
- Select your target platform (OS and browser) from the header dropdowns
- Begin at the "V8 Heap Sandbox" privilege level
- Select an available attack vector from the interactive flow diagram
- Review detailed attack information in the right panel including CVEs, POCs, impact analysis, and mitigations

### 2. **Privilege Escalation**
- Click "Execute Attack" to select your attack technique
- Choose "Escalate Privilege" to advance to the next privilege level
- Each escalation automatically adds to your attack chain in the left panel
- Continue the progression until reaching System/Root access

### 3. **Viewing Attack Chains**
- The attack chain panel on the left automatically tracks your progression
- Toggle the panel visibility using the arrow button
- Click "Show Tree" in the header to view a comprehensive tree visualization
- Export your chain in multiple formats: PNG image, JSON data, PlantUML diagram, or Mermaid diagram

### 4. **Navigation and Controls**
- Use "Reset Simulation" in the header to start over
- Toggle between different privilege levels and attack vectors
- Try different platform combinations to explore various attack scenarios
- Use the tree view to understand the complete attack surface landscape

## Architecture

### Component Structure
- **Next.js 15 App Router**: Server-side layout with client-side interactivity
- **React Context API**: Global state management for attack simulation
- **React Flow**: Interactive flow diagrams for attack surface visualization
- **Tailwind CSS**: Responsive styling with dark theme
- **TypeScript**: Type-safe development

### Key Components
- **Header**: Platform selection and simulation controls
- **AttackSurfaceFlow**: Main interactive flow visualization
- **AttackDetails**: Detailed attack information panel
- **AttackChainPanel**: Sliding panel showing attack progression
- **TreeView**: Comprehensive modal for attack tree visualization

## Security Education

This tool is designed for educational purposes to understand:

- **Browser Security Models**: How modern browsers implement security boundaries
- **Sandbox Escapes**: Common techniques used to escape sandboxed environments  
- **Privilege Escalation**: Methods for gaining elevated system access
- **Mitigation Strategies**: Security measures that prevent these attacks

### Real-World Attack Vectors

All attack techniques are based on documented vulnerabilities:
- **JavaScript Engine**: Use-after-free, JIT compilation bugs, WebAssembly exploits
- **IPC Exploitation**: Mojo message handling vulnerabilities
- **GPU Drivers**: Hardware-level privilege escalation
- **Kernel Exploits**: Android kernel vulnerabilities for root access

## Current Limitations & Roadmap

### Current Implementation (v1.0)
- **Platform**: Android only
- **Browser**: Chromium only
- **Attack Vectors**: Focus on Android-specific Chromium sandbox escapes
- **CVE Data**: Currently uses placeholder CVE numbers for demonstration

### Planned Features (Future Versions)

#### Multi-Platform Support
- **iOS**: Safari and WebKit-based attack vectors
- **Windows**: Edge, Chrome, and Firefox attack surfaces
- **macOS**: Safari, Chrome, and Firefox security boundaries
- **Linux**: Chrome and Firefox sandbox escapes

#### Multi-Browser Support
- **Safari/WebKit**: iOS and macOS attack vectors
- **Firefox**: Gecko engine vulnerabilities across platforms
- **Edge**: Chromium-based Edge specific vectors

#### Enhanced Data & Features
- **Real CVE Integration**: Replace placeholder data with actual CVE database
- **Historical Attack Timeline**: Show evolution of attack techniques
- **Mitigation Effectiveness**: Rate and track security improvements
- **Interactive Tutorials**: Guided learning paths for security concepts

#### Export & Integration
- **MITRE ATT&CK Mapping**: Connect attacks to MITRE framework
- **STIX/TAXII Integration**: Threat intelligence format support
- **Research Paper Export**: LaTeX and academic format support

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
