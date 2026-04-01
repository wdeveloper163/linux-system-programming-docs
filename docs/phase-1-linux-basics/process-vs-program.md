# Process vs Program

`Process` and `Program` are terms often used interchangeably, but in Linux system programming, they mean **very different things**.

Instead of thinking:

```text
"The program is running."
```

You should think:

```text
"The program file is loaded into memory as a process."
```

That is why understanding the difference is so useful in Linux system programming.

---

## Why understand this?

In Linux C++ projects, you often deal with:

*   executable files on disk
*   running instances in memory
*   unique Process IDs (PIDs)
*   system calls like `fork()` and `exec()`

Understanding this helps because it:

*   clarifies how memory is used
*   explains how multiple apps run at once
*   avoids confusion when debugging
*   makes system API calls easier to manage

::: tip Simple idea
A `Program` is like a **recipe**.

A `Process` is like **cooking the meal**.

*   The recipe sits on the shelf (disk).
*   The cooking happens in the kitchen (memory).
*   You can cook the same recipe multiple times (multiple processes).
  :::

---

## The basic structure

The difference is made of **states**.

A comparison looks like this:

```text
Program: Static File
Process: Active Instance
```

### What that means

*   **Program** → stored on disk (passive)
*   **Process** → loaded in memory (active)
*   **Lifecycle** → Program exists forever, Process ends when done

Example:

```text
/bin/ls : Program
Running ls : Process
```

This means:

*   `/bin/ls` is the file on your hard drive
*   Running it creates a temporary process in RAM
*   When it finishes, the process disappears, but the program stays

::: warning Important
A program can have **many processes** running at the same time.
:::

---

## Your first simple Example

Here is a beginner-friendly example using the terminal.

```bash
# The Program (File)
ls -l /bin/ls

# The Process (Running)
ps aux | grep ls
```

### What each line does

```bash
ls -l /bin/ls
```

Shows the **Program** file details on the disk.

```bash
ps aux | grep ls
```

Shows the **Process** details in memory.

*   `ps` → list running processes
*   `aux` → show all users and details
*   `grep ls` → filter for ls

```bash
-rwxr-xr-x 1 root root ... /bin/ls
```

Shows the program is static (size, permissions).

```bash
user 1234 0.0 0.0 ... ls
```

Shows the process is dynamic (PID 1234, memory usage).

---

## State

State makes Processes different from Programs.

Example:

```text
Program: No State
Process: Has State (PID, Memory, Registers)
```

Instead of thinking the file changes, you reuse the concept of **Instance**.

```text
Process State
```

::: tip Why this helps
If you want to change the program, you edit the file. If you want to change the process, you send signals (like `kill`).
:::

---

## Process Attributes

`Linux` provides special identifiers called **Process Attributes**.

Think of these like **object properties** in JavaScript (e.g., `user.id`) or **model attributes** in PHP (e.g., `$user->id`). They are values that `Linux` fills in automatically for every running process.

You don't need to create them; the kernel knows them for you.

### The Big Three Attributes

These are the most common ones you will use in Linux system programming:

| Attribute | Meaning | Memory Trick | Example Value |
| :--- | :--- | :--- | :--- |
| `PID` | **Process ID** | **P**ersonal **I**D | `1234` |
| `PPID` | **Parent Process ID** | **P**arent **P**ID | `1000` |
| `State` | **Current Status** | **S**tatus | `Running` |

### How the Magic Happens (Step-by-Step)

Let's look at how a process starts:

```text
1. User types command
2. Kernel loads Program
3. Kernel creates Process
```

When you run a command, the kernel performs a **creation** operation before running the code.

1.  **Identify the Program:** The kernel finds `/bin/ls` on disk.
    *   So, it loads the code.
2.  **Create the Process:** The kernel allocates memory.
    *   So, it assigns a `PID`.
