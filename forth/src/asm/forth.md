enter:
    pop HL
enter1:
    ld E,(HL)
    inc HL
    ld D,(HL)
    inc HL
    push HL
    ex DE,HL
    jp (HL)


exit:
    pop HL
    jp (IY)

exit_forth:
    ret


An fword is an array of i32s
The first location is an indirect table pointer to the implementation. The remaining array locations are "parameters", i.e. they are either offsets to other fwords in memory or literal data
Executing a fword means accessing the table pointer and calling it. A variable contains the contents of the second location (first parameter).


