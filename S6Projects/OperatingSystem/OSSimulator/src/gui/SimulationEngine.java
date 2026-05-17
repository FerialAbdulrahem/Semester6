package gui;

import os.interpreter.Interpreter;
import os.memory.Memory;
import os.memory.MemoryWord;
import os.processes.PCB;
import os.processes.Process;
import os.processes.ProcessState;
import os.syscalls.Mutex;
import os.syscalls.SystemCall;
import scheduler.*;

import java.io.*;
import java.nio.file.*;
import java.util.*;
import java.util.function.Consumer;


public class SimulationEngine {

  
    private static final String[] PROGRAM_FILES = {
        "programs/Program_1.txt",
        "programs/Program_2.txt",
        "programs/Program_3.txt"
    };
    private static final int[] ARRIVAL_TIMES = {0, 1, 4};
    private static final int PCB_WORDS = 4;
    private static final int VAR_WORDS = 3;
    private static final String DISK_DIR = "process_storage";

   
    private Memory      memory;
    private SystemCall  systemCall;
    private Interpreter interpreter;

    private final List<Process>  allProcesses  = new ArrayList<>();
    private final Queue<Process> readyQueue    = new LinkedList<>();
    private final List<Process>  blockedQueue  = new ArrayList<>();
    private Process runningProcess = null;

    private int     clock    = 0;
    private boolean finished = false;
    private scheduler scheduler;
    private int instructionsThisSlice = 0;
    private int currentQuantum        = 2;

   
    private final Set<Integer> swappedToDisk = new HashSet<>();

   
    private boolean awaitingInput = false;

    
    private final Map<Integer, String> blockedOnResource = new HashMap<>();

    private final List<String> eventLog = new ArrayList<>();
    private Consumer<String>   outputSink;

   
    public SimulationEngine(Consumer<String> outputSink) {
        this.outputSink = outputSink;
        reset();
    }

   
    public void setScheduler(scheduler sched) {
        this.scheduler = sched;
        currentQuantum = sched.getQuantum() > 0 ? sched.getQuantum() : Integer.MAX_VALUE;
        log("Scheduler set to: " + sched.getName());
    }

    public scheduler getScheduler() { return scheduler; }

    public void reset() {
        memory      = new Memory();
        systemCall  = new SystemCall(memory, s -> log(s));
        interpreter = new Interpreter(memory, systemCall);
        allProcesses.clear();
        readyQueue.clear();
        blockedQueue.clear();
        blockedOnResource.clear();
        runningProcess = null;
        clock = 0;
        finished = false;
        instructionsThisSlice = 0;
        awaitingInput = false;
        eventLog.clear();
        swappedToDisk.clear();

        // Clear swap files from previous run
        File diskDir = new File(DISK_DIR);
        if (diskDir.exists()) {
            File[] files = diskDir.listFiles();
            if (files != null) for (File f : files) f.delete();
        }

        if (scheduler == null) scheduler = new RoundRobinScheduler();
        currentQuantum = scheduler.getQuantum() > 0 ? scheduler.getQuantum() : Integer.MAX_VALUE;
        seedTestFile();
        loadProcessDescriptors();
        log("=== Simulation reset. Clock = 0 ===");
        log("Scheduler: " + scheduler.getName());
        log("Arrival times: P1@t=0  P2@t=1  P3@t=4");
    }


