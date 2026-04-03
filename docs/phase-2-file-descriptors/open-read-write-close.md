# File Descriptors (open, read, write, close)

`File Descriptor` is one of the **most important concepts** in Linux system programming.

Instead of thinking:

```text
"I am reading a file."
```

You should think:

```text
"I am reading from a file descriptor (a number given by the OS)."
```

That is how Linux actually works internally.

---

## Why understand this?

In Linux C++ projects, you often deal with:

* files on disk
* input/output (I/O)
* sockets (network)
* pipes (communication between processes)

Understanding File Descriptors helps because it:

* explains how Linux handles all I/O in the same way
* makes system calls easier to understand
* avoids bugs when working with files
* is required for learning advanced topics (pipes, sockets, epoll)

::: tip Simple idea
A `File Descriptor (FD)` is like a **ticket number**.

* You open something → OS gives you a number (FD)
* You use that number to read/write
* You close it when done
  :::

---

## The basic structure

Everything is based on a simple idea:

```text
Open → Use → Close
```

### What that means

* `open()` → ask OS to open file
* `read()` / `write()` → use it
* `close()` → release it

Example:

```text
File: notes.txt
FD: 3
```

This means:

* You opened `notes.txt`
* OS gave you `3` (file descriptor)
* You now use `3` to interact with the file

::: warning Important
You NEVER use the file name again after opening.
You always use the File Descriptor.
:::

---

## Standard File Descriptors (Default ones)

Every Linux process already has 3 file descriptors:

| FD | Name   | Purpose          |
| -- | ------ | ---------------- |
| 0  | stdin  | input (keyboard) |
| 1  | stdout | output (screen)  |
| 2  | stderr | error output     |

Example:

```cpp
write(1, "Hello\n", 6);
```

This prints to the terminal because `1 = stdout`.

---

## Your first simple Example

Let's use terminal + C++ thinking.

```bash
# Create file
echo "Hello Linux" > file.txt

# View file
cat file.txt
```

Now internally:

```text
open("file.txt") → FD 3
read(3, ...)
close(3)
```

Linux always follows this pattern.

---

## System Calls (Core APIs)

These are the **real Linux APIs** you will use in C++.

---

### `open()`

Opens a file and returns a File Descriptor.

```cpp
int fd = open("file.txt", O_RDONLY);
```

### What happens

* OS finds file
* allocates FD
* returns a number (like `3`)

---

### `read()`

Reads data from FD into memory.

```cpp
char buffer[100];
int bytes = read(fd, buffer, sizeof(buffer));
```

---

### `write()`

Writes data to FD.

```cpp
write(fd, "Hello", 5);
```

---

### `close()`

Closes FD and frees it.

```cpp
close(fd);
```

---

## Full lifecycle example

```cpp
#include <iostream>
#include <fcntl.h>
#include <unistd.h>

int main() {
    // 1. Open file
    int fd = open("file.txt", O_RDONLY);

    // 2. Read file
    char buffer[100];
    int bytes = read(fd, buffer, sizeof(buffer));

    // 3. Print to terminal
    write(1, buffer, bytes);

    // 4. Close file
    close(fd);

    return 0;
}
```

### What happens step-by-step

```text
1. open() → FD 3
2. read(3) → load file into buffer
3. write(1) → print to screen
4. close(3) → free FD
```

---

## State

File Descriptors also have **state**.

```text
FD: Has State
```

### Example state

* current position (cursor in file)
* mode (read/write)
* file status

Example:

```text
FD 3 → file.txt
Position → byte 20
Mode → read-only
```

::: tip Why this helps
If you read again, it continues from the last position!
:::

---

## Process + File Descriptor connection

Each **process has its own FD table**.

```text
Process 100 → FD 3 → file.txt
Process 200 → FD 3 → different file
```

Same number, different meaning!

### Why?

Because FD is **per-process**, not global.

---

## Example with multiple FDs

```cpp
int fd1 = open("a.txt", O_RDONLY); // maybe 3
int fd2 = open("b.txt", O_RDONLY); // maybe 4
```

```text
FD 3 → a.txt
FD 4 → b.txt
```

Now you control both separately.

---

## Common flags for `open()`

```cpp
O_RDONLY   // read only
O_WRONLY   // write only
O_RDWR     // read + write
O_CREAT    // create if not exists
O_TRUNC    // clear file
```

Example:

```cpp
open("file.txt", O_WRONLY | O_CREAT, 0644);
```

---

## A practical beginner C++ Example

Let's write to a file.

```cpp
#include <fcntl.h>
#include <unistd.h>

int main() {
    int fd = open("output.txt", O_WRONLY | O_CREAT, 0644);

    write(fd, "Hello from C++\n", 16);

    close(fd);
    return 0;
}
```

### What happens

* file created if not exists
* data written using FD
* file closed safely

---

## Real-world example

Think of a web server.

Your program:

```text
server (program)
```

Handles:

```text
FD 3 → client socket
FD 4 → file
FD 5 → log file
```

Everything (files, network, pipes) becomes:

```text
"Just File Descriptors"
```

That is the **power of Linux design**.

---

## Common beginner mistakes

### Forgetting to close FD

Leads to **resource leaks**.

### Ignoring return value

```cpp
int fd = open(...);
```

If `fd == -1`, it failed!

---

### Using filename after open

Wrong:

```cpp
read("file.txt", ...); ❌
```

Correct:

```cpp
read(fd, ...); ✅
```

---

### Buffer issues

Not checking how many bytes were read.

---

### Writing wrong size

```cpp
write(fd, buffer, sizeof(buffer)); ❌
```

Better:

```cpp
write(fd, buffer, bytes_read); ✅
```

---

## Quick cheatsheet

### Lifecycle

```text
open → read/write → close
```

### Standard FDs

```text
0 → stdin
1 → stdout
2 → stderr
```

### Common System Calls

```cpp
open()
read()
write()
close()
```

---

## Summary

For Linux system programming with C++, File Descriptors are the **foundation of all I/O**.

A File Descriptor helps you describe:

* how the OS tracks open files
* how you interact with files and devices
* how input/output actually works

Instead of thinking in terms of filenames, think in terms of:

```text
"FD (number) → resource"
```

::: tip Beginner takeaway
You don’t read files directly.
You ask Linux for a File Descriptor, then use that number to work with the file.
:::
