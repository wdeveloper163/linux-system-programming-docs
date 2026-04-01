# Project Structure (`src/`, `include/`, `build/`)

In Linux C++ projects, keeping files organized is very important.

As your project grows, you may have:

* source files
* header files
* build output
* test files
* configuration files

If everything is placed in one folder, the project becomes hard to read and harder to maintain.

That is why many C++ projects use a simple structure like this:

```text
project/
├── src/
├── include/
└── build/
```

This is a very common starting point in Linux system programming.

---

## Why project structure matters

A good folder layout helps you:

* find files quickly
* keep source code clean
* separate code from generated files
* make builds easier to manage
* work more comfortably as the project grows

::: tip Simple idea
A clean project structure makes your codebase easier to understand for both you and other developers.
:::

---

## The basic idea

Each folder has a different purpose:

* `src/` → implementation files
* `include/` → header files
* `build/` → generated build output

This separation keeps the project tidy.

---

## `src/`

The `src/` folder usually contains your **source files**.

These are the `.cpp` files where the real code is implemented.

Example:

```text
src/
├── main.cpp
├── logger.cpp
└── server.cpp
```

### What goes in `src/`

Usually:

* program entry point like `main.cpp`
* class implementations
* function implementations
* logic for features such as logging, sockets, parsing, or threads

### Example

```cpp
// src/logger.cpp
#include "logger.hpp"
#include <iostream>

void log_message(const std::string& msg) {
    std::cout << msg << '\n';
}
```

---

## `include/`

The `include/` folder usually contains your **header files**.

These are files like `.h` or `.hpp` that declare:

* functions
* classes
* constants
* interfaces

Example:

```text
include/
├── logger.hpp
└── server.hpp
```

### What goes in `include/`

Usually:

* declarations
* class definitions
* function prototypes
* shared interfaces used by multiple source files

### Example

```cpp
// include/logger.hpp
#pragma once
#include <string>

void log_message(const std::string& msg);
```

---

## Why separate `src/` and `include/`?

This makes the project easier to understand.

A common idea in C++ is:

* `include/` tells you **what exists**
* `src/` shows **how it works**

So:

* headers describe the interface
* source files contain the implementation

That separation becomes very helpful in larger projects.

---

## `build/`

The `build/` folder is usually used for **generated files**.

This folder should contain things created during the build process, not your handwritten source code.

Example contents:

```text
build/
├── app
├── CMakeCache.txt
├── CMakeFiles/
└── Makefile
```

### What goes in `build/`

Usually:

* final executable
* object files
* generated Makefiles
* CMake cache and internal build files
* other temporary build output

::: tip
The `build/` folder is usually created automatically by your build system.
:::

---

## Why keep `build/` separate?

This is called an **out-of-source build**.

It means:

* your real source code stays in `src/` and `include/`
* generated files go into `build/`

That is useful because it keeps the project clean.

Without this separation, source folders can get cluttered with:

* object files
* temporary files
* generated metadata
* compiled binaries

---

## Example project layout

Here is a small beginner-friendly example:

```text
project/
├── Makefile
├── include/
│   └── logger.hpp
├── src/
│   ├── main.cpp
│   └── logger.cpp
└── build/
```

### What each part does

* `Makefile` → build instructions
* `src/main.cpp` → program entry point
* `src/logger.cpp` → implementation of logging logic
* `include/logger.hpp` → logging declarations
* `build/` → compiled output

---

## Real-world example

Suppose you are building a small Linux logging tool.

Your project might look like this:

```text
project/
├── CMakeLists.txt
├── include/
│   └── logger.hpp
├── src/
│   ├── main.cpp
│   └── logger.cpp
└── build/
```

### How it works

* `main.cpp` calls the logging function
* `logger.hpp` declares the function
* `logger.cpp` implements it
* `build/` stores the executable and CMake-generated files

This is simple, clean, and easy to grow later.

---

## Example source and header relationship

### `include/logger.hpp`

```cpp
#pragma once
#include <string>

void log_message(const std::string& msg);
```

### `src/logger.cpp`

```cpp
#include "logger.hpp"
#include <iostream>

void log_message(const std::string& msg) {
    std::cout << msg << '\n';
}
```

### `src/main.cpp`

```cpp
#include "logger.hpp"

int main() {
    log_message("hello from linux c++");
    return 0;
}
```

This is a very common layout in C++ projects.

---

## How builds use this structure

If you are using a Makefile, you may compile with something like:

```bash
g++ -Wall -Wextra -Werror -g -Iinclude src/main.cpp src/logger.cpp -o build/app
```

### What this means

* `-Iinclude` → look for headers in `include/`
* `src/main.cpp src/logger.cpp` → compile source files from `src/`
* `-o build/app` → place the executable in `build/`

This matches the folder structure cleanly.

---

## Example with CMake

A beginner-friendly `CMakeLists.txt` might look like this:

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
```

Then you build with:

```bash
cmake -S . -B build
cmake --build build
```

This is why the `build/` folder is so useful: CMake puts generated files there instead of mixing them into your source tree.

---

## Why this structure is beginner-friendly

This layout is easy to understand because it answers 3 simple questions:

### Where is the real code?

In `src/`

### Where are the declarations and headers?

In `include/`

### Where does build output go?

In `build/`

That makes the project much less confusing.

---

## Common beginner mistakes

### Putting everything in one folder

This works for tiny examples, but becomes messy very quickly.

### Editing files inside `build/`

The `build/` folder is for generated output, not your main source code.

### Forgetting `-Iinclude`

If your headers are inside `include/`, the compiler needs to know that.

### Mixing source files and generated files

Keeping source code and build output separate makes the project easier to maintain.

---

## A good mental model

Think of the folders like this:

* `src/` = where the real program logic lives
* `include/` = where the public declarations live
* `build/` = where compiled/generated files go

So the flow is:

1. write code in `src/` and `include/`
2. build the project
3. get output in `build/`

---

## Quick cheatsheet

### Common folders

```text
src/      -> .cpp implementation files
include/  -> .hpp/.h header files
build/    -> generated build output
```

### Common compile idea

```bash
g++ -Iinclude src/main.cpp src/logger.cpp -o build/app
```

### Common CMake build

```bash
cmake -S . -B build
cmake --build build
```

---

## Summary

A clean project structure makes Linux C++ development much easier.

Using:

* `src/` for implementation
* `include/` for headers
* `build/` for generated output

helps keep your project simple, readable, and scalable.

::: tip Beginner takeaway
A good project structure keeps your code organized from the start, so your project stays clean as it grows.
:::
