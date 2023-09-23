package com.moovup.friend.api.model;

import lombok.Builder;
import lombok.Getter;

@Builder
@Getter
public class FriendDetailsDto {
    private String id;
    private String fullName;
    private String email;
    private String picture;
    private Location location;
}
