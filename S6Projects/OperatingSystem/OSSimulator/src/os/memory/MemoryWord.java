package os.memory;

import java.io.Serializable;

public class MemoryWord implements Serializable {
    private static final long serialVersionUID = 1L;
    private String value;
    private boolean allocated;
    
    public MemoryWord() {
        this.value = null;
        this.allocated = false;
    }
    
    public String getValue() { 
        return value; 
    }
    
    public void setValue(String value) { 
        this.value = value; 
    }
    
    public boolean isAllocated() { 
        return allocated; 
    }
    
    public void setAllocated(boolean allocated) { 
        this.allocated = allocated; 
    }
}