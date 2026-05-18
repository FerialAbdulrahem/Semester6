#include <stdio.h>
#include <stdint.h>
#include "alu.h"

static ALUResult make_result(void)
{
    ALUResult r;
    r.result   = 0;
    r.carry    = -1;
    r.overflow = -1;
    r.negative = -1;
    r.zero     = -1;
    r.sign     = -1;
    return r;
}
 
ALUResult alu_add(uint8_t a, uint8_t b)
{
    ALUResult res = make_result();
    uint16_t ua  = (uint16_t)a;
    uint16_t ub  = (uint16_t)b;
    uint16_t ur  = ua + ub;

    res.result = (uint8_t)(ur & 0xFF);
    res.carry = ((ur >> 8) & 1) ? 1 : 0;

    int sa  = (a           & 0x80) ? 1 : 0;
    int sb  = (b           & 0x80) ? 1 : 0;
    int sr  = (res.result  & 0x80) ? 1 : 0;

    res.overflow = ((sa == sb) && (sr != sa)) ? 1 : 0;
    res.negative = (res.result & 0x80) ? 1 : 0;
    res.sign = res.negative ^ res.overflow;
    res.zero = (res.result == 0) ? 1 : 0;

    printf("     [ALU] ADD: %d + %d = %d\n",
           (int8_t)a, (int8_t)b, (int8_t)res.result);
    printf("     [ALU] C=%d  V=%d  N=%d  S=%d  Z=%d\n",
           res.carry, res.overflow, res.negative, res.sign, res.zero);

    return res;
}

 
ALUResult alu_sub(uint8_t a, uint8_t b)
{
    ALUResult res = make_result();

    res.result = (uint8_t)((int8_t)a - (int8_t)b);

    int sa  = (a           & 0x80) ? 1 : 0;
    int sb  = (b           & 0x80) ? 1 : 0;
    int sr  = (res.result  & 0x80) ? 1 : 0;

    res.overflow = ((sa != sb) && (sr == sb)) ? 1 : 0;
    res.negative = (res.result & 0x80) ? 1 : 0;
    res.sign = res.negative ^ res.overflow;
    res.zero = (res.result == 0) ? 1 : 0;

    printf("     [ALU] SUB: %d - %d = %d\n",
           (int8_t)a, (int8_t)b, (int8_t)res.result);
    printf("     [ALU] V=%d  N=%d  S=%d  Z=%d\n",
           res.overflow, res.negative, res.sign, res.zero);

    return res;
}

 
ALUResult alu_mul(uint8_t a, uint8_t b)
{
    ALUResult res = make_result();

    int16_t product = (int16_t)((int8_t)a * (int8_t)b);
    res.result = (uint8_t)(product & 0xFF);

    res.negative = (res.result & 0x80) ? 1 : 0;
    res.zero     = (res.result == 0)   ? 1 : 0;

    printf("     [ALU] MUL: %d * %d = %d\n",
           (int8_t)a, (int8_t)b, (int8_t)res.result);
    printf("     [ALU] N=%d  Z=%d\n", res.negative, res.zero);

    return res;
}

 
ALUResult alu_and(uint8_t a, uint8_t b)
{
    ALUResult res = make_result();

    res.result   = a & b;
    res.negative = (res.result & 0x80) ? 1 : 0;
    res.zero     = (res.result == 0)   ? 1 : 0;

    printf("     [ALU] AND: 0x%02X & 0x%02X = 0x%02X (%d)\n",
           a, b, res.result, (int8_t)res.result);
    printf("     [ALU] N=%d  Z=%d\n", res.negative, res.zero);

    return res;
}

 
ALUResult alu_or(uint8_t a, uint8_t b)
{
    ALUResult res = make_result();

    res.result   = a | b;
    res.negative = (res.result & 0x80) ? 1 : 0;
    res.zero     = (res.result == 0)   ? 1 : 0;

    printf("     [ALU] OR:  0x%02X | 0x%02X = 0x%02X (%d)\n",
           a, b, res.result, (int8_t)res.result);
    printf("     [ALU] N=%d  Z=%d\n", res.negative, res.zero);

    return res;
}

 
ALUResult alu_sal(uint8_t a, uint8_t imm)
{
    ALUResult res = make_result();

     int shift = (int)(imm & 0xFF);
    if (shift >= 8)
        res.result = 0;
    else
        res.result = (uint8_t)((uint8_t)a << shift);

    res.negative = (res.result & 0x80) ? 1 : 0;
    res.zero     = (res.result == 0)   ? 1 : 0;

    printf("     [ALU] SAL: 0x%02X << %d = 0x%02X (%d)\n",
           a, shift, res.result, (int8_t)res.result);
    printf("     [ALU] N=%d  Z=%d\n", res.negative, res.zero);

    return res;
}

 
ALUResult alu_sar(uint8_t a, uint8_t imm)
{
    ALUResult res = make_result();

    int shift = (int)(imm & 0xFF);
    if (shift >= 8) {
         res.result = (a & 0x80) ? 0xFF : 0x00;
    } else {
         res.result = (uint8_t)((int8_t)a >> shift);
    }

    res.negative = (res.result & 0x80) ? 1 : 0;
    res.zero     = (res.result == 0)   ? 1 : 0;

    printf("     [ALU] SAR: 0x%02X >> %d = 0x%02X (%d)\n",
           a, shift, res.result, (int8_t)res.result);
    printf("     [ALU] N=%d  Z=%d\n", res.negative, res.zero);

    return res;
}
