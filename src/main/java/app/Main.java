package app; /**
 * @author Vivek Pandey
 */
import static spark.Spark.*;

public class Main {
    public static void main(String[] args) {
        System.out.println("Hello World!");
        //staticFiles.location("/public");
        String projectDir = System.getProperty("user.dir");
        String staticDir = "/src/main/resources/public";
        staticFiles.externalLocation(projectDir + staticDir);
        get("/hello", (req, res) -> "Hello World");
    }
}
