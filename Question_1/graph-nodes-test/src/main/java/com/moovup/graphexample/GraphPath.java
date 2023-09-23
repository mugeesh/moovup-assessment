package com.moovup.graphexample;

import java.util.*;
import java.util.stream.Collectors;

public class GraphPath {
    private Map<String, List<String>> routes;

    public GraphPath(Map<String, List<String>> routes) {
        this.routes = routes;
    }

    public List<List<String>> findAllPaths(String start, String end) {
        List<List<String>> paths = new ArrayList<>();
        Deque<List<String>> stack = new ArrayDeque<>();
        stack.push(Arrays.asList(start));

        while (!stack.isEmpty()) {
            List<String> path = stack.pop();
            String lastNode = path.get(path.size() - 1);

            if (lastNode.equals(end)) {
                paths.add(new ArrayList<>(path));
            } else {
                for (String neighbor : routes.get(lastNode)) {
                    if (!path.contains(neighbor)) {
                        List<String> newPath = new ArrayList<>(path);
                        newPath.add(neighbor);
                        stack.push(newPath);
                    }
                }
            }
        }

        return paths;
    }

    public List<String> findShortestPath(String start, String end) {
        Map<String, String> previousNode = new HashMap<>();
        Map<String, Integer> distances = new HashMap<>();
        PriorityQueue<String> queue = new PriorityQueue<>(Comparator.comparing(distances::get));

        for (String vertex : routes.keySet()) {
            distances.put(vertex, vertex.equals(start) ? 0 : Integer.MAX_VALUE);
        }

        queue.add(start);
        while (!queue.isEmpty()) {
            String currentNode = queue.poll();

            for (String neighbor : routes.get(currentNode)) {
                int alternateDist = distances.get(currentNode) + 1;
                if (alternateDist < distances.get(neighbor)) {
                    distances.put(neighbor, alternateDist);
                    previousNode.put(neighbor, currentNode);
                    queue.add(neighbor);
                }
            }
        }

        List<String> shortestPath = new ArrayList<>();
        String node = end;
        while (node != null) {
            shortestPath.add(node);
            node = previousNode.get(node);
        }
        return shortestPath.stream().sorted().toList();
    }
}