3.  **Construct the Execution:**

    **Before (Program):**
    ```text
    File: /bin/ls
    Size: 140KB
    ```

    **After (Process):**
    ```text
    PID: 1234
    Memory: 5MB
    State: Running
    ```

### Why use `PID` instead of the program name?

Imagine you have three terminals open running `ls`.

**Without PID:**
You cannot tell them apart. They all look like `ls`.
```text
ls
ls
ls
```

**With PID:**
Each has a unique number. You can control them individually!
```text
ls (PID 101)
ls (PID 102)
ls (PID 103)
```

This follows the **Unique Identity principle** you know from database records.

### When to use `PID` vs `Program Name`

*   **Use `PID` (Process ID):**
    *   Usually used when **managing** running tasks (killing, monitoring).
    *   Example: `kill 1234`
*   **Use `Program Name` (File):**
    *   Used when **starting** a new task.
    *   Example: `./app`

::: tip Beginner takeaway
For now, if you want to stop something, use `PID`. If you want to start something, use the Program name.
:::

---

## Example with more than one Process

Most Linux systems have multiple processes from one program.

Example:

```text
Program: /usr/bin/firefox
Processes: PID 500, PID 501, PID 502
```

### What happens here

*   `firefox` is the single program file
*   `PID 500, 501, 502` are all running instances
*   `Linux` manages them separately in memory

If you kill `PID 500`, the other processes continue! The program file is not deleted.

---

## Common helper System Calls

You will often see system calls like these in C++.

### `fork()`

Creates a new process.

```cpp
pid_t pid = fork();
```

### `exec()`

Replaces the current process with a new program.

```cpp
execl("/bin/ls", "ls", NULL);
```

### `wait()`

Pauses until a child process finishes.

```cpp
wait(NULL);
```

These are usually used together in C++:

```cpp
if (fork() == 0) {
    exec(...);
} else {
    wait(...);
}
```

::: tip What `fork` means
It tells the kernel to duplicate the current process.
:::

---

## A practical beginner C++ Example

This is a good starting point for a small Linux C++ project:

```cpp
#include <iostream>
#include <unistd.h>

int main() {
    pid_t pid = getpid();
    std::cout << "My Process ID is: " << pid << std::endl;
    return 0;
}
```

### What happens here

*   `#include <unistd.h>` → gives access to Linux API
*   `getpid()` → returns the current process ID
*   `std::cout` → prints to terminal

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

Suppose you are building a web server.

Your project has:

*   One program file (`server`)
*   Many connections (processes or threads)

Without understanding processes, you think:

```text
"One server handles one user."
```

With process knowledge, you know:

```text
"One program spawns many processes to handle many users."
```

That is the main benefit: **scalability through processes**.

---

## Common beginner mistakes

### Confusing Program and Process

Thinking deleting a process deletes the program file.

### Forgetting `PID`

Trying to kill a program by name instead of PID.

### Not checking `fork()` return

`fork()` returns different values for parent and child.

### Ignoring `wait()`

Parent processes might end before children (zombies).

### Confusing `PID` and `PPID`

*   Use `PID` for **this** process.
*   Use `PPID` for the **parent** who created this.

---

## Quick cheatsheet

### Definition format

```text
Program: File on Disk
Process: Instance in Memory
```

### Common commands

```bash
ps aux
top
kill <PID>
```

### Process Attributes

*   `PID` → Process ID (Unique)
*   `PPID` → Parent Process ID
*   `State` → Running, Sleeping, Stopped

### Common System Calls

```cpp
fork()
exec()
wait()
getpid()
```

---

## Summary

For Linux system programming with C++, understanding **Process vs Program** is the foundation.

A Program helps you describe:

*   the code on disk
*   the executable file
*   the static instructions

A Process helps you describe:

*   the running instance
*   the memory usage
*   the dynamic state

::: tip Beginner takeaway
A Program is the recipe. A Process is the cooking. You need both to understand how Linux runs your C++ code.
:::
