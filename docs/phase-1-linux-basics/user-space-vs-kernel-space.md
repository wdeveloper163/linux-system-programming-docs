# User Space vs Kernel Space

`User Space` and `Kernel Space` are terms often used when talking about operating systems, but in Linux system programming, they define **where your code is allowed to run**.

Instead of thinking:

```text
"My C++ code can access anything on the computer."
```

You should think:

```text
"My C++ code runs in User Space, and must ask Kernel Space for hardware access."
```

That is why understanding the boundary is so useful in Linux system programming.

---

## Why understand this?

In Linux C++ projects, you often deal with:

*   memory protection
*   hardware access (disk, network, CPU)
*   system calls (the bridge between spaces)
*   security permissions

Understanding this helps because it:

*   prevents crashes (Segmentation Faults)
*   explains permission errors
*   clarifies why some operations are slow
*   makes security concepts easier to manage

::: tip Simple idea
A `Computer` is like a **Restaurant**.

*   **User Space** → The **Dining Area** (Where customers/apps sit).
*   **Kernel Space** → The **Kitchen** (Where the chefs/OS work).
*   **System Call** → The **Waiter** (Takes orders from customers to the kitchen).

You (the app) cannot go into the kitchen. You must ask the waiter.
  :::

---

## The basic structure

The difference is made of **privileges**.

A comparison looks like this:

```text
User Space: Limited Access
Kernel Space: Full Access
```

### What that means

*   **User Space** → Your application code (restricted)
*   **Kernel Space** → The OS core (unrestricted)
*   **Boundary** → System Calls cross the line

Example:

```text
printf() : User Space (Library)
write()  : Kernel Space (System Call)
```

This means:

*   `printf` formats text in your memory
*   `write` asks the kernel to put text on the screen
*   The kernel decides if you are allowed to do it

::: warning Important
If your User Space code tries to touch Kernel memory directly, it crashes (Segfault).
:::

---

## Your first simple Example

Here is a beginner-friendly example using the terminal.

```bash
# User Space Command
echo "Hello"

# Kernel Space Action (Viewing logs)
dmesg | tail
```

### What each line does

```bash
echo "Hello"
```

Runs a program in **User Space**. It prints to your terminal.

```bash
dmesg | tail
```

Shows messages from the **Kernel Space**. These are internal OS logs.

```text
Hello
```

Output from your user program.

```text
[12345.67] USB device connected
```

Output from the kernel (hardware events).

---

## Privileges

Privileges make Kernel Space different from User Space.

Example:

```text
User Space: Normal Permissions
Kernel Space: Root Permissions
```

Instead of thinking the CPU is the same, you reuse the concept of **Modes**.

```text
CPU Protection Rings
```

::: tip Why this helps
If you want to read a file, you cannot do it directly. You must ask the kernel via a system call.
:::

---

## The Big Three Concepts

These are the most common ones you will use in Linux system programming:

| Concept | Meaning | Memory Trick | Example Value |
| :--- | :--- | :--- | :--- |
| `User` | **Your App** | **U**ser = **U**nsafe | `./app` |
| `Kernel` | **The OS** | **K**ernel = **K**ing | `vmlinuz` |
| `Syscall` | **The Bridge** | **Sys**tem = **Sys**pass | `open()` |

### How the Magic Happens (Step-by-Step)

Let's look at how a file is read:

```text
1. App requests file
2. CPU switches to Kernel Mode
3. Kernel reads disk
4. CPU switches to User Mode
5. App gets data
```

When you call a system function, the CPU performs a **context switch** before running the code.

1.  **Identify the Request:** The app calls `open()`.
    *   So, CPU pauses user code.
2.  **Switch Mode:** The CPU enters Kernel Mode.
    *   So, it can access hardware safely.
3.  **Construct the Response:**

    **Before (User Space):**
    ```text
    Code: open("file.txt")
    Access: None
    ```

    **After (Kernel Space):**
    ```text
    Action: Read Disk
    Access: Full
    Data: Returned to User
    ```

### Why use System Calls instead of direct access?

Imagine you want to read a file belonging to another user.

