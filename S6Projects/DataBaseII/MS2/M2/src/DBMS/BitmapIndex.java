package DBMS;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.LinkedHashMap;

public class BitmapIndex implements Serializable{
    private LinkedHashMap<String, StringBuilder> index;
    private int recordCount;

    public BitmapIndex(){
        index = new LinkedHashMap<>();
        recordCount = 0;
    }

   
    public void insert(String value){
        for (String key : index.keySet()){
            index.get(key).append('0');
        }
        if (!index.containsKey(value)){
            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < recordCount; i++)
                sb.append('0');
            sb.append('1');
            index.put(value, sb);
        }
        else{
            StringBuilder sb = index.get(value);
            sb.setCharAt(sb.length() - 1, '1');
        }
        recordCount++;
    }

    public String getBits(String value)
    {
        if (index.containsKey(value))
            return index.get(value).toString();
        
        StringBuilder sb = new StringBuilder();
        
        for (int i = 0; i < recordCount; i++)
            sb.append('0');
        
        return sb.toString();
    }

    public ArrayList<Integer> getMatchingIndices(String value){
        String bits = getBits(value);
        ArrayList<Integer> result = new ArrayList<>();
        for (int i = 0; i < bits.length(); i++){
            if (bits.charAt(i) == '1')
                result.add(i);
        }
        return result;
    }

    public static String andBits(String a, String b){
        StringBuilder result = new StringBuilder();
        int len = Math.min(a.length(), b.length());
        for (int i = 0; i < len; i++)
            result.append((a.charAt(i) == '1' && b.charAt(i) == '1') ? '1' : '0');
        return result.toString();
    }

    public int getRecordCount(){
        return recordCount;
    }
}
