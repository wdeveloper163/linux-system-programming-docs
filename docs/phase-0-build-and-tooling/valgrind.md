# Valgrind

**Valgrind** is a tool that helps you find **memory problems** in programs while they run.

In Linux C++ development, it is most commonly used to detect things like:

* memory leaks
* invalid memory reads
* invalid memory writes
* use of uninitialized values
* incorrect memory cleanup

It is especially useful in Linux system programming, where your code often works closely with memory, files, buffers, and low-level resources.

---

## Why Valgrind is useful

Some bugs do not fail immediately.

Your program may:

* run successfully
* produce output
* even seem correct

but still have hidden problems such as:

* leaking memory
* reading memory it should not read
* writing past valid memory
* using values that were never initialized

These bugs can be difficult to notice just by testing normally.

::: tip Simple idea
Valgrind runs your program and checks how it uses memory.
:::

---

## What Valgrind helps detect

Valgrind is commonly used to find:

* **memory leaks**
* **invalid read/write**
* **use of uninitialized values**
* **bad memory cleanup**
* **incorrect heap usage**

The most common tool is:

```bash
valgrind --leak-check=full ./app
```

This runs your program under Valgrind and prints a report.

---

## A simple memory leak example

```cpp
#include <iostream>

int main() {
    int* p = new int(42);
    std::cout << *p << '\n';
}
```

This program allocates memory with:

```cpp
new int(42)
```

but never frees it with:

```cpp
delete p;
```

So the memory is leaked.

The program may still appear to work, but Valgrind can report that leaked memory.

---

## A fixed version

```cpp
#include <iostream>

int main() {
    int* p = new int(42);
    std::cout << *p << '\n';
    delete p;
}
```

Now the memory is cleaned up properly.

---

## Another example: invalid access

```cpp
#include <iostream>

int main() {
    int* arr = new int[3]{1, 2, 3};
    std::cout << arr[5] << '\n';
    delete[] arr;
}
```

This reads outside the allocated array.

That is invalid memory access.

Valgrind can often detect this kind of bug and report where it happened.

---

## Why this matters in Linux system programming

Linux system programming often includes code that works with:

* buffers
* dynamic memory
* strings
* files
* sockets
* arrays
* low-level parsing

In this kind of code, memory mistakes can cause:

* crashes
* incorrect output
* unstable behavior
* hard-to-find bugs

Valgrind helps by checking your program while it runs.

---

## How to use Valgrind

First, compile your program with debug information:

```bash
g++ -Wall -Wextra -Werror -g -O0 main.cpp -o app
```

Then run it with Valgrind:

```bash
valgrind --leak-check=full ./app
```

---

## Why `-g` is important

You almost always want:

```bash
-g
```

when using Valgrind.

This adds debug information so Valgrind reports can show:

* source file names
* line numbers
* function names

Without `-g`, the output is much harder to understand.

---

## Why `-O0` is often used

For debugging, it is common to use:

```bash
-O0
```

This disables compiler optimization and keeps the executable closer to the original source code.

That usually makes debugging easier.

::: tip
A common Valgrind-friendly compile setup is:

```bash
-Wall -Wextra -Werror -g -O0
```

:::

---

## Common Valgrind command

The most common beginner command is:

```bash
valgrind --leak-check=full ./app
```

### What this means

* `valgrind` → run the tool
* `--leak-check=full` → show detailed memory leak information
* `./app` → run your program

---

## Example output idea

If your program leaks memory, Valgrind may report things like:

* bytes definitely lost
* where the memory was allocated
* which function caused the leak

That makes debugging much easier than guessing.

---

## Example in a Makefile

You usually do **not** add Valgrind as a compiler flag, because it is a runtime tool.

Instead, you compile normally and run the built program with Valgrind.

Example:

```make
CXX = g++
CXXFLAGS = -Wall -Wextra -Werror -g -O0 -Iinclude
TARGET = app
SRC = src/main.cpp src/logger.cpp

.PHONY: all clean valgrind

all: $(TARGET)

$(TARGET): $(SRC)
	$(CXX) $(CXXFLAGS) $^ -o $@

valgrind: $(TARGET)
	valgrind --leak-check=full ./$(TARGET)

clean:
	rm -f $(TARGET)
```

Now you can run:

```bash
make
make valgrind
```

---

## Example in CMake

Valgrind is not usually added inside `target_compile_options(...)` because it is not a compiler sanitizer flag.

Instead, you:

1. build the program normally
2. run the executable with Valgrind

Example build:

```cmake
cmake_minimum_required(VERSION 3.16)

project(MyApp)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

add_executable(app
    src/main.cpp
    src/logger.cpp
)

target_include_directories(app PRIVATE include)

target_compile_options(app PRIVATE
    -Wall
    -Wextra
    -Werror
    -g
    -O0
)
```

Then run:

```bash
valgrind --leak-check=full ./build/app
```

---

## Valgrind vs ASan

Valgrind and ASan are both used for memory debugging, but they work differently.

### ASan

* enabled at compile time
* usually faster than Valgrind
* excellent for many memory bugs
* requires recompiling with sanitizer flags

### Valgrind

* runs the built program under a checking tool
* especially well known for memory leak detection
* does not require sanitizer flags
* usually slower when running

Both are useful. Many developers use ASan often during development and Valgrind when checking leaks carefully.

---

## Real-world example

Suppose you are writing a Linux log processing tool.

It:

* reads files
* allocates buffers
* stores parsed entries
* exits normally

The program may seem fine, but if you forgot to free some allocated memory, each run leaks a little more.

Valgrind can help you catch that and show where the leaked memory came from.

That is very useful in long-running tools, daemons, and server-side programs.

---

## Common beginner mistakes

### Thinking “the program finished” means memory is fine

A program can exit successfully and still leak memory.

### Forgetting `-g`

Without debug symbols, Valgrind reports are less helpful.

### Expecting Valgrind to be a compiler flag

Valgrind is a runtime tool, not something like `-fsanitize=...`.

### Ignoring small leaks

Even small leaks matter, especially in long-running Linux processes.

---

## Quick cheatsheet

### Compile for debugging

```bash
g++ -Wall -Wextra -Werror -g -O0 main.cpp -o app
```

### Run with Valgrind

```bash
valgrind --leak-check=full ./app
```

### Good for finding

* memory leaks
* invalid reads
* invalid writes
* uninitialized value use
* heap misuse

---

## Beginner-friendly mental model

Think of Valgrind like this:

* your program runs
* Valgrind watches how it uses memory
* if memory is misused or leaked, Valgrind reports it

It is like a memory inspector for your running program.

---

## Summary

For Linux system programming with C++, **Valgrind** is one of the most useful tools for checking memory usage at runtime.

It is especially helpful for finding:

* leaks
* invalid memory access
* cleanup mistakes
* hidden memory problems in otherwise “working” programs

::: tip Beginner takeaway
If your program uses dynamic memory and you want to check for leaks or bad memory access, Valgrind is a great tool to run during testing.
:::
