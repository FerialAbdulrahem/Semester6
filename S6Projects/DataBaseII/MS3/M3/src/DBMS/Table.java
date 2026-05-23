package DBMS;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.Arrays;

public class Table implements Serializable
{
	private String name;
	private String[] columnsNames;
	private int pageCount;
	private int recordsCount;
	private ArrayList<String> trace;
	private ArrayList<String>  indexedColumns;
	private ArrayList<Integer> indexBlockCounts;
	
	public Table(String name, String[] columnsNames) 
	{
		super();
		this.name = name;
		this.columnsNames = columnsNames;
		this.trace = new ArrayList<String>();
		this.trace.add("Table created name:" + name + ", columnsNames:"
				+ Arrays.toString(columnsNames));
		this.indexedColumns   = new ArrayList<String>();
        this.indexBlockCounts = new ArrayList<Integer>();
	}

	@Override
	public String toString() 
	{
		return "Table [name=" + name + ", columnsNames="
				+ Arrays.toString(columnsNames) + ", pageCount=" + pageCount
				+ ", recordsCount=" + recordsCount + "]";
	}
	
	public void insert(String []record)
	{
		long startTime = System.currentTimeMillis();
		Page current = FileManager.loadTablePage(this.name, pageCount-1);
		if(current==null||!current.insert(record))
		{
			current = new Page();
			current.insert(record);
			pageCount++;
		}
		FileManager.storeTablePage(this.name, pageCount-1, current);
		recordsCount++;
		long stopTime = System.currentTimeMillis();
		this.trace.add("Inserted:"+ Arrays.toString(record)+", at page number:"+(pageCount-1)
				+", execution time (mil):"+(stopTime - startTime));
	}
	
	public String[] fixCond(String[] cols, String[] vals)
	{
		String[] res = new String[columnsNames.length];
		for(int i=0;i<res.length;i++)
		{
			for(int j=0;j<cols.length;j++)
			{
				if(columnsNames[i].equals(cols[j]))
				{
					res[i]=vals[j];
				}
			}
		}
		return res;
	}
	
	public ArrayList<String []> select(String[] cols, String[] vals)
	{
		String[] cond = fixCond(cols, vals);
		String tracer ="Select condition:"+Arrays.toString(cols)+"->"+Arrays.toString(vals);
		ArrayList<ArrayList<Integer>> pagesResCount = new ArrayList<ArrayList<Integer>>();
		ArrayList<String []> res = new ArrayList<String []>();
		long startTime = System.currentTimeMillis();
		for(int i=0;i<pageCount;i++)
		{
			Page p = FileManager.loadTablePage(this.name, i);
			ArrayList<String []> pRes = p.select(cond);
			if(pRes.size()>0)
			{
				ArrayList<Integer> pr = new ArrayList<Integer>();
				pr.add(i);
				pr.add(pRes.size());
				pagesResCount.add(pr);
				res.addAll(pRes);
			}
		}
		long stopTime = System.currentTimeMillis();
		tracer +=", Records per page:" + pagesResCount+", records:"+res.size()
				+", execution time (mil):"+(stopTime - startTime);
		this.trace.add(tracer);
		return res;
	}
	
	public ArrayList<String []> select(int pageNumber, int recordNumber)
	{
		String tracer ="Select pointer page:"+pageNumber+", record:"+recordNumber;
		ArrayList<String []> res = new ArrayList<String []>();
		long startTime = System.currentTimeMillis();
		Page p = FileManager.loadTablePage(this.name, pageNumber);
		ArrayList<String []> pRes = p.select(recordNumber);
		if(pRes.size()>0)
		{
			res.addAll(pRes);
		}
		long stopTime = System.currentTimeMillis();
		tracer+=", total output count:"+res.size()
				+", execution time (mil):"+(stopTime - startTime);
		this.trace.add(tracer);
		return res;
	}
	
	public ArrayList<String []> select()
	{
		ArrayList<String []> res = new ArrayList<String []>();
		long startTime = System.currentTimeMillis();
		for(int i=0;i<pageCount;i++)
		{
			Page p = FileManager.loadTablePage(this.name, i);
			res.addAll(p.select());
		}
		long stopTime = System.currentTimeMillis();
		this.trace.add("Select all pages:" + pageCount+", records:"+recordsCount
				+", execution time (mil):"+(stopTime - startTime));
		return res;
	}
	
	public void createDenseIndex(String colName){
	    long startTime = System.currentTimeMillis();

	    int colIdx = -1;
	    for (int i = 0; i < columnsNames.length; i++)
	        if (columnsNames[i].equals(colName)) { colIdx = i; break; }
	    if (colIdx == -1) {
	        this.trace.add("createDenseIndex failed: column '" + colName + "' not found.");
	        return;
	    }

	
	    ArrayList<String[]> entries = new ArrayList<String[]>();
	    for (int p = 0; p < pageCount; p++) {
	        Page page = FileManager.loadTablePage(this.name, p);
	        ArrayList<String[]> recs = page.select();
	        for (int r = 0; r < recs.size(); r++) {
	            entries.add(new String[]{recs.get(r)[colIdx], String.valueOf(p), String.valueOf(r)});
	        }
	    }

	
	    entries.sort((a, b) -> a[0].compareTo(b[0]));


	    int blockNumber = 0;
	    DenseIndexBlock block = new DenseIndexBlock();
	    for (String[] e : entries) {
	        if (!block.hasCapacity()) {
	            FileManager.storeIndexBlock(this.name, colName, blockNumber++, block);
	            block = new DenseIndexBlock();
	        }
	        block.addEntry(e[0], Integer.parseInt(e[1]), Integer.parseInt(e[2]));
	    }
	    if (block.size() > 0)
	        FileManager.storeIndexBlock(this.name, colName, blockNumber++, block);

	    if (!indexedColumns.contains(colName)) {
	        indexedColumns.add(colName);
	        indexBlockCounts.add(blockNumber);
	    } else {
	        indexBlockCounts.set(indexedColumns.indexOf(colName), blockNumber);
	    }

	    long stopTime = System.currentTimeMillis();
	    this.trace.add("Dense Index created on column:'" + colName
	            + "', total entries:" + entries.size()
	            + ", blocks written:" + blockNumber
	            + ", execution time (mil):" + (stopTime - startTime));
	}
 
	public String getIndexRepresentation(String colName){
	    int pos = indexedColumns.indexOf(colName);
	    if (pos == -1)
	        return "No index found for column: " + colName;

	    int numBlocks = indexBlockCounts.get(pos);
	    StringBuilder sb = new StringBuilder("[");
	    for (int b = 0; b < numBlocks; b++) {
	        if (b > 0) sb.append(", ");
	        DenseIndexBlock blk = FileManager.loadIndexBlock(this.name, colName, b);
	        sb.append(blk == null ? "[]" : blk.toString());
	    }
	    sb.append("]");
	    return sb.toString();
	} 
	
	public String getFullTrace() 
	{
		String res = "";
		for(int i=0;i<this.trace.size();i++)
		{
			res+=this.trace.get(i)+"\n";
		}
		return res+ "Pages Count: " + pageCount + ", Records Count: " + recordsCount;
	}
	
	public String getLastTrace() 
	{
		return this.trace.get(this.trace.size()-1);
	}

}
