#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdint.h>
#include "alu.h"

#define INSTR_MEM_SIZE 1024

uint16_t inst_memory[INSTR_MEM_SIZE];

static int program_size = 0;


typedef struct { const char *name; int code; } OpcodeEntry;

static const OpcodeEntry opcode_table[] = {
    {"ADD",  OP_ADD},
    {"SUB",  OP_SUB},
    {"MUL",  OP_MUL},
    {"LDI",  OP_LDI},
    {"BEQZ", OP_BEQZ},
    {"AND",  OP_AND},
    {"OR",   OP_OR},
    {"JR",   OP_JR},
    {"SAL",  OP_SAL},
    {"SAR",  OP_SAR},
    {"LB",   OP_LB},
    {"SB",   OP_SB}
};
static const int OPCODE_TABLE_SIZE = 12;


static int get_opcode(const char *mnemonic)
{
    for (int i = 0; i < OPCODE_TABLE_SIZE; i++)
        if (strcmp(opcode_table[i].name, mnemonic) == 0)
            return opcode_table[i].code;
    return -1;
}

 
static int parse_reg(const char *s)
{
    if (s[0] == 'R' || s[0] == 'r')
        return atoi(s + 1);
    return atoi(s);
}

 
static int encode_instruction(const char *line, int line_num,
                               uint16_t *out_instr)
{
    char buf[256];
    strncpy(buf, line, 255);
    buf[255] = '\0';

 
    char *comment = strchr(buf, '#');
    if (comment) *comment = '\0';

    
    char *p = buf;
    while (*p == ' ' || *p == '\t') p++;
    if (*p == '\0') return 0;   

    char mnemonic[16] = {0}, arg1[16] = {0}, arg2[16] = {0};
    int nfields = sscanf(p, "%15s %15s %15s", mnemonic, arg1, arg2);
    if (nfields < 1) return 0;

    int op = get_opcode(mnemonic);
    if (op < 0) {
        fprintf(stderr, "  [Parser] Line %d: unknown mnemonic '%s'\n",
                line_num, mnemonic);
        return -1;   
    }

    uint16_t instr = (uint16_t)((op & 0xF) << 12);
    int r1 = 0, r2 = 0, imm = 0;

    switch (op) {

   
        case OP_ADD:
        case OP_SUB:
        case OP_MUL:
        case OP_AND:
        case OP_OR:
        case OP_JR:
            if (nfields < 3) {
                fprintf(stderr, "  [Parser] Line %d: %s needs 2 register args\n",
                        line_num, mnemonic);
                return -1;
            }
            r1 = parse_reg(arg1);
            r2 = parse_reg(arg2);
            if (r1 < 0 || r1 > 63) {
                fprintf(stderr, "  [Parser] Line %d: R%d out of range (0-63)\n",
                        line_num, r1);
                return -1;
            }
            if (r2 < 0 || r2 > 63) {
                fprintf(stderr, "  [Parser] Line %d: R%d out of range (0-63)\n",
                        line_num, r2);
                return -1;
            }
            instr |= (uint16_t)((r1 & 0x3F) << 6);
            instr |= (uint16_t)(r2 & 0x3F);
            break;
 
        case OP_LDI:
        case OP_BEQZ:
        case OP_LB:
        case OP_SB:
            if (nfields < 3) {
                fprintf(stderr, "  [Parser] Line %d: %s needs R1 and IMM\n",
                        line_num, mnemonic);
                return -1;
            }
            r1  = parse_reg(arg1);
            imm = atoi(arg2);
            if (r1 < 0 || r1 > 63) {
                fprintf(stderr, "  [Parser] Line %d: R%d out of range (0-63)\n",
                        line_num, r1);
                return -1;
            }
            
            if (imm < -32 || imm > 31) {
                fprintf(stderr,
                    "  [Parser] Line %d: immediate %d out of 6-bit signed range "
                    "[-32, 31]\n", line_num, imm);
                return -1;
            }
            instr |= (uint16_t)((r1 & 0x3F) << 6);
            instr |= (uint16_t)(imm & 0x3F);    
            break;

    
        case OP_SAL:
        case OP_SAR:
            if (nfields < 3) {
                fprintf(stderr, "  [Parser] Line %d: %s needs R1 and shift amount\n",
                        line_num, mnemonic);
                return -1;
            }
            r1  = parse_reg(arg1);
            imm = atoi(arg2);
            if (r1 < 0 || r1 > 63) {
                fprintf(stderr, "  [Parser] Line %d: R%d out of range (0-63)\n",
                        line_num, r1);
                return -1;
            }
            
            if (imm < 0 || imm > 63) {
                fprintf(stderr,
                    "  [Parser] Line %d: shift amount %d out of range [0, 63]\n",
                    line_num, imm);
                return -1;
            }
            instr |= (uint16_t)((r1 & 0x3F) << 6);
            instr |= (uint16_t)(imm & 0x3F);
            break;

        default:
            break;
    }

    *out_instr = instr;
    return 1;   
}

 

void init_instruction_memory(void)
{
    memset(inst_memory, 0, sizeof(inst_memory));
    program_size = 0;
}

int get_program_size(void)
{
    return program_size;
}

int load_program(const char *filename)
{
    FILE *fp = fopen(filename, "r");
    if (!fp) {
        fprintf(stderr, "[Parser] ERROR: cannot open '%s'\n", filename);
        return 0;
    }

    printf("\n[Parser] Loading program from '%s' ...\n", filename);

    char line[256];
    int addr = 0, line_num = 0;

    while (fgets(line, sizeof(line), fp) && addr < INSTR_MEM_SIZE) {
        line_num++;
        line[strcspn(line, "\r\n")] = '\0';

        
        char *p = line;
        while (*p == ' ' || *p == '\t') p++;
        if (*p == '\0' || *p == '#') continue;

        uint16_t encoded = 0;
        int ret = encode_instruction(p, line_num, &encoded);
        if (ret <= 0) continue;   

        inst_memory[addr] = encoded;

      
        printf("[Parser] Line %-3d: %-30s -> 0x%04X  (binary: ", line_num, p, encoded);
        for (int b = 15; b >= 0; b--) {
            printf("%d", (encoded >> b) & 1);
            if (b == 12 || b == 6) printf(" ");
        }
        printf(") stored at InstrMem[%d]\n", addr);

        addr++;
    }

    fclose(fp);
    program_size = addr;
    printf("[Parser] Total instructions loaded: %d\n\n", addr);
    return addr;
}

uint16_t read_instruction_memory(uint16_t address)
{
    if (address >= INSTR_MEM_SIZE) return 0;
    return inst_memory[address];
}

void print_instruction_memory(void)
{
    printf("\n========== INSTRUCTION MEMORY ==========\n");
    if (program_size == 0) {
        printf("  (empty)\n");
    } else {
        for (int i = 0; i < program_size; i++) {
            uint16_t w = inst_memory[i];
            int op = (w >> 12) & 0xF;
            int r1 = (w >>  6) & 0x3F;
            int r2 =  w        & 0x3F;
            printf("InstrMem[%4d] = 0x%04X  (op=%2d r1=%2d r2/imm=%2d)\n",
                   i, w, op, r1, r2);
        }
    }
    printf("=========================================\n");
}
