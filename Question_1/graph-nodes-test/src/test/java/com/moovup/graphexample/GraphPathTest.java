package com.moovup.graphexample;

import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class GraphPathTest {

    private GraphPath graphPath;

    final String start = "A";
    final String end = "H";

    @Before
    public void initGraph() {
        Map<String, List<String>> routes = new HashMap<>();
        routes.put("A", List.of("B", "D", "H"));
        routes.put("B", List.of("A", "C", "D"));
        routes.put("C", List.of("B", "D", "F"));
        routes.put("D", List.of("A", "B", "C", "E"));
        routes.put("E", List.of("D", "F", "H"));
        routes.put("F", List.of("C", "E", "G"));
        routes.put("G", List.of("F", "H"));
        routes.put("H", List.of("A", "E", "G"));

        graphPath = new GraphPath(routes);
    }

    @Test
    public void testFindAllPaths() {
        List<List<String>> allPath = graphPath.findAllPaths(start, end);

        System.out.println("Possible path:::");
        allPath.stream().forEach(System.out::println);
        System.out.println("end path:::");

        Assert.assertEquals(15, allPath.size());
    }

    @Test
    public void testFindShortestPath() {
        List<String> findShortestPath = graphPath.findShortestPath(start, end);
        System.out.println("shortest Path:::" + findShortestPath);

        List<String> expected = List.of("A", "H").stream().toList();
        Assert.assertTrue(compareList(expected, findShortestPath));
    }

    public static boolean compareList(List ls1, List ls2) {
        return ls1.containsAll(ls2) && ls1.size() == ls2.size() ? true : false;
    }
}