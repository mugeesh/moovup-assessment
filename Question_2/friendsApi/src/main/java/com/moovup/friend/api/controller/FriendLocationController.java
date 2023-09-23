package com.moovup.friend.api.controller;

import com.moovup.friend.api.config.OpenAPIConfig;
import com.moovup.friend.api.model.FriendDetailsDto;
import com.moovup.friend.api.service.FriendLocationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Comparator;
import java.util.List;

@RestController
@Slf4j
@RequestMapping("/friend-location-api")
@Tag(name = OpenAPIConfig.FILE_TAG, description = "API for Getting Location of Friends")
public class FriendLocationController {

    private final FriendLocationService friendLocationService;

    public FriendLocationController(FriendLocationService friendLocationService) {
        this.friendLocationService = friendLocationService;
    }


    @GetMapping("/all")
    @Operation(summary = "Get all friend List", description = "Get all friend list from friend location api")
    public ResponseEntity<Object> retrieveAllFriendsMinInfo() {
        log.info("fetching all friend information api ");
        List<FriendDetailsDto> friendList = friendLocationService.getFriends()
                .stream()
                .sorted(Comparator.comparing(FriendDetailsDto::getFullName)).toList();
        return ResponseEntity.ok().body(friendList);
    }

}
