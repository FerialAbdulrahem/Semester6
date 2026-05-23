package DBMS;

import java.io.Serializable;
import java.util.ArrayList;

public class DenseIndexBlock implements Serializable {

    private ArrayList<String>  values;
    private ArrayList<Integer> pageNumbers;
    private ArrayList<Integer> recordOffsets;

    public DenseIndexBlock() {
        this.values        = new ArrayList<>();
        this.pageNumbers   = new ArrayList<>();
        this.recordOffsets = new ArrayList<>();
    }

    public boolean hasCapacity() {
        return values.size() < DBApp.indexPageSize;
    }

    public int size() {
        return values.size();
    }

    public boolean addEntry(String value, int pageNumber, int recordOffset) {
        if (!hasCapacity()) return false;
        values.add(value);
        pageNumbers.add(pageNumber);
        recordOffsets.add(recordOffset);
        return true;
    }

    public boolean containsValue(String value) {
        for (String v : values)
            if (v.equals(value)) return true;
        return false;
    }

    public ArrayList<int[]> getPointers(String value) {
        ArrayList<int[]> result = new ArrayList<>();
        for (int i = 0; i < values.size(); i++)
            if (values.get(i).equals(value))
                result.add(new int[]{pageNumbers.get(i), recordOffsets.get(i)});
        return result;
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < values.size(); i++) {
            if (i > 0) sb.append(", ");
            sb.append("(")
              .append(values.get(i))
              .append(", r").append(recordOffsets.get(i))
              .append("@p").append(pageNumbers.get(i))
              .append(")");
        }
        sb.append("]");
        return sb.toString();
    }
}