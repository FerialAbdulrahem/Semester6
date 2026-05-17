package os.processes;

import os.memory.Memory;
import java.util.*;


public class Process {
    private PCB pcb;
    private List<String> instructions;

    private Memory memory;
    private int varStart = -1;
    private int varEnd   = -1;

    // Fallback map used before memory is bound and while swapped out
    private final Map<String, String> variableFallback = new LinkedHashMap<>();

    public Process(PCB pcb, int instructionCount) {
        this.pcb          = pcb;
        this.instructions = new ArrayList<>();
    }

  

    public void addInstruction(String instruction) {
        instructions.add(instruction);
    }

    public String getCurrentInstruction() {
        int pc = pcb.getProgramCounter();
        if (pc >= 0 && pc < instructions.size()) return instructions.get(pc);
        return null;
    }

    public void incrementPC() {
        pcb.setProgramCounter(pcb.getProgramCounter() + 1);
        pcb.decrementRemainingTime();
        if (pcb.getProgramCounter() >= instructions.size()) {
            pcb.setState(ProcessState.FINISHED);
        }
    }

    
    public void bindMemory(Memory memory, int varStart, int varEnd) {
        this.memory   = memory;
        this.varStart = varStart;
        this.varEnd   = varEnd;

        // Flush fallback only for variables not already in memory
        for (Map.Entry<String, String> e : variableFallback.entrySet()) {
            if (loadFromMemory(e.getKey()) == null) {
                storeToMemory(e.getKey(), e.getValue());
            }
        }
        variableFallback.clear();
    }

   
    public void unbindMemory() {
        // Save current variables to fallback before losing memory reference
        if (memory != null && varStart >= 0) {
            for (int i = varStart; i <= varEnd; i++) {
                String word = memory.read(i);
                if (word != null && word.startsWith("VAR:") && !word.equals("VAR:empty")) {
                    String kv = word.substring(4);
                    int eq = kv.indexOf('=');
                    if (eq >= 0) variableFallback.put(kv.substring(0, eq), kv.substring(eq + 1));
                }
            }
        }
        this.memory   = null;
        this.varStart = -1;
        this.varEnd   = -1;
    }

    public void setVariable(String name, String value) {
        variableFallback.put(name, value);
        if (memory != null && varStart >= 0) {
            storeToMemory(name, value);
        }
        else {
            variableFallback.put(name, value);
        }
    }

    public String getVariable(String name) {
        if (memory != null && varStart >= 0) {
            String v = loadFromMemory(name);
            if (v != null) return v;
        }
        return variableFallback.get(name);
    }

    private void storeToMemory(String name, String value) {
      
        for (int i = varStart; i <= varEnd; i++) {
            String word = memory.read(i);
            if (word != null && word.startsWith("VAR:" + name + "=")) {
                memory.write(i, "VAR:" + name + "=" + value);
                return;
            }
        }
       
        for (int i = varStart; i <= varEnd; i++) {
            String word = memory.read(i);
            if (word == null || word.equals("VAR:empty")) {
                memory.write(i, "VAR:" + name + "=" + value);
                return;
            }
        }
      
        variableFallback.put(name, value);
    }

    private String loadFromMemory(String name) {
        for (int i = varStart; i <= varEnd; i++) {
            String word = memory.read(i);
            if (word != null && word.startsWith("VAR:" + name + "=")) {
                return word.substring(("VAR:" + name + "=").length());
            }
        }
        return null;
    }

    public PCB getPCB()                  { return pcb; }
    public List<String> getInstructions(){ return instructions; }
    public int getVarStart()             { return varStart; }
    public int getVarEnd()               { return varEnd; }
    public boolean isMemoryBound()       { return memory != null && varStart >= 0; }

    public Map<String, String> getVariables() {
        Map<String, String> result = new LinkedHashMap<>(variableFallback);
        if (memory != null && varStart >= 0) {
            for (int i = varStart; i <= varEnd; i++) {
                String word = memory.read(i);
                if (word != null && word.startsWith("VAR:") && !word.equals("VAR:empty")) {
                    String kv = word.substring(4);
                    int eq = kv.indexOf('=');
                    if (eq >= 0) result.put(kv.substring(0, eq), kv.substring(eq + 1));
                }
            }
        }
        return result;
    }
}
