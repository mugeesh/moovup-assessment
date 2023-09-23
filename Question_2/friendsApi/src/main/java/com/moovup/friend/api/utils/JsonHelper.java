package com.moovup.friend.api.utils;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.type.TypeFactory;
import lombok.experimental.UtilityClass;
import lombok.extern.slf4j.Slf4j;

import java.lang.reflect.Type;
import java.util.List;

@Slf4j
@UtilityClass
public class JsonHelper {
    private static final ObjectMapper objectMapper = new ObjectMapper();

    public static <T> T fromJson(String jsonText, Class<T> clazz) {
        try {
            TypeFactory typeFactory = objectMapper.getTypeFactory();
            Type listType = typeFactory.constructCollectionType(List.class, clazz);
            return objectMapper.readValue(jsonText, typeFactory.constructType(listType));
        }catch (Exception e){
            log.error("error while parsing json", e);
        }
        return null;
    }
}
