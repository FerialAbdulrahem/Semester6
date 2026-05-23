package DBMS;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedHashMap;

public class Table implements Serializable
{
    private String name;
    private String[] columnsNames;
    private int pageCount;
    private int recordsCount;
    private ArrayList<String> trace;
    private ArrayList<String> indexedColumns;

    public Table(String name, String[] columnsNames)
    {
        super();
        this.name = name;
        this.columnsNames = columnsNames;
        this.trace = new ArrayList<String>();
        this.indexedColumns = new ArrayList<String>();
        this.trace.add("Table created name:" + name + ", columnsNames:"
                + Arrays.toString(columnsNames));
    }

    @Override
    public String toString()
    {
        return "Table [name=" + name + ", columnsNames="
                + Arrays.toString(columnsNames) + ", pageCount=" + pageCount
                + ", recordsCount=" + recordsCount + "]";
    }

    public void insert(String[] record)
    {
        long startTime = System.currentTimeMillis();
        Page current = FileManager.loadTablePage(this.name, pageCount - 1);
        if (current == null || !current.insert(record))
        {
            current = new Page();
            current.insert(record);
            pageCount++;
        }
        FileManager.storeTablePage(this.name, pageCount - 1, current);

        for (String col : indexedColumns)
        {
            BitmapIndex bi = FileManager.loadTableIndex(this.name, col);
            if (bi != null)
            {
                int colIdx = getColumnIndex(col);
                bi.insert(record[colIdx]);
                FileManager.storeTableIndex(this.name, col, bi);
            }
        }

        recordsCount++;
        long stopTime = System.currentTimeMillis();
        this.trace.add("Inserted:" + Arrays.toString(record) + ", at page number:" + (pageCount - 1)
                + ", execution time (mil):" + (stopTime - startTime));
    }

    public String[] fixCond(String[] cols, String[] vals)
    {
        String[] res = new String[columnsNames.length];
        for (int i = 0; i < res.length; i++)
        {
            for (int j = 0; j < cols.length; j++)
            {
                if (columnsNames[i].equals(cols[j]))
                {
                    res[i] = vals[j];
                }
            }
        }
        return res;
    }

    public ArrayList<String[]> select(String[] cols, String[] vals)
    {
        String[] cond = fixCond(cols, vals);
        String tracer = "Select condition:" + Arrays.toString(cols) + "->" + Arrays.toString(vals);
        ArrayList<ArrayList<Integer>> pagesResCount = new ArrayList<ArrayList<Integer>>();
        ArrayList<String[]> res = new ArrayList<String[]>();
        long startTime = System.currentTimeMillis();
        for (int i = 0; i < pageCount; i++)
        {
            Page p = FileManager.loadTablePage(this.name, i);
            ArrayList<String[]> pRes = p.select(cond);
            if (pRes.size() > 0)
            {
                ArrayList<Integer> pr = new ArrayList<Integer>();
                pr.add(i);
                pr.add(pRes.size());
                pagesResCount.add(pr);
                res.addAll(pRes);
            }
        }
        long stopTime = System.currentTimeMillis();
        tracer += ", Records per page:" + pagesResCount + ", records:" + res.size()
                + ", execution time (mil):" + (stopTime - startTime);
        this.trace.add(tracer);
        return res;
    }

    public ArrayList<String[]> select(int pageNumber, int recordNumber)
    {
        String tracer = "Select pointer page:" + pageNumber + ", record:" + recordNumber;
        ArrayList<String[]> res = new ArrayList<String[]>();
        long startTime = System.currentTimeMillis();
        Page p = FileManager.loadTablePage(this.name, pageNumber);
        ArrayList<String[]> pRes = p.select(recordNumber);
        if (pRes.size() > 0)
        {
            res.addAll(pRes);
        }
        long stopTime = System.currentTimeMillis();
        tracer += ", total output count:" + res.size()
                + ", execution time (mil):" + (stopTime - startTime);
        this.trace.add(tracer);
        return res;
    }

