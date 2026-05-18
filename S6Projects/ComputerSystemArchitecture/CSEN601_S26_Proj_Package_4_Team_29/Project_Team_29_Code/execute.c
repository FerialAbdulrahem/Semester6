#include <stdio.h>
#include <stdint.h>
#include <stdbool.h>
#include "alu.h"

extern uint8_t  GPR[];
extern uint16_t PC;
extern uint8_t  SREG;
extern uint8_t  read_gpr(int reg);
extern void     write_gpr(int reg, uint8_t value, const char *stage);
extern void     apply_alu_result(ALUResult res, int dest_reg, const char *stage);
extern uint8_t  read_data_memory(uint16_t address);
extern void     write_data_memory(uint16_t address, uint8_t value, const char *stage);

extern ID_EX_Reg ID_EX;

int     last_written_reg   = -1;
uint8_t last_written_value = 0;
bool    last_write_valid   = false;

 
bool     branch_taken  = false;
uint16_t branch_target = 0;

 
void executeStage(void)
{
    last_write_valid = false;
    branch_taken     = false;

    if (!ID_EX.valid) {
        printf("  [EX] -- no instruction (latch empty) --\n");
        return;
    }

    int      op       = ID_EX.opcode;
    int      r1       = ID_EX.r1;
    int      r2       = ID_EX.r2;
    int      imm      = ID_EX.imm;
    uint8_t  valR1    = ID_EX.valR1;
    uint8_t  valR2    = ID_EX.valR2;
    uint16_t instrPC  = ID_EX.instrPC;

    ALUResult res;

    printf("  [EX] Execute: opcode=%d  R1=%d  R2=%d  IMM=%d\n",
           op, r1, r2, imm);
    printf("       value[R%d]=%d  value[R%d]=%d\n",
           r1, (int8_t)valR1, r2, (int8_t)valR2);

    switch (op) {

         case OP_ADD:
            res = alu_add(valR1, valR2);
            apply_alu_result(res, r1, "EX");
            last_written_reg   = r1;
            last_written_value = res.result;
            last_write_valid   = true;
            break;

         case OP_SUB:
            res = alu_sub(valR1, valR2);
            apply_alu_result(res, r1, "EX");
            last_written_reg   = r1;
            last_written_value = res.result;
            last_write_valid   = true;
            break;

         case OP_MUL:
            res = alu_mul(valR1, valR2);
            apply_alu_result(res, r1, "EX");
            last_written_reg   = r1;
            last_written_value = res.result;
            last_write_valid   = true;
            break;

         case OP_LDI:
         
            write_gpr(r1, (uint8_t)(imm & 0xFF), "EX");
            printf("     [EX] LDI R%d = %d\n", r1, imm);
            last_written_reg   = r1;
            last_written_value = (uint8_t)(imm & 0xFF);
            last_write_valid   = true;
            break;

         case OP_BEQZ:
            printf("     [EX] BEQZ R%d (%d) IMM=%d  instrPC=%d\n",
                   r1, (int8_t)valR1, imm, (int)instrPC);
            if (valR1 == 0) {
                branch_target = (uint16_t)(instrPC + 1 + imm);
                branch_taken  = true;
                PC = branch_target;
                printf("     [EX] Branch TAKEN -> new PC = %d\n", (int)PC);
            } else {
                printf("     [EX] Branch NOT TAKEN (R%d = %d)\n",
                       r1, (int8_t)valR1);
            }
            last_write_valid = false;
            break;

       
        case OP_AND:
            res = alu_and(valR1, valR2);
            apply_alu_result(res, r1, "EX");
            last_written_reg   = r1;
            last_written_value = res.result;
            last_write_valid   = true;
            break;

   
        case OP_OR:
            res = alu_or(valR1, valR2);
            apply_alu_result(res, r1, "EX");
            last_written_reg   = r1;
            last_written_value = res.result;
            last_write_valid   = true;
            break;

     
        case OP_JR:
           
            branch_target = (uint16_t)(((uint16_t)valR1 << 8) | (uint16_t)valR2);
            branch_taken  = true;
            PC = branch_target;
            printf("     [EX] JR: R%d=0x%02X  R%d=0x%02X  -> PC = %d\n",
                   r1, valR1, r2, valR2, (int)PC);
            last_write_valid = false;
            break;

        
        case OP_SAL:
             
            res = alu_sal(valR1, (uint8_t)(imm & 0x3F));
            apply_alu_result(res, r1, "EX");
            last_written_reg   = r1;
            last_written_value = res.result;
            last_write_valid   = true;
            break;

         
        case OP_SAR:
            res = alu_sar(valR1, (uint8_t)(imm & 0x3F));
            apply_alu_result(res, r1, "EX");
            last_written_reg   = r1;
            last_written_value = res.result;
            last_write_valid   = true;
            break;

        
        case OP_LB: {
             
            uint16_t addr = (imm < 0) ? 0 : (uint16_t)(imm & 0x7FF); /* 0..2047 */
            uint8_t  val  = read_data_memory(addr);
            write_gpr(r1, val, "EX");
            printf("     [EX] LB R%d = DataMem[%d] = %d\n",
                   r1, (int)addr, (int8_t)val);
            last_written_reg   = r1;
            last_written_value = val;
            last_write_valid   = true;
            break;
        }

        
        case OP_SB: {
           
            uint16_t addr = (imm < 0) ? 0 : (uint16_t)(imm & 0x7FF);
            write_data_memory(addr, valR1, "EX");
            printf("     [EX] SB DataMem[%d] = R%d = %d\n",
                   (int)addr, r1, (int8_t)valR1);
            
            last_write_valid = false;
            break;
        }

        default:
            printf("     [EX] Unknown opcode %d – instruction skipped\n", op);
            last_write_valid = false;
            break;
    }

    ID_EX.valid = false;
}
