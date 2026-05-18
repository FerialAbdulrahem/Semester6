 #include <stdio.h>
#include <string.h>
#include <stdint.h>

#define DATA_MEM_SIZE 2048

uint8_t data_memory[DATA_MEM_SIZE];

 void init_data_memory(void)
{
    memset(data_memory, 0, sizeof(data_memory));
}

 uint8_t read_data_memory(uint16_t address)
{
    if (address >= DATA_MEM_SIZE) {
        fprintf(stderr, "[DataMem] ERROR: read address %u out of range\n",
                (unsigned)address);
        return 0;
    }
    return data_memory[address];
}

 void write_data_memory(uint16_t address, uint8_t value, const char *stage)
{
    if (address >= DATA_MEM_SIZE) {
        fprintf(stderr, "[DataMem] ERROR: write address %u out of range\n",
                (unsigned)address);
        return;
    }
    uint8_t old = data_memory[address];
    data_memory[address] = value;
    printf("     [%s] DataMem[%u] updated: %d (0x%02X) -> %d (0x%02X)\n",
           stage, (unsigned)address,
           (int8_t)old, old, (int8_t)value, value);
}

 void print_data_memory(void)
{
    printf("\n========== DATA MEMORY (non-zero locations) ==========\n");
    int printed = 0;
    for (int i = 0; i < DATA_MEM_SIZE; i++) {
        if (data_memory[i] != 0) {
            printf("DataMem[%4d] = %4d (0x%02X)\n",
                   i, (int8_t)data_memory[i], data_memory[i]);
            printed++;
        }
    }
    if (printed == 0)
        printf("  (all zeros)\n");
    printf("======================================================\n");
}
