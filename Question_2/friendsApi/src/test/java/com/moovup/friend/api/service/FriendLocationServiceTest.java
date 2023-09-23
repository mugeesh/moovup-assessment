package com.moovup.friend.api.service;

import com.moovup.friend.api.model.FriendDetails;
import com.moovup.friend.api.model.FriendDetailsDto;
import com.moovup.friend.api.model.Location;
import com.moovup.friend.api.model.Name;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;

import java.util.Arrays;
import java.util.List;

import static org.mockito.Mockito.when;

@SpringBootTest
class FriendLocationServiceTest {

    @Autowired
    private FriendLocationService friendLocationService;
    @MockBean
    private TemplateClient templateClient;

    @BeforeEach
    void init() {
        FriendDetails friendDetails = new FriendDetails();
        friendDetails.setId("123");
        friendDetails.setEmail("abc@gmail.com");
        Name name = new Name();
        name.setFirst("first");
        name.setLast("last");
        friendDetails.setName(name);
        Location location = new Location();
        location.setLatitude(123L);
        location.setLongitude(-123L);
        friendDetails.setLocation(location);

        when(templateClient.getEndpointDetails())
                .thenReturn(Arrays.asList(friendDetails));
    }


    @Test
    void testGetFriends() {
        List<FriendDetailsDto> friends = friendLocationService.getFriends();
        Assertions.assertNotNull(friends);
        Assertions.assertEquals(1, friends.size());
        FriendDetailsDto friendDetails = friends.get(0);
        Assertions.assertEquals("123", friendDetails.getId());
        Assertions.assertEquals("abc@gmail.com", friendDetails.getEmail());
    }
}
