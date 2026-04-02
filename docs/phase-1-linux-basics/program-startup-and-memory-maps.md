# Program Startup & Memory Maps

`Program Startup` and **Running Code** are terms often used loosely, but in Linux system programming, they define **the hidden journey your code takes before `main()` begins**.

Instead of thinking:

```text
"I run ./app and main() starts immediately."
```

You should think:

```text
"The Shell calls execve, the Kernel loads memory, _start runs, then main() begins."
```

That is why understanding the startup flow is so useful in Linux system programming.

---

## Why understand this?

In Linux C++ projects, you often deal with:

*   debugging crashes (Segfaults)
*   understanding memory addresses (ASLR)
*   analyzing malware or binaries
*   optimizing load times

Understanding this helps because it:

*   explains where variables live in memory
*   clarifies why addresses change every run
*   reveals hidden dependencies (shared libraries)
*   makes debugging tools (`gdb`, `strace`) easier to use

::: tip Simple idea
A `Program Startup` is like **Loading a Website**.

*   **Shell (`./app`)** → You typing the **URL**.
*   **`execve`** → The **DNS Lookup** (finding the file).
*   **Kernel Loader** → The **Server** preparing the response.
*   **`_start`** → The **Bootstrap Script** (setup).
*   **`main()`** → The **Page Render** (your actual code).

You don't see the bootstrap, but it sets up the environment for your page.
  :::

---

## The basic structure

The difference is made of **stages**.

A comparison looks like this:

```text
User View: ./app → Output
Real View: execve → _start → main → Exit
```

### What that means

*   **`execve`** → System call to load the binary
*   **`_start`** → Entry point (before main)
*   **`main`** → Your C++ function

Example:

```text
Shell: ./app
Kernel: load elf
Runtime: _start
Code: main()
```

This means:

*   You type `./app`
*   Kernel maps memory (see `/proc/self/maps`)
*   Runtime initializes globals
*   Finally, your `main()` runs

::: warning Important
`main()` is NOT the first code that runs. `_start` is.
:::

---

## Your first simple Example

Here is a beginner-friendly example using the terminal.

```bash
# Trace the startup system call
strace -e execve ./app

# Inspect memory layout
cat /proc/self/maps
```

### What each line does

```bash
strace -e execve ./app
```

Shows the **`execve`** system call that loads your program.

```bash
cat /proc/self/maps
```

Shows the **Memory Map** of the running process.

```text
execve("./app", ["./app"], ...) = 0
```

Confirms the kernel loaded your binary.

```text
00400000-00401000 r-xp ... /path/to/app
7ffd...          rwxp ... [stack]
```

Shows where code and stack live in memory.

---

## The Startup Flow

The Startup Flow makes Program Execution different from a script.

Example:

```text
_start: Setup Environment
main: Run Logic
```

Instead of thinking `main` is the entry point, you reuse the concept of **Bootstrap**.

```text
ELF Loading Sequence
```

::: tip Why this helps
If you understand `_start`, you understand how arguments (`argc`, `argv`) reach `main()`.
:::

---

## The Big Three Stages

These are the most common ones you will use in Linux system programming:

| Stage | Meaning | Memory Trick | Example Value |
| :--- | :--- | :--- | :--- |
| `execve` | **Load Binary** | **Exec**ute **Ve**rsion | `syscall` |
| `_start` | **Entry Point** | **Start** = **Start** | `0x401000` |
| `main` | **User Code** | **Main** = **Main** Event | `int main()` |

### How the Magic Happens (Step-by-Step)

Let's look at how a program starts:

```text
1. Shell calls execve
2. Kernel maps memory (maps)
3. CPU jumps to _start
4. _start calls main
5. main returns to _start
6. _start calls exit
```

When you run `./app`, the Kernel performs a **loading** operation before running the code.

1.  **Load Binary:** The kernel reads the ELF file.
    *   So, it knows where code lives.
2.  **Map Memory:** The kernel creates `/proc/self/maps`.
    *   So, code has addresses.
3.  **Construct the Flow:**

    **Before (Shell):**
    ```text
    Command: ./app
    State: Not Running
    ```

    **After (Loaded):**
    ```text
    Memory: Mapped
    PC: At _start
    Args: Ready for main
    ```

### Why inspect `/proc/self/maps`?

Imagine you are debugging a crash at address `0x7ffd1234`.

**Without Maps:**
You don't know what that address belongs to.
```text
Address: 0x7ffd1234 (Unknown)
```

**With Maps:**
You check `/proc/self/maps` and see it's the Stack.
```text
0x7ffd0000-0x7ffdffff [stack]
```

This follows the **Debugging Principle** you know from browser DevTools (Inspecting Memory).

### When to use `strace` vs `/proc`

