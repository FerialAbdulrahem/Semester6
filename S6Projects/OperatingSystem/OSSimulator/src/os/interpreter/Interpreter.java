package os.interpreter;
import os.processes.Process;
import os.processes.ProcessState;
import os.memory.Memory;
import os.syscalls.SystemCall;


public class Interpreter {
    private final Memory     memory;
    private final SystemCall systemCall;

    public Interpreter(Memory memory, SystemCall systemCall) {
        this.memory     = memory;
        this.systemCall = systemCall;
    }

   
    public boolean execute(String instructionLine, Process process) {
        if (instructionLine == null || instructionLine.trim().isEmpty()) return true;
        Instruction instr = new Instruction(instructionLine);
        boolean blockedDuringExecution = false;
        boolean fileNotReady           = false;
        try {
            switch (instr.getType()) {
                case PRINT:         handlePrint(instr, process);                       break;
                case ASSIGN:        fileNotReady = handleAssign(instr, process);       break;
                case WRITE_FILE:    handleWriteFile(instr, process);                   break;
                case READ_FILE:     fileNotReady = handleReadFile(instr, process);     break;
                case PRINT_FROM_TO: handlePrintFromTo(instr, process);                 break;
                case SEM_WAIT:
                    blockedDuringExecution = handleSemWait(instr, process);
                    break;
                case SEM_SIGNAL:    handleSemSignal(instr, process);                   break;
                default:
                    log("Unknown instruction: " + instructionLine);
            }
        } catch (Exception e) {
            log("Error executing '" + instructionLine + "': " + e.getMessage());
            return false;
        }

        if (fileNotReady) {
            log("[Interpreter] readFile: file not ready for P"
                    + process.getPCB().getProcessId()
                    + " – releasing file mutex and rolling back to semWait file");
            systemCall.handleSystemCall(SystemCall.SYS_SEM_SIGNAL, process, "file");
    
            int semWaitPC = Math.max(0, process.getPCB().getProgramCounter() - 1);
            process.getPCB().setProgramCounter(semWaitPC);
            syncPCBToMemory(process);
            log("[Interpreter] P" + process.getPCB().getProcessId()
                    + " PC set to " + semWaitPC + " (semWait file) – will re-block next cycle");
            return true;   // skip the normal incrementPC below
        }

        if (!blockedDuringExecution) {
            process.incrementPC();
        }
        syncPCBToMemory(process);
        return true;
    }



    private void handlePrint(Instruction instr, Process proc) {
        String value = resolveArg(instr, 0, proc);
        systemCall.handleSystemCall(SystemCall.SYS_PRINT, proc,
                value != null ? value : "");
    }

    
    private boolean handleAssign(Instruction instr, Process proc) {
        String varName   = instr.getAssignVariable();
        String valueExpr = instr.getAssignValue();
        if (varName == null) return false;

        String value;

     
        if ("readFile".equalsIgnoreCase(valueExpr)) {
            String filenameToken = instr.getTokens().size() > 3
                    ? instr.getTokens().get(3) : null;
            String filename = filenameToken != null
                    ? resolveToken(filenameToken, proc) : null;
            if (filename != null) {
                value = (String) systemCall.handleSystemCall(
                        SystemCall.SYS_READ_FILE, proc, filename);
                if (value == null || value.trim().isEmpty()) {
                    log("assign readFile: file '" + filename
                            + "' not available yet for P" + proc.getPCB().getProcessId());
                    return true;   // release mutex + roll back
                }
            } else {
                log("assign readFile: missing filename argument");
                return false;
            }
        }

    
        else if ("input".equalsIgnoreCase(valueExpr)) {
            value = (String) systemCall.handleSystemCall(
                    SystemCall.SYS_INPUT, proc,
                    "Please enter a value for " + varName);
        }
     
        else if (valueExpr != null && instr.isVariableOperand(1)) {
            value = proc.getVariable(valueExpr);
            if (value == null) value = valueExpr;
        }

        
        else {
            value = instr.getLiteralValue(1);
            if (value == null) value = valueExpr;
        }

        if (value != null) {
            proc.setVariable(varName, value);
            log("Assigned " + varName + " = \"" + value
                    + "\"  (P" + proc.getPCB().getProcessId() + ")");
        }
        return false;
    }

    private void handleWriteFile(Instruction instr, Process proc) {
        String filename = resolveArg(instr, 0, proc);
        String data     = resolveArg(instr, 1, proc);
        if (filename == null) filename = instr.getOperand(0);
        if (data     == null) data     = instr.getOperand(1);
        systemCall.handleSystemCall(SystemCall.SYS_WRITE_FILE, proc, filename, data);
    }

   
    private boolean handleReadFile(Instruction instr, Process proc) {
        String filename = resolveArg(instr, 0, proc);
        if (filename == null) filename = instr.getOperand(0);
        String content = (String) systemCall.handleSystemCall(
                SystemCall.SYS_READ_FILE, proc, filename);

        if (content == null || content.trim().isEmpty()) {
            log("readFile: file '" + filename
                    + "' not available yet for P" + proc.getPCB().getProcessId());
            return true;   // release mutex + roll back
        }

        systemCall.handleSystemCall(SystemCall.SYS_PRINT, proc, content);
        return false;
    }

    private void handlePrintFromTo(Instruction instr, Process proc) {
        try {
            String startStr = resolveArg(instr, 0, proc);
            String endStr   = resolveArg(instr, 1, proc);
            if (startStr == null) startStr = instr.getOperand(0);
            if (endStr   == null) endStr   = instr.getOperand(1);
            int from = Integer.parseInt(startStr.trim());
            int to   = Integer.parseInt(endStr.trim());
            int lo   = Math.min(from, to);
            int hi   = Math.max(from, to);
            StringBuilder sb = new StringBuilder();
            for (int i = lo; i <= hi; i++) {
                if (sb.length() > 0) sb.append(" ");
                sb.append(i);
            }
            systemCall.handleSystemCall(SystemCall.SYS_PRINT, proc, sb.toString());
        } catch (NumberFormatException e) {
            log("printFromTo: invalid numbers - " + e.getMessage());
        }
    }

    private boolean handleSemWait(Instruction instr, Process proc) {
        String resource = instr.getResourceName();
        if (resource != null) {
            Object result = systemCall.handleSystemCall(
                    SystemCall.SYS_SEM_WAIT, proc, resource);
            if (Boolean.FALSE.equals(result)) {
                return true;
            }
        }
        return false;
    }

    private void handleSemSignal(Instruction instr, Process proc) {
        String resource = instr.getResourceName();
        if (resource != null) {
            systemCall.handleSystemCall(SystemCall.SYS_SEM_SIGNAL, proc, resource);
        }
    }

  

    private String resolveArg(Instruction instr, int index, Process proc) {
        if (index >= instr.getOperandCount()) return null;
        if (instr.isVariableOperand(index)) {
            String varName = instr.getOperand(index);
            String val = proc.getVariable(varName);
            return val != null ? val : varName;
        }
        return instr.getLiteralValue(index);
    }

    private String resolveToken(String token, Process proc) {
        String fromVar = proc.getVariable(token);
        return fromVar != null ? fromVar : token;
    }

    private void syncPCBToMemory(Process proc) {
        int start = proc.getPCB().getMemoryStart();
        if (start < 0 || start >= Memory.SIZE) return;
        memory.write(start + 1, "PCB:State=" + proc.getPCB().getState());
        memory.write(start + 2, "PCB:PC="    + proc.getPCB().getProgramCounter());
    }

    private void log(String msg) { System.out.println("[Interpreter] " + msg); }
}