    public boolean step() {
        if (finished) return false;

        log("\n══ Clock " + clock + " ══════════════════════════════════════");

       
        for (Process proc : allProcesses) {
            if (proc.getPCB().getState() == ProcessState.NEW
                    && getArrivalTime(proc) == clock) {
                boolean loaded = tryLoadToMemory(proc);
                if (!loaded) {
                    log("P" + proc.getPCB().getProcessId()
                            + " arrived but memory full → attempting swap-out...");
                    swapOutForProcess(proc);
                    loaded = tryLoadToMemory(proc);
                }
                if (loaded) {
                    proc.getPCB().setState(ProcessState.READY);
                    enqueueReady(proc);
                    log("P" + proc.getPCB().getProcessId()
                            + " arrived → memory ["
                            + proc.getPCB().getMemoryStart() + "-"
                            + proc.getPCB().getMemoryEnd() + "] → Ready");
                    printQueues();
                } else {
                    log("ERROR: could not load P" + proc.getPCB().getProcessId()
                            + " — not enough memory even after swap-out!");
                }
            }
        }

      
        if (awaitingInput) {
            if (systemCall.isWaitingForInput()) {
                log("  → Still waiting for user input — clock stalled");
                clock++;
                return true;
            }
           
            awaitingInput = false;
            log("  → Input received — replaying stalled instruction");
            if (runningProcess != null) {
                String instr = runningProcess.getCurrentInstruction();
                if (instr != null) {
                    log("  → P" + runningProcess.getPCB().getProcessId()
                            + "  PC=" + runningProcess.getPCB().getProgramCounter()
                            + "  replay: " + instr);
                    interpreter.execute(instr, runningProcess);
                    instructionsThisSlice++;
                }
            }
            syncQueues();
            printMemoryState();
            clock++;
            checkFinished();
            return true;
        }

       
        for (Process p : readyQueue) p.getPCB().incrementWaitingTime();

    
        if (runningProcess == null && !readyQueue.isEmpty()) {
            pickNext();
        }

    
        if (runningProcess != null) {
            String instr = runningProcess.getCurrentInstruction();
            if (instr != null) {
                log("  → P" + runningProcess.getPCB().getProcessId()
                        + "  PC=" + runningProcess.getPCB().getProgramCounter()
                        + "  exec: " + instr);
                interpreter.execute(instr, runningProcess);

             
                if (systemCall.isWaitingForInput()) {
                    int pc = runningProcess.getPCB().getProgramCounter();
                    runningProcess.getPCB().setProgramCounter(pc - 1);
                    awaitingInput = true;
                    log("  → P" + runningProcess.getPCB().getProcessId()
                            + " needs user input — PC rolled back to "
                            + runningProcess.getPCB().getProgramCounter());
                    printMemoryState();
                    clock++;
                    return true;
                }
                instructionsThisSlice++;
            }
        }

      
        syncQueues();

       
        if (runningProcess != null
                && runningProcess.getPCB().getState() == ProcessState.RUNNING
                && instructionsThisSlice >= currentQuantum) {
            preempt();
        }

      
        if (runningProcess == null && !readyQueue.isEmpty()) {
            pickNext();
        }

       
        printMemoryState();

     
        clock++;

      
        checkFinished();
        return true;
    }



    private void pickNext() {
        Process next = scheduler.selectNext(readyQueue);
        if (next == null) return;

        if (!isInMemory(next)) {
            log("P" + next.getPCB().getProcessId()
                    + " is on disk — swapping into memory before running...");
            boolean swappedIn = swapInProcess(next);
            if (!swappedIn) {
                log("P" + next.getPCB().getProcessId()
                        + " swap-in failed — process stays on disk, will retry next cycle");
                next.getPCB().setState(ProcessState.READY);
                enqueueReady(next);
                return;  
            }
        }

        runningProcess = next;
        runningProcess.getPCB().setState(ProcessState.RUNNING);
        instructionsThisSlice = 0;
        currentQuantum = scheduler.getQuantum() > 0 ? scheduler.getQuantum() : Integer.MAX_VALUE;
        log(">>> Scheduler selected P" + runningProcess.getPCB().getProcessId()
                + "  [" + scheduler.getName() + "]"
                + "  quantum=" + (currentQuantum == Integer.MAX_VALUE ? "INF" : currentQuantum));
        printQueues();
    }

    private void preempt() {
        if (runningProcess == null) return;
        log("--- Preempting P" + runningProcess.getPCB().getProcessId()
                + " (" + instructionsThisSlice + "/" + currentQuantum + " instructions used) ---");
        if (scheduler instanceof MLFQscheduler) {
            ((MLFQscheduler) scheduler).demote(runningProcess);
            runningProcess.getPCB().setState(ProcessState.READY);
        } else {
            runningProcess.getPCB().setState(ProcessState.READY);
        }
        syncStateToMemory(runningProcess);  
        readyQueue.add(runningProcess);
        runningProcess = null;
        instructionsThisSlice = 0;
        printQueues();
    }

