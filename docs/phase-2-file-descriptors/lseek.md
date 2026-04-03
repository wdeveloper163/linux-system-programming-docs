# File Offset Control (`lseek`)

`lseek` is used to **move the position (cursor)** inside a file.

Instead of thinking:

```text
"I read from the file again."
```

You should think:

```text
"I moved the file cursor, then read from that position."
```

That is how Linux handles file reading internally.

---

## Why understand this?

In Linux C++ projects, you often need to:

* read specific parts of a file
* skip data
* rewind or restart reading
* append or overwrite at specific positions

Understanding `lseek` helps because it:

* gives you **random access** to files
* avoids unnecessary reading
* improves performance
* is required for binary file handling

::: tip Simple idea
A file is like a **video timeline**.

* `read()` → play forward
* `lseek()` → jump to a specific time
  :::

---

## The basic structure

Every open file has a **cursor position**.

```text
File → [DATA..............]
          ↑
       Cursor
```

### What that means

* `read()` → reads from current cursor
* `write()` → writes at current cursor
* `lseek()` → moves the cursor

---

## Function syntax

```cpp
off_t lseek(int fd, off_t offset, int whence);
```

### Parameters explained

| Parameter | Meaning                |
| --------- | ---------------------- |
| `fd`      | File Descriptor        |
| `offset`  | how many bytes to move |
| `whence`  | from where to move     |

---

## The 3 modes (very important)

### `SEEK_SET` (from beginning)

```cpp
lseek(fd, 0, SEEK_SET);
```

Move to **start of file**.

---

### `SEEK_CUR` (from current position)

```cpp
lseek(fd, 5, SEEK_CUR);
```

Move **forward 5 bytes** from current position.

---

### `SEEK_END` (from end)

```cpp
lseek(fd, 0, SEEK_END);
```

Move to **end of file**.

---

## Visual understanding

```text
File: HELLO WORLD
Index:01234567890
```

### Example

```cpp
lseek(fd, 6, SEEK_SET);
```

Cursor moves to:

```text
HELLO _WORLD
       ↑
```

Now reading will give `"WORLD"`.

---

## Your first simple Example

```cpp
#include <fcntl.h>
#include <unistd.h>

int main() {
    int fd = open("file.txt", O_RDONLY);

    // Move to 6th byte
    lseek(fd, 6, SEEK_SET);

    char buffer[10];
    int bytes = read(fd, buffer, sizeof(buffer));

    write(1, buffer, bytes);

    close(fd);
}
```

### What happens

```text
1. open → FD 3
2. lseek → move cursor
3. read → read from new position
4. write → print output
```

---

## Re-reading from beginning

Once you read a file, cursor moves forward.

To read again:

```cpp
lseek(fd, 0, SEEK_SET);
```

::: tip Beginner takeaway
`lseek(fd, 0, SEEK_SET)` = rewind file
:::

---

## Get current position

You can also **ask where the cursor is**:

```cpp
off_t pos = lseek(fd, 0, SEEK_CUR);
```

```text
Returns current byte position
```

---

## Jump to end (useful for append)

```cpp
lseek(fd, 0, SEEK_END);
write(fd, "NEW", 3);
```

This writes at the **end of file**.

---

## Full lifecycle example

```cpp
#include <fcntl.h>
#include <unistd.h>

int main() {
    int fd = open("file.txt", O_RDONLY);

    char buffer[6];

    // Read first 5 bytes
    read(fd, buffer, 5);
    write(1, buffer, 5); // prints "HELLO"

    // Move cursor
    lseek(fd, 6, SEEK_SET);

    // Read next part
    read(fd, buffer, 5);
    write(1, buffer, 5); // prints "WORLD"

    close(fd);
}
```

---

## State

`lseek` directly modifies **file descriptor state**.

```text
FD State:
Position → changes with lseek
```

Example:

```text
Before: position = 0
After:  position = 6
```

---

## Important behavior

### `read()` moves cursor automatically

```cpp
read(fd, buffer, 5);
```

Moves position forward by 5 bytes.

---

### `lseek()` does NOT read data

It only moves the pointer.

---

## Process + FD + lseek

Each process has its own file descriptor state.

```text
Process A → position 5
Process B → position 0
```

Even for the same file!

---

## Sparse files (advanced but simple idea)

```cpp
lseek(fd, 1000, SEEK_SET);
write(fd, "A", 1);
```

This creates:

```text
[empty space.............A]
```

::: tip What this means
Linux does NOT store empty bytes → saves disk space
:::

---

## Common beginner mistakes

### Forgetting `lseek` before re-read

```cpp
read(fd, buffer, 5);
read(fd, buffer, 5); // continues, not restart ❌
```

---

### Wrong `whence`

Using wrong mode causes unexpected results.

---

### Ignoring return value

```cpp
off_t pos = lseek(...);
```

If `pos == -1`, error occurred.

---

### Using on non-seekable FDs

Does NOT work on:

* pipes
* sockets

---

## Quick cheatsheet

### Syntax

```cpp
lseek(fd, offset, whence);
```

### Modes

```text
SEEK_SET → from start
SEEK_CUR → from current
SEEK_END → from end
```

### Common patterns

```cpp
lseek(fd, 0, SEEK_SET); // rewind
lseek(fd, 0, SEEK_END); // go to end
```

---

## Summary

For Linux system programming with C++, `lseek` gives you **control over where you read/write**.

Without `lseek`, you can only go forward.

With `lseek`, you can:

* jump anywhere in a file
* re-read data
* write at specific positions

::: tip Beginner takeaway
`lseek` is your **file cursor controller**.

It does not read or write — it just decides *where* the next operation happens.
:::
