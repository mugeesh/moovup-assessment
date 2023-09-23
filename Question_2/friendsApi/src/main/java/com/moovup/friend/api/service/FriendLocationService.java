package com.moovup.friend.api.service;

import com.moovup.friend.api.model.FriendDetailsDto;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class FriendLocationService {

    private final TemplateClient templateClient;

    public FriendLocationService(TemplateClient templateClient) {
        this.templateClient = templateClient;
    }

    public List<FriendDetailsDto> getFriends() {
        return templateClient.getEndpointDetails()
                .stream().map(friend-> FriendDetailsDto.builder()
                        .id(friend.getId())
                        .email(friend.getEmail())
                        .fullName(friend.getName().getFirst()+" "+friend.getName().getLast())
                        .picture(friend.getPicture())
                        .location(friend.getLocation())
                        .build()).toList();
    }
}
