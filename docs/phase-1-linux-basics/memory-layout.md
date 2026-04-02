# Memory Layout (stack, heap, text, BSS)

`Memory Layout` and **RAM** are terms often used when talking about computers, but in Linux system programming, they define **where your variables live and how long they last**.

Instead of thinking:

```text
"My variables are just stored somewhere in memory."
```

You should think:

```text
"My variables are stored in specific segments (Stack, Heap, Text) with different rules."
```

That is why understanding the memory layout is so useful in Linux system programming.

---

## Why understand this?

In Linux C++ projects, you often deal with:

*   variable scope and lifetime
*   memory leaks (forgotten heap memory)
*   stack overflows (too much recursion)
*   segmentation faults (accessing wrong areas)

Understanding this helps because it:

*   prevents crashes (Segfaults)
*   explains performance differences (Stack is faster)
*   clarifies why variables lose value
*   makes debugging memory issues easier

::: tip Simple idea
A `Program` is like an **Office Building**.

*   **Text Segment** → The **Blueprints** (Fixed instructions on the wall).
*   **Data/BSS** → The **Filing Cabinets** (Global data, stays forever).
*   **Stack** → Your **Desk** (Temporary work, cleaned when you leave).
*   **Heap** → The **Storage Room** (You grab space, you must return it).

You work at your desk, but if you need big storage, you go to the storage room.
  :::

---

## The basic structure

The difference is made of **lifetime**.

A comparison looks like this:

```text
Stack: Automatic Cleanup
Heap: Manual Cleanup
```

### What that means

*   **Stack** → Local variables, function calls (fast, automatic)
*   **Heap** → Dynamic memory, large data (slow, manual)
*   **Text/BSS** → Code and globals (static, fixed)

Example:

```text
int x = 10;      : Stack (Inside function)
int *p = new int : Heap (Dynamic allocation)
```

This means:

*   `x` disappears when the function ends
*   `*p` stays until you call `delete`
*   If you forget `delete`, you leak memory

::: warning Important
If you access memory you don't own (like freed heap), you crash (Segfault).
:::

---

## Your first simple Example

Here is a beginner-friendly example using the terminal.

```bash
# Compile the program
g++ main.cpp -o app

# View memory segments sizes
size app
```

### What each line does

```bash
g++ main.cpp -o app
```

Creates the executable file with all segments included.

```bash
size app
```

Shows the size of **Text**, **Data**, and **BSS** segments.

```text
   text    data     bss     dec     hex filename
   1400     200     100    1700     6a4 app
```

*   `text` → Code size
*   `data` → Initialized globals
*   `bss` → Uninitialized globals

---

## Segments

Segments make Memory Layout different from random access.

Example:

```text
Stack: Grows Down
Heap: Grows Up
```

Instead of thinking memory is one big block, you reuse the concept of **Zones**.

```text
Virtual Memory Regions
```

::: tip Why this helps
If you know where data lives, you know how to manage it. Stack data manages itself. Heap data needs you.
:::

---

## The Big Four Segments

These are the most common ones you will use in Linux system programming:

| Segment | Meaning | Memory Trick | Example Value |
| :--- | :--- | :--- | :--- |
| `Text` | **Code** | **T**ext = **T**yped Code | `main()` |
| `Stack` | **Local Vars** | **S**tack = **S**hort-lived | `int x` |
| `Heap` | **Dynamic Mem** | **H**eap = **H**uman managed | `new int` |
| `BSS` | **Zeroed Data** | **B**SS = **B**lank Start | `static int x` |

### How the Magic Happens (Step-by-Step)

Let's look at how memory is allocated when running:

```text
1. Load Program (Text)
2. Initialize Globals (BSS/Data)
3. Run Main (Stack)
4. Allocate Dynamic (Heap)
```

When you run a program, the OS performs a **mapping** operation before running the code.

1.  **Load Code:** The binary is mapped to Text segment.
    *   So, instructions are ready.
2.  **Setup Stack:** A stack frame is created for `main()`.
    *   So, local variables have space.
3.  **Construct the Layout:**

    **Before (Run):**
    ```text
    File: app (on disk)
    Memory: None
    ```

    **After (Run):**
    ```text
    Text: Loaded
    Stack: Active
    Heap: Empty (ready for new)
    ```

### Why use Stack instead of Heap?

Imagine you need a temporary variable for a calculation.

