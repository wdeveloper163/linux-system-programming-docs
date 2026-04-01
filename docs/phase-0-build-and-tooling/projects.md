# Practical: Build, Debug and Validate

Phase 1 is where you **apply the build tooling basics in a small real workflow**.

By this point, you have already learned:

* Makefile basics
* CMake basics
* debug compiler flags
* release compiler flags
* ASan
* UBSan
* TSan
* Valgrind
* basic project structure

Now the goal is to use those ideas in practice.

---

## Phase 1 goal

In this phase, you should be able to:

* create a **reusable Makefile template**
* build code with sanitizers during development
* run **ASan** on buggy code
* understand what the ASan report is telling you
* use **Valgrind** before calling the work done

::: tip Simple idea
Phase 1 is not just about writing code.

It is about building the habit of using the right tools while you write code.
:::

---

## Expected output

At the end of Phase 1, you should produce:

* a **reusable Makefile template**
* a working example where you **run ASan on buggy code and interpret the output**

These are the practical deliverables for this phase.

---

## What “reusable Makefile template” means

You are not writing a Makefile for only one tiny file.

You are creating a Makefile that can be reused for small Linux C++ projects with only minor changes.

A good template should already support:

* compiler variables
* debug-friendly flags
* sanitizer builds for development
* helpful targets like `all`, `run`, and `clean`

### Example reusable Makefile template

```make
CXX = g++
CXXFLAGS = -Wall -Wextra -Werror -g -O0 -fsanitize=address,undefined -Iinclude
TARGET = app
SRC = src/main.cpp src/logger.cpp

.PHONY: all run clean

all: $(TARGET)

$(TARGET): $(SRC)
	$(CXX) $(CXXFLAGS) $^ -o $@

run: $(TARGET)
	./$(TARGET)

clean:
	rm -f $(TARGET)
```

This is called reusable because you can change:

* `TARGET`
* `SRC`

and use the same structure again in another project.

---

## What “run ASan on buggy code” means

You should take a small buggy program, compile it with **AddressSanitizer**, run it, and examine the output.

This is important because in Linux system programming, memory bugs are common and often hard to find manually.

Example buggy code:

```cpp
#include <iostream>

int main() {
    int arr[3] = {1, 2, 3};
    std::cout << arr[5] << '\n';
    return 0;
}
```

This code reads outside the array bounds.

That is a real bug.

---

## How to run ASan on the buggy code

Compile it with ASan enabled:

```bash
g++ -Wall -Wextra -Werror -g -O0 -fsanitize=address buggy.cpp -o buggy
```

Then run it:

```bash
./buggy
```

ASan should report a memory error.

---

## What “interpret output” means

Do not stop at “ASan found an error”.

You should be able to explain:

* what kind of bug happened
* where it happened
* why it happened
* what code needs to be fixed

### Example interpretation

If ASan reports an out-of-bounds read, your interpretation should sound like this:

> The program accessed memory outside the valid range of the array.
> The array has 3 elements, but the code tries to read `arr[5]`.
> ASan points to the exact line where the invalid access happens.
> The fix is to make sure the index stays within bounds.

That is the real skill being practiced here.

---

## Phase 1 workflow

A good Phase 1 workflow looks like this:

### 1. Create the project structure

```text
project/
├── Makefile
├── include/
├── src/
└── build/
```

### 2. Add a reusable Makefile

Use a Makefile that supports development builds with sanitizers.

### 3. Write or use a small buggy program

The bug should be simple enough to understand, such as:

* out-of-bounds access
* use-after-free
* invalid pointer access

### 4. Build with sanitizers

Use ASan during development.

### 5. Run the program

Trigger the bug and read the sanitizer output.

### 6. Explain the error

Describe clearly what went wrong.

### 7. Fix the bug

Update the code and rebuild.

### 8. Run Valgrind

Check that the final version is clean before marking the task done.

---

## Required checks

Phase 1 includes two important checks.

### 1. Always build with sanitizers in development

During development, you should build with sanitizer flags enabled.

Example:

```bash
-Wall -Wextra -Werror -g -O0 -fsanitize=address,undefined
```

This helps catch bugs early while the code is still changing.

::: warning Important
Do not treat sanitizers as optional during development in this phase.

They are part of the expected workflow.
:::

---

### 2. Valgrind clean before marking done

Before saying the task is complete, run Valgrind on the finished program.

Example:

```bash
valgrind --leak-check=full ./app
```

You want the final result to be clean from obvious memory issues such as:

* leaks
* invalid reads
* invalid writes

::: tip
ASan helps catch memory bugs during development.

Valgrind gives you one more strong check before you call the phase complete.
:::

---

## Why both ASan and Valgrind matter

It is useful to use both tools because they help in different ways.

### ASan

Great during active development.

It helps quickly catch:

* out-of-bounds access
* use-after-free
* invalid memory access

### Valgrind

Very useful as a final memory check.

It helps confirm:

* no obvious leaks
* no bad memory use in the tested run

So the Phase 1 habit is:

* develop with sanitizers
* validate with Valgrind before finishing

---

## Real-world example mindset

Imagine you are building a small Linux utility.

At first, the program compiles and runs.

That does **not** mean it is correct.

A good systems programmer asks:

* did I build with warnings enabled?
* did I run with sanitizers?
* did I check for leaks?
* did I verify memory safety before calling it done?

That is exactly the habit Phase 1 is teaching.

---

## What success looks like

You can consider Phase 1 successful if you can do all of these:

* organize the project cleanly
* use a reusable Makefile
* build with sanitizer-enabled debug flags
* run buggy code under ASan
* explain the sanitizer report in simple words
* fix the issue
* run Valgrind and confirm the result is clean

---

## A practical example checklist

Here is a simple checklist for Phase 1:

### Build setup

* [ ] project has `src/`, `include/`, and `build/`
* [ ] project has a reusable Makefile
* [ ] development build uses sanitizers

### Bug investigation

* [ ] buggy code is compiled with ASan
* [ ] ASan report is produced
* [ ] report is interpreted correctly
* [ ] code is fixed

### Final validation

* [ ] project rebuilds cleanly
* [ ] Valgrind is run
* [ ] no important memory issues remain

---

## Beginner-friendly mental model

Think of Phase 1 like this:

* the **Makefile** gives you a repeatable build process
* **ASan** helps you catch bugs while developing
* **Valgrind** helps you verify memory safety before finishing

So Phase 1 is really about building this habit:

> build carefully, debug with tools, and verify before done

---

## Summary

Phase 1 is your first practical tooling milestone.

The main outputs are:

* a reusable Makefile template
* an ASan run on buggy code, with clear interpretation of the result

And the required checks are:

* always use sanitizers during development
* make sure Valgrind is clean before marking the task done

::: tip Beginner takeaway
Phase 1 is less about writing a big project and more about learning a professional workflow for building, testing, and checking Linux C++ code.
:::