    private void syncQueues() {
        if (runningProcess != null) {
            ProcessState s = runningProcess.getPCB().getState();
            if (s == ProcessState.BLOCKED) {
                String resource = findBlockedResource(runningProcess);
                blockedOnResource.put(runningProcess.getPCB().getProcessId(), resource);
                log("P" + runningProcess.getPCB().getProcessId()
                        + " BLOCKED on: " + resource);
                syncStateToMemory(runningProcess); 
                
                if (scheduler instanceof MLFQscheduler) {
                    ((MLFQscheduler) scheduler).remove(runningProcess);
                }
                blockedQueue.add(runningProcess);
                runningProcess = null;
                instructionsThisSlice = 0;
                printQueues();
            } else if (s == ProcessState.FINISHED) {
                log("P" + runningProcess.getPCB().getProcessId() + " FINISHED");
                syncStateToMemory(runningProcess);
            
                releaseMutexesFor(runningProcess);
                freeProcessMemory(runningProcess);
                runningProcess = null;
                instructionsThisSlice = 0;
                printQueues();
            }
        }

      
        Iterator<Process> it = blockedQueue.iterator();
        while (it.hasNext()) {
            Process p = it.next();
            if (p.getPCB().getState() == ProcessState.READY) {
                it.remove();
                blockedOnResource.remove(p.getPCB().getProcessId());
                if (!isInMemory(p)) {
                    log("P" + p.getPCB().getProcessId()
                            + " unblocked but is on disk — swapping into memory...");
                    boolean ok = swapInProcess(p);
                    if (!ok) {
                        log("P" + p.getPCB().getProcessId()
                                + " swap-in failed after unblock — will retry next cycle");
                    }
                }
                enqueueReady(p);
                log("P" + p.getPCB().getProcessId() + " unblocked → Ready");
                printQueues();
            }
        }
    }

    private String findBlockedResource(Process proc) {
        Mutex[] mutexes = {
            systemCall.getUserInputMutex(),
            systemCall.getUserOutputMutex(),
            systemCall.getFileMutex()
        };
        String[] names = {"userInput", "userOutput", "file"};
        for (int i = 0; i < mutexes.length; i++) {
            for (Process w : mutexes[i].getWaitingQueue()) {
                if (w.getPCB().getProcessId() == proc.getPCB().getProcessId())
                    return names[i];
            }
        }
        return "unknown";
    }

    private void releaseMutexesFor(Process proc) {
        Mutex[] mutexes = {
            systemCall.getUserInputMutex(),
            systemCall.getUserOutputMutex(),
            systemCall.getFileMutex()
        };
        String[] names = {"userInput", "userOutput", "file"};
        for (int i = 0; i < mutexes.length; i++) {
            if (mutexes[i].isLocked()) {
                Process owner = mutexes[i].getOwner();
                if (owner != null && owner.getPCB().getProcessId()
                        == proc.getPCB().getProcessId()) {
                    log("  Auto-release mutex '" + names[i] + "' from finished P"
                            + proc.getPCB().getProcessId());
                    mutexes[i].semSignal(proc);
                }
            }
        }
    }

    

    private boolean tryLoadToMemory(Process proc) {
        int needed = PCB_WORDS + VAR_WORDS + proc.getInstructions().size();
        if (!memory.canAllocate(needed)) return false;
        int start = memory.allocate(needed);
        if (start == -1) return false;
        int end  = start + needed - 1;
        int addr = start;

        
        memory.write(addr++, "PCB:PID="   + proc.getPCB().getProcessId());
        memory.write(addr++, "PCB:State=" + proc.getPCB().getState());
        memory.write(addr++, "PCB:PC="    + proc.getPCB().getProgramCounter());
        memory.write(addr++, "PCB:Mem=["  + start + "-" + end + "]");

       
        int varStart = addr;
        for (int i = 0; i < VAR_WORDS; i++) memory.write(addr++, "VAR:empty");
        int varEnd = addr - 1;

      
        for (String line : proc.getInstructions()) memory.write(addr++, "INST:" + line);

        proc.getPCB().setMemoryStart(start);
        proc.getPCB().setMemoryEnd(end);
        proc.bindMemory(memory, varStart, varEnd);
        return true;
    }

    private void freeProcessMemory(Process proc) {
        proc.unbindMemory();
        int start = proc.getPCB().getMemoryStart();
        int end   = proc.getPCB().getMemoryEnd();
        if (end >= start && start >= 0) {
            memory.deallocate(start, end);
            log("P" + proc.getPCB().getProcessId()
                    + " memory [" + start + "-" + end + "] freed");
        }
    }


    private void syncStateToMemory(Process proc) {
        int s = proc.getPCB().getMemoryStart();
        if (s < 0 || s + 3 >= Memory.SIZE) return;
        if (!isInMemory(proc)) return;
        memory.write(s + 1, "PCB:State=" + proc.getPCB().getState());
        memory.write(s + 2, "PCB:PC="    + proc.getPCB().getProgramCounter());
    }

