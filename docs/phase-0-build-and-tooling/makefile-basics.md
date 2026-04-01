# Makefile Basics

`make` is a tool that helps you **build your C++ program without typing the full compiler command every time**.

Instead of writing:

```bash
g++ -Wall -Wextra -Werror -g -Iinclude src/main.cpp src/logger.cpp -o app
```

again and again, you write the build steps once in a file called `Makefile`, then run:

```bash
make
```

That is why `make` is so useful in Linux system programming.

---

## Why use `make`?

In Linux C++ projects, you often have:

* multiple `.cpp` files
* header files in `include/`
* compiler flags
* helper commands like cleaning old builds

`make` helps because it:

* saves time
* keeps build commands organized
* avoids repeating long commands
* makes your project easier to manage

::: tip Simple idea
A `Makefile` is like a recipe.

It says:

* what you want to build
* what files are needed
* what command should be run
  :::

---

## The basic structure

A Makefile is made of **rules**.

A rule looks like this:

```make
target: dependencies
	command
```

### What that means

* **target** → what you want to create
* **dependencies** → files needed first
* **command** → how to create it

Example:

```make
app: src/main.cpp
	g++ src/main.cpp -o app
```

This means:

* build a program called `app`
* use `src/main.cpp`
* run `g++ src/main.cpp -o app`

::: warning Important
The command line must start with a **TAB**, not spaces.
:::

---

## Your first simple Makefile

Here is a beginner-friendly example:

```make
CXX = g++
CXXFLAGS = -Wall -Wextra -Werror -g -Iinclude
TARGET = app

$(TARGET): src/main.cpp
	$(CXX) $(CXXFLAGS) $< -o $@
```

### What each line does

```make
CXX = g++
```

Uses `g++` as the C++ compiler.

```make
CXXFLAGS = -Wall -Wextra -Werror -g -Iinclude
```

Adds compiler options:

* `-Wall -Wextra` → show useful warnings
* `-Werror` → treat warnings as errors
* `-g` → include debug information
* `-Iinclude` → look for header files in the `include/` folder

```make
TARGET = app
```

Sets the output program name to `app`.

```make
$(TARGET): src/main.cpp
```

Says: to build `app`, I need `src/main.cpp`.

```make
	$(CXX) $(CXXFLAGS) $< -o $@
```

Runs the compiler command using **automatic variables** (shortcuts). We will explain `$<` and `$@` in detail below.

---

## Variables

Variables make Makefiles easier to read and update.

Example:

```make
CXX = g++
CXXFLAGS = -Wall -Wextra -Werror -g
```

Instead of writing the same compiler command many times, you reuse variables:

```make
$(CXX) $(CXXFLAGS)
```

::: tip Why this helps
If you want to change a compiler flag later, you only update it in one place.
:::

---

## Automatic variables

`make` provides special shortcuts called **automatic variables**.

Think of these like **template literals** in JavaScript (e.g., `` `${name}` ``). They are placeholders that `make` fills in automatically depending on the rule being run.

You don't need to remember the file names every time; `make` knows them for you.

### The Big Three Shortcuts

These are the most common ones you will use in Linux system programming:

| Variable | Meaning | Memory Trick | Example Value |
| :--- | :--- | :--- | :--- |
| `$@` | The **Target** | **A**t symbol = **A**im | `app` |
| `$<` | The **First Dependency** | **<** Points to the **Left** (first file) | `src/main.cpp` |
| `$^` | **All Dependencies** | **^** (Hat) = **All** on top | `src/main.cpp src/utils.cpp` |

### How the Magic Happens (Step-by-Step)

Let's look at this rule again:

```make
$(TARGET): src/main.cpp
	$(CXX) $(CXXFLAGS) $< -o $@
```

When you run `make`, it performs a **find and replace** operation before running the command.

1.  **Identify the Target:** The rule is building `app` (because `$(TARGET)` is `app`).
    *   So, `$@` becomes `app`.
2.  **Identify the Dependencies:** The rule depends on `src/main.cpp`.
    *   So, `$<` becomes `src/main.cpp`.
3.  **Construct the Command:**

    **Before (Makefile):**
    ```bash
    $(CXX) $(CXXFLAGS) $< -o $@
    ```

    **After (What actually runs):**
    ```bash
    g++ -Wall -Wextra -Werror -g -Iinclude src/main.cpp -o app
    ```

### Why use `$<` instead of writing the filename?

Imagine you change your mind and want to compile `src/start.cpp` instead.

**Without variables:**
You have to edit the command line too:
```make
app: src/start.cpp
    g++ -Wall ... src/start.cpp -o app  # You must edit this line manually
```

