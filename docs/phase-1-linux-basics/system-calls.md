# System Calls (syscall boundary)

`System Calls` and **Function Calls** are terms often used interchangeably, but in Linux system programming, they mean **very different things**.

Instead of thinking:

```text
"I am calling a function like in JavaScript."
```

You should think:

```text
"I am requesting a service from the Operating System Kernel."
```

That is why understanding the syscall boundary is so useful in Linux system programming.

---

## Why understand this?

In Linux C++ projects, you often deal with:

*   file input/output
*   network communication
*   process management
*   error handling (`errno`)

Understanding this helps because it:

*   clarifies performance costs (context switches)
*   explains why some calls fail (permissions)
*   avoids security vulnerabilities
*   makes debugging easier with tools like `strace`

::: tip Simple idea
A `System Call` is like an **API Gateway** in web development.

*   **Your Code** → The Frontend (User Space).
*   **The Kernel** → The Backend Service (Kernel Space).
*   **Syscall** → The HTTP Request to the backend.

You cannot access the database (hardware) directly. You must call the API.
  :::

---

## The basic structure

The difference is made of **transitions**.

A comparison looks like this:

```text
Function Call: Jump within your code
System Call: Jump into the Kernel
```

### What that means

*   **Function Call** → Fast, stays in User Space
*   **System Call** → Slower, crosses to Kernel Space
*   **Boundary** → Protected by the CPU

Example:

```text
strlen() : Function Call (User Space)
write()  : System Call (Kernel Boundary)
```

This means:

*   `strlen` just counts characters in your memory
*   `write` asks the OS to send data to a file or screen
*   `write` requires permission and hardware access

::: warning Important
Every system call has a cost. Too many syscalls can slow down your program.
:::

---

## Your first simple Example

Here is a beginner-friendly example using the terminal.

```bash
# Run a program and trace syscalls
strace ls

# See only specific syscalls
strace -e open,close ls
```

### What each line does

```bash
strace ls
```

Runs `ls` and prints every **System Call** it makes.

```bash
strace -e open,close ls
```

Filters to show only file **open** and **close** requests.

```text
openat(AT_FDCWD, ".", ...) = 3
close(3) = 0
```

Shows the kernel giving a file descriptor (3) and closing it.

---

## Context Switch

Context Switch makes System Calls different from Function Calls.

Example:

```text
Function Call: No Switch
System Call: Mode Switch (User → Kernel → User)
```

Instead of thinking the CPU just jumps, you reuse the concept of **Protection**.

```text
CPU Ring Transition
```

::: tip Why this helps
If you want speed, minimize syscalls. If you want hardware access, you must pay the syscall cost.
:::

---

## The Big Three Concepts

These are the most common ones you will use in Linux system programming:

| Concept | Meaning | Memory Trick | Example Value |
| :--- | :--- | :--- | :--- |
| `Trap` | **The Instruction** | **T**rap = **T**ransition | `int 0x80` |
| `Return` | **The Result** | **R**eturn = **R**esponse | `0` or `-1` |
| `errno` | **The Error** | **E**rror **No** | `EACCES` |

### How the Magic Happens (Step-by-Step)

Let's look at how a system call executes:

```text
1. App calls write()
2. CPU traps to Kernel
3. Kernel executes request
4. Kernel returns value
5. App resumes
```

When you call a syscall, the CPU performs a **secure handover** before running the code.

1.  **Identify the Call:** The app calls `write()`.
    *   So, CPU saves current state (registers).
2.  **Switch Mode:** The CPU switches to Kernel Mode.
    *   So, it can access hardware safely.
3.  **Construct the Response:**

    **Before (User Space):**
    ```text
    Call: write(1, "Hi", 2)
    State: User Mode
    ```

    **After (Kernel Space):**
    ```text
    Action: Send to Screen
    State: Kernel Mode → User Mode
    Return: 2 (bytes written)
    ```

### Why use System Calls instead of direct hardware access?

Imagine you want to write to the network card.

**Without Syscall Boundary:**
Your app could crash the network driver directly.
```text
App → Network Card (Crash Risk!)
```