    private boolean isInMemory(Process proc) {
        int start = proc.getPCB().getMemoryStart();
        int end   = proc.getPCB().getMemoryEnd();
        if (start < 0 || end < start || start >= Memory.SIZE) return false;
        if (!memory.getMemory()[start].isAllocated()) return false;
        String firstWord = memory.read(start);
        if (firstWord == null) return false;
        return firstWord.equals("PCB:PID=" + proc.getPCB().getProcessId());
    }

   
    private void swapOutForProcess(Process incoming) {
       
        
            int incomingNeeded = PCB_WORDS + VAR_WORDS + incoming.getInstructions().size();

            List<Process> candidates = new ArrayList<>();
            for (Process p : readyQueue)   if (isInMemory(p)) candidates.add(p);
            for (Process p : blockedQueue) if (isInMemory(p)) candidates.add(p);
            if (runningProcess != null && isInMemory(runningProcess)
                    && runningProcess != incoming) candidates.add(runningProcess);

            while (!memory.canAllocate(incomingNeeded) && !candidates.isEmpty()) {
                Process victim = null;
                int maxRemaining = -1;
                for (Process p : candidates) {
                    if (p.getPCB().getRemainingTime() > maxRemaining) {
                        maxRemaining = p.getPCB().getRemainingTime();
                        victim = p;
                    }
                }
                if (victim == null) break;
                candidates.remove(victim);

                boolean isBlockedVictim = blockedQueue.contains(victim);

                
                if (scheduler instanceof MLFQscheduler) {
                    MLFQscheduler mlfq = (MLFQscheduler) scheduler;
                    mlfq.remove(victim);
                }

                readyQueue.remove(victim);

                // If evicting the currently running process, preempt it
                if (victim == runningProcess) {
                    log("  Evicting running P" + victim.getPCB().getProcessId()
                            + " to make room — preempting");
                    victim.getPCB().setState(ProcessState.READY);
                    runningProcess = null;
                    instructionsThisSlice = 0;
                }

                String filename = DISK_DIR + "/process_" + victim.getPCB().getProcessId() + ".swap";
                try {
                    Files.createDirectories(Paths.get(DISK_DIR));
                    writeToDisk(victim, filename);
                    freeProcessMemory(victim);
                    swappedToDisk.add(victim.getPCB().getProcessId());

                    // Only re-enqueue READY processes (blocked ones stay blocked)
                    if (!isBlockedVictim) {
                        victim.getPCB().setState(ProcessState.READY);
                        enqueueReady(victim);
                        log("Swapped OUT P" + victim.getPCB().getProcessId() + " → " + filename);
                    } else {
                        log("Swapped OUT blocked P" + victim.getPCB().getProcessId()
                                + " (remains blocked on " + findBlockedResource(victim) + ")");
                    }
                } catch (IOException e) {
                    log("Swap-out failed for P" + victim.getPCB().getProcessId()
                            + ": " + e.getMessage());
                    enqueueReady(victim); // safety fallback
                }
            }
        }
    

   
    private void writeToDisk(Process proc, String filename) throws IOException {
        try (PrintWriter pw = new PrintWriter(new FileWriter(filename))) {
            pw.println("# Process " + proc.getPCB().getProcessId() + " swap file");
            pw.println("pid="      + proc.getPCB().getProcessId());
            pw.println("state="    + proc.getPCB().getState());
            pw.println("pc="       + proc.getPCB().getProgramCounter());
            pw.println("memStart=" + proc.getPCB().getMemoryStart());
            pw.println("memEnd="   + proc.getPCB().getMemoryEnd());

            int s = proc.getPCB().getMemoryStart();
            int e = proc.getPCB().getMemoryEnd();
            for (int i = s; i <= e; i++) {
                String val = memory.read(i);
                pw.println("word_" + i + "=" + (val == null ? "null" : val));
            }
            for (Map.Entry<String, String> kv : proc.getVariables().entrySet()) {
                pw.println("var_" + kv.getKey() + "=" + kv.getValue());
            }
        }
    }

 
    private boolean swapInProcess(Process proc) {
        String filename = DISK_DIR + "/process_" + proc.getPCB().getProcessId() + ".swap";
        if (!new File(filename).exists()) {
            log("  Swap-in P" + proc.getPCB().getProcessId()
                    + ": no swap file found — process cannot run without memory");
            return false;
        }

        int needed = PCB_WORDS + VAR_WORDS + proc.getInstructions().size();

        
        int start = memory.allocate(needed);
        if (start == -1) {
            log("  Swap-in P" + proc.getPCB().getProcessId()
                    + " needs " + needed + " contiguous words — evicting to defragment/free...");
            swapOutForProcess(proc);
            start = memory.allocate(needed);
        }

        if (start == -1) {
            log("Swap-in FAILED: not enough contiguous memory for P"
                    + proc.getPCB().getProcessId() + " — process stays on disk");
            return false;
        }

        try {
            readFromDisk(proc, start, filename);
            new File(filename).delete();
            swappedToDisk.remove(proc.getPCB().getProcessId());
            log("Swapped IN P" + proc.getPCB().getProcessId()
                    + " ← disk → memory [" + start + "-" + (start + needed - 1) + "]");
            return true;
        } catch (Exception e) {
            log("Swap-in failed for P" + proc.getPCB().getProcessId()
                    + ": " + e.getMessage() + " — rolling back allocation");
            memory.deallocate(start, start + needed - 1);
            return false;
        }
    }

   
    private void readFromDisk(Process proc, int newStart, String filename) throws IOException {
        List<String> lines = Files.readAllLines(Paths.get(filename));
        int oldStart = proc.getPCB().getMemoryStart();
        int oldEnd   = proc.getPCB().getMemoryEnd();
        int needed   = oldEnd - oldStart + 1;
        int newEnd   = newStart + needed - 1;

        for (String line : lines) {
            if (line.startsWith("#") || line.isEmpty()) continue;

            if (line.startsWith("word_")) {
                String[] sp = line.split("=", 2);
                if (sp.length < 2) continue;
                int idx;
                try { idx = Integer.parseInt(sp[0].replace("word_", "")); }
                catch (NumberFormatException ex) { continue; }
                int offset = idx - oldStart;
                if (offset >= 0 && offset < needed) {
                    memory.write(newStart + offset, sp[1].equals("null") ? null : sp[1]);
                }
            } else if (line.startsWith("pc=")) {
                try { proc.getPCB().setProgramCounter(Integer.parseInt(line.split("=")[1])); }
                catch (NumberFormatException ignored) {}
            } else if (line.startsWith("var_")) {
                // Restore variable into the process so it is available after swap-in.
                // setVariable() writes directly to memory once bindMemory() is called.
                String kv = line.substring("var_".length());
                int eq = kv.indexOf('=');
                if (eq >= 0) {
                    proc.setVariable(kv.substring(0, eq), kv.substring(eq + 1));
                }
            }
        }

     
        proc.getPCB().setMemoryStart(newStart);
        proc.getPCB().setMemoryEnd(newEnd);
        memory.write(newStart + 3, "PCB:Mem=[" + newStart + "-" + newEnd + "]");

        
        int varStart = newStart + PCB_WORDS;
        int varEnd   = varStart + VAR_WORDS - 1;
        proc.bindMemory(memory, varStart, varEnd);
    }

   
    private void seedTestFile() {
        String destDir  = "disk/";
        String destName = "TestFileToReadFrom.txt";
       
        String[] candidates = {
            "programs/TestFileToReadFrom.txt",
            "src/TestFileToReadFrom.txt",
            destName
        };
        try {
            Files.createDirectories(Paths.get(destDir));
            Path dest = Paths.get(destDir + destName);
            for (String candidate : candidates) {
                Path src = Paths.get(candidate);
                if (Files.exists(src)) {
                    Files.copy(src, dest, StandardCopyOption.REPLACE_EXISTING);
                    log("Seeded " + destDir + destName + " from " + candidate);
                    return;
                }
            }
             
            Files.write(dest, "ContentOfTestFile".getBytes());
            log("Seeded " + destDir + destName + " with default content");
        } catch (IOException e) {
            log("WARNING: could not seed TestFileToReadFrom.txt — " + e.getMessage());
        }
    }

