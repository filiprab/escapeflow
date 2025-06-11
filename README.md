# Chromium Android Sandbox Escape - Attack Surface Visualization

This web application was created as part of my Bachelor thesis about Sandbox Escapes in Chromium on Android devices. It is an interactive web application that visualizes attack surfaces and privilege escalation paths in Chromium on Android. This tool demonstrates various exploitation techniques across different privilege levels, from V8 heap sandbox escapes to kernel-level privilege escalation.

## Features

- **Interactive Attack Flow**: Visualize attack surfaces with draggable React Flow components
- **Multi-Level Privilege Escalation**: Simulate attacks across V8 Sandbox, Renderer Process, GPU Process, Browser Process, and System/Root levels
- **Real CVE Data**: Attack vectors based on actual CVEs with proof-of-concept links
- **Attack Chain Visualization**: Complete visual representation of successful attack paths
- **Export Capabilities**: TBD

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
- Begin at the "V8 Heap Sandbox" privilege level
- Select an available attack vector from the visualization
- Review attack details including CVEs, POCs, and mitigations

### 2. **Privilege Escalation**
- Click "Escalate Privilege" to advance to the next level
- Each escalation adds to your attack chain
- Continue until reaching System/Root access

### 3. **Viewing Attack Chains**
- Click "View Chain" to see your complete attack path
- Attack chains show visual progression with technique labels
- Export your chain as PNG or JSON for documentation

### 4. **Resetting the Simulation**
- Use "Reset Simulation" to start over
- Try different attack paths to explore various scenarios

## Security Education

This tool is designed for educational purposes to understand:

- **Browser Security Models**: How modern browsers implement security boundaries
- **Sandbox Escapes**: Common techniques used to escape sandboxed environments  
- **Privilege Escalation**: Methods for gaining elevated system access
- **Mitigation Strategies**: Security measures that prevent these attacks

### Real-World Attack Vectors

All attack techniques are based on documented vulnerabilities:
- **V8 Engine**: Use-after-free, JIT compilation bugs, WebAssembly exploits
- **IPC Exploitation**: Mojo message handling vulnerabilities
- **GPU Drivers**: Hardware-level privilege escalation
- **Kernel Exploits**: Android kernel vulnerabilities for root access

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
