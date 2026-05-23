package DBMS;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.*; 

public class DBApp
{
	static int dataPageSize = 2;


	public static void createTable(String tableName, String[] columnsNames)
	{
		Table t = new Table(tableName, columnsNames);
		FileManager.storeTable(tableName, t);
	}

	public static void insert(String tableName, String[] record)
	{
		Table t = FileManager.loadTable(tableName);
		t.insert(record);
		FileManager.storeTable(tableName, t);
	}

	public static ArrayList<String []> select(String tableName)
	{
		Table t = FileManager.loadTable(tableName);
		ArrayList<String []> res = t.select();
		FileManager.storeTable(tableName, t);
		return res;
	}

	public static ArrayList<String []> select(String tableName, int pageNumber, int recordNumber)
	{
		Table t = FileManager.loadTable(tableName);
		ArrayList<String []> res = t.select(pageNumber, recordNumber);
		FileManager.storeTable(tableName, t);
		return res;
	}

	public static ArrayList<String []> select(String tableName, String[] cols, String[] vals)
	{
		Table t = FileManager.loadTable(tableName);
		ArrayList<String []> res = t.select(cols, vals);
		FileManager.storeTable(tableName, t);
		return res;
	}

	public static String getFullTrace(String tableName)
	{
		Table t = FileManager.loadTable(tableName);
		String res = t.getFullTrace();
		return res;
	}

	public static String getLastTrace(String tableName)
	{
		Table t = FileManager.loadTable(tableName);
		String res = t.getLastTrace();
		return res;
	}
	
	public static ArrayList<String[]> validateRecords(String tableName) {
	    Table t = FileManager.loadTable(tableName);
	    if (t == null) {
	        // Reconstruct table by scanning existing pages
	        String path = FileManager.class.getResource("FileManager.class").toString();
	        File directory = new File(path.substring(6, path.length() - 17) + File.separator
	                + "Tables" + File.separator + tableName + File.separator);
	        
	        // Find the highest page number from existing files
	        int maxPage = -1;
	        if (directory.exists()) {
	            for (File f : directory.listFiles()) {
	                String fname = f.getName();
	                if (fname.endsWith(".db") && !fname.equals(tableName + ".db")) {
	                    try {
	                        int pageNum = Integer.parseInt(fname.replace(".db", ""));
	                        if (pageNum > maxPage) maxPage = pageNum;
	                    } catch (NumberFormatException e) {}
	                }
	            }
	        }

	        // Load one existing page to get column count
	        Page samplePage = null;
	        for (int i = 0; i <= maxPage; i++) {
	            samplePage = FileManager.loadTablePage(tableName, i);
	            if (samplePage != null) break;
	        }

	        // Build dummy column names based on record length
	        int colCount = (samplePage != null && !samplePage.select().isEmpty()) 
	                       ? samplePage.select().get(0).length : 0;
	        String[] dummyCols = new String[colCount];
	        for (int i = 0; i < colCount; i++) dummyCols[i] = "col" + i;

	        t = new Table(tableName, dummyCols);

	        // Re-insert all records from existing pages into the new table object
	        for (int i = 0; i <= maxPage; i++) {
	            Page p = FileManager.loadTablePage(tableName, i);
	            if (p != null) {
	                for (String[] record : p.select()) {
	                    t.insert(record);
	                }
	            }
	        }
	        FileManager.storeTable(tableName, t);
	    }

	    ArrayList<String[]> missing = t.validateRecords();
	    FileManager.storeTable(tableName, t);
	    return missing;
	}
	
	public static void recoverRecords(String tableName,ArrayList<String[]> missing) {
		Table t = FileManager.loadTable(tableName);
        t.recoverRecords(missing);
        FileManager.storeTable(tableName, t);
	}
	
	 public static void createBitMapIndex(String tableName, String columnName){
		 Table t = FileManager.loadTable(tableName);
	     t.createBitMapIndex(columnName);
	     FileManager.storeTable(tableName, t);
	}
	
	public static String getValueBits(String tableName, String colName, String value) {
		  Table t = FileManager.loadTable(tableName);
	        return t.getValueBits(colName, value);
	}
	
	public static ArrayList<String []> selectIndex(String tableName, String[] cols, String[] vals){
		 Table t = FileManager.loadTable(tableName);
	     ArrayList<String[]> res = t.selectIndex(cols, vals);
	     FileManager.storeTable(tableName, t);
	     return res;
	}
	
	public static void main(String []args) throws IOException
    {
        FileManager.reset();
        String[] cols = {"id","name","major","semester","gpa"};
        createTable("student", cols);
        String[] r1 = {"1", "stud1", "CS", "5", "0.9"};
        insert("student", r1);

        String[] r2 = {"2", "stud2", "BI", "7", "1.2"};
        insert("student", r2);

        String[] r3 = {"3", "stud3", "CS", "2", "2.4"};
        insert("student", r3);

        String[] r4 = {"4", "stud4", "CS", "9", "1.2"};
        insert("student", r4);

        String[] r5 = {"5", "stud5", "BI", "4", "3.5"};
        insert("student", r5);

        ////////// This is the code used to delete pages from the table
        System.out.println("File Manager trace before deleting pages: "+FileManager.trace());
        String path = FileManager.class.getResource("FileManager.class").toString();
        File directory = new File(path.substring(6,path.length()-17)+File.separator+"Tables/student"+File.separator);
        File[] contents = directory.listFiles();
        int[] pageDel = {0,2};

        for(int i=0;i<pageDel.length;i++)
        {
            contents[pageDel[i]].delete();
        }
        ////////End of deleting pages code

        System.out.println("File Manager trace after deleting pages: "+FileManager.trace());
        ArrayList<String[]> tr = validateRecords("student");
        System.out.println("Missing records count: "+tr.size());

        recoverRecords("student", tr);
        System.out.println("---");
        System.out.println("Recovering the missing records.");
        tr = validateRecords("student");
        System.out.println("Missing record count: "+tr.size());
        System.out.println("File Manager trace after recovering missing records: "+FileManager.trace());

        System.out.println("---");
        System.out.println("Full trace of the table: ");
        System.out.println(getFullTrace("student"));
    }

}