**With Syscall Boundary:**
The kernel validates the request first.
```text
App → Kernel (Validate) → Network Card (Safe)
```

This follows the **Input Validation principle** you know from web APIs.

### When to use Syscalls vs Library Functions

*   **Use `Library Functions` (Wrapper):**
    *   Usually used for **convenience** and buffering.
    *   Example: `printf()` (buffers data, calls `write` later)
*   **Use `System Calls` (Direct):**
    *   Used when you need **exact control** over the kernel.
    *   Example: `write()` (immediate execution)

::: tip Beginner takeaway
For now, use library functions for ease. Use syscalls when you need to understand exactly what the kernel is doing.
:::

---

## Example with more than one Syscall

Most Linux programs make many system calls in sequence.

Example:

```text
open() → read() → read() → close()
```

### What happens here

*   `open()` crosses the boundary once (get file)
*   `read()` crosses the boundary twice (get data)
*   `close()` crosses the boundary once (release file)
*   `Linux` tracks each crossing individually

If you read 100 times, you cross the boundary 100 times! This is why buffering (like `printf`) is often faster.

---

## Common helper System Calls

You will often see system calls like these in C++.

### `open()`

Opens a file resource.

```cpp
int fd = open("file.txt", O_RDONLY);
```

### `read()`

Reads data from a resource.

```cpp
ssize_t bytes = read(fd, buffer, size);
```

### `write()`

Writes data to a resource.

```cpp
ssize_t bytes = write(fd, buffer, size);
```

These are usually used together in C++:

```cpp
if (write(fd, buf, len) == -1) {
    // Handle error
}
```

::: tip What `errno` means
If a syscall fails, it returns `-1` and sets a global variable `errno` with the error code.
:::

---

## A practical beginner C++ Example

This is a good starting point for a small Linux C++ project:

```cpp
#include <unistd.h>
#include <iostream>

int main() {
    // Direct System Call
    ssize_t bytes = write(1, "Hello Syscall\n", 14);
    
    std::cout << "Bytes written: " << bytes << std::endl;
    return 0;
}
```

### What happens here

*   `#include <unistd.h>` → gives access to Linux API
*   `write()` → crosses the syscall boundary
*   `1` → Standard Output (your terminal)

Compile and run:

```bash
g++ main.cpp -o app
./app
```

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

Suppose you are building a high-performance log writer.

Your project has:

*   Many log messages per second
*   Need to write to disk

Without understanding syscalls, you think:

```text
"Call write() for every log message."
```

With syscall knowledge, you know:

```text
"Buffer messages and call write() less often."
```

That is the main benefit: **performance through batching**.

---

## Common beginner mistakes

### Ignoring Return Values

Syscalls return data (bytes read/written). Always check!

### Forgetting `errno`

When a syscall fails, check `errno` to know why.

### Too Many Syscalls

Calling `write()` in a loop is slow. Buffer your data.

### Confusing `printf` and `write`

`printf` is buffered (User Space). `write` is immediate (Kernel Space).

### Blocking on Syscalls

Some syscalls (like `read` on network) wait until data arrives. This pauses your program.

---

## Quick cheatsheet

### Definition format

```text
Syscall: Request to Kernel
Function: Code in User Space
```

### Common commands

```bash
strace ./app       # Trace syscalls
man 2 open         # Manual for open syscall
```

### Syscall Attributes

*   `Return` → Success (≥0) or Failure (-1)
*   `errno` → Error code on failure
*   `Blocking` → May pause execution

### Common System Calls

```cpp
open()
read()
write()
close()
fork()
```

---

## Summary

For Linux system programming with C++, understanding **System Calls** is how you talk to the OS.

System Calls help you describe:

*   hardware access requests
*   kernel boundary crossings
*   resource management

User Space Functions help you describe:

*   logic and calculations
*   buffered operations
*   convenience wrappers

::: tip Beginner takeaway
A System Call is a request ticket to the Kernel. Use them wisely, check their returns, and remember they cost more than normal functions.
:::