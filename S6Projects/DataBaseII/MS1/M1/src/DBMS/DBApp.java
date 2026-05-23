package DBMS;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.Collections;

import org.junit.Test;

public class DBApp {
	
	static int dataPageSize = 2;

	public static void createTable(String tableName, String[] columnsNames) {

		Table t = new Table(tableName, columnsNames);

		t.addTrace("Table created name:" + tableName + ", columnsNames:" + Arrays.toString(columnsNames));

		FileManager.storeTable(tableName, t);
	}

	public static void insert(String tableName, String[] record) {

		long startTime = System.currentTimeMillis();

		Table t = FileManager.loadTable(tableName);

		if (t == null)
			return;

		Page p;
		int pageNum = t.pageCount - 1;

		if (pageNum < 0 || FileManager.loadTablePage(tableName, pageNum).records.size() >= dataPageSize) {
			pageNum = t.pageCount;
			p = new Page();
			t.pageCount=(t.pageCount + 1);
		} 
		
		else {
			p = FileManager.loadTablePage(tableName, pageNum);
		}

		p.records.add(record);
		
		FileManager.storeTablePage(tableName, pageNum, p);
		
		t.recordCount=(t.recordCount + 1);
		
		long endTime = System.currentTimeMillis();

		t.addTrace("Inserted:" + Arrays.toString(record) + 
				   ", at page number:" + pageNum + 
				   ", execution time (mil):"
				   + (endTime - startTime));

		FileManager.storeTable(tableName, t);
	}

	public static ArrayList<String[]> select(String tableName) {

		long startTime = System.currentTimeMillis();

		ArrayList<String[]> res = new ArrayList<>();

		Table t = FileManager.loadTable(tableName);

		if (t == null)
			return res;

		for (int i = 0; i < t.pageCount; i++) {

			Page p = FileManager.loadTablePage(tableName, i);

			if (p == null) {
				continue;
			}

			for (String[] record : p.records) {
				res.add(record);
			}
		}

		long endTime = System.currentTimeMillis();

		t.addTrace("Select all pages:" + t.pageCount + ", records:" + res.size() + ", execution time (mil):"
				+ (endTime - startTime));

		FileManager.storeTable(tableName, t);

		return res;
	}

	public static ArrayList<String[]> select(String tableName, int pageNumber, int recordNumber) {

		long startTime = System.currentTimeMillis();

		ArrayList<String[]> res = new ArrayList<>();

		Table t = FileManager.loadTable(tableName);

		if (t == null)
			return res;

		if (pageNumber >= 0 && pageNumber < t.pageCount) {

			Page p = FileManager.loadTablePage(tableName, pageNumber);

			if (p != null && recordNumber >= 0 && recordNumber < p.records.size()) {
				res.add(p.records.get(recordNumber));
			}
		}

		long endTime = System.currentTimeMillis();

		t.addTrace("Select pointer page:" + pageNumber + ", record:" + recordNumber + ", total output count:"
				+ res.size() + ", execution time (mil):" + (endTime - startTime));

		FileManager.storeTable(tableName, t);

		return res;
	}

	private static boolean conditionHelper(Table t, String[] record, String[] columnNames, String[] values) {
	    
	    String[] columns = t.columnNames;
	    
	    for (int i = 0; i < columnNames.length; i++) {
	        
	        int colIndex = -1;
	        for (int j = 0; j < columns.length; j++) {
	            if (columns[j].equals(columnNames[i])) {
	                colIndex = j;
	                break;
	            }
	        }

	        if (colIndex == -1) return false;
	        
	        if (!record[colIndex].equals(values[i])) return false;
	    }

	    return true;
	}

    public static ArrayList<String[]> select(String tableName, String[] cols, String[] vals) {

        long startTime = System.currentTimeMillis();

        ArrayList<String[]> res = new ArrayList<>();
        ArrayList<String> perPage = new ArrayList<>();

        Table t = FileManager.loadTable(tableName);
        
        if (t == null) return res;

        for (int i = 0; i < t.pageCount; i++) {
        	
            Page p = FileManager.loadTablePage(tableName, i);
            
            if (p == null) continue;

            int countInPage = 0;

            for (String[] record : p.records) {
            	
                if (conditionHelper(t, record, cols, vals)) {
                    res.add(record);
                    countInPage++;
                }
            }

            if (countInPage > 0) {
                perPage.add("[" + i + ", " + countInPage + "]");
            }
        }

        long endTime = System.currentTimeMillis();
        
        t.addTrace("Select condition:" + Arrays.toString(cols) + 
        	 	   "->" + Arrays.toString(vals)+
                   ", Records per page:" + perPage.toString()+
                   ", records:" + res.size()+
                   ", execution time (mil):" + (endTime - startTime));
        
        FileManager.storeTable(tableName, t);

        return res;
    }
	
	public static String getFullTrace(String tableName) {

		Table t = FileManager.loadTable(tableName);

		if (t == null)
			return "";

		String res = "";

		for (String s : t.trace) {
			res += s + "\n";
		}

		res += "Pages Count: " + t.pageCount + ", Records Count: " + t.recordCount;

		return res;
	}

	public static String getLastTrace(String tableName) {

		Table t = FileManager.loadTable(tableName);

		if (t == null || t.trace.isEmpty())
			return "";

		return t.trace.get(t.trace.size() - 1);
	}

	public static void main(String[] args) throws IOException {
		String[] cols = {"id","name","major","semester","gpa"};
		createTable("student", cols);
		String[] r1 = {"1", "stud1", "CS", "5", "0.9"};
		insert("student", r1);
		String[] r2 = {"2", "stud2", "BI", "7", "1.2"};
		insert("student", r2);
		String[] r3 = {"3", "stud3", "CS", "2", "2.4"};
		insert("student", r3);
		String[] r4 = {"4", "stud4", "DMET", "9", "1.2"};
		insert("student", r4);
		String[] r5 = {"5", "stud5", "BI", "4", "3.5"};
		insert("student", r5);
		System.out.println("Output of selecting the whole table content:");
		ArrayList<String[]> result1 = select("student");
		for (String[] array : result1) {
		for (String str : array) {
		System.out.print(str + " ");
		}
		System.out.println();
		}
		System.out.println(" ");
		System.out.println("Output of selecting the output by position:");
		ArrayList<String[]> result2 = select("student", 1, 1);
		for (String[] array : result2) {
		for (String str : array) {
		System.out.print(str + " ");
		}
		System.out.println();
		}
		System.out.println(" ");
		System.out.println("Output of selecting the output by column condition:");
		ArrayList<String[]> result3 = select("student", new String[]{"gpa"}, new
		String[]{"1.2"});
		
		for (String[] array : result3) {
			for (String str : array) {
			System.out.print(str + " ");
			}
			System.out.println();
			}
			System.out.println(" ");
			System.out.println("Full Trace of the table:");
			System.out.println(getFullTrace("student"));
			System.out.println(" ");
			System.out.println("Last Trace of the table:");
			System.out.println(getLastTrace("student"));
			System.out.println(" ");
			System.out.println("The trace of the Tables Folder:");
			System.out.println(FileManager.trace());
			//FileManager.reset();
			System.out.println(" ");
			System.out.println("The trace of the Tables Folder after resetting:");
			System.out.println(FileManager.trace());
		
	}
	
}