    private void loadProcessDescriptors() {
        for (int i = 0; i < PROGRAM_FILES.length; i++) {
            try {
                List<String> rawLines = Files.readAllLines(Paths.get(PROGRAM_FILES[i]));
                List<String> instructions = new ArrayList<>();
                for (String l : rawLines) {
                    String t = l.trim();
                    if (!t.isEmpty()) instructions.add(t);
                }
                PCB pcb = new PCB(i + 1, -1, -1, 0, instructions.size());
                Process proc = new Process(pcb, instructions.size());
                for (String inst : instructions) proc.addInstruction(inst);
                allProcesses.add(proc);
                log("Loaded P" + (i + 1) + " (" + instructions.size()
                        + " instructions, arrives t=" + ARRIVAL_TIMES[i] + ")");
            } catch (IOException e) {
                log("Could not load " + PROGRAM_FILES[i] + ": " + e.getMessage());
            }
        }
    }

    private int getArrivalTime(Process proc) {
        int idx = allProcesses.indexOf(proc);
        return (idx >= 0 && idx < ARRIVAL_TIMES.length) ? ARRIVAL_TIMES[idx] : 0;
    }

 

    private void enqueueReady(Process proc) {
        readyQueue.add(proc);
        if (scheduler instanceof MLFQscheduler) {
            ((MLFQscheduler) scheduler).enqueue(proc);
        }
    }

   