**Without Stack (Using Heap):**
You must allocate and free manually. Slow and verbose.
```cpp
int *x = new int;
*x = 10;
// ... use it ...
delete x; // Must remember this!
```

**With Stack (Automatic):**
The CPU handles it instantly.
```cpp
int x = 10;
// ... use it ...
// Gone automatically!
```

This follows the **Scope Principle** you know from JavaScript blocks `{}`.

### When to use Stack vs Heap

*   **Use `Stack` (Local):**
    *   Usually used for **small, temporary** data.
    *   Example: `int count = 0;`
*   **Use `Heap` (Dynamic):**
    *   Used when you need **large or persistent** data.
    *   Example: `std::vector`, large arrays, objects shared across functions.

::: tip Beginner takeaway
For now, use Stack for everything small. Use Heap only when you need data to survive after a function ends.
:::

---

## Example with more than one Function

Most Linux C++ projects have multiple function calls stacking up.

Example:

```text
main() calls funcA() calls funcB()
```

### What happens here

*   `main()` creates a stack frame
*   `funcA()` creates a new stack frame on top
*   `funcB()` creates another frame on top
*   `Linux` removes them in reverse order (LIFO)

If `funcB()` finishes, its stack memory is instantly free. `funcA()` continues safely.

---

## Common helper System Calls

You will often see memory calls like these in C++.

### `malloc()`

Allocates heap memory (C-style).

```cpp
void *ptr = malloc(100);
```

### `free()`

Releases heap memory (C-style).

```cpp
free(ptr);
```

### `new` / `delete`

Allocates heap memory (C++-style).

```cpp
int *ptr = new int;
delete ptr;
```

These are usually used together in C++:

```cpp
int *arr = new int[10];
// use arr
delete[] arr;
```

::: tip What `malloc` means
It stands for **Memory Allocate**. It asks the Kernel for heap space.
:::

---

## A practical beginner C++ Example

This is a good starting point for a small Linux C++ project:

```cpp
#include <iostream>

void myFunction() {
    int stackVar = 10; // Stack
    int *heapVar = new int(20); // Heap
    delete heapVar; // Clean up
}

int main() {
    myFunction();
    return 0;
}
```

### What happens here

*   `stackVar` → Lives only inside `myFunction`
*   `heapVar` → Lives until `delete` is called
*   `main` → Entry point, bottom of the stack

Compile and run:

```bash
g++ main.cpp -o app
./app
```

---

## Example project structure

```text
project/
├── Makefile
├── include/
│   └── helper.hpp
└── src/
    ├── main.cpp
    └── helper.cpp
```

### What goes where

*   `src/` → your `.cpp` source files
*   `include/` → your header files
*   `Makefile` → build instructions

This is a common layout in Linux system programming.

---

## Real-world example

Suppose you are building a web server request handler.

Your project has:

*   Request data (temporary)
*   Log buffers (persistent)

Without understanding memory, you think:

```text
"Store everything in global variables."
```

With memory layout knowledge, you know:

```text
"Store request data on Stack (auto-cleanup). Store logs on Heap (persistent)."
```

That is the main benefit: **safety through automatic cleanup**.

---

## Common beginner mistakes

### Memory Leaks

Allocating on Heap (`new`) without freeing (`delete`).

### Dangling Pointers

Using a pointer after freeing the memory.

### Stack Overflow

Too much recursion or large arrays on the stack.

### Confusing Stack and Heap

Thinking stack memory survives after function returns.

### Buffer Overflow

Writing past the end of an array (corrupts adjacent memory).

---

## Quick cheatsheet

### Definition format

```text
Stack: Automatic, Fast, Small
Heap: Manual, Slow, Large
```

### Common commands

```bash
size ./app       # View segment sizes
valgrind ./app   # Check for memory leaks
```

### Memory Attributes

*   `Text` → Read-only code
*   `Stack` → Local variables
*   `Heap` → Dynamic allocation
*   `BSS` → Uninitialized globals

### Common Memory Calls

```cpp
malloc()
free()
new
delete
```

---

## Summary

For Linux system programming with C++, understanding **Memory Layout** is how you manage data lifetime.

Stack helps you describe:

*   temporary variables
*   function scopes
*   fast automatic storage

Heap helps you describe:

*   dynamic data
*   large structures
*   manual lifetime management

::: tip Beginner takeaway
Stack is your desk (clean it when you leave). Heap is the storage room (lock it when you take something). Know where your data lives.
:::