    public ArrayList<String[]> select()
    {
        ArrayList<String[]> res = new ArrayList<String[]>();
        long startTime = System.currentTimeMillis();
        for (int i = 0; i < pageCount; i++)
        {
            Page p = FileManager.loadTablePage(this.name, i);
            if (p != null)
                res.addAll(p.select());
        }
        long stopTime = System.currentTimeMillis();
        this.trace.add("Select all pages:" + pageCount + ", records:" + recordsCount
                + ", execution time (mil):" + (stopTime - startTime));
        return res;
    }   
    
    public String getFullTrace()
    {
        String res = "";
        for (int i = 0; i < this.trace.size(); i++)
        {
            res += this.trace.get(i) + "\n";
        }
        return res + "Pages Count: " + pageCount + ", Records Count: " + recordsCount
                + ", Indexed Columns: " + indexedColumns.toString();
    }

    public String getLastTrace()
    {
        return this.trace.get(this.trace.size() - 1);
    } 
    

public ArrayList<String[]> validateRecords() {
    long startTime = System.currentTimeMillis();
    ArrayList<String[]> missing = new ArrayList<>();
    int missingCount = 0;
 
    for (int i = 0; i < pageCount; i++) {
        Page p = FileManager.loadTablePage(this.name, i);
        if (p == null) {
            // Correctly count records for last page (may be partial)
            boolean isLastPage = (i == pageCount - 1);
            int remainder = recordsCount % DBApp.dataPageSize;
            int recordsOnPage = (isLastPage && remainder != 0) ? remainder : DBApp.dataPageSize;
 
            missingCount += recordsOnPage;
            for (int j = 0; j < recordsOnPage; j++)
                missing.add(null);
        }
    }
 
    long stopTime = System.currentTimeMillis();
    // KEY FIX: colon after "records", not comma
    this.trace.add("Validating records: " + missingCount + " records missing."
            + ", execution time (mil):" + (stopTime - startTime));
    return missing;
}
 
    
public void recoverRecords(ArrayList<String[]> missingRecords) {
    long startTime = System.currentTimeMillis();
    ArrayList<Integer> recoveredPages = new ArrayList<>();
    int recoveredCount = 0;
 
   
    ArrayList<String[]> realRecords = new ArrayList<>();
    for (String[] r : missingRecords)
        if (r != null) realRecords.add(r);
 
    int missingIdx = 0;
    for (int i = 0; i < pageCount && missingIdx < realRecords.size(); i++) {
        Page p = FileManager.loadTablePage(this.name, i);
        if (p == null) {
            Page newPage = new Page();
            recoveredPages.add(i);
            for (int j = 0; j < DBApp.dataPageSize && missingIdx < realRecords.size(); j++, missingIdx++) {
                newPage.insert(realRecords.get(missingIdx));
                recoveredCount++;
            }
            FileManager.storeTablePage(this.name, i, newPage);
        }
    }
 
    long stopTime = System.currentTimeMillis();
    // KEY FIX: use recoveredCount (not missingRecords.size() which includes nulls)
    this.trace.add("Recovering " + recoveredCount + " records"
            + " in pages: " + recoveredPages
            + ", execution time (mil):" + (stopTime - startTime));
}
   
    public void createBitMapIndex(String columnName){
        long startTime = System.currentTimeMillis();
        BitmapIndex bi = new BitmapIndex();
        int colIdx = getColumnIndex(columnName);
        for (int i = 0; i < pageCount; i++){
            Page p = FileManager.loadTablePage(this.name, i);
            if (p != null) {
                for (String[] record : p.select()){
                    bi.insert(record[colIdx]);
                }
            }
        }
        FileManager.storeTableIndex(this.name, columnName, bi);
        if (!indexedColumns.contains(columnName))
            indexedColumns.add(columnName);
        long stopTime = System.currentTimeMillis();
        this.trace.add("Index created for column: " + columnName + ", execution time (mil):" + (stopTime - startTime));
    } 
    
