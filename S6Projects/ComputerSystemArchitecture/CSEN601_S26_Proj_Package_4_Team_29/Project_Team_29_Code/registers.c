#include <stdio.h>
#include <string.h>
#include <stdint.h>
#include "alu.h"

#define NUM_GPRS 64

 
uint8_t  GPR[NUM_GPRS];  
uint16_t PC   = 0;
uint8_t  SREG = 0;

#define SET_FLAG(bit, val) \
    do { if (val) SREG |= (1u << (bit)); else SREG &= ~(1u << (bit)); } while (0)

#define GET_FLAG(bit) (int)(((SREG) >> (bit)) & 1u)
 
void init_registers(void)
{
    memset(GPR, 0, sizeof(GPR));
    PC   = 0;
    SREG = 0;
    printf("[INIT] Registers initialized: 64 x 8-bit GPRs, PC=0, SREG=0x00\n");
}
 
uint8_t read_gpr(int reg)
{
    if (reg < 0 || reg >= NUM_GPRS) {
        fprintf(stderr, "[REG] ERROR: R%d out of range\n", reg);
        return 0;
    }
    return GPR[reg];
}
 
void write_gpr(int reg, uint8_t value, const char *stage)
{
    if (reg < 0 || reg >= NUM_GPRS) {
        fprintf(stderr, "[REG] ERROR: R%d out of range\n", reg);
        return;
    }
    uint8_t old = GPR[reg];
    GPR[reg] = value;
    printf("     [%s] R%d updated: %d (0x%02X) -> %d (0x%02X)\n",
           stage, reg, (int8_t)old, old, (int8_t)value, value);
}

 
void apply_alu_result(ALUResult res, int dest_reg, const char *stage)
{
  
    if (res.carry    >= 0) SET_FLAG(C_FLAG, res.carry);
    if (res.overflow >= 0) SET_FLAG(V_FLAG, res.overflow);
    if (res.negative >= 0) SET_FLAG(N_FLAG, res.negative);
    if (res.sign     >= 0) SET_FLAG(S_FLAG, res.sign);
    if (res.zero     >= 0) SET_FLAG(Z_FLAG, res.zero);

    
    SREG &= 0x1F;

    
    if (dest_reg >= 0)
        write_gpr(dest_reg, res.result, stage);

    printf("     [%s] SREG = 0x%02X  (C=%d V=%d N=%d S=%d Z=%d)\n",
           stage, SREG,
           GET_FLAG(C_FLAG), GET_FLAG(V_FLAG),
           GET_FLAG(N_FLAG), GET_FLAG(S_FLAG), GET_FLAG(Z_FLAG));
}
  
void print_all_registers(void)
{
    printf("\n========== REGISTER FILE (end of simulation) ==========\n");
    for (int i = 0; i < NUM_GPRS; i++) {
        printf("R%-2d = %4d (0x%02X)", i, (int8_t)GPR[i], GPR[i]);
        if ((i + 1) % 4 == 0)
            printf("\n");
        else
            printf("  |  ");
    }
    printf("PC   = %u\n", (unsigned)PC);
    printf("SREG = 0x%02X  (C=%d V=%d N=%d S=%d Z=%d)\n",
           SREG,
           GET_FLAG(C_FLAG), GET_FLAG(V_FLAG),
           GET_FLAG(N_FLAG), GET_FLAG(S_FLAG), GET_FLAG(Z_FLAG));
    printf("=======================================================\n");
}