**Without Kernel Protection:**
Your app could read anyone's passwords directly from the disk.
```text
App → Disk (Dangerous!)
```

**With Kernel Protection:**
The kernel checks if you have permission first.
```text
App → Kernel (Check) → Disk (Safe)
```

This follows the **Security Principle** you know from web APIs (Middleware/Auth).

### When to use User Space vs Kernel Space

*   **Use `User Space` (Logic):**
    *   Usually used for **calculations**, loops, and data processing.
    *   Example: `int x = 1 + 1;`
*   **Use `Kernel Space` (Hardware):**
    *   Used when touching **files, network, or memory**.
    *   Example: `write(fd, buf, len);`

::: tip Beginner takeaway
For now, if you are doing math, stay in User Space. If you need files or network, cross the bridge to Kernel Space via System Calls.
:::

---

## Example with more than one Process

Most Linux systems have many user spaces sharing one kernel.

Example:

```text
User Space: App A, App B, App C
Kernel Space: One Single Kernel
```

### What happens here

*   `App A, B, C` are isolated from each other
*   `Kernel` manages all of them fairly
*   `Linux` prevents App A from crashing App B

If App A crashes, the Kernel stays safe! The whole computer does not freeze.

---

## Common helper System Calls

You will often see system calls like these in C++.

### `open()`

Requests access to a file.

```cpp
int fd = open("file.txt", O_RDONLY);
```

### `read()`

Requests data from a file.

```cpp
read(fd, buffer, size);
```

### `write()`

Requests data to be sent out.

```cpp
write(fd, buffer, size);
```

These are usually used together in C++:

```cpp
int fd = open("file.txt", O_RDONLY);
read(fd, buf, 10);
close(fd);
```

::: tip What `fd` means
It stands for **File Descriptor**. It is a ticket the kernel gives you to access a file.
:::

---

## A practical beginner C++ Example

This is a good starting point for a small Linux C++ project:

```cpp
#include <unistd.h>

int main() {
    // Write directly to Kernel (Standard Output)
    write(1, "Hello Kernel!\n", 14);
    return 0;
}
```

### What happens here

*   `#include <unistd.h>` → gives access to Linux API
*   `write()` → a system call (crosses to Kernel Space)
*   `1` → represents the screen (Standard Output)

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

Suppose you are building a web server (like Nginx).

Your project has:

*   User Space code (Handling HTTP logic)
*   Kernel Space interactions (Reading network packets)

Without understanding spaces, you think:

```text
"My code reads the network card directly."
```

With space knowledge, you know:

```text
"My code asks the Kernel to give me network data."
```

That is the main benefit: **stability through isolation**.

---

## Common beginner mistakes

### Confusing Library Functions and System Calls

Thinking `printf()` is the same as `write()`. (`printf` is User, `write` is Kernel boundary).

### Forgetting Permissions

Trying to open a system file without root access.

### Not checking return values

System calls can fail (return -1). Always check!

### Ignoring Context Switch Cost

Crossing from User to Kernel is "expensive" (slow). Don't do it unnecessarily.

### Confusing `User` and `Kernel` Memory

*   Use `malloc` for **User** memory.
*   Never try to access **Kernel** memory addresses.

---

## Quick cheatsheet

### Definition format

```text
User Space: Application Land
Kernel Space: OS Land
```

### Common commands

```bash
uname -a      # Check kernel version
top           # See user processes
dmesg         # See kernel logs
```

### Space Attributes

*   `User` → Restricted, Safe
*   `Kernel` → Unrestricted, Powerful
*   `Syscall` → The Bridge

### Common System Calls

```cpp
open()
read()
write()
close()
```

---

## Summary

For Linux system programming with C++, understanding **User Space vs Kernel Space** is critical.

User Space helps you describe:

*   your application logic
*   safe memory usage
*   standard calculations

Kernel Space helps you describe:

*   hardware access
*   security boundaries
*   system resources

::: tip Beginner takeaway
User Space is your home. Kernel Space is the engine room. You can visit the engine room, but only through the designated door (System Calls).
:::