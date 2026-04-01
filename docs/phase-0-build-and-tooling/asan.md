# AddressSanitizer (ASan)

**AddressSanitizer**, usually called **ASan**, is a tool that helps you find **memory bugs** in C and C++ programs.

You enable it with this compiler flag:

```bash
-fsanitize=address
```

ASan is one of the most useful tools in Linux system programming because memory mistakes in low-level code can be very hard to debug.

---

## Why ASan is useful

In C++, your program works directly with memory.

That means bugs like these can happen:

* reading past the end of an array
* writing outside a buffer
* using memory after it was freed
* freeing memory twice
* accessing invalid stack memory

Without ASan, these bugs may:

* crash immediately
* crash much later
* produce wrong results
* seem to work sometimes

That makes them difficult to track down.

::: tip Simple idea
ASan watches your program while it runs and reports dangerous memory access.
:::

---

## What does ASan detect?

ASan is mainly used to catch memory errors such as:

* **buffer overflows**
* **heap use-after-free**
* **stack out-of-bounds access**
* **double free**
* **invalid memory access**

These are common problems in systems code.

---

## Basic example

Here is a simple bug:

```cpp
#include <iostream>

int main() {
    int arr[3] = {1, 2, 3};
    std::cout << arr[5] << '\n';
}
```

The array has only 3 elements:

* `arr[0]`
* `arr[1]`
* `arr[2]`

But this code reads:

```cpp
arr[5]
```

That is out of bounds.

Without ASan, the program may:

* print garbage
* crash
* appear to work

With ASan enabled, you usually get a runtime error report showing the problem.

---

## Another common bug: use-after-free

```cpp
#include <iostream>

int main() {
    int* p = new int(42);
    delete p;

    std::cout << *p << '\n';
}
```

Here:

* memory is allocated
* then freed with `delete`
* then used again

That is called **use-after-free**.

This is a serious memory bug, and ASan is very good at finding it.

---

## Why this matters in Linux system programming

Linux system programming often involves:

* buffers
* file I/O
* sockets
* manual memory handling
* pointers
* arrays
* performance-sensitive code

In that kind of code, even a small memory bug can cause:

* crashes
* security issues
* random behavior
* hard-to-reproduce failures

That is why ASan is so valuable during development.

---

## How to compile with ASan

A common debug-friendly build looks like this:

```bash
g++ -Wall -Wextra -Werror -g -O0 -fsanitize=address main.cpp -o app
```

Then run the program normally:

```bash
./app
```

If ASan detects a memory bug, it prints a detailed report.

---

## Why `-g` is important

You almost always want:

```bash
-g
```

with ASan.

This adds debug information so error messages can show:

* file names
* line numbers
* function names

Without `-g`, the report is much harder to read.

---

## Why `-O0` is often used

During debugging, it is common to use:

```bash
-O0
```

This disables optimization.

That makes debugging easier because the compiled program stays closer to your source code.

::: tip
A common ASan setup is:

```bash
-Wall -Wextra -Werror -g -O0 -fsanitize=address
```

:::

---

## Example in a Makefile

```make
CXX = g++
CXXFLAGS = -Wall -Wextra -Werror -g -O0 -fsanitize=address -Iinclude
TARGET = app
SRC = src/main.cpp src/logger.cpp

$(TARGET): $(SRC)
	$(CXX) $(CXXFLAGS) $^ -o $@
```

This builds your program with ASan enabled.

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
    -fsanitize=address
)

target_link_options(app PRIVATE
    -fsanitize=address
)
```

::: tip
Sanitizer flags usually need to be added during both compilation and linking.
:::

---

## What an ASan report helps you see

When ASan finds a problem, it usually tells you:

* what kind of memory bug happened
* where it happened
* which line of code caused it
* sometimes where the bad memory was allocated or freed

That makes debugging much faster than guessing from a crash.

---

## Real-world example

Suppose you are writing a Linux server that reads data into a fixed-size buffer.

If your code accidentally writes past the end of that buffer, the program may behave strangely only under certain inputs.

Without ASan, the bug may look random.

With ASan, you often get a direct report pointing to the exact bad access.

That is why many developers use ASan regularly while developing systems code.

---

## What ASan does not replace

ASan is extremely useful, but it does not replace:

* good code review
* careful bounds checking
* safe design
* unit testing

It is a debugging tool, not a substitute for writing careful code.

---

## Common beginner mistakes

### Thinking “no crash” means no memory bug

A program can have memory corruption and still appear to work.

### Forgetting to add ASan during linking

This often causes build problems or missing sanitizer behavior.

### Using ASan only after a big bug appears

It is better to use it early during development and testing.

### Expecting ASan in final production builds

ASan adds overhead, so it is mainly for debugging, testing, and development.

---

## Quick cheatsheet

### Enable ASan

```bash
-fsanitize=address
```

### Common debug setup

```bash
-Wall -Wextra -Werror -g -O0 -fsanitize=address
```

### Good for finding

* out-of-bounds access
* buffer overflows
* use-after-free
* invalid memory access
* double free

---

## Beginner-friendly mental model

Think of ASan like this:

* your program uses memory
* ASan watches that memory use at runtime
* if your code touches memory the wrong way, ASan warns you

It is like a safety checker for memory mistakes.

---

## Summary

For Linux system programming with C++, **AddressSanitizer** is one of the best tools for finding memory bugs early.

It helps detect problems that are often:

* dangerous
* hard to reproduce
* difficult to debug manually

::: tip Beginner takeaway
If your program works with pointers, arrays, buffers, or dynamic memory, ASan can save you a lot of debugging time.
:::
