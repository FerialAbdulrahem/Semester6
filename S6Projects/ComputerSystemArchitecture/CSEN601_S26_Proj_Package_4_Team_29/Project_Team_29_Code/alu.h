#ifndef ALU_H
#define ALU_H

#include <stdint.h>
#include <stdbool.h>

#define OP_ADD   0                    
#define OP_SUB   1                   
#define OP_MUL   2            
#define OP_LDI   3           
#define OP_BEQZ  4    
#define OP_AND   5   
#define OP_OR    6    
#define OP_JR    7   
#define OP_SAL   8   
#define OP_SAR   9    
#define OP_LB    10   
#define OP_SB    11  

 
#define C_FLAG  4
#define V_FLAG  3
#define N_FLAG  2
#define S_FLAG  1
#define Z_FLAG  0

 
typedef struct {
    uint8_t result;
    int     carry;
    int     overflow;
    int     negative;
    int     zero;
    int     sign;
} ALUResult;
 
typedef struct {
    uint16_t instruction;                
    uint16_t fetchedPC;       
    bool     valid;
} IF_ID_Reg;

 
typedef struct {
    int      opcode;
    int      r1;            
    int      r2;           
    int      imm;           
    uint8_t  valR1;        
    uint8_t  valR2;         
    uint16_t instrPC;       
    bool     valid;
} ID_EX_Reg;

 
ALUResult alu_add(uint8_t a, uint8_t b);
ALUResult alu_sub(uint8_t a, uint8_t b);
ALUResult alu_mul(uint8_t a, uint8_t b);
ALUResult alu_and(uint8_t a, uint8_t b);
ALUResult alu_or (uint8_t a, uint8_t b);
ALUResult alu_sal(uint8_t a, uint8_t imm);   
ALUResult alu_sar(uint8_t a, uint8_t imm);  

#endif 