    public String getValueBits(String columnName, String value){
        BitmapIndex bi = FileManager.loadTableIndex(this.name, columnName);
        if (bi == null)
            return null;
        return bi.getBits(value);
    }

    public ArrayList<String[]> selectIndex(String[] cols, String[] vals){
        long startTime = System.currentTimeMillis();

        ArrayList<String> indexed = new ArrayList<>();
        ArrayList<String> nonIndexed = new ArrayList<>();
        for (String col : cols){
            if (indexedColumns.contains(col))
                indexed.add(col);
            else
                nonIndexed.add(col);
        }
        java.util.Collections.sort(indexed);
        java.util.Collections.sort(nonIndexed);

        ArrayList<String[]> res = new ArrayList<>();

        if (indexed.isEmpty()){
            res = select(cols, vals);
            this.trace.remove(this.trace.size() - 1); 
            long stopTime = System.currentTimeMillis();
            String tracer = "Select index condition:" + Arrays.toString(cols) + "->" + Arrays.toString(vals)
                    + ", Indexed selection count: 0"
                    + ", Non Indexed: " + Arrays.toString(nonIndexed.toArray())
                    + ", Final count: " + res.size()
                    + ", execution time (mil):" + (stopTime - startTime);
            this.trace.add(tracer);
        }
        else{
     
            String andBits = null;
            for (int ci = 0; ci < cols.length; ci++){
                if (indexed.contains(cols[ci])){
                    BitmapIndex bi = FileManager.loadTableIndex(this.name, cols[ci]);
                    String bits = bi.getBits(vals[ci]);
                    andBits = (andBits == null) ? bits : BitmapIndex.andBits(andBits, bits);
                }
            }

            ArrayList<Integer> candidateIndices = new ArrayList<>();
            for (int i = 0; i < andBits.length(); i++)
                if (andBits.charAt(i) == '1')
                    candidateIndices.add(i);

            int indexedSelectionCount = candidateIndices.size();

          
            String[] nonIndexedCols = nonIndexed.toArray(new String[0]);
            String[] nonIndexedVals = new String[nonIndexed.size()];
            for (int k = 0; k < nonIndexed.size(); k++)
                for (int ci = 0; ci < cols.length; ci++)
                    if (cols[ci].equals(nonIndexed.get(k)))
                    { nonIndexedVals[k] = vals[ci]; break; }

          
            for (int recordIdx : candidateIndices) {
                int pageNum = recordIdx / DBApp.dataPageSize;
                int recNum = recordIdx % DBApp.dataPageSize;
                Page p = FileManager.loadTablePage(this.name, pageNum);
                if (p != null && recNum < p.size()) {
                    String[] record = p.select(recNum).get(0);
                    boolean match = true;
                    for (int k = 0; k < nonIndexedCols.length; k++) {
                        int colIdx = getColumnIndex(nonIndexedCols[k]);
                        if (!record[colIdx].equals(nonIndexedVals[k]))
                        { match = false; break; }
                    }
                    if (match)
                        res.add(record);
                }
            }

            long stopTime = System.currentTimeMillis();
            StringBuilder tracer = new StringBuilder("Select index condition:");
            tracer.append(Arrays.toString(cols)).append("->").append(Arrays.toString(vals));
            tracer.append(", Indexed columns: ").append(indexed.toString());
            tracer.append(", Indexed selection count: ").append(indexedSelectionCount);
            if (!nonIndexed.isEmpty())
                tracer.append(", Non Indexed: ").append(Arrays.toString(nonIndexedCols));
            tracer.append(", Final count: ").append(res.size());
            tracer.append(", execution time (mil):").append(stopTime - startTime);
            this.trace.add(tracer.toString());
        }

        return res;
    }
    
    private int getColumnIndex(String colName)
    {
        for (int i = 0; i < columnsNames.length; i++)
        {
            if (columnsNames[i].equals(colName))
                return i;
        }
        return -1;
    }

}