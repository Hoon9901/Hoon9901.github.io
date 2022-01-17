---
title: 'SpringBoot JWT 튜토리얼 - 4장 DTO,Repository,로그인 구현'
date: 2022-01-13
tags:
  - SpringBoot
  - JWT
  - 튜토리얼
keywords :
  - 스프링
  - 스프링부트
  - SpringBoot
  - JWT
  - 튜토리얼
  - Tutorial
  - Login
  - 로그인
---
# 1. DTO 클래스 생성

## LoginDto 클래스

외부와의 통신에 사용할 DTO 패키지 및 클래스를 생성합니다.

```java
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class LoginDto {

    @NotNull
    @Size(min = 3, max = 50)
    private String username;

    @NotNull
    @Size(min = 3, max = 100)
    private String password;
}
```

Lombok 어노테이션(Get, Set 등)이 추가되었고 @Valid 관련 어노테이션을 추가했습니다.

로그인 할 이용자의 아이디, 비밀번호를 담을 username, password 필드를 가집니다.

## TokenDto 클래스

Token 정보를 Response 할때 사용할 TokenDto를 만들겠습니다.

```java
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TokenDto {

    private String token;
}
```

## UserDto 클래스

회원가입시에 사용할 UserDto 클래스도 미리 만들어주겠습니다.

```java
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserDto {

    @NotNull
    @Size(min = 3, max = 50)
    private String username;

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @NotNull
    @Size(min = 3, max = 100)
    private String password;

    @NotNull
    @Size(min = 3, max = 50)
    private String nickname;
}
```

# 2. Repository 관련 코드 작성

이제 Repository들을 만들어주기 위해 repository 패키지를 생성합니다.

## UserRepository 인터페이스

이전에 만들었던 User 엔티티에 매핑되는 UserRepository 인터페이스를 만들겠습니다.

```java
public interface UserRepository extends JpaRepository<User, Long> {
    @EntityGraph(attributePaths = "authorities")
    Optional<User> findOneWithAuthoritiesByUsername(String username);
}
```

- `EntityGraph` : 쿼리가 수행될때 Lazy 조회가 아니고 Eager조회로 authorities 정보를 같이가져옵니다.
    - Lazy, Eager : 지연로딩(lazy), 즉시로딩(eager) 연관관계의 데이터를 어떻게 가져올지 (fetch)

`JpaRepository`를 `extends` 하면 `findAll`, `save` 등의 메소드를 기본적으로 사용할 수 있습니다.

`findOneWithAuthoritiesByUsername` 메소드는 username을 기준으로 User 정보를 가져올때 권한 정보도 같이 가져오게됩니다.

# 3. 로그인 API, 관련 로직 생성

## CustomUserDetailsService 클래스

Spring Security에서 중요한 부분중 하나인 UserDetailsService를 구현한 CustomUserDetailsService 클래스를 생성하겠습니다. 

먼저 service 패키지를 만들어고 해당 패키지에 클래스를 생성합니다.

```java
@Component("userDetailsService")
public class CustomUserDetailsService implements UserDetailsService {
    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    @Transactional
    public UserDetails loadUserByUsername(final String username) {
        return userRepository.findOneWithAuthoritiesByUsername(username)
                .map(user -> createUser(username, user))
                .orElseThrow(() -> new UsernameNotFoundException(username + " -> 데이터베이스에서 찾을 수 없습니다."));
    }

    private org.springframework.security.core.userdetails.User createUser(String username, User user) {
        if (!user.isActivated()) {
            throw new RuntimeException(username + " -> 활성화되어 있지 않습니다.");
        }
        List<GrantedAuthority> grantedAuthorities = user.getAuthorities().stream()
                .map(authority -> new SimpleGrantedAuthority(authority.getAuthorityName()))
                .collect(Collectors.toList());
        return new org.springframework.security.core.userdetails.User(user.getUsername(),
                user.getPassword(),
                grantedAuthorities);
    }
}
```

`UserDetailsService`를 `implements`하고 `UserRepository`를 주입받습니다. `loadUserByUsername` 메소드를 오버라이드해서 로그인시에 DB에서 유저정보와 권한정보를 가져오게됩니다.

해당 정보를 기반으로 해서 `userdetails.user` 객체를 생성해서 리턴합니다.

## AuthController 클래스

로그인 API를 추가하기 위해서 AuthController 클래스를 만들겠습니다.

```java
@RestController
@RequestMapping("/api")
public class AuthController {
    private final TokenProvider tokenProvider;
    private final AuthenticationManagerBuilder authenticationManagerBuilder;

    public AuthController(TokenProvider tokenProvider, AuthenticationManagerBuilder authenticationManagerBuilder) {
        this.tokenProvider = tokenProvider;
        this.authenticationManagerBuilder = authenticationManagerBuilder;
    }

    @PostMapping("/authenticate")
    public ResponseEntity<TokenDto> authorize(@Valid @RequestBody LoginDto loginDto) {

        UsernamePasswordAuthenticationToken authenticationToken =
                new UsernamePasswordAuthenticationToken(loginDto.getUsername(), loginDto.getPassword());

        Authentication authentication = authenticationManagerBuilder.getObject().authenticate(authenticationToken);
        SecurityContextHolder.getContext().setAuthentication(authentication);

        String jwt = tokenProvider.createToken(authentication);

        HttpHeaders httpHeaders = new HttpHeaders();
        httpHeaders.add(JwtFilter.AUTHORIZATION_HEADER, "Bearer " + jwt);

        return new ResponseEntity<>(new TokenDto(jwt), httpHeaders, HttpStatus.OK);
    }
}
```

