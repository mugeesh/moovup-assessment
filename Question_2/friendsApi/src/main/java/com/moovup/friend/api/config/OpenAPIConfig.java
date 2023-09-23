package com.moovup.friend.api.config;

import io.swagger.v3.oas.models.ExternalDocumentation;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;

@Configuration
@EnableWebMvc
public class OpenAPIConfig {
    public static final String FILE_TAG = "Friend Location API";

    @Bean
    public OpenAPI springShopOpenAPI() {
        return new OpenAPI()
                .info(getInfo())
                .externalDocs(getExternalDocumentation());
    }

    private Info getInfo() {
        return new Info()
                .title("MoovUp Assessment Test API")
                .description("Friend Details Information including location")
                .version("v0.0.1")
                .contact(getContacts())
                .license(getLicense());
    }


    private Contact getContacts() {
        return new Contact()
                .name("Mugeesh Husain")
                .email("mugeesh.husain@gmail.com");
    }

    private License getLicense() {
        return new License().name("Apache 2.0").url("https://www.apache.org/licenses/LICENSE-2.0");
    }

    private ExternalDocumentation getExternalDocumentation() {
        return new ExternalDocumentation()
                .description("MoovUp Test Requirement ")
                .url("https://github.com/moovup/programming-test/blob/master/web.md");
    }
}
