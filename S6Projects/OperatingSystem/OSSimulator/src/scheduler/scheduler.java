package scheduler;

import os.processes.Process;
import java.util.Queue;

public interface scheduler {
    
    Process selectNext(Queue<Process> readyQueue);
    int getQuantum();
    String getName();
}
