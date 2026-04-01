# Debug Compiler Flags

When you build a C++ program for debugging, you want the compiler to help you:

* catch mistakes early
* keep debugging information
* avoid aggressive optimizations
* detect memory bugs and undefined behavior

That is why debug builds often use flags like these:

```bash
-Wall -Wextra -Werror -g -O0 -fsanitize=address,undefined
```

These flags are very common in Linux system programming, where small bugs can cause crashes, memory corruption, or strange runtime behavior.

---

## Why use debug flags?

During development, your goal is **not** to make the program as fast as possible.

Your goal is to make bugs easier to find.

Debug flags help because they:

* show warnings for suspicious code
* stop the build when warnings appear
* include debugging symbols
* disable optimization that can hide bugs
* detect memory errors and undefined behavior at runtime

::: tip Simple idea
A debug build is designed to help you **find problems early**, not to make the program smaller or faster.
:::

---

## The full debug flag set

A common debug setup looks like this:

```bash
-Wall -Wextra -Werror -g -O0 -fsanitize=address,undefined
```

You will usually add these to your compiler flags in a Makefile or CMake project.

Example in a Makefile:

```make
CXXFLAGS = -Wall -Wextra -Werror -g -O0 -fsanitize=address,undefined
```

---

## What each flag does

### `-Wall`

Enables a useful set of common compiler warnings.

These warnings help catch suspicious code such as:

* unused variables
* missing return values
* questionable logic

It does **not** mean “all possible warnings,” but it enables many important ones.

::: tip
`-Wall` should be enabled in almost every C++ project.
:::

---

### `-Wextra`

Enables additional warnings beyond `-Wall`.

This helps catch even more potential issues that the compiler thinks may be mistakes.

Together, `-Wall` and `-Wextra` give you a strong warning baseline.

---

### `-Werror`

Treats warnings as errors.

That means if the compiler finds a warning, the build fails.

Why is this useful?

Because warnings often point to real bugs or risky code.
Using `-Werror` forces you to fix them early instead of ignoring them.

::: warning
`-Werror` can feel strict at first, but it helps keep code clean.
:::

---

### `-g`

Adds debugging information to the binary.

This is important when using tools like:

* `gdb`
* AddressSanitizer
* stack traces

Without `-g`, debugging information is limited, and error messages are harder to understand.

Example benefit:

If your program crashes, tools can show:

* file names
* line numbers
* function names

instead of only raw addresses.

---

### `-O0`

Disables compiler optimization.

In debug builds, this is helpful because optimization can:

* rearrange code
* inline functions
* remove variables
* make debugging harder

With `-O0`, the compiled program stays closer to your original source code, which makes debugging simpler.

::: tip
Use `-O0` in debug builds so the program behaves more like the source code you wrote.
:::

---

### `-fsanitize=address,undefined`

Enables two runtime sanitizers:

* **AddressSanitizer (ASan)**
* **UndefinedBehaviorSanitizer (UBSan)**

These tools check your program while it runs and report serious bugs.

This is one of the most useful debug options in Linux C++ development.

---

## AddressSanitizer example

AddressSanitizer helps detect memory problems like:

* buffer overflows
* use-after-free
* invalid memory access
* stack out-of-bounds access

Example bug:

```cpp
#include <iostream>

int main() {
    int arr[3] = {1, 2, 3};
    std::cout << arr[5] << '\n';
}
```

This accesses memory outside the array.

Without sanitizers, the program may:

* crash
* print garbage
* seem to work sometimes

With `-fsanitize=address`, you usually get a clear runtime error message.

---

## UndefinedBehaviorSanitizer example

UBSan helps detect undefined behavior, such as:

* signed integer overflow
* invalid shifts
* bad pointer conversions
* misaligned access

Example bug:

```cpp
#include <iostream>
#include <limits>

int main() {
    int x = std::numeric_limits<int>::max();
    std::cout << x + 1 << '\n';
}
```

This causes signed integer overflow, which is undefined behavior in C++.

With UBSan enabled, the runtime usually reports the problem clearly.

---

## Real-world example

Suppose you are writing a Linux system programming project with:

* file handling
* logging
* sockets
* pointers
* arrays or buffers

A small mistake like:

* writing past a buffer
* using freed memory
* overflowing an integer
* using an uninitialized value in dangerous logic

can cause bugs that are hard to trace.

That is why debug builds often use:

```bash
-Wall -Wextra -Werror -g -O0 -fsanitize=address,undefined
```

This combination helps catch problems much earlier.

---

## Example in a Makefile

```make
CXX = g++
CXXFLAGS = -Wall -Wextra -Werror -g -O0 -fsanitize=address,undefined -Iinclude
TARGET = app
SRC = src/main.cpp src/logger.cpp

$(TARGET): $(SRC)
	$(CXX) $(CXXFLAGS) $^ -o $@
```

This creates a debug-friendly build with warnings, debug symbols, and sanitizers enabled.

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
    -fsanitize=address,undefined
)

target_link_options(app PRIVATE
    -fsanitize=address,undefined
)
```

::: tip
Sanitizer flags usually need to be added to both **compile options** and **link options**.
:::

---

## Why use both warnings and sanitizers?

Warnings and sanitizers solve different problems.

### Warnings

The compiler checks your code before the program runs.

Examples:

* unused variables
* suspicious comparisons
* missing return statements

### Sanitizers

The program is checked while it runs.

Examples:

* invalid memory access
* out-of-bounds reads/writes
* undefined behavior

Using both gives much better bug detection.

---

## When should you use these flags?

Use them during:

* local development
* debugging sessions
* testing
* CI checks for debug builds

Do **not** usually use this exact set for final release binaries, because release builds usually focus on optimization and may disable heavy sanitizer checks.

---

## Common beginner mistakes

### Using sanitizers only during compilation

If you use:

```bash
-fsanitize=address,undefined
```

you usually need it during linking too.

### Mixing debug and release ideas

A debug build is for finding bugs.
A release build is for performance.

Do not expect `-O0` debug builds to be fast.

### Ignoring warnings

Warnings often point to real problems.
That is why `-Werror` is useful.

### Forgetting `-g`

Without debug symbols, stack traces and debugger output are much less helpful.

---

## Quick cheatsheet

### Recommended debug flags

```bash
-Wall -Wextra -Werror -g -O0 -fsanitize=address,undefined
```

### Meaning

* `-Wall` → common warnings
* `-Wextra` → extra warnings
* `-Werror` → treat warnings as errors
* `-g` → add debug symbols
* `-O0` → disable optimization
* `-fsanitize=address,undefined` → enable ASan and UBSan

---

## Beginner-friendly mental model

Think of these flags like this:

* `-Wall -Wextra` → “compiler, warn me about suspicious code”
* `-Werror` → “do not let me ignore warnings”
* `-g` → “keep useful debug information”
* `-O0` → “do not optimize, keep debugging simple”
* `-fsanitize=address,undefined` → “check my program for dangerous runtime bugs”

---

## Summary

For Linux system programming with C++, a good debug build should help you catch bugs early and debug them clearly.

That is why this flag set is so useful:

```bash
-Wall -Wextra -Werror -g -O0 -fsanitize=address,undefined
```

It gives you:

* strong compiler warnings
* strict build behavior
* debug symbols
* simple non-optimized builds
* runtime checks for memory errors and undefined behavior

::: tip Beginner takeaway
Use debug flags when you are developing and testing.
They make bugs easier to find before they become bigger problems.
:::
