#include <stdio.h>
#include <stdint.h>
#include <stdbool.h>
#include "alu.h"

extern uint16_t inst_memory[];
extern uint16_t PC;
extern int      get_program_size(void);
extern uint16_t read_instruction_memory(uint16_t address);

IF_ID_Reg IF_ID;    

bool fetchStage(void)
{
    int prog_size = get_program_size();

    if ((int)PC >= prog_size) {
        IF_ID.valid = false;
        IF_ID.instruction = 0;
        IF_ID.fetchedPC   = PC;
        return false;
    }

    uint16_t instr  = read_instruction_memory(PC);
    IF_ID.instruction = instr;
    IF_ID.fetchedPC   = PC;
    IF_ID.valid       = true;

    int opcode = (instr >> 12) & 0xF;
    int r1     = (instr >>  6) & 0x3F;
    int r2_imm =  instr        & 0x3F;

    printf("  [IF] Fetched: PC=%-4d  0x%04X  (opcode=%d  R1=%d  R2/IMM=%d)\n",
           (int)PC, instr, opcode, r1, r2_imm);

    PC++;   
    return true;
}

void flush_IF_ID(void)
{
    IF_ID.valid       = false;
    IF_ID.instruction = 0;
    IF_ID.fetchedPC   = 0;
    printf("  [IF] -- flushed (IF/ID cleared due to branch/jump) --\n");
}
