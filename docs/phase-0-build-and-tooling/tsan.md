# ThreadSanitizer (TSan)

**ThreadSanitizer**, usually called **TSan**, is a tool that helps you find **thread-related bugs** in C and C++ programs.

You enable it with this compiler flag:

```bash
-fsanitize=thread
```

TSan is especially useful in Linux system programming because multithreaded bugs are often:

* random
* hard to reproduce
* difficult to debug
* dependent on timing

---

## Why TSan is useful

When a program uses multiple threads, different threads may run at the same time and access the same memory.

If that shared memory is not protected correctly, the program can behave unpredictably.

These bugs may:

* happen only sometimes
* disappear when you add debug prints
* show up only under load
* look fine on one run and fail on the next

::: tip Simple idea
TSan watches how threads access shared memory while your program runs.
:::

---

## What kind of bug does TSan detect?

TSan is mainly used to detect **data races**.

A **data race** happens when:

* two or more threads access the same memory
* at least one of them writes to it
* and there is no proper synchronization

This is a serious bug because it leads to **undefined behavior**.

---

## Simple example

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

This code creates two threads, and both update the same variable:

```cpp
counter
```

The problem is that `counter` is shared, but there is no lock or synchronization.

So the result is not safe.

With TSan enabled, this is usually reported as a data race.

---

## Why this is a problem

At first, you might expect the final value to always be:

```text
200000
```

But because both threads are writing at the same time, the actual result may be wrong.

The program may still run, but the behavior is unreliable.

That is what makes thread bugs dangerous: they do not always crash immediately.

---

## A safer version

Here is the same example using a mutex:

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

Now the shared variable is protected with a mutex.

That means only one thread can modify it at a time.

This removes the race.

---

## Why this matters in Linux system programming

Threads are very common in Linux C++ programs such as:

* servers
* worker pools
* producer-consumer systems
* background task runners
* event-processing systems
* logging systems

These programs often share things like:

* counters
* queues
* flags
* caches
* configuration state

If shared data is accessed without proper synchronization, the program may fail in subtle ways.

That is why TSan is so useful during development.

---

## How to compile with TSan

A common setup looks like this:

```bash
g++ -Wall -Wextra -Werror -g -O1 -fsanitize=thread main.cpp -o app
```

Then run the program normally:

```bash
./app
```

If TSan finds a thread bug, it prints a detailed runtime report.

---

## Why `-g` is important

You almost always want:

```bash
-g
```

with TSan.

This adds debug information so reports can show:

* file names
* line numbers
* function names

Without `-g`, the output is much harder to understand.

---

## Why `-O1` is often used

For thread debugging, you will often see:

```bash
-O1
```

This keeps some optimization while still making sanitizer reports useful.

Some people also use `-O0`, but `-O1` is a common practical choice for TSan builds.

::: tip
A common TSan setup is:

```bash
-Wall -Wextra -Werror -g -O1 -fsanitize=thread
```

:::

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
Like other sanitizers, TSan usually needs to be enabled during both compilation and linking.
:::

---

## What TSan can help detect

TSan is especially good at finding:

* data races
* unsynchronized reads and writes
* shared variable access without locks
* accidental unsafe access to global or static variables

It is most useful when your program uses **multiple threads and shared state**.

---

## Real-world example

Suppose you are writing a Linux server with:

* one thread accepting work
* multiple worker threads
* a shared queue
* a shared shutdown flag
* a shared request counter

If these shared values are not protected correctly, the server may:

* count requests incorrectly
* miss shutdown signals
* behave inconsistently
* fail only under load

Without TSan, these bugs can be very hard to track down.

With TSan, you often get a direct warning about the unsafe shared access.

---

## TSan vs ASan vs UBSan

These tools check different kinds of problems.

### ASan

Finds **memory bugs**, such as:

* buffer overflows
* use-after-free
* invalid memory access

### UBSan

Finds **undefined behavior**, such as:

* signed integer overflow
* invalid shifts
* bad low-level operations

### TSan

Finds **thread-related bugs**, especially:

* data races
* unsafe shared memory access

So if your program uses threads, TSan is the sanitizer focused on concurrency bugs.

---

## Common beginner mistakes

### Thinking “it works most of the time” means it is correct

Thread bugs are often timing-dependent.
A program may appear fine and still be broken.

### Sharing data without synchronization

If multiple threads can write, or one writes while another reads, you usually need synchronization.

### Forgetting to add the sanitizer flag during linking

Like other sanitizers, TSan usually needs to be enabled during linking too.

### Expecting TSan to replace careful design

TSan is very helpful, but you still need proper thread-safe design using tools like:

* `std::mutex`
* `std::lock_guard`
* `std::atomic`

---

## Quick cheatsheet

### Enable TSan

```bash
-fsanitize=thread
```

### Common debug setup

```bash
-Wall -Wextra -Werror -g -O1 -fsanitize=thread
```

### Good for finding

* data races
* unsafe shared memory access
* missing synchronization
* thread-related bugs that appear randomly

---

## Beginner-friendly mental model

Think of TSan like this:

* your program has multiple threads
* those threads share data
* TSan watches whether that shared data is accessed safely

If two threads touch the same memory the wrong way, TSan warns you.

---

## Summary

For Linux system programming with C++, **ThreadSanitizer** is one of the best tools for debugging multithreaded code.

It helps catch thread bugs that are often:

* inconsistent
* hard to reproduce
* hidden until the program is under stress

::: tip Beginner takeaway
If your program uses threads and shared data, TSan can help you find race conditions early.
:::
