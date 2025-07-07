export interface ExploitationTechnique {
  id: string;
  name: string;
  description: string;
  detailedDescription: string;
  cves: string[];
  pocs: string[];
  mitigations: string[];
  references: string[];
  contextSpecificImpact?: string[];
}

export interface PrivilegeInfo {
  level: string;
  capabilities: string[];
  restrictions: string[];
  examples: string[];
}

export interface TargetComponent {
  id: string;
  name: string;
  description: string;
  sourcePrivilege: string;
  targetPrivilege: string;
  sourcePrivilegeInfo: PrivilegeInfo;
  targetPrivilegeInfo: PrivilegeInfo;
  techniques: ExploitationTechnique[];
}

export interface AttackVector {
  id: string;
  name: string;
  description: string;
  detailedDescription: string;
  cves: string[];
  pocs: string[];
  sourcePrivilege: string;
  targetPrivilege: string;
  mitigations: string[];
  references: string[];
  componentId: string;
  techniqueId: string;
}

export const targetComponents: TargetComponent[] = [
  // V8 Heap Sandbox Component
  {
    id: 'v8-component',
    name: 'V8 Heap Sandbox',
    description: 'Target the V8 JavaScript engine\'s heap sandbox isolation',
    sourcePrivilege: 'V8 Heap Sandbox',
    targetPrivilege: 'Renderer Process',
    sourcePrivilegeInfo: {
      level: 'V8 Heap Sandbox',
      capabilities: [
        'Execute JavaScript code',
        'Access V8 heap memory',
        'Trigger JIT compilation',
        'WebAssembly execution'
      ],
      restrictions: [
        'Limited to V8 heap memory',
        'No direct system calls',
        'No access to renderer process memory',
        'Isolated from other origins'
      ],
      examples: [
        'typeof window === "object" // true',
        'navigator.userAgent // access allowed',
        'new ArrayBuffer(1024) // heap allocation'
      ]
    },
    targetPrivilegeInfo: {
      level: 'Renderer Process',
      capabilities: [
        'Access renderer process memory',
        'DOM manipulation',
        'Network requests',
        'File system access (limited)',
        'Run system commands (sandboxed)'
      ],
      restrictions: [
        'Sandboxed environment',
        'No direct kernel access',
        'Limited file system access',
        'No raw socket access'
      ],
      examples: [
        'uname -a // Linux hostname 6.6.87.2 #1 SMP...',
        'ps aux // shows sandboxed processes',
        'cat /proc/version // kernel version info'
      ]
    },
    techniques: [
      {
        id: 'v8-type-confusion',
        name: 'Type Confusion',
        description: 'Exploit V8 type confusion vulnerabilities to escape sandbox',
        detailedDescription: 'Type confusion bugs in V8 occur when the engine incorrectly assumes the type of a JavaScript object, allowing attackers to access memory outside the intended boundaries and escape the heap sandbox.',
        cves: ['CVE-1234-1234', 'CVE-1234-1234'],
        pocs: [
          'https://example.com',
          'https://example.com'
        ],
        mitigations: [
          'V8 heap sandbox (partial mitigation)',
          'Control Flow Integrity (CFI)',
          'Type confusion mitigations'
        ],
        references: [
          'https://example.com',
          'https://example.com'
        ],
        contextSpecificImpact: [
          'Bypass V8 heap sandbox isolation',
          'Gain arbitrary read/write in renderer process memory',
          'Access sensitive renderer data like cookies, passwords, browsing history',
          'Manipulate DOM and inject malicious scripts',
          'Prepare for further IPC exploitation to escape renderer sandbox'
        ]
      },
      {
        id: 'v8-uaf',
        name: 'Use-After-Free',
        description: 'Exploit use-after-free vulnerabilities in V8 heap management',
        detailedDescription: 'Use-after-free vulnerabilities in V8 occur when memory is accessed after being freed, allowing attackers to manipulate freed memory and gain arbitrary read/write capabilities.',
        cves: ['CVE-1234-1234', 'CVE-1234-12343'],
        pocs: [
          'https://example.com'
        ],
        mitigations: [
          'AddressSanitizer (ASAN) in debug builds',
          'Heap layout randomization',
          'Delayed free mechanisms'
        ],
        references: [
          'https://example.com'
        ],
        contextSpecificImpact: [
          'Control freed memory allocation and reuse',
          'Achieve reliable code execution within renderer process',
          'Bypass ASLR through memory layout manipulation',
          'Access cross-origin data in compromised renderer',
          'Set up heap grooming for consistent exploitation'
        ]
      },
      {
        id: 'v8-jit',
        name: 'JIT Compiler Exploitation',
        description: 'Exploit vulnerabilities in V8 JIT compiler',
        detailedDescription: 'The V8 Just-In-Time (JIT) compiler optimizes JavaScript execution but introduces complexity that can lead to vulnerabilities. JIT spraying and code generation bugs can be exploited to gain code execution.',
        cves: ['CVE-1234-1234', 'CVE-1234-1234'],
        pocs: [
          'https://example.com',
          'https://example.com'
        ],
        mitigations: [
          'JIT hardening',
          'Code pointer authentication',
          'W^X enforcement'
        ],
        references: [
          'https://example.com',
          'https://example.com'
        ],
        contextSpecificImpact: [
          'Generate and execute malicious native code',
          'Bypass W^X (Write XOR Execute) protections',
          'Achieve fastest and most reliable code execution',
          'Access JIT code cache for persistent backdoors',
          'Manipulate optimized code paths for stealth'
        ]
      },
      {
        id: 'v8-wasm',
        name: 'WebAssembly Exploitation',
        description: 'Exploit WebAssembly runtime vulnerabilities',
        detailedDescription: 'WebAssembly provides a sandboxed execution environment, but vulnerabilities in the WebAssembly runtime or JIT compiler can be exploited to escape the sandbox.',
        cves: ['CVE-1234-1234', 'CVE-1234-1234'],
        pocs: [
          'https://example.com'
        ],
        mitigations: [
          'WebAssembly bounds checking',
          'Memory protection',
          'Type safety verification'
        ],
        references: [
          'https://example.com',
          'https://example.com'
        ],
        contextSpecificImpact: [
          'Escape WebAssembly sandbox restrictions',
          'Access linear memory outside bounds',
          'Execute arbitrary code through WASM runtime corruption',
          'Bypass WASM security validations',
          'Leverage WASM JIT compiler vulnerabilities'
        ]
      }
    ]
  },

  // Renderer Process Component
  {
    id: 'renderer-component',
    name: 'Renderer Process',
    description: 'Target the Chromium renderer process to escape to browser process or GPU process',
    sourcePrivilege: 'Renderer Process',
    targetPrivilege: 'Browser Process',
    sourcePrivilegeInfo: {
      level: 'Renderer Process',
      capabilities: [
        'Access renderer process memory',
        'DOM manipulation',
        'Network requests',
        'File system access (limited)',
        'Run system commands (sandboxed)'
      ],
      restrictions: [
        'Sandboxed environment',
        'No direct kernel access',
        'Limited file system access',
        'No raw socket access'
      ],
      examples: [
        'uname -a // Linux hostname 6.6.87.2 #1 SMP...',
        'ps aux // shows sandboxed processes',
        'cat /proc/version // kernel version info'
      ]
    },
    targetPrivilegeInfo: {
      level: 'Browser Process',
      capabilities: [
        'Access all browser memory',
        'Manage all tabs and processes',
        'Full file system access',
        'Network configuration',
        'System API access'
      ],
      restrictions: [
        'User-level permissions only',
        'No direct kernel access',
        'SELinux/AppArmor restrictions',
        'Android app sandbox'
      ],
      examples: [
        'ls -la /data/data/ // app data access',
        'netstat -tulpn // network connections',
        'cat /proc/self/maps // memory mappings'
      ]
    },
    techniques: [
      {
        id: 'renderer-ipc',
        name: 'IPC Manipulation',
        description: 'Exploit IPC message handling vulnerabilities',
        detailedDescription: 'The renderer process communicates with the browser process through IPC (Inter-Process Communication). Malformed or crafted IPC messages can be used to trigger vulnerabilities in the browser process, leading to sandbox escape.',
        cves: ['CVE-1234-1234', 'CVE-1234-1234'],
        pocs: [
          'https://example.com',
          'https://example.com'
        ],
        mitigations: [
          'Strict IPC message validation',
          'Site isolation',
          'Process sandboxing'
        ],
        references: [
          'https://example.com',
          'https://example.com'
        ],
        contextSpecificImpact: [
          'Send malformed IPC messages to browser process',
          'Trigger vulnerabilities in browser process message handlers',
          'Bypass message validation and sanitization',
          'Access privileged browser process APIs',
          'Escalate from sandboxed renderer to full browser privileges'
        ]
      }
    ]
  },

  // GPU Process Component
  {
    id: 'gpu-component',
    name: 'GPU Process',
    description: 'Target the GPU process to escalate privileges and access system resources',
    sourcePrivilege: 'Renderer Process',
    targetPrivilege: 'GPU Process',
    sourcePrivilegeInfo: {
      level: 'Renderer Process',
      capabilities: [
        'Access renderer process memory',
        'DOM manipulation',
        'Network requests',
        'File system access (limited)',
        'Run system commands (sandboxed)'
      ],
      restrictions: [
        'Sandboxed environment',
        'No direct kernel access',
        'Limited file system access',
        'No raw socket access'
      ],
      examples: [
        'uname -a // Linux hostname 6.6.87.2 #1 SMP...',
        'ps aux // shows sandboxed processes',
        'cat /proc/version // kernel version info'
      ]
    },
    targetPrivilegeInfo: {
      level: 'GPU Process',
      capabilities: [
        'Hardware GPU access',
        'Graphics driver interaction',
        'GPU memory management',
        'Direct hardware commands',
        'Elevated system access'
      ],
      restrictions: [
        'Limited to GPU operations',
        'Restricted system calls',
        'No direct kernel access',
        'Hardware-specific limitations'
      ],
      examples: [
        'lspci | grep VGA // GPU hardware info',
        'cat /proc/driver/nvidia/version // driver version',
        'nvidia-smi // GPU status and memory'
      ]
    },
    techniques: [
      {
        id: 'gpu-driver',
        name: 'GPU Driver Exploitation',
        description: 'Exploit vulnerabilities in GPU drivers',
        detailedDescription: 'GPU drivers run with elevated privileges and have direct hardware access. Vulnerabilities in graphics drivers can be exploited to gain system-level privileges and bypass security mechanisms.',
        cves: ['CVE-1234-1234', 'CVE-1234-1234'],
        pocs: [
          'https://example.com',
          'https://example.com'
        ],
        mitigations: [
          'GPU process sandboxing',
          'Driver validation',
          'Command buffer validation',
          'Hardware-assisted isolation'
        ],
        references: [
          'https://example.com',
          'https://example.com'
        ],
        contextSpecificImpact: [
          'Execute code in GPU driver context with elevated privileges',
          'Access graphics hardware directly bypassing OS restrictions',
          'Manipulate GPU memory mappings for DMA attacks',
          'Persist in graphics driver for system-wide access',
          'Use GPU as covert channel for data exfiltration'
        ]
      },
      {
        id: 'gpu-command-buffer',
        name: 'Command Buffer Manipulation',
        description: 'Manipulate GPU command buffers to gain control',
        detailedDescription: 'The GPU process validates and processes command buffers from the renderer. Malformed command buffers can trigger vulnerabilities in the GPU process, leading to memory corruption and code execution.',
        cves: ['CVE-1234-1234', 'CVE-1234-1234'],
        pocs: [
          'https://example.com'
        ],
        mitigations: [
          'Command buffer validation',
          'Memory protection',
          'Process isolation',
          'Hardware bounds checking'
        ],
        references: [
          'https://example.com',
          'https://example.com'
        ],
        contextSpecificImpact: [
          'Corrupt GPU process memory through malformed commands',
          'Access other processes\' GPU memory allocations',
          'Trigger GPU driver vulnerabilities through command injection',
          'Cause GPU process crashes for denial of service',
          'Leak sensitive graphics data from other applications'
        ]
      }
    ]
  },

  // GPU to Browser Escalation Component
  {
    id: 'gpu-to-browser-component',
    name: 'Browser Process',
    description: 'Escalate from GPU process to browser process',
    sourcePrivilege: 'GPU Process',
    targetPrivilege: 'Browser Process',
    sourcePrivilegeInfo: {
      level: 'GPU Process',
      capabilities: [
        'Hardware GPU access',
        'Graphics driver interaction',
        'GPU memory management',
        'Direct hardware commands',
        'Elevated system access'
      ],
      restrictions: [
        'Limited to GPU operations',
        'Restricted system calls',
        'No direct kernel access',
        'Hardware-specific limitations'
      ],
      examples: [
        'lspci | grep VGA // GPU hardware info',
        'cat /proc/driver/nvidia/version // driver version',
        'nvidia-smi // GPU status and memory'
      ]
    },
    targetPrivilegeInfo: {
      level: 'Browser Process',
      capabilities: [
        'Access all browser memory',
        'Manage all tabs and processes',
        'Full file system access',
        'Network configuration',
        'System API access'
      ],
      restrictions: [
        'User-level permissions only',
        'No direct kernel access',
        'SELinux/AppArmor restrictions',
        'Android app sandbox'
      ],
      examples: [
        'ls -la /data/data/ // app data access',
        'netstat -tulpn // network connections',
        'cat /proc/self/maps // memory mappings'
      ]
    },
    techniques: [
      {
        id: 'gpu-browser-ipc',
        name: 'GPU-Browser IPC Exploitation',
        description: 'Exploit IPC communication between GPU and browser processes',
        detailedDescription: 'The GPU process communicates with the browser process through IPC channels. Vulnerabilities in this communication can be exploited to gain browser process privileges.',
        cves: ['CVE-1234-1234', 'CVE-1234-1234'],
        pocs: [
          'https://example.com'
        ],
        mitigations: [
          'IPC message validation',
          'Process isolation',
          'Capability-based security'
        ],
        references: [
          'https://example.com'
        ],
        contextSpecificImpact: [
          'Leverage GPU process privileges to attack browser process',
          'Send elevated privilege IPC messages to browser',
          'Access browser process memory from GPU context',
          'Bypass GPU process sandboxing restrictions',
          'Combine GPU driver access with browser process control'
        ]
      },
      {
        id: 'gpu-shared-memory',
        name: 'Shared Memory Exploitation',
        description: 'Exploit shared memory regions between GPU and browser',
        detailedDescription: 'GPU and browser processes share memory regions for efficient communication. Vulnerabilities in shared memory handling can lead to memory corruption and privilege escalation.',
        cves: ['CVE-1234-1234', 'CVE-1234-1234'],
        pocs: [
          'https://example.com'
        ],
        mitigations: [
          'Memory protection',
          'Bounds checking',
          'Process isolation'
        ],
        references: [
          'https://example.com'
        ],
        contextSpecificImpact: [
          'Corrupt shared memory regions between GPU and browser',
          'Access browser process data through shared mappings',
          'Manipulate graphics data visible to browser process',
          'Trigger race conditions in shared memory access',
          'Leak browser process secrets through GPU memory'
        ]
      }
    ]
  },

  // Browser Process Component
  {
    id: 'browser-component',
    name: 'Browser Process',
    description: 'Target the browser process to escalate to system privileges',
    sourcePrivilege: 'Browser Process',
    targetPrivilege: 'System/Root',
    sourcePrivilegeInfo: {
      level: 'Browser Process',
      capabilities: [
        'Access all browser memory',
        'Manage all tabs and processes',
        'Full file system access',
        'Network configuration',
        'System API access'
      ],
      restrictions: [
        'User-level permissions only',
        'No direct kernel access',
        'SELinux/AppArmor restrictions',
        'Android app sandbox'
      ],
      examples: [
        'ls -la /data/data/ // app data access',
        'netstat -tulpn // network connections',
        'cat /proc/self/maps // memory mappings'
      ]
    },
    targetPrivilegeInfo: {
      level: 'System/Root',
      capabilities: [
        'Full system access',
        'Kernel module loading',
        'Hardware access',
        'All file system access',
        'System configuration',
        'Root command execution'
      ],
      restrictions: [
        'Hardware limitations only',
        'Secure boot restrictions',
        'Hardware security modules'
      ],
      examples: [
        'id // uid=0(root) gid=0(root) groups=0(root)',
        'cat /proc/kallsyms // kernel symbol table',
        'dmesg // kernel log messages',
        'mount -o remount,rw / // remount root filesystem'
      ]
    },
    techniques: [
      {
        id: 'browser-system',
        name: 'System Privilege Escalation',
        description: 'Exploit system-level vulnerabilities for privilege escalation',
        detailedDescription: 'Once code execution is achieved in the browser process, attackers can exploit system-level vulnerabilities or misconfigurations to gain root privileges on the Android device.',
        cves: ['CVE-1234-12342', 'CVE-1234-12342'],
        pocs: [
          'https://example.com',
          'https://example.com'
        ],
        mitigations: [
          'SELinux policies',
          'Android app sandboxing',
          'Kernel ASLR',
          'Control Flow Integrity'
        ],
        references: [
          'https://example.com',
          'https://example.com'
        ],
        contextSpecificImpact: [
          'Escape from browser process to system level',
          'Access all user data and system resources',
          'Install persistent malware and rootkits',
          'Access other applications and system services',
          'Prepare for kernel-level exploitation'
        ]
      },
      {
        id: 'browser-kernel',
        name: 'Kernel Exploitation',
        description: 'Exploit Android kernel vulnerabilities',
        detailedDescription: 'Android kernel vulnerabilities can be exploited to gain root privileges. Common attack vectors include use-after-free bugs in drivers, race conditions, and memory corruption vulnerabilities.',
        cves: ['CVE-1234-1234', 'CVE-1234-1234'],
        pocs: [
          'https://example.com',
          'https://example.com'
        ],
        mitigations: [
          'Kernel ASLR',
          'SMEP/SMAP',
          'Stack canaries',
          'Control Flow Integrity',
          'Kernel Guard'
        ],
        references: [
          'https://example.com',
          'https://example.com'
        ],
        contextSpecificImpact: [
          'Gain root/administrator privileges on the system',
          'Access kernel memory and system call table',
          'Disable security mechanisms like SMEP/SMAP',
          'Install kernel-level rootkits and backdoors',
          'Complete system compromise with highest privileges'
        ]
      }
    ]
  }
];