이전에 만들었던 `TokenProvider`, `AuthenticationManagerBuilder` 를 주입받습니다.

로그인 API 경로는 `/api/authenticate` 경로이고 `POST` 요청을 받습니다.

### authorize 메소드

`authorize` 메소드는 LoginDto의 username, password를 매개변수로 받고 이를 이용해 `UsernamePasswordAuthenticationToken`을 생성합니다.

authenticationToken을 이용해서 Authentication 객체를 생성하려고 `authenticate` 메소드가 실행이될 때 `CustomUserDetailsService` 클래스의 `loadUserByUsername` 메소드가 실행됩니다.

이 결과값을 이용해서 Authenticaion 객체를 생성하고 이를 SecurityContext 에 저장하고 Authenticaion 객체를 `createToken` 메소드를 통해서 JWT Token 을 생성합니다.

JWT Token 을 Response Header에 넣어주고 TokenDto를 이용해서 Response Body에도 넣어서 리턴하게 됩니다.

# 4. 로그인 API 테스트

자 이제 로그인 API 를 포스트맨으로 테스트해보겠습니다.

## 로그인 요청

 [http://localhost:8080/api/authenticate](http://localhost:8080/api/authenticate) 경로로 아래와 같이 `POST` 요청을 보냅니다.

![Untitled](4-1.png)

admin 계정 정보는 data.sql의 insert문이 서버가 시작될때 자동실행되어 DB에 저장된 상태입니다.

- 405 HTTP 상태 코드가 발생하면?
    - Server Log
    
    ```json
    2022-01-12 18:35:18.364 DEBUG 5197 --- [nio-8080-exec-1] com.example.jwttutorial.jwt.JwtFilter    : 유효한 JWT 토큰이 없습니다, uri: /api/authenticate
    2022-01-12 18:35:18.373  WARN 5197 --- [nio-8080-exec-1] .w.s.m.s.DefaultHandlerExceptionResolver : Resolved [org.springframework.web.HttpMediaTypeNotSupportedException: Content type 'text/plain;charset=UTF-8' not supported]
    2022-01-12 18:35:18.374 DEBUG 5197 --- [nio-8080-exec-1] com.example.jwttutorial.jwt.JwtFilter    : 유효한 JWT 토큰이 없습니다, uri: /error
    ```
    
    - Response
    
    ```json
    {
        "timestamp": "2022-01-12T09:33:18.957+00:00",
        "status": 415,
        "error": "Unsupported Media Type",
        "path": "/api/authenticate"
    }
    ```
    
    위와 같이 응답이 반환되면 POST 요청을 보낼때 `JSON` 형식으로 보내시면됩니다.
    

## 정상 응답

정상적으로 요청이 응답된다면 서버에선 해당 sql문 query 내용이 로그로 나타납니다

```sql
Hibernate: 
    select
        user0_.user_id as user_id1_1_0_,
        authority2_.authority_name as authorit1_0_1_,
        user0_.activated as activate2_1_0_,
        user0_.nickname as nickname3_1_0_,
        user0_.password as password4_1_0_,
        user0_.username as username5_1_0_,
        authoritie1_.user_id as user_id1_2_0__,
        authoritie1_.authority_name as authorit2_2_0__ 
    from
        user user0_ 
    left outer join
        user_authority authoritie1_ 
            on user0_.user_id=authoritie1_.user_id 
    left outer join
        authority authority2_ 
            on authoritie1_.authority_name=authority2_.authority_name 
    where
        user0_.username=?
```

그리고 Repsonse 내용으로 아래와 같이 Token이 정상적으로 리턴됩니다.

```json
{
    "token": "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbiIsImF1dGgiOiJST0xFX0FETUlOLFJPTEVfVVNFUiIsImV4cCI6MTY0MjA2NjU2NH0.QLtuqh874mipMl-h0cO6p4Jf430RGf2uBArr5nWcnmnvG6YqVo0qFXGxEwbPHD9u7J4Zl1GIL0YuWQTXWdUYHA"
}
```

이제 DTO 클래스, Repository, 로그인 API의 개발이 완료되었습니다. 

디음 편에서는 회원가입 API를 만들고 회원가입한 유저와 admin 관리자의 권한 검증을 구성하겠습니다.

- Postman의 유용한 기능

![Untitled](4-2.png)

위와 같이 Tests 탭에서 Response의 데이터를 전역변수에 저장해서 다른 Request에서도 사용할 수 있습니다.

# Reference

[Spring Docs - JpaRepository](https://docs.spring.io/spring-data/jpa/docs/current/api/org/springframework/data/jpa/repository/JpaRepository.html)