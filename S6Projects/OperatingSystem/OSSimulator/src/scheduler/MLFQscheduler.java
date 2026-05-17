package scheduler;

import os.processes.Process;
import java.util.*;


public class MLFQscheduler implements scheduler {

    private static final int LEVELS = 4;

    /** Per-level ready queues. */
    private final List<Queue<Process>> queues;

    /** Tracks which MLFQ level each process (by PID) currently belongs to. */
    private final Map<Integer, Integer> processLevel;

    /** Quantum that was selected when selectNext() last ran. */
    private int currentQuantum = 1;

    public MLFQscheduler() {
        queues = new ArrayList<>(LEVELS);
        for (int i = 0; i < LEVELS; i++) queues.add(new LinkedList<>());
        processLevel = new HashMap<>();
    }

    public void enqueue(Process p) {
        int pid   = p.getPCB().getProcessId();
        int level = processLevel.getOrDefault(pid, 0);
        queues.get(level).add(p);
    }

    
    public void remove(Process p) {
        if (p == null) return;
        int pid   = p.getPCB().getProcessId();
        int level = processLevel.getOrDefault(pid, 0);
        queues.get(level).remove(p);
    }

    public void demote(Process p) {
        int pid   = p.getPCB().getProcessId();
        int level = processLevel.getOrDefault(pid, 0);
        if (level < LEVELS - 1) level++;
        processLevel.put(pid, level);
        queues.get(level).add(p);
    }

    @Override
    public Process selectNext(Queue<Process> engineReadyQueue) {
        for (int i = 0; i < LEVELS; i++) {
            if (!queues.get(i).isEmpty()) {
                Process p = queues.get(i).poll();
                currentQuantum = (int) Math.pow(2, i);
                engineReadyQueue.remove(p);
                return p;
            }
        }
        return null;
    }

    @Override
    public int getQuantum() { return currentQuantum; }

    public int getLevelOf(Process p) {
        return processLevel.getOrDefault(p.getPCB().getProcessId(), 0);
    }

    public List<Queue<Process>> getQueues() { return queues; }

    @Override
    public String getName() { return "MLFQ (4 levels, q=2^level)"; }
}