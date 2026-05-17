package os.syscalls;

import java.io.*;
import java.nio.file.*;

public class FileHandler {
    
   
    public static void writeFile(String filename, String data) throws IOException {
       
        Path diskDir = Paths.get("disk/");
        if (!Files.exists(diskDir)) {
            Files.createDirectories(diskDir);
        }
        
      
        try (BufferedWriter writer = new BufferedWriter(new FileWriter("disk/" + filename))) {
            writer.write(data);
        }
        System.out.println("📁 Written to file: disk/" + filename);
    }
    
   
    public static String readFile(String filename) throws IOException {
        StringBuilder content = new StringBuilder();
        Path filePath = Paths.get("disk/" + filename);
        
        
        if (!Files.exists(filePath)) {
            throw new FileNotFoundException("File not found: " + filename);
        }
        
        try (BufferedReader reader = new BufferedReader(new FileReader("disk/" + filename))) {
            String line;
            while ((line = reader.readLine()) != null) {
                content.append(line).append("\n");
            }
        }
        return content.toString();
    }
    
    
    public static boolean fileExists(String filename) {
        Path filePath = Paths.get("disk/" + filename);
        return Files.exists(filePath);
    }
    
  
    public static boolean deleteFile(String filename) throws IOException {
        Path filePath = Paths.get("disk/" + filename);
        if (Files.exists(filePath)) {
            Files.delete(filePath);
            System.out.println("🗑️ Deleted file: disk/" + filename);
            return true;
        }
        return false;
    }
    
    
    public static String[] listFiles() {
        Path diskDir = Paths.get("disk/");
        if (Files.exists(diskDir)) {
            try {
                return Files.list(diskDir)
                    .map(path -> path.getFileName().toString())
                    .toArray(String[]::new);
            } catch (IOException e) {
                return new String[0];
            }
        }
        return new String[0];
    }
}