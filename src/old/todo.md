# todo

## stuff to build

### simple memory allocator

- bump allocator
- buddy allocator

### simple closure

### get a record

- takes a pointer to mem
- takes a pointer to typedef
- pushes items from mem on stack

### set a record

- takes a pointer to mem
- takes a pointer to typedef
- pops items on stack and puts in mem

### a typedef is an array of bytes

- each byte is a number representing a simple type
- need a create typedef
  - takes a pointer to mem
  - takes a length
  - takes a series of numbers representing types
  - composite types?
  - pointer to typedef could be its type
    - therefore numbers below a number could be builtins
