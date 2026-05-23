package DBMS;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.Arrays;

public class Table implements Serializable{

	private static final long serialVersionUID = 1L;
	String tableName;
	String[] columnNames;
	int pageCount;
	int recordCount;
	ArrayList<String> trace;
	
	public Table(String tableName, String[] columnNames) {
		super();
		this.tableName = tableName;
		this.columnNames = columnNames;
		this.pageCount = 0;
		this.recordCount = 0;
		this.trace = new ArrayList<>();
	}
	
	public void addTrace(String entry){
	    trace.add(entry);
	}
	
}