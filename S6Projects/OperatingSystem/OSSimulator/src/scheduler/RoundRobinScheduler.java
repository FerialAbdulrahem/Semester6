package scheduler;

import os.processes.Process;
import java.util.LinkedList;
import java.util.Queue;


public class RoundRobinScheduler implements scheduler {

    private final int quantum;

    public RoundRobinScheduler() { this(2); }

    public RoundRobinScheduler(int quantum) { this.quantum = quantum; }

    @Override
    public Process selectNext(Queue<Process> readyQueue) {
        return readyQueue.poll();   // FIFO order
    }

    @Override
    public int getQuantum() { return quantum; }

    @Override
    public String getName() { return "Round Robin (q=" + quantum + ")"; }
}
