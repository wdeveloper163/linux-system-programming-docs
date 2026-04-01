# Thread Debug with `-fsanitize=thread`

When you write multithreaded C++ programs on Linux, some bugs are much harder to find than normal crashes.

Your program may:

* work sometimes
* fail only once in a while
* print different results on different runs
* behave strangely under load

A common reason is a **data race**.

That is where **ThreadSanitizer** helps.

You enable it with:

```bash
-fsanitize=thread
```

This is one of the most useful tools for debugging thread-related bugs in Linux system programming.

---

## Why thread bugs are hard

In single-threaded code, execution happens in one clear order.

In multithreaded code, two or more threads may run at the same time.

That means the result can depend on:

* timing
* scheduling
* CPU behavior
* which thread runs first

So a bug may appear only sometimes, which makes it difficult to debug.

::: tip Simple idea
Thread bugs are often not obvious.
A program may look correct, but still have unsafe shared memory access.
:::

---

## What does `-fsanitize=thread` do?

`-fsanitize=thread` enables **ThreadSanitizer (TSan)**.

TSan checks your program while it runs and looks for problems such as:

* data races
* unsafe access to shared variables
* missing synchronization
* thread-related memory access issues

If it finds a problem, it prints a detailed runtime report.

---

## What is a data race?

A **data race** happens when:

* two or more threads access the same memory
* at least one access is a write
* and there is no proper synchronization

This leads to **undefined behavior**.

That means the program may:

* give wrong results
* behave inconsistently
* crash
* seem fine until later

---

## Simple example of a race

```cpp
#include <iostream>
#include <thread>

int counter = 0;

void increment() {
    for (int i = 0; i < 100000; ++i) {
        ++counter;
    }
}

int main() {
    std::thread t1(increment);
    std::thread t2(increment);

    t1.join();
    t2.join();

    std::cout << "counter = " << counter << '\n';
}
```

At first glance, this may look okay.

But it is not thread-safe.

Both threads modify `counter` at the same time, with no lock or synchronization.

So the final result may not be what you expect.

With ThreadSanitizer enabled, the program can report this as a data race.

---

## Why this matters in Linux system programming

In Linux system programming, threads are common in:

* servers
* worker pools
* producer-consumer systems
* logging systems
* background jobs
* event-driven programs

If shared state is not protected correctly, bugs can be very hard to reproduce.

That is why `-fsanitize=thread` is so useful during development.

---

## A safer version

Here is the same idea using a mutex:

```cpp
#include <iostream>
#include <thread>
#include <mutex>

int counter = 0;
std::mutex mtx;

void increment() {
    for (int i = 0; i < 100000; ++i) {
        std::lock_guard<std::mutex> lock(mtx);
        ++counter;
    }
}

int main() {
    std::thread t1(increment);
    std::thread t2(increment);

    t1.join();
    t2.join();

    std::cout << "counter = " << counter << '\n';
}
```

Now access to `counter` is synchronized.

This removes the race.

---

## How to compile with ThreadSanitizer

Example:

```bash
g++ -Wall -Wextra -Werror -g -O1 -fsanitize=thread main.cpp -o app
```

Then run:

```bash
./app
```

If ThreadSanitizer detects a race, it prints an error report.

---

## Why `-g` is useful here

You will almost always want:

```bash
-g
```

with ThreadSanitizer.

This adds debug information so reports show:

* file names
* line numbers
* function names

Without `-g`, the report is harder to understand.

---

## About optimization level

For thread debugging, it is common to use a low or moderate optimization level, often:

```bash
-O1
```

or sometimes:

```bash
-O0
```

The exact choice can vary, but the main goal is still debugging, not maximum speed.

---

## Example in a Makefile

```make
CXX = g++
CXXFLAGS = -Wall -Wextra -Werror -g -O1 -fsanitize=thread -Iinclude
TARGET = app
SRC = src/main.cpp src/worker.cpp

$(TARGET): $(SRC)
	$(CXX) $(CXXFLAGS) $^ -o $@
```

This builds your program with ThreadSanitizer enabled.

---

## Example in CMake

```cmake
cmake_minimum_required(VERSION 3.16)

project(MyApp)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

add_executable(app
    src/main.cpp
    src/worker.cpp
)

target_include_directories(app PRIVATE include)

target_compile_options(app PRIVATE
    -Wall
    -Wextra
    -Werror
    -g
    -O1
    -fsanitize=thread
)

target_link_options(app PRIVATE
    -fsanitize=thread
)
```

::: tip
Like other sanitizers, ThreadSanitizer should usually be added to both compile options and link options.
:::

---

## What kinds of bugs can it find?

ThreadSanitizer is especially useful for finding:

* multiple threads writing the same variable
* one thread reading while another writes
* missing mutex protection
* accidental shared state
* races in global or static variables

---

## Real-world example

Imagine you are building a Linux server.

You have:

* one thread accepting connections
* several worker threads
* a shared queue or shared counter
* a global shutdown flag

If that shared state is accessed without proper synchronization, the program may fail only sometimes.

ThreadSanitizer helps catch those hidden bugs before they become production issues.

---

## Common beginner mistakes

### Thinking “it works on my machine” means it is safe

Thread bugs are often timing-dependent.
A program may appear correct many times and still be broken.

### Forgetting synchronization

If multiple threads share writable data, use proper synchronization such as:

* `std::mutex`
* `std::lock_guard`
* atomics where appropriate

### Using ThreadSanitizer only sometimes

It is most useful during active development and testing of threaded code.

### Forgetting to add the flag during linking

Like other sanitizers, `-fsanitize=thread` usually needs to be present when linking too.

---

## Quick cheatsheet

### Thread debug flag

```bash
-fsanitize=thread
```

### Common debug-friendly setup

```bash
-Wall -Wextra -Werror -g -O1 -fsanitize=thread
```

### What it helps detect

* data races
* unsafe shared memory access
* missing thread synchronization

---

## Beginner-friendly mental model

Think of ThreadSanitizer like this:

* your program has multiple threads
* those threads touch the same memory
* ThreadSanitizer watches for unsafe access

If two threads use shared data the wrong way, it warns you.

---

## Summary

For Linux system programming with C++, `-fsanitize=thread` is one of the best tools for debugging multithreaded code.

It helps detect thread bugs that are often:

* random
* inconsistent
* hard to reproduce

::: tip Beginner takeaway
If your program uses threads and shared data, ThreadSanitizer can help you catch races early.
:::
