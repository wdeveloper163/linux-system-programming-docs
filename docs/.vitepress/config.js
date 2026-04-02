export default {
  base: '/linux-system-programming-docs/',
  title: 'Linux System Programming',
  description: 'Beginner-friendly notes and practical guides for learning Linux system programming with C++, build tooling, debugging, sanitizers, and project workflows.',
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' }
    ],
    search: {
      provider: 'local'
    },
    sidebar: [
      {
        text: 'Phase 0: Build & Tooling',
        collapsed: true,
        items: [
          { text: 'Makefile basics', link: '/phase-0-build-and-tooling/makefile-basics' },
          { text: 'CMake basics', link: '/phase-0-build-and-tooling/cmake-basics' },
          {
            text: 'Compiler flags',
            items: [
              { text: 'Debug', link: '/phase-0-build-and-tooling/compiler-flags/debug' },
              { text: 'Thread debug', link: '/phase-0-build-and-tooling/compiler-flags/thread-debug' },
              { text: 'Release', link: '/phase-0-build-and-tooling/compiler-flags/release' }
            ]
          },
          { text: 'AddressSanitizer (ASan)', link: '/phase-0-build-and-tooling/asan' },
          { text: 'UBSan', link: '/phase-0-build-and-tooling/ubsan' },
          { text: 'ThreadSanitizer (TSan)', link: '/phase-0-build-and-tooling/tsan' },
          { text: 'Valgrind', link: '/phase-0-build-and-tooling/valgrind' },
          { text: 'Project structure', link: '/phase-0-build-and-tooling/project-structure' },
          { text: 'Practical: Build, Debug and Validate', link: '/phase-0-build-and-tooling/projects' }
        ]
      },
      {
        text: 'Phase 1: Linux Basics',
        collapsed: true,
        items: [
            { text: 'Process vs Program', link: '/phase-1-linux-basics/process-vs-program' },
            { text: 'User space vs Kernel space', link: '/phase-1-linux-basics/user-space-vs-kernel-space' },
            { text: 'System calls (syscall boundary)', link: '/phase-1-linux-basics/system-calls' },
            { text: 'Memory layout (stack, heap, text, BSS)', link: 'phase-1-linux-basics/memory-layout' },
        ]
      }
    ]
  }
}