export const getAvailableComponents = (currentPrivilege: string): TargetComponent[] => {
  switch (currentPrivilege) {
    case 'initial':
    case 'V8 Heap Sandbox':
      return targetComponents.filter(component => 
        component.sourcePrivilege === 'V8 Heap Sandbox'
      );
    case 'Renderer Process':
      return targetComponents.filter(component => 
        component.sourcePrivilege === 'Renderer Process'
      );
    case 'GPU Process':
      return targetComponents.filter(component => 
        component.sourcePrivilege === 'GPU Process'
      );
    case 'Browser Process':
      return targetComponents.filter(component => 
        component.sourcePrivilege === 'Browser Process'
      );
    default:
      return [];
  }
};

export const createAttackVector = (component: TargetComponent, technique: ExploitationTechnique): AttackVector => {
  return {
    id: `${component.id}-${technique.id}`,
    name: `${component.name}: ${technique.name}`,
    description: technique.description,
    detailedDescription: technique.detailedDescription,
    cves: technique.cves,
    pocs: technique.pocs,
    sourcePrivilege: component.sourcePrivilege,
    targetPrivilege: component.targetPrivilege,
    mitigations: technique.mitigations,
    references: technique.references,
    componentId: component.id,
    techniqueId: technique.id,
  };
}; 