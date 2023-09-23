package com.moovup.friend.api.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

@AllArgsConstructor
@NoArgsConstructor
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class FriendDetails {
    @JsonProperty("_id")
    private String id;
    private Name name;
    private String email;
    private String picture;
    private Location location;
}