**With automatic variables:**
You only change the dependency line. The command line stays the same!
```make
app: src/start.cpp
    g++ -Wall ... $< -o $@  # No changes needed here! $< updates automatically
```

This follows the **DRY principle** (Don't Repeat Yourself) you know from web development.

### When to use `$<` vs `$^`

*   **Use `$<` (First Dependency):**
    *   Usually used when compiling a **single object file** from a **single source file**.
    *   Example: `main.o: main.cpp` → `g++ -c $< -o $@`
*   **Use `$^` (All Dependencies):**
    *   Used when linking the **final program** from **multiple object files**.
    *   Example: `app: main.o utils.o` → `g++ $^ -o $@`

::: tip Beginner takeaway
For now, if you are compiling just one `.cpp` file to an executable, `$<` is safe. If you are linking multiple files together, use `$^`.
:::

---

## Example with more than one source file

Most Linux C++ projects have multiple source files.

Example:

```make
CXX = g++
CXXFLAGS = -Wall -Wextra -Werror -g -Iinclude
TARGET = app
SRC = src/main.cpp src/logger.cpp src/server.cpp

$(TARGET): $(SRC)
	$(CXX) $(CXXFLAGS) $^ -o $@
```

### What happens here

*   `SRC` stores all source files
*   `$^` means **all dependencies** (because we have multiple files now, we use `$^` instead of `$<`)
*   `make` builds one executable from all `.cpp` files

If you used `$<` here, it would only compile `src/main.cpp` and ignore the others! `$^` ensures `logger.cpp` and `server.cpp` are included too.

---

## Common helper targets

You will often see targets like these.

### `all`

Usually the main build target.

```make
all: app
```

### `clean`

Removes generated files.

```make
clean:
	rm -f app *.o
```

### `run`

Builds and runs the program.

```make
run: app
	./app
```

These are usually written with `.PHONY`:

```make
.PHONY: all clean run
```

::: tip What `.PHONY` means
It tells `make` that these are action names, not real files.
:::

---

## A practical beginner Makefile

This is a good starting point for a small Linux C++ project:

```make
CXX = g++
CXXFLAGS = -Wall -Wextra -Werror -g -Iinclude
TARGET = app
SRC = src/main.cpp src/logger.cpp

.PHONY: all clean run

all: $(TARGET)

$(TARGET): $(SRC)
	$(CXX) $(CXXFLAGS) $^ -o $@

run: $(TARGET)
	./$(TARGET)

clean:
	rm -f $(TARGET)
```

---

## Example project structure

```text
project/
├── Makefile
├── include/
│   └── logger.hpp
└── src/
    ├── main.cpp
    └── logger.cpp
```

### What goes where

* `src/` → your `.cpp` source files
* `include/` → your header files
* `Makefile` → build instructions

This is a common layout in Linux system programming.

---

## Real-world example

Suppose you are building a small Linux logging tool.

Your project has:

* `src/main.cpp`
* `src/logger.cpp`
* `include/logger.hpp`

Without `make`, you compile it by typing:

```bash
g++ -Wall -Wextra -Werror -g -Iinclude src/main.cpp src/logger.cpp -o app
```

With a Makefile, you just type:

```bash
make
```

That is the main benefit: **same build, less effort**.

---

## Common beginner mistakes

### Using spaces instead of a TAB

Commands inside rules must start with a TAB.

### Forgetting `-Iinclude`

If your headers are inside `include/`, the compiler needs to know that.

### Not using variables

Variables make the file much cleaner.

### Forgetting `.PHONY`

Use `.PHONY` for helper targets like `all`, `run`, and `clean`.

### Confusing `$<` and `$^`

*   Use `$<` when you only care about the **first** file (like compiling one `.cpp` to one `.o`).
*   Use `$^` when you need **every** file listed (like linking all `.o` files into one `app`).

---

## Quick cheatsheet

### Rule format

```make
target: dependencies
	command
```

### Common variables

```make
CXX = g++
CXXFLAGS = -Wall -Wextra -Werror -g -Iinclude
TARGET = app
```

### Automatic variables

* `$@` → target (The **A**im)
* `$<` → first dependency (The **<** Left one)
* `$^` → all dependencies (The **^** Hat collects all)

### Common commands

```bash
make
make run
make clean
```

---

## Summary

For Linux system programming with C++, `make` is the standard tool for automating builds.

A Makefile helps you describe:

* what to build
* which files are needed
* which compiler command should run

::: tip Beginner takeaway
A Makefile is just a reusable build recipe for your C++ project. Automatic variables like `$@` and `$<` are the magic ingredients that keep the recipe clean and flexible.
:::
