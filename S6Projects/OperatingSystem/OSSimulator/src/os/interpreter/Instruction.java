package os.interpreter;

import java.util.Arrays;
import java.util.List;

public class Instruction {
    
    public enum InstructionType {
        PRINT,         
        ASSIGN,        
        WRITE_FILE,     
        READ_FILE,     
        PRINT_FROM_TO,  
        SEM_WAIT,    
        SEM_SIGNAL,    
        UNKNOWN
    }
    
    private InstructionType type;
    private String originalLine;
    private List<String> tokens;
    private String[] operands;
    private boolean[] isVariable;
    private String[] literalValues;
    
    public Instruction(String line) {
        this.originalLine = line;
        this.tokens = Arrays.asList(line.trim().split("\\s+"));
        parse();
    }
    
    private void parse() {
        if (tokens.isEmpty()) {
            type = InstructionType.UNKNOWN;
            operands = new String[0];
            return;
        }
        
        String command = tokens.get(0).toLowerCase();
        
        switch (command) {
            case "print":
                type = InstructionType.PRINT;
                operands = new String[]{getOperandAtIndex(1)};
                break;
                
            case "assign":
                type = InstructionType.ASSIGN;
                operands = new String[]{getOperandAtIndex(1), getOperandAtIndex(2)};
                break;
                
            case "writefile":
                type = InstructionType.WRITE_FILE;
                operands = new String[]{getOperandAtIndex(1), getOperandAtIndex(2)};
                break;
                
            case "readfile":
                type = InstructionType.READ_FILE;
                operands = new String[]{getOperandAtIndex(1)};
                break;
                
            case "printfromto":
                type = InstructionType.PRINT_FROM_TO;
                operands = new String[]{getOperandAtIndex(1), getOperandAtIndex(2)};
                break;
                
            case "semwait":
                type = InstructionType.SEM_WAIT;
                operands = new String[]{getOperandAtIndex(1)};
                break;
                
            case "semsignal":
                type = InstructionType.SEM_SIGNAL;
                operands = new String[]{getOperandAtIndex(1)};
                break;
                
            default:
                type = InstructionType.UNKNOWN;
                operands = new String[0];
        }
        
      
        if (operands != null && operands.length > 0) {
            isVariable = new boolean[operands.length];
            literalValues = new String[operands.length];
            
            for (int i = 0; i < operands.length; i++) {
                analyzeOperand(i);
            }
        }
    }
    
    private String getOperandAtIndex(int index) {
        if (index < tokens.size()) {
            return tokens.get(index);
        }
        return null;
    }
    
    private void analyzeOperand(int operandIndex) {
        String operand = operands[operandIndex];
        if (operand == null) {
            isVariable[operandIndex] = false;
            literalValues[operandIndex] = null;
            return;
        }
        
        
        if (operand.matches("[a-zA-Z_][a-zA-Z0-9_]*")) {
            isVariable[operandIndex] = true;
            literalValues[operandIndex] = null;
        } 
        
        else if (operand.startsWith("\"") && operand.endsWith("\"")) {
            isVariable[operandIndex] = false;
            literalValues[operandIndex] = operand.substring(1, operand.length() - 1);
        }
        
        else if (operand.matches("-?\\d+")) {
            isVariable[operandIndex] = false;
            literalValues[operandIndex] = operand;
        }
     
        else if (operand.equalsIgnoreCase("input")) {
            isVariable[operandIndex] = false;
            literalValues[operandIndex] = "input";
        }
       
        else {
            isVariable[operandIndex] = false;
            literalValues[operandIndex] = operand;
        }
    }
    
 
    
    public InstructionType getType() { 
        return type; 
    }
    
    public String getOriginalLine() { 
        return originalLine; 
    }
    
    public List<String> getTokens() { 
        return tokens; 
    }
    
    public String[] getOperands() { 
        return operands; 
    }
    
    public int getOperandCount() { 
        return operands != null ? operands.length : 0; 
    }
    
    public String getOperand(int index) {
        if (operands != null && index < operands.length) {
            return operands[index];
        }
        return null;
    }
    
    public boolean isVariableOperand(int index) {
        if (isVariable != null && index < isVariable.length) {
            return isVariable[index];
        }
        return false;
    }
    
    public String getLiteralValue(int index) {
        if (literalValues != null && index < literalValues.length) {
            return literalValues[index];
        }
        return null;
    }
    
    public String resolveOperand(int operandIndex, java.util.function.Function<String, String> variableResolver) {
        if (operandIndex >= getOperandCount()) {
            return null;
        }
        
        if (isVariableOperand(operandIndex)) {
            String varName = getOperand(operandIndex);
            String value = variableResolver.apply(varName);
            return value != null ? value : varName;
        } else {
            return getLiteralValue(operandIndex);
        }
    }
    
    public int resolveIntOperand(int operandIndex, java.util.function.Function<String, String> variableResolver) 
            throws NumberFormatException {
        String value = resolveOperand(operandIndex, variableResolver);
        if (value == null) {
            throw new NumberFormatException("Operand is null");
        }
        return Integer.parseInt(value);
    }
    
    
    
    public boolean isPrint() { 
        return type == InstructionType.PRINT; 
    }
    
    public boolean isAssign() { 
        return type == InstructionType.ASSIGN; 
    }
    
    public boolean isWriteFile() { 
        return type == InstructionType.WRITE_FILE; 
    }
    
    public boolean isReadFile() { 
        return type == InstructionType.READ_FILE; 
    }
    
    public boolean isPrintFromTo() { 
        return type == InstructionType.PRINT_FROM_TO; 
    }
    
    public boolean isSemWait() { 
        return type == InstructionType.SEM_WAIT; 
    }
    
    public boolean isSemSignal() { 
        return type == InstructionType.SEM_SIGNAL; 
    }
    
    public String getAssignVariable() {
        if (isAssign() && operands != null && operands.length >= 1) {
            return operands[0];
        }
        return null;
    }
    
    public String getAssignValue() {
        if (isAssign() && operands != null && operands.length >= 2) {
            return operands[1];
        }
        return null;
    }
    
    public String getPrintFromStart() {
        if (isPrintFromTo() && operands != null && operands.length >= 1) {
            return operands[0];
        }
        return null;
    }
    
    public String getPrintFromEnd() {
        if (isPrintFromTo() && operands != null && operands.length >= 2) {
            return operands[1];
        }
        return null;
    }
    
    public String getFilename() {
        if ((isReadFile() || isWriteFile()) && operands != null && operands.length >= 1) {
            return operands[0];
        }
        return null;
    }
    
    public String getFileData() {
        if (isWriteFile() && operands != null && operands.length >= 2) {
            return operands[1];
        }
        return null;
    }
    
    public String getResourceName() {
        if ((isSemWait() || isSemSignal()) && operands != null && operands.length >= 1) {
            return operands[0];
        }
        return null;
    }
    
    @Override
    public String toString() {
        return String.format("Instruction[type=%s, operands=%s]", type, 
               operands != null ? Arrays.toString(operands) : "[]");
    }
}