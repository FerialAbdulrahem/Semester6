#include <stdio.h>
#include <stdint.h>
#include <stdbool.h>
#include "alu.h"

extern uint8_t  GPR[];
extern uint16_t PC;
extern uint8_t  SREG;
extern uint8_t  read_gpr(int reg);

extern int     last_written_reg;
extern uint8_t last_written_value;
extern bool    last_write_valid;

extern IF_ID_Reg IF_ID;
ID_EX_Reg ID_EX;  

static int sign_extend_6(int raw6)
{
    
    if (raw6 & 0x20)
        return raw6 | (~0x3F);   
    return raw6;
}

 void decodeStage(void)
{
    if (!IF_ID.valid) {
        ID_EX.valid = false;
        printf("  [ID] -- no instruction (latch empty) --\n");
        return;
    }

    uint16_t instr = IF_ID.instruction;
   
    int opcode     = (instr >> 12) & 0xF;   
    int r1         = (instr >>  6) & 0x3F;   
    int r2_raw     =  instr        & 0x3F;   
    int imm_raw    =  instr        & 0x3F;   
    int imm;

    bool is_shift = (opcode == OP_SAL || opcode == OP_SAR);
    if (is_shift)
        imm = imm_raw & 0x3F;              
    else
        imm = sign_extend_6(imm_raw);      

    
    uint8_t valR1, valR2;

    if (last_write_valid && last_written_reg == r1) {
        valR1 = last_written_value;
        printf("  [ID] Forwarding: R%d = %d (from EX)\n", r1, (int8_t)valR1);
    } else {
        valR1 = read_gpr(r1);
    }

    if (last_write_valid && last_written_reg == r2_raw) {
        valR2 = last_written_value;
        printf("  [ID] Forwarding: R%d = %d (from EX)\n", r2_raw, (int8_t)valR2);
    } else {
        valR2 = read_gpr(r2_raw);
    }

 
    ID_EX.opcode   = opcode;
    ID_EX.r1       = r1;
    ID_EX.r2       = r2_raw;
    ID_EX.imm      = imm;
    ID_EX.valR1    = valR1;
    ID_EX.valR2    = valR2;
    ID_EX.instrPC  = IF_ID.fetchedPC;
    ID_EX.valid    = true;

 
    printf("  [ID] Decode: PC=%-4d  0x%04X\n",
           (int)IF_ID.fetchedPC, instr);
    printf("       opcode=%d  R1=%d  R2=%d  IMM=%d\n",
           opcode, r1, r2_raw, imm);
    printf("       value[R%d]=%d   value[R%d]=%d\n",
           r1, (int8_t)valR1, r2_raw, (int8_t)valR2);
}


void flush_ID_EX(void)
{
    ID_EX.valid  = false;
    ID_EX.opcode = -1;
    printf("  [ID] -- flushed (ID/EX cleared due to branch/jump) --\n");
}
