# UBSan

**UBSan** stands for **UndefinedBehaviorSanitizer**.

It is a tool that helps you find **undefined behavior** in C and C++ programs.

You enable it with this compiler flag:

```bash
-fsanitize=undefined
```

UBSan is very useful in Linux system programming because undefined behavior can cause programs to act in strange, inconsistent, or dangerous ways.

---

## What is undefined behavior?

Undefined behavior means:

> your code does something that the C++ language does not define safely

When that happens, the program might:

* crash
* print the wrong result
* behave differently on different runs
* work on one machine and fail on another
* seem fine until much later

That is what makes undefined behavior so dangerous.

::: tip Simple idea
UBSan helps catch code that is technically “not valid” at runtime, even if it compiles.
:::

---

## Why UBSan is useful

Some bugs are not simple syntax mistakes.

Your code may compile successfully, but still do something invalid while running.

UBSan helps detect issues such as:

* signed integer overflow
* invalid shifts
* division problems
* bad pointer casts
* misaligned memory access
* other undefined operations

These problems are especially important in low-level Linux C++ code, where the program interacts closely with memory and the system.

---

## A simple example

```cpp
#include <iostream>
#include <limits>

int main() {
    int x = std::numeric_limits<int>::max();
    std::cout << x + 1 << '\n';
}
```

This may look harmless, but it is a problem.

`x` is already the largest possible `int`.

So:

```cpp
x + 1
```

causes **signed integer overflow**, which is undefined behavior in C++.

Without UBSan, the program may just print a strange value.

With UBSan, you usually get a runtime report explaining the problem.

---

## Another example: invalid shift

```cpp
#include <iostream>

int main() {
    int x = 1;
    std::cout << (x << 40) << '\n';
}
```

This shifts a small integer by too many bits.

That can be undefined behavior depending on the type and platform.

UBSan can report this kind of problem at runtime.

---

## Why this matters in Linux system programming

Linux system programming often includes code that uses:

* integers for sizes and offsets
* bit operations
* pointer conversions
* low-level memory access
* buffers and binary data

In this kind of code, undefined behavior can lead to:

* wrong calculations
* corrupted logic
* inconsistent behavior
* hard-to-debug bugs

That is why UBSan is so useful during development.

---

## How to compile with UBSan

A common debug-friendly build looks like this:

```bash
g++ -Wall -Wextra -Werror -g -O0 -fsanitize=undefined main.cpp -o app
```

Then run the program:

```bash
./app
```

If UBSan detects undefined behavior, it prints a detailed runtime message.

---

## Why `-g` is important

You almost always want:

```bash
-g
```

with UBSan.

This adds debug information so reports can show:

* file names
* line numbers
* function names

Without `-g`, the output is harder to understand.

---

## Why `-O0` is often used

During debugging, it is common to use:

```bash
-O0
```

This disables compiler optimization.

That makes the program easier to debug because the generated code stays closer to the original source.

::: tip
A common UBSan setup is:

```bash
-Wall -Wextra -Werror -g -O0 -fsanitize=undefined
```

:::

---

## Example in a Makefile

```make
CXX = g++
CXXFLAGS = -Wall -Wextra -Werror -g -O0 -fsanitize=undefined -Iinclude
TARGET = app
SRC = src/main.cpp src/logger.cpp

$(TARGET): $(SRC)
	$(CXX) $(CXXFLAGS) $^ -o $@
```

This builds your program with UBSan enabled.

---

## Example in CMake

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
    -fsanitize=undefined
)

target_link_options(app PRIVATE
    -fsanitize=undefined
)
```

::: tip
Like other sanitizers, UBSan usually needs to be enabled during both compilation and linking.
:::

---

## What kinds of problems can UBSan catch?

UBSan is good at finding runtime issues such as:

* signed integer overflow
* invalid shift operations
* dividing in invalid ways
* null reference misuse in some cases
* incorrect type-related operations
* misaligned access

It is especially helpful for bugs that do not always crash immediately but still make the program incorrect.

---

## Real-world example

Suppose you are writing a Linux tool that reads binary data from a file or network socket.

You use integers for:

* buffer sizes
* offsets
* indexes
* bit flags

If one calculation overflows or one shift is invalid, the program may not crash right away.

Instead, it may produce incorrect results and keep running.

Without UBSan, this can be hard to notice.

With UBSan, you often get a clear report pointing to the bad operation.

---

## UBSan vs ASan

These two sanitizers solve different problems.

### ASan

Focuses on **memory errors**, such as:

* out-of-bounds access
* use-after-free
* buffer overflows

### UBSan

Focuses on **undefined behavior**, such as:

* signed overflow
* invalid shifts
* bad low-level operations

That is why they are often used together:

```bash
-fsanitize=address,undefined
```

This gives both memory checking and undefined behavior checking.

---

## Common beginner mistakes

### Thinking “the program runs” means the code is safe

Undefined behavior may not crash right away.

The program can keep running and still be wrong.

### Forgetting to enable UBSan during linking

Like other sanitizers, the flag usually needs to be used when linking too.

### Assuming warnings are enough

Compiler warnings are helpful, but UBSan catches problems at runtime.

### Using it only after a bug appears

UBSan is most useful when used regularly during development and testing.

---

## Quick cheatsheet

### Enable UBSan

```bash
-fsanitize=undefined
```

### Common debug setup

```bash
-Wall -Wextra -Werror -g -O0 -fsanitize=undefined
```

### Good for finding

* signed integer overflow
* invalid shifts
* undefined arithmetic behavior
* bad low-level operations
* runtime issues that may not crash immediately

---

## Beginner-friendly mental model

Think of UBSan like this:

* your code compiles
* the program runs
* but some operation is still invalid according to C++

UBSan watches for those invalid operations and warns you when they happen.

It is like a runtime checker for “this code should not be doing that.”

---

## Summary

For Linux system programming with C++, **UBSan** is one of the best tools for finding undefined behavior early.

It helps catch bugs that are often:

* subtle
* inconsistent
* hard to notice
* dangerous in low-level code

::: tip Beginner takeaway
If your code does arithmetic, bit operations, pointer-related logic, or other low-level work, UBSan can help catch mistakes that normal testing may miss.
:::