    private void printQueues() {
        StringBuilder sb = new StringBuilder("  Queues →");
        if (scheduler instanceof MLFQscheduler) {
            MLFQscheduler mlfq = (MLFQscheduler) scheduler;
            sb.append(" MLFQ[");
            List<Queue<Process>> levels = mlfq.getQueues();
            for (int i = 0; i < levels.size(); i++) {
                sb.append("L").append(i).append(":[");
                List<String> pids = new ArrayList<>();
                for (Process p : levels.get(i)) pids.add("P" + p.getPCB().getProcessId());
                sb.append(String.join(",", pids)).append("]");
                if (i < levels.size() - 1) sb.append(" ");
            }
            sb.append("]");
        } else {
            sb.append(" Ready:[");
            List<String> r = new ArrayList<>();
            for (Process p : readyQueue) r.add("P" + p.getPCB().getProcessId());
            sb.append(String.join(",", r)).append("]");
        }
        sb.append("  Blocked:[");
        List<String> b = new ArrayList<>();
        for (Process p : blockedQueue) {
            String res = blockedOnResource.getOrDefault(p.getPCB().getProcessId(), "?");
            b.add("P" + p.getPCB().getProcessId() + "@" + res);
        }
        sb.append(String.join(",", b)).append("]");
        if (runningProcess != null)
            sb.append("  Running:P").append(runningProcess.getPCB().getProcessId());
        else
            sb.append("  Running:[idle]");
        log(sb.toString());
    }

    private void printMemoryState() {
        StringBuilder sb = new StringBuilder("\n  -- Memory @ Clock " + clock + " --\n");
        MemoryWord[] words = memory.getMemory();
        for (int i = 0; i < Memory.SIZE; i++) {
            if (words[i].isAllocated()) {
                String val = words[i].getValue() != null ? words[i].getValue() : "(null)";
                sb.append(String.format("  [%02d] %s%n", i, val));
            } else {
                sb.append(String.format("  [%02d] FREE%n", i));
            }
        }
        log(sb.toString().trim());
    }

    private void checkFinished() {
        boolean allDone = allProcesses.stream()
                .allMatch(p -> p.getPCB().getState() == ProcessState.FINISHED);
        boolean pendingArrivals = allProcesses.stream()
                .anyMatch(p -> p.getPCB().getState() == ProcessState.NEW
                            && getArrivalTime(p) > clock);
        finished = allDone && readyQueue.isEmpty() && blockedQueue.isEmpty()
                && runningProcess == null && !pendingArrivals;
    }

    private void log(String msg) {
        eventLog.add(msg);
        if (outputSink != null) outputSink.accept(msg);
    }

    
    public Memory              getMemory()             { return memory; }
    public SystemCall          getSystemCall()          { return systemCall; }
    public List<Process>       getAllProcesses()        { return allProcesses; }
    public Queue<Process>      getReadyQueue()          { return readyQueue; }
    public List<Process>       getBlockedQueue()        { return blockedQueue; }
    public Map<Integer,String> getBlockedOnResource()   { return blockedOnResource; }
    public Process             getRunningProcess()      { return runningProcess; }
    public int                 getClock()               { return clock; }
    public boolean             isFinished()             { return finished; }
    public boolean             isAwaitingInput()        { return awaitingInput; }
    public List<String>        getEventLog()            { return eventLog; }
    public Set<Integer>        getSwappedToDisk()       { return Collections.unmodifiableSet(swappedToDisk); }
    public Mutex getUserInputMutex()  { return systemCall.getUserInputMutex(); }
    public Mutex getUserOutputMutex() { return systemCall.getUserOutputMutex(); }
    public Mutex getFileMutex()       { return systemCall.getFileMutex(); }
    public int   getArrivalTimePublic(Process p) { return getArrivalTime(p); }
}