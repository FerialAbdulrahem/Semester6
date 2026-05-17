package os.syscalls;

import os.processes.Process;
import os.processes.ProcessState;
import os.memory.Memory;
import java.util.function.Consumer;


public class SystemCall {

    public static final int SYS_READ_FILE  = 1;
    public static final int SYS_WRITE_FILE = 2;
    public static final int SYS_PRINT      = 3;
    public static final int SYS_INPUT      = 4;
    public static final int SYS_READ_MEM   = 5;
    public static final int SYS_WRITE_MEM  = 6;
    public static final int SYS_SEM_WAIT   = 7;
    public static final int SYS_SEM_SIGNAL = 8;

    private final Memory           memory;
    private final Consumer<String> outputConsumer;

 
    private final Mutex userInputMutex;
    private final Mutex userOutputMutex;
    private final Mutex fileMutex;

    
    private volatile String  pendingInput    = null;
    private volatile boolean waitingForInput = false;

    public SystemCall(Memory memory, Consumer<String> outputConsumer) {
        this.memory          = memory;
        this.outputConsumer  = outputConsumer;
        this.userInputMutex  = new Mutex("userInput");
        this.userOutputMutex = new Mutex("userOutput");
        this.fileMutex       = new Mutex("file");
    }

  

   
    public void provideInput(String input) {
        this.pendingInput    = input;
        this.waitingForInput = false;
    }

    public boolean isWaitingForInput() { return waitingForInput; }


    public Object handleSystemCall(int callNumber, Process process, Object... args) {
        log("[SysCall] P" + process.getPCB().getProcessId()
                + " → " + getCallName(callNumber));

        switch (callNumber) {
            case SYS_READ_FILE:
                return args.length > 0 ? readFile((String) args[0], process) : null;
            case SYS_WRITE_FILE:
                return args.length > 1
                        ? writeFile((String) args[0], (String) args[1], process)
                        : false;
            case SYS_PRINT:
                return args.length > 0 ? printToScreen((String) args[0]) : false;
            case SYS_INPUT:
                return getUserInput(args.length > 0 ? (String) args[0] : "Please enter a value");
            case SYS_READ_MEM:
                return args.length > 0 ? readMemory((int) args[0]) : null;
            case SYS_WRITE_MEM:
                return args.length > 1 ? writeMemory((int) args[0], (String) args[1]) : false;
            case SYS_SEM_WAIT:
                return args.length > 0 ? semWait((String) args[0], process) : false;
            case SYS_SEM_SIGNAL:
                return args.length > 0 ? semSignal((String) args[0], process) : false;
            default:
                log("[SysCall] Unknown call: " + callNumber);
                return -1;
        }
    }

    

    private String readFile(String filename, Process process) {
        try {
            String content = FileHandler.readFile(filename);
            log("[SysCall] P" + process.getPCB().getProcessId()
                    + " read file: " + filename);
            return content;
        } catch (Exception e) {
            log("[SysCall] ERROR reading file '" + filename + "': " + e.getMessage());
            return null;
        }
    }

    private boolean writeFile(String filename, String data, Process process) {
        try {
            FileHandler.writeFile(filename, data);
            log("[SysCall] P" + process.getPCB().getProcessId()
                    + " wrote to file: " + filename);
            return true;
        } catch (Exception e) {
            log("[SysCall] ERROR writing file '" + filename + "': " + e.getMessage());
            return false;
        }
    }

    private boolean printToScreen(String data) {
        log("[SCREEN] " + data);
        return true;
    }

 
    private String getUserInput(String prompt) {
        
        if (pendingInput != null) {
            String result = pendingInput;
            pendingInput = null;
            waitingForInput = false;
            return result;
        }

       
        if (!waitingForInput) {
            log("[INPUT] " + prompt);
        }

     
        waitingForInput = true;
        return null;
    }

    private String readMemory(int address) {
        if (address < 0 || address >= Memory.SIZE) {
            log("[SysCall] Invalid memory address: " + address);
            return null;
        }
        return memory.read(address);
    }

    private boolean writeMemory(int address, String value) {
        if (address < 0 || address >= Memory.SIZE) {
            log("[SysCall] Invalid memory address: " + address);
            return false;
        }
        memory.write(address, value);
        return true;
    }

    private boolean semWait(String resourceName, Process process) {
        Mutex mutex = getMutex(resourceName);
        if (mutex == null) { log("[SysCall] Unknown resource: " + resourceName); return false; }
        return mutex.semWait(process);
    }

    private boolean semSignal(String resourceName, Process process) {
        Mutex mutex = getMutex(resourceName);
        if (mutex == null) { log("[SysCall] Unknown resource: " + resourceName); return false; }
        mutex.semSignal(process);
        return true;
    }

    

    private Mutex getMutex(String resourceName) {
        if (resourceName == null) return null;
        switch (resourceName.toLowerCase()) {
            case "userinput":  return userInputMutex;
            case "useroutput": return userOutputMutex;
            case "file":       return fileMutex;
            default:           return null;
        }
    }

    private void log(String msg) {
        if (outputConsumer != null) outputConsumer.accept(msg);
    }

    private String getCallName(int n) {
        switch (n) {
            case SYS_READ_FILE:  return "READ_FILE";
            case SYS_WRITE_FILE: return "WRITE_FILE";
            case SYS_PRINT:      return "PRINT";
            case SYS_INPUT:      return "INPUT";
            case SYS_READ_MEM:   return "READ_MEM";
            case SYS_WRITE_MEM:  return "WRITE_MEM";
            case SYS_SEM_WAIT:   return "SEM_WAIT";
            case SYS_SEM_SIGNAL: return "SEM_SIGNAL";
            default:             return "UNKNOWN(" + n + ")";
        }
    }

  

    public Mutex getUserInputMutex()  { return userInputMutex; }
    public Mutex getUserOutputMutex() { return userOutputMutex; }
    public Mutex getFileMutex()       { return fileMutex; }
}