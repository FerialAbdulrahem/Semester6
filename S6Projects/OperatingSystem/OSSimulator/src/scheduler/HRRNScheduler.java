package scheduler;

import os.processes.Process;
import java.util.Queue;


public class HRRNScheduler implements scheduler {

    @Override
    public Process selectNext(Queue<Process> readyQueue) {
        if (readyQueue.isEmpty()) return null;

        Process best = null;
        double  bestRatio = Double.NEGATIVE_INFINITY;

        for (Process p : readyQueue) {
            double ratio = p.getPCB().getResponseRatio();
            if (ratio > bestRatio) {
                bestRatio = ratio;
                best = p;
            }
        }

        readyQueue.remove(best);
        return best;
    }

   
    @Override
    public int getQuantum() { return 0; }

    @Override
    public String getName() { return "HRRN (non-preemptive)"; }
}
