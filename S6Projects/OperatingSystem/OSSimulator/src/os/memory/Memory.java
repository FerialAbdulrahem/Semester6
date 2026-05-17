package os.memory;

import java.io.*;
import java.util.*;

public class Memory {
    public static final int SIZE = 40;

    private MemoryWord[] memory;
    private List<MemoryBlock> allocatedBlocks;

    public Memory() {
        memory = new MemoryWord[SIZE];
        for (int i = 0; i < SIZE; i++) {
            memory[i] = new MemoryWord();
        }
        allocatedBlocks = new ArrayList<>();
    }

    public int allocate(int size) {
        int start = findFreeBlock(size);
        if (start != -1) {
            MemoryBlock block = new MemoryBlock(start, start + size - 1);
            allocatedBlocks.add(block);
            for (int i = start; i < start + size; i++) {
                memory[i].setAllocated(true);
            }
            return start;
        }
        return -1;
    }

    private int findFreeBlock(int size) {
        int freeCount = 0;
        int freeStart = -1;
        for (int i = 0; i < SIZE; i++) {
            if (!memory[i].isAllocated()) {
                if (freeCount == 0) freeStart = i;
                freeCount++;
                if (freeCount == size) {
                    return freeStart;
                }
            } else {
                freeCount = 0;
                freeStart = -1;
            }
        }
        return -1;
    }

    public void deallocate(int start, int end) {
        for (int i = start; i <= end; i++) {
            if (i >= 0 && i < SIZE) {
                memory[i].setAllocated(false);
                memory[i].setValue(null);
            }
        }
        allocatedBlocks.removeIf(block -> block.start == start);
    }

    public void write(int address, String value) {
        if (address >= 0 && address < SIZE) {
            memory[address].setValue(value);
        }
    }

    public String read(int address) {
        if (address >= 0 && address < SIZE) {
            return memory[address].getValue();
        }
        return null;
    }

    
    public void swapFromDisk(int start, String filename) throws IOException, ClassNotFoundException {
        try (ObjectInputStream ois = new ObjectInputStream(new FileInputStream(filename))) {
            @SuppressWarnings("unchecked")
            List<String> data = (List<String>) ois.readObject();
            for (int i = 0; i < data.size(); i++) {
                if (start + i < SIZE) {
                    memory[start + i].setValue(data.get(i).equals("null") ? null : data.get(i));
                    memory[start + i].setAllocated(true);
                }
            }
          
            allocatedBlocks.add(new MemoryBlock(start, start + data.size() - 1));
        }
    }

    public void print() {
        System.out.println("=== Memory State ===");
        for (int i = 0; i < SIZE; i++) {
            if (memory[i].isAllocated()) {
                System.out.printf("[%2d] %s%n", i, memory[i].getValue());
            } else {
                System.out.printf("[%2d] FREE%n", i);
            }
        }
    }

    public MemoryWord[] getMemory() {
        return memory;
    }

    public List<MemoryBlock> getAllocatedBlocks() {
        return allocatedBlocks;
    }

    public int getFreeSpace() {
        int free = 0;
        for (int i = 0; i < SIZE; i++) {
            if (!memory[i].isAllocated()) {
                free++;
            }
        }
        return free;
    }

    
    public boolean canAllocate(int size) {
        int run = 0;
        for (int i = 0; i < SIZE; i++) {
            if (!memory[i].isAllocated()) {
                run++;
                if (run >= size) return true;
            } else {
                run = 0;
            }
        }
        return false;
    }

    static class MemoryBlock {
        int start, end;
        MemoryBlock(int start, int end) {
            this.start = start;
            this.end = end;
        }
    }
}