*   **Use `strace` (Dynamic):**
    *   Usually used for **tracking actions** (syscalls) during startup.
    *   Example: `strace ./app`
*   **Use `/proc` (Static Snapshot):**
    *   Used for **inspecting state** (memory) while running.
    *   Example: `cat /proc/self/maps`

::: tip Beginner takeaway
For now, use `strace` to see what the program does. Use `/proc/maps` to see where the program lives.
:::

---

## Example with more than one Mapping

Most Linux programs have multiple memory mappings.

Example:

```text
00400000-00401000 r-xp ... /path/to/app  (Code)
00600000-00601000 r--p ... /path/to/app  (Data)
7f...-7f...      r-xp ... /lib/x86_64... (libc)
7ffd...          rwxp ... [stack]        (Stack)
```

### What happens here

*   `app` code is mapped read-execute
*   `app` data is mapped read-write
*   `libc` is mapped separately (shared library)
*   `stack` is at a high address (grows down)

If you see `libc` in your maps, you know your program uses standard C functions.

---

## Common helper System Calls

You will often see system calls like these during startup.

### `execve()`

Loads and runs a new program.

```cpp
execve("./app", argv, envp);
```

### `mmap()`

Maps files or devices into memory (used for libraries).

```cpp
mmap(NULL, length, PROT_READ, ...);
```

### `brk()`

Adjusts the program break (end of data segment).

```cpp
brk(address);
```

These are usually used together by the **Loader**:

```text
execve → mmap (libs) → brk (heap) → _start
```

::: tip What `mmap` means
It stands for **Memory Map**. It connects a file to memory addresses.
:::

---

## A practical beginner C++ Example

This is a good starting point for a small Linux C++ project:

```cpp
#include <unistd.h>
#include <fcntl.h>
#include <iostream>

int main() {
    // Open /proc/self/maps using Linux API (not ifstream)
    int fd = open("/proc/self/maps", O_RDONLY);
    char buffer[4096];
    
    // Read raw bytes
    ssize_t bytes = read(fd, buffer, sizeof(buffer));
    buffer[bytes] = '\0'; // Null terminate
    
    std::cout << "Memory Maps:\n" << buffer << std::endl;
    close(fd);
    return 0;
}
```

### What happens here

*   `open()` → Gets a file descriptor for the virtual file
*   `read()` → Reads the kernel-generated text (Linux API)
*   `buffer` → Stores the memory map output
*   `close()` → Releases the descriptor

Compile and run:

```bash
g++ main.cpp -o app
./app
```

::: warning Gotcha: cmdline
If you read `/proc/self/cmdline`, arguments are separated by `\0` (null bytes), not spaces. `std::cout` will stop at the first null byte! You must replace `\0` with spaces manually.
:::

---

## Example project structure

```text
project/
├── Makefile
├── include/
│   └── helper.hpp
└── src/
    ├── main.cpp
    └── helper.cpp
```

### What goes where

*   `src/` → your `.cpp` source files
*   `include/` → your header files
*   `Makefile` → build instructions

This is a common layout in Linux system programming.

---

## Real-world example

Suppose you are debugging a segmentation fault.

Your project has:

*   Crash at address `0x7f1234`
*   Unknown cause

Without understanding maps, you think:

```text
"Maybe my code is wrong."
```

With map knowledge, you know:

```text
"Check /proc/maps. Is 0x7f1234 in [stack] or [heap]?"
```

That is the main benefit: **precise debugging through memory visibility**.

---

## Common beginner mistakes

### Assuming `main` is First

Forgetting `_start` runs before `main`.

### Ignoring ASLR

Addresses change every run. Don't hardcode pointers.

### Reading `cmdline` Wrong

Treating `/proc/self/cmdline` as a normal string (forgetting `\0` separators).

### Confusing `maps` and `mem`

`maps` is text (readable). `mem` is binary (raw memory).

### Forgetting `close()`

Even virtual files need `close()` to release the file descriptor.

---

## Quick cheatsheet

### Definition format

```text
execve: Load Program
_start: Entry Point
main: User Logic
```

### Common commands

```bash
strace -e execve ./app
cat /proc/self/maps
pmap -x [pid]
```

### Startup Attributes

*   `execve` → Syscall to start
*   `_start` → First instruction
*   `maps` → Memory layout

### Common System Calls

```cpp
execve()
mmap()
brk()
open()
```

---

## Summary

For Linux system programming with C++, understanding **Startup Flow & Memory Maps** is how you trace execution.

Startup Flow helps you describe:

*   how binaries load
*   where execution begins
*   how arguments arrive

Memory Maps help you describe:

*   where code lives
*   where stack/heap are
*   what libraries are used

::: tip Beginner takeaway
`main()` is just a function called by `_start`. `/proc/self/maps` is your map to find where everything lives in memory. Use them to debug like a pro.
:::