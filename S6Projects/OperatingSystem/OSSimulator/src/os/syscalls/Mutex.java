package os.syscalls;

import os.processes.Process;
import os.processes.ProcessState;
import java.util.*;

public class Mutex {
    private String resourceName;
    private boolean locked;
    private Queue<Process> waitingQueue;
    private Process owner;
    
    public Mutex(String resourceName) {
        this.resourceName = resourceName;
        this.locked = false;
        this.waitingQueue = new LinkedList<>();
        this.owner = null;
    }
    

    public synchronized boolean semWait(Process process) {
    	 if (owner == process) {
    	        System.out.println("✅ Process " + process.getPCB().getProcessId() +
    	            " confirmed ownership of " + resourceName + " (granted by semSignal)");
    	        return true;
    	 }
    	
    	if (!locked) {
            // Mutex is free, acquire it
            locked = true;
            owner = process;
            System.out.println("✅ Process " + process.getPCB().getProcessId() + 
                " acquired " + resourceName);
            return true;
        } else {
            // Mutex is locked, block the process
            waitingQueue.add(process);
            process.getPCB().setState(ProcessState.BLOCKED);
            System.out.println("⛔ Process " + process.getPCB().getProcessId() + 
                " blocked on " + resourceName + " (held by Process " + 
                (owner != null ? owner.getPCB().getProcessId() : "unknown") + ")");
            return false;
        }
    }
   
    public synchronized void semSignal(Process process) {
       
        if (owner == process) {
            locked = false;
            System.out.println("🔓 Process " + process.getPCB().getProcessId() + 
                " released " + resourceName);
            
           
            if (!waitingQueue.isEmpty()) {
                Process next = waitingQueue.poll();
                locked = true;
                owner = next;
                next.getPCB().setState(ProcessState.READY);
                System.out.println("🔄 Process " + next.getPCB().getProcessId() + 
                    " now acquired " + resourceName + " and moved to Ready Queue");
            } else {
                owner = null;
            }
        } else {
            System.out.println("⚠️ Process " + process.getPCB().getProcessId() + 
                " tried to release " + resourceName + " but doesn't own it!");
        }
    }
    
    
    public boolean isLocked() { 
        return locked; 
    }
    
   
    public String getResourceName() { 
        return resourceName; 
    }
    
   
    public Queue<Process> getWaitingQueue() { 
        return waitingQueue; 
    }
    
    
    public Process getOwner() { 
        return owner; 
    }
    
   
    public synchronized void forceRelease() {
        if (owner != null) {
            System.out.println("⚠️ Force releasing " + resourceName + " from Process " + 
                owner.getPCB().getProcessId());
            locked = false;
            owner = null;
            
            // Wake up all waiting processes
            while (!waitingQueue.isEmpty()) {
                Process p = waitingQueue.poll();
                p.getPCB().setState(ProcessState.READY);
                System.out.println("🔄 Process " + p.getPCB().getProcessId() + 
                    " moved from blocked to ready queue");
            }
        }
    }
}