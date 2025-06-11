export interface ExploitationTechnique {
  id: string;
  name: string;
  description: string;
  detailedDescription: string;
  cves: string[];
  pocs: string[];
  mitigations: string[];
  references: string[];
}

export interface TargetComponent {
  id: string;
  name: string;
  description: string;
  sourcePrivilege: string;
  targetPrivilege: string;
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
    techniques: [
      {
        id: 'v8-type-confusion',
        name: 'Type Confusion',
        description: 'Exploit V8 type confusion vulnerabilities to escape sandbox',
        detailedDescription: 'Type confusion bugs in V8 occur when the engine incorrectly assumes the type of a JavaScript object, allowing attackers to access memory outside the intended boundaries and escape the heap sandbox.',
        cves: ['CVE-2023-4427', 'CVE-2022-1364'],
        pocs: [
          'https://github.com/mmx9/CVE-2023-4427',
          'https://github.com/Theori-Inc/CVE-2022-1364'
        ],
        mitigations: [
          'V8 heap sandbox (partial mitigation)',
          'Control Flow Integrity (CFI)',
          'Type confusion mitigations'
        ],
        references: [
          'https://v8.dev/blog/sandbox',
          'https://googleprojectzero.blogspot.com/2023/01/the-more-you-know-more-you-know-you.html'
        ]
      },
      {
        id: 'v8-uaf',
        name: 'Use-After-Free',
        description: 'Exploit use-after-free vulnerabilities in V8 heap management',
        detailedDescription: 'Use-after-free vulnerabilities in V8 occur when memory is accessed after being freed, allowing attackers to manipulate freed memory and gain arbitrary read/write capabilities.',
        cves: ['CVE-2023-3079', 'CVE-2021-37973'],
        pocs: [
          'https://github.com/mistymntncop/CVE-2023-3079'
        ],
        mitigations: [
          'AddressSanitizer (ASAN) in debug builds',
          'Heap layout randomization',
          'Delayed free mechanisms'
        ],
        references: [
          'https://v8.dev/blog/sandbox'
        ]
      },
      {
        id: 'v8-jit',
        name: 'JIT Compiler Exploitation',
        description: 'Exploit vulnerabilities in V8 JIT compiler',
        detailedDescription: 'The V8 Just-In-Time (JIT) compiler optimizes JavaScript execution but introduces complexity that can lead to vulnerabilities. JIT spraying and code generation bugs can be exploited to gain code execution.',
        cves: ['CVE-2023-3420', 'CVE-2022-1096', 'CVE-2021-30632'],
        pocs: [
          'https://github.com/mistymntncop/CVE-2023-3420',
          'https://github.com/r4j0x00/exploits/tree/master/chrome-0day'
        ],
        mitigations: [
          'JIT hardening',
          'Code pointer authentication',
          'W^X enforcement'
        ],
        references: [
          'https://v8.dev/blog/jitless',
          'https://doar-e.github.io/blog/2019/01/28/introduction-to-spidermonkey-exploitation/'
        ]
      },
      {
        id: 'v8-wasm',
        name: 'WebAssembly Exploitation',
        description: 'Exploit WebAssembly runtime vulnerabilities',
        detailedDescription: 'WebAssembly provides a sandboxed execution environment, but vulnerabilities in the WebAssembly runtime or JIT compiler can be exploited to escape the sandbox.',
        cves: ['CVE-2023-4761', 'CVE-2022-2856'],
        pocs: [
          'https://github.com/WebAssembly/spec/issues/1533'
        ],
        mitigations: [
          'WebAssembly bounds checking',
          'Memory protection',
          'Type safety verification'
        ],
        references: [
          'https://webassembly.org/docs/security/',
          'https://github.com/WebAssembly/design/blob/main/Security.md'
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
    techniques: [
      {
        id: 'renderer-ipc',
        name: 'IPC Manipulation',
        description: 'Exploit IPC message handling vulnerabilities',
        detailedDescription: 'The renderer process communicates with the browser process through IPC (Inter-Process Communication). Malformed or crafted IPC messages can be used to trigger vulnerabilities in the browser process, leading to sandbox escape.',
        cves: ['CVE-2023-7024', 'CVE-2023-6345', 'CVE-2022-4135', 'CVE-2021-38003'],
        pocs: [
          'https://github.com/5j9/CVE-2023-7024',
          'https://github.com/mistymntncop/CVE-2022-4135'
        ],
        mitigations: [
          'Strict IPC message validation',
          'Site isolation',
          'Process sandboxing'
        ],
        references: [
          'https://chromium.googlesource.com/chromium/src/+/main/docs/security/mojo.md',
          'https://www.chromium.org/Home/chromium-security/site-isolation/'
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
    techniques: [
      {
        id: 'gpu-driver',
        name: 'GPU Driver Exploitation',
        description: 'Exploit vulnerabilities in GPU drivers',
        detailedDescription: 'GPU drivers run with elevated privileges and have direct hardware access. Vulnerabilities in graphics drivers can be exploited to gain system-level privileges and bypass security mechanisms.',
        cves: ['CVE-2023-5997', 'CVE-2022-4262', 'CVE-2021-37975', 'CVE-2023-4863'],
        pocs: [
          'https://github.com/google/security-research/tree/master/pocs/cpus/zenbleed',
          'https://github.com/chromium/chromium/blob/main/docs/gpu/README.md'
        ],
        mitigations: [
          'GPU process sandboxing',
          'Driver validation',
          'Command buffer validation',
          'Hardware-assisted isolation'
        ],
        references: [
          'https://chromium.googlesource.com/chromium/src/+/main/docs/design/gpu_sandboxing.md',
          'https://developer.nvidia.com/blog/improving-security-nvidia-gpu-driver/'
        ]
      },
      {
        id: 'gpu-command-buffer',
        name: 'Command Buffer Manipulation',
        description: 'Manipulate GPU command buffers to gain control',
        detailedDescription: 'The GPU process validates and processes command buffers from the renderer. Malformed command buffers can trigger vulnerabilities in the GPU process, leading to memory corruption and code execution.',
        cves: ['CVE-2023-6345', 'CVE-2022-3723', 'CVE-2021-37976'],
        pocs: [
          'https://github.com/v8/v8/blob/main/test/mjsunit/regress/regress-crbug-1351138.js'
        ],
        mitigations: [
          'Command buffer validation',
          'Memory protection',
          'Process isolation',
          'Hardware bounds checking'
        ],
        references: [
          'https://www.chromium.org/developers/design-documents/gpu-command-buffer/',
          'https://source.chromium.org/chromium/chromium/src/+/main:gpu/command_buffer/'
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
    techniques: [
      {
        id: 'gpu-browser-ipc',
        name: 'GPU-Browser IPC Exploitation',
        description: 'Exploit IPC communication between GPU and browser processes',
        detailedDescription: 'The GPU process communicates with the browser process through IPC channels. Vulnerabilities in this communication can be exploited to gain browser process privileges.',
        cves: ['CVE-2023-7024', 'CVE-2022-4135', 'CVE-2021-38003'],
        pocs: [
          'https://github.com/5j9/CVE-2023-7024'
        ],
        mitigations: [
          'IPC message validation',
          'Process isolation',
          'Capability-based security'
        ],
        references: [
          'https://chromium.googlesource.com/chromium/src/+/main/docs/security/mojo.md'
        ]
      },
      {
        id: 'gpu-shared-memory',
        name: 'Shared Memory Exploitation',
        description: 'Exploit shared memory regions between GPU and browser',
        detailedDescription: 'GPU and browser processes share memory regions for efficient communication. Vulnerabilities in shared memory handling can lead to memory corruption and privilege escalation.',
        cves: ['CVE-2023-6345', 'CVE-2022-3723'],
        pocs: [
          'https://github.com/mistymntncop/CVE-2022-4135'
        ],
        mitigations: [
          'Memory protection',
          'Bounds checking',
          'Process isolation'
        ],
        references: [
          'https://www.chromium.org/developers/design-documents/gpu-command-buffer/'
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
    techniques: [
      {
        id: 'browser-system',
        name: 'System Privilege Escalation',
        description: 'Exploit system-level vulnerabilities for privilege escalation',
        detailedDescription: 'Once code execution is achieved in the browser process, attackers can exploit system-level vulnerabilities or misconfigurations to gain root privileges on the Android device.',
        cves: ['CVE-2023-21492', 'CVE-2022-20452', 'CVE-2021-39793'],
        pocs: [
          'https://github.com/ABC-01001/CVE-2023-21492-POC',
          'https://github.com/Bonfee/CVE-2022-20452'
        ],
        mitigations: [
          'SELinux policies',
          'Android app sandboxing',
          'Kernel ASLR',
          'Control Flow Integrity'
        ],
        references: [
          'https://source.android.com/security/selinux',
          'https://source.android.com/security/app-sandbox'
        ]
      },
      {
        id: 'browser-kernel',
        name: 'Kernel Exploitation',
        description: 'Exploit Android kernel vulnerabilities',
        detailedDescription: 'Android kernel vulnerabilities can be exploited to gain root privileges. Common attack vectors include use-after-free bugs in drivers, race conditions, and memory corruption vulnerabilities.',
        cves: ['CVE-2023-40283', 'CVE-2022-20421', 'CVE-2021-22600', 'CVE-2020-0041'],
        pocs: [
          'https://github.com/chompie1337/CVE-2023-40283_exploits',
          'https://github.com/google/security-research/tree/master/pocs/linux/cve-2021-22600'
        ],
        mitigations: [
          'Kernel ASLR',
          'SMEP/SMAP',
          'Stack canaries',
          'Control Flow Integrity',
          'Kernel Guard'
        ],
        references: [
          'https://source.android.com/security/kernel-security',
          'https://googleprojectzero.blogspot.com/2019/04/virtually-unlimited-memory-escaping.html'
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