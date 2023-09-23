package com.moovup.friend.api.service;

import com.moovup.friend.api.model.FriendDetails;
import com.moovup.friend.api.utils.JsonHelper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.ArrayList;
import java.util.List;

@Component
public class TemplateClient {

    @Value("${moovup.template-endpoint}")
    protected String templateEndpoint;

    @Value("${moovup.token}")
    protected String authToken;

    private final WebClient webClient;

    public TemplateClient() {
        this.webClient = WebClient.builder().build();
    }

    public List<FriendDetails> getEndpointDetails() {
        List<FriendDetails> friendDetailsList;
        String result = this.webClient
                .get()
                .uri(templateEndpoint)
                .headers(h -> h.setBearerAuth(authToken))
                .retrieve()
                .bodyToMono(String.class)
                .block();
        friendDetailsList = (List<FriendDetails>) JsonHelper.fromJson(result, FriendDetails.class);
        if (friendDetailsList == null) {
            return new ArrayList<>();
        }
        return friendDetailsList;
    }

}
