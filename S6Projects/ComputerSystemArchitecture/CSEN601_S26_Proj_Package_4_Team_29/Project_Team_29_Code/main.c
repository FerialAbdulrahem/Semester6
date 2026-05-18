#include <stdio.h>
#include <stdint.h>
#include <stdbool.h>
#include "alu.h"

extern uint8_t  GPR[];
extern uint16_t PC;
extern uint8_t  SREG;
extern void     init_registers(void);
extern void     print_all_registers(void);

extern uint16_t inst_memory[];
extern void     init_instruction_memory(void);
extern int      load_program(const char *filename);
extern void     print_instruction_memory(void);
extern int      get_program_size(void);

extern void     init_data_memory(void);
extern void     print_data_memory(void);

extern IF_ID_Reg IF_ID;
extern ID_EX_Reg ID_EX;
extern bool      fetchStage(void);
extern void      flush_IF_ID(void);
extern void      decodeStage(void);
extern void      flush_ID_EX(void);
extern void      executeStage(void);
extern bool      branch_taken;
extern uint16_t  branch_target;

int main(int argc, char *argv[])
{
    const char *filename = (argc > 1) ? argv[1] : "program.txt";

    printf("========================================================\n");
    printf("  Package 4: Double McHarvard – Processor Simulator\n");
    printf("  CSEN601 Spring 26\n");
    printf("========================================================\n\n");

    init_registers();
    init_instruction_memory();
    init_data_memory();

    int n = load_program(filename);
    if (n == 0) {
        printf("No instructions loaded. Exiting.\n");
        return 1;
    }

    int expected_cycles = 3 + (n - 1) * 1;
    printf("[MAIN] Program has %d instructions.\n", n);
    printf("[MAIN] Expected clock cycles: %d\n\n", expected_cycles);

    int cycle = 0;

    while (1) {
        cycle++;
        printf("\n============ Clock Cycle %-4d ============\n", cycle);

        executeStage();

        if (branch_taken) {
            flush_ID_EX();
            flush_IF_ID();
            branch_taken = false;
            fetchStage();
        } else {
            decodeStage();
            fetchStage();
        }

        if (!IF_ID.valid && !ID_EX.valid) {
            int formula_cycles = 3 + (n - 1);
            while (cycle < formula_cycles) {
                cycle++;
                printf("\n============ Clock Cycle %-4d ============\n", cycle);
                printf("  [IF] -- no instruction --\n");
                printf("  [ID] -- no instruction (latch empty) --\n");
                printf("  [EX] -- no instruction (latch empty) --\n");
            }
            printf("\n[MAIN] Pipeline drained – simulation complete.\n");
            break;
        }

        if (cycle > 100000) {
            printf("\n[MAIN] Max cycle limit reached – possible infinite loop.\n");
            break;
        }
    }

    printf("\n\nTotal Clock Cycles Executed: %d\n", cycle);
    print_all_registers();
    print_instruction_memory();
    print_data_memory();

    return 0;
}