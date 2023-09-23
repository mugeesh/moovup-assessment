package com.moovup.friend.api.controller;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.moovup.friend.api.model.FriendDetailsDto;
import com.moovup.friend.api.service.FriendLocationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;
import java.util.Arrays;
import java.util.List;

@WebMvcTest(controllers = FriendLocationController.class)
class FriendLocationControllerTest {

	@Autowired
	private MockMvc mockMvc;

	@MockBean
	FriendLocationService friendLocationService;

	@BeforeEach
	void init(){
		FriendDetailsDto friendDetails = FriendDetailsDto.builder()
				.id("123")
				.fullName("Justin")
				.email("email1@gmail.com")
				.build();
		FriendDetailsDto friendDetails1 = FriendDetailsDto.builder()
				.id("456")
				.fullName("Ammar")
				.email("email2@gmail.com")
				.build();

		List<FriendDetailsDto> dto = Arrays.asList(friendDetails, friendDetails1);
		when(friendLocationService.getFriends())
				.thenReturn(dto);
	}


	@Test
	void allFriendEndpoint() throws Exception {
		this.mockMvc.perform(get("/friend-location-api/all"))
				.andExpect(status().isOk())
				.andExpect(MockMvcResultMatchers.jsonPath("$[0].id").value("456"))
				.andExpect(MockMvcResultMatchers.jsonPath("$[0].fullName").value("Ammar"))
				.andExpect(MockMvcResultMatchers.jsonPath("$[0].email").value("email2@gmail.com"))
				.andExpect(MockMvcResultMatchers.jsonPath("$[1].id").value("123"))
				.andExpect(MockMvcResultMatchers.jsonPath("$[1].email").value("email1@gmail.com"));
	}
}