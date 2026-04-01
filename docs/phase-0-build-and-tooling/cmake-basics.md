# CMake Basics

`CMake` is a tool that helps you **generate build files for your project**.

In Linux C++ projects, you do not usually compile large programs by hand.
Instead, you describe your project in a file called:

```text
CMakeLists.txt
```

Then CMake prepares the build system for you.

After that, you build the project with tools like `make` or `ninja`.

---

## Why use CMake?

When your C++ project becomes bigger, you may have:

* many `.cpp` files
* header files in `include/`
* multiple executables
* libraries
* debug and release builds
* different platforms or compilers

Writing everything manually becomes hard to manage.

CMake helps because it:

* keeps build setup organized
* works well for multi-file projects
* separates project configuration from actual build output
* makes out-of-source builds easy
* is widely used in real C++ projects

::: tip Simple idea
A `Makefile` tells the compiler exactly what to do.

A `CMakeLists.txt` describes your project, and CMake generates the build files for you.
:::

---

## What is `CMakeLists.txt`?

`CMakeLists.txt` is the main file where you describe your project.

Inside it, you usually define:

* the minimum CMake version
* the project name
* the C++ standard
* the source files
* the executable or library to build

Here is a very small example:

```cmake
cmake_minimum_required(VERSION 3.16)

project(MyApp)

add_executable(app src/main.cpp)
```

### What this means

```cmake
cmake_minimum_required(VERSION 3.16)
```

Use CMake version `3.16` or newer.

```cmake
project(MyApp)
```

Set the project name to `MyApp`.

```cmake
add_executable(app src/main.cpp)
```

Build an executable called `app` from `src/main.cpp`.

---

## Your first simple CMake project

Suppose your project looks like this:

```text
project/
├── CMakeLists.txt
└── src/
    └── main.cpp
```

A beginner-friendly `CMakeLists.txt` could be:

```cmake
cmake_minimum_required(VERSION 3.16)

project(MyApp)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

add_executable(app src/main.cpp)
```

---

## What each line does

```cmake
cmake_minimum_required(VERSION 3.16)
```

Tells CMake which minimum version is required.

```cmake
project(MyApp)
```

Names the project.

```cmake
set(CMAKE_CXX_STANDARD 17)
```

Use C++17.

```cmake
set(CMAKE_CXX_STANDARD_REQUIRED ON)
```

Require that standard instead of falling back to an older one.

```cmake
add_executable(app src/main.cpp)
```

Create the final program named `app`.

---

## How to build with CMake

CMake usually works in **two steps**:

### Step 1: configure the project

```bash
cmake -S . -B build
```

### Step 2: build the project

```bash
cmake --build build
```

---

## What do `-S` and `-B` mean?

```bash
cmake -S . -B build
```

* `-S .` means the source directory is the current folder
* `-B build` means put build files inside the `build/` folder

This is the modern and recommended style.

::: tip Good habit
Always keep build output inside a separate `build/` directory.
:::

---

## What is an out-of-source build?

An **out-of-source build** means:

* your source files stay in the project folders
* generated build files go into a separate folder like `build/`

Example:

```text
project/
├── CMakeLists.txt
├── build/
├── include/
└── src/
```

This is better than putting build files next to your source code.

---

## Why out-of-source builds are useful

They keep your project clean.

Without them, your source folders can fill up with generated files like:

* object files
* cache files
* generated Makefiles
* temporary build data

With out-of-source builds:

* source code stays clean
* build files stay separate
* cleaning the build is easy
* switching between debug and release builds is easier

::: tip Simple idea
Your source code lives in the project folder.
Your build output lives in `build/`.
:::

---

## Real-world example

Suppose you are writing a small Linux system programming tool in C++.

Your project might look like this:

```text
project/
├── CMakeLists.txt
├── include/
│   └── logger.hpp
└── src/
    ├── main.cpp
    └── logger.cpp
```

A simple `CMakeLists.txt` could be:

```cmake
cmake_minimum_required(VERSION 3.16)

project(LoggerApp)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

add_executable(app
    src/main.cpp
    src/logger.cpp
)

target_include_directories(app PRIVATE include)
```

---

## What is `target_include_directories`?

This tells the compiler where to find header files.

```cmake
target_include_directories(app PRIVATE include)
```

Here:

* `app` is the target
* `include` is the header folder

So if your code has:

```cpp
#include "logger.hpp"
```

the compiler knows where to look.

---

## Building the project

From the project root, run:

```bash
cmake -S . -B build
cmake --build build
```

If everything works, the executable will be created inside the build folder.

---

## Debug and Release builds

CMake also makes it easy to use different build types.

### Debug build

```bash
cmake -S . -B build -DCMAKE_BUILD_TYPE=Debug
cmake --build build
```

### Release build

```bash
cmake -S . -B build -DCMAKE_BUILD_TYPE=Release
cmake --build build
```

### Why this matters

* **Debug** is useful while developing
* **Release** is better for optimized final builds

---

## Common beginner workflow

For small Linux C++ projects, this is a good pattern:

### 1. Write your `CMakeLists.txt`

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

### 2. Configure

```bash
cmake -S . -B build
```

### 3. Build

```bash
cmake --build build
```

### 4. Run the program

```bash
./build/app
```

---

## A practical beginner `CMakeLists.txt`

This is a good starting point for a small Linux C++ project:

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

---

## Example project structure

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

### What goes where

* `src/` → your `.cpp` files
* `include/` → your header files
* `CMakeLists.txt` → project build description
* `build/` → generated build output

---

## Why this is better than manual compilation

Without CMake, you keep typing compile commands by hand.

With CMake:

* your project setup is written once
* build files are generated for you
* your source tree stays cleaner
* larger projects become easier to manage

---

## Common beginner mistakes

### Putting build files in the source folder

Use out-of-source builds:

```bash
cmake -S . -B build
```

### Forgetting to add include directories

If headers are inside `include/`, tell CMake:

```cmake
target_include_directories(app PRIVATE include)
```

### Forgetting to list source files

If a `.cpp` file is not added, it will not be compiled.

### Editing files inside `build/`

The `build/` folder is generated output.
Your real source code should stay in `src/`, `include/`, and `CMakeLists.txt`.

---

## Quick cheatsheet

### Basic `CMakeLists.txt`

```cmake
cmake_minimum_required(VERSION 3.16)

project(MyApp)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

add_executable(app src/main.cpp)

target_include_directories(app PRIVATE include)
```

### Configure build

```bash
cmake -S . -B build
```

### Build

```bash
cmake --build build
```

### Run

```bash
./build/app
```

### Debug build

```bash
cmake -S . -B build -DCMAKE_BUILD_TYPE=Debug
cmake --build build
```

### Release build

```bash
cmake -S . -B build -DCMAKE_BUILD_TYPE=Release
cmake --build build
```

---

## Summary

For Linux system programming with C++, CMake is one of the most common ways to manage builds.

A `CMakeLists.txt` file helps you describe:

* your project
* your source files
* your executable
* your include paths

And out-of-source builds help you keep build output separate from source code.

::: tip Beginner takeaway
`CMakeLists.txt` describes your project.
CMake generates the build system.
The `build/` folder keeps generated files out of your source tree.
:::
