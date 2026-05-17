package os.processes;

import java.io.Serializable;

public class PCB implements Serializable {
    private static final long serialVersionUID = 1L;
    
    private int processId;
    private ProcessState state;
    private int programCounter;
    private int memoryStart;
    private int memoryEnd;
    private int instructionCount;
    private int waitingTime;
    private int burstTime;
    private int remainingTime;
    
    public PCB(int processId, int memoryStart, int memoryEnd, int programCounter, int instructionCount) {
        this.processId = processId;
        this.memoryStart = memoryStart;
        this.memoryEnd = memoryEnd;
        this.programCounter = programCounter;
        this.instructionCount = instructionCount;
        this.state = ProcessState.NEW;
        this.waitingTime = 0;
        this.burstTime = instructionCount;
        this.remainingTime = instructionCount;
    }
    
   
    public int getProcessId() { return processId; }
    public ProcessState getState() { return state; }
    public void setState(ProcessState state) { this.state = state; }
    public int getProgramCounter() { return programCounter; }
    public void setProgramCounter(int programCounter) { this.programCounter = programCounter; }
    public int getMemoryStart() { return memoryStart; }
    public int getMemoryEnd()   { return memoryEnd; }
    public void setMemoryStart(int memoryStart) { this.memoryStart = memoryStart; }
    public void setMemoryEnd(int memoryEnd)     { this.memoryEnd   = memoryEnd; }
    public int getInstructionCount() { return instructionCount; }
    public int getWaitingTime() { return waitingTime; }
    public void incrementWaitingTime() { this.waitingTime++; }
    public int getBurstTime() { return burstTime; }
    public int getRemainingTime() { return remainingTime; }
    public void decrementRemainingTime() { this.remainingTime--; }
    
    public double getResponseRatio() {
        return (waitingTime + burstTime) / (double) burstTime;
    }
    
    @Override
    public String toString() {
        return String.format("PCB[ID=%d, State=%s, PC=%d, Memory=[%d-%d]]", 
            processId, state, programCounter, memoryStart, memoryEnd);
    }
}