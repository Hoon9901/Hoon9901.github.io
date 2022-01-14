---
title: 'SpringBoot JWT 튜토리얼 - 5장 회원가입, 권한검증 [최종]'
date: 2022-01-14
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
# 1. 회원가입 API 작성

## SecurityUtil 클래스

간단한 유틸리티 메소드를 만들기 위해 `SecurityUtil` 클래스를 util 패키지에 생성하겠습니다.

```java
public class SecurityUtil {

   private static final Logger logger = LoggerFactory.getLogger(SecurityUtil.class);

   private SecurityUtil() {
   }

   public static Optional<String> getCurrentUsername() {
      final Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

      if (authentication == null) {
         logger.debug("Security Context에 인증 정보가 없습니다.");
         return Optional.empty();
      }

      String username = null;
      if (authentication.getPrincipal() instanceof UserDetails) {
         UserDetails springSecurityUser = (UserDetails) authentication.getPrincipal();
         username = springSecurityUser.getUsername();
      } else if (authentication.getPrincipal() instanceof String) {
         username = (String) authentication.getPrincipal();
      }

      return Optional.ofNullable(username);
   }
```

`getCurrentUsername` 메소드의 역활은 SecurityContext의 Authentication 객체를 이용해 `username`을 리턴해주는 간단한 유틸성 메소드입니다. 

`SecurityContext`에 Authenticaion 객체가 저장되는 시점은 JwtFilter의 `doFilter`메소드에서 Request가 들어올때 SecurityContext에 Authenticaion 객체를 저장해서 사용하게 됩니다.

## UserService 클래스

회원가입, 유저 정보 조회등의 메소드를 만들기 위해 UserService 클래스를 생성하겠습니다.

```java
@Service
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

@Transactional
    public User signup(UserDto userDto) {
        if (userRepository.findOneWithAuthoritiesByUsername(userDto.getUsername()).orElse(null) != null) {
            throw new RuntimeException("이미 가입되어 있는 유저입니다.");
        }

        Authority authority = Authority.builder()
                .authorityName("ROLE_USER")
                .build();

        User user = User.builder()
                .username(userDto.getUsername())
                .password(passwordEncoder.encode(userDto.getPassword()))
                .nickname(userDto.getNickname())
                .authorities(Collections.singleton(authority))
                .activated(true)
                .build();

        return userRepository.save(user);
    }

    @Transactional(readOnly = true)
    public Optional<User> getUserWithAuthorities(String username) {
        return userRepository.findOneWithAuthoritiesByUsername(username);
    }

    @Transactional(readOnly = true)
    public Optional<User> getMyUserWithAuthorities() {
        return SecurityUtil.getCurrentUsername().flatMap(userRepository::findOneWithAuthoritiesByUsername);
    }
}
```

UserService 클래스는 `UserRepository`, `PasswordEncoder`를 주입받습니다.

`singup` 메소드는 username이 DB에 존재하지 않으면 Authority와 User 정보를 생성해서 UserRepository의 `save`메소드를 통해 DB에 정보를 저장합니다. 

여기서 **중요한 점**은 `singup` 메소드를 통해 가입한 회원은 USER ROLE을 가지고 있고 `data.sql` 에서 자동 생성되는 admin 계정은 USER, ADMIN ROLE을 가지고 있습니다 이 차이를 통해 권한검증 부분을 테스트 하겠습니다.

그리고 유저 권한정보를 가져오는 메소드가 2개 있습니다.

`getUserWithAuthorities`는 username을 기준으로 정보를 가져오고

`getMyUserWithAuthorities`는 SecurityContext에 저장된 username의 정보만 가져옵니다.

이 두가지 메소드의 허용권한을 다르게 해서 권한검증에 대한 부분을 테스트하겠습니다.

# 2. 권한 검증

## UserController 클래스

`UserService`의 메소드들을 호출할 `UserController` 클래스를 생성하겠습니다.

```java
@RestController
@RequestMapping("/api")
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/signup")
    public ResponseEntity<User> signup(@Valid @RequestBody UserDto userDto) {
        return ResponseEntity.ok(userService.signup(userDto));
    }

    @GetMapping("/user")
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    public ResponseEntity<User> getMyUserInfo(HttpServletRequest request) {
        return ResponseEntity.ok(userService.getMyUserWithAuthorities().get());
    }

    @GetMapping("/user/{username}")
    @PreAuthorize("hasAnyRole('ADMIN')")
    public ResponseEntity<User> getUserInfo(@PathVariable String username) {
        return ResponseEntity.ok(userService.getUserWithAuthorities(username).get());
    }
}
```

- `@PreAuthorize`
    - 해당 메서드가 호출되기 이전에 권한을 검사한다
- `hasAnyRole([role1, role2])`
    - 현재 사용자의 권한이 파라미터의 권한 중 일치하는 것이 있는 경우 `true` 를 리턴

`sinup` 메소드는 UserDto를 매개변수로 받아서 UserService의 `singup` 메소드를 호출합니다.

`getMyUserInfo` 메소드는 `@PreAuthorize`를 통해서 USER, ADMIN 두가지 권한 모두 허용했고

`getUserInfo` 메소드는 ADMIN 권한만 호출할 수 있도록 설정했습니다 그리고 `UserService`에서 만들었던 username 매개변수를 기준으로 유저 정보와 권한 정보를 리턴하는 API가 되겠습니다. 

# 3. Response 시 DTO를 통해서만 받기

## 기존 문제점

추가적으로 지금까지 로직을 보시면 사용자 요청에 대해 응답을 Entity 그대로 전달하기 때문에 문제가있습니다.  문제점을 보기위해 Entity를 통해 반환을 하게 되면 어떤 결과를 나오는지 보겠습니다.

- Response - `POST` /api/signup

```json
{
    "userId": 3,
    "username": "hoon",
    "password": "$2a$10$PZhLrJzS9YQX1.M5.ezMhu/VFAbtSiYLU.ExF3qzlBrrk7bHPyzdm",
    "nickname": "nick",
    "activated": true,
    "authorities": [
        {
            "authorityName": "ROLE_USER"
        }
    ]
}
```

해당 응답 결과처럼, 보시면은 중요한 정보들이 그대로 반환이 됩니다 그 이유는 `UserService`의 회원가입 로직을 처리하는 메소드가 User Entity 그대로 반환해주기 때문에 사용자 측에서는 해당 결과를 받게됩니다.

보안적인 측면에서도 안좋은 방식이므로 DTO를 통해 응답하도록 코드를 수정하겠습니다.

## 해결법

### AuthorityDto 클래스 생성

권한정보에 대한 DTO 클래스를 작성하겠습니다.

```java
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuthorityDto {
    private String authorityName;
}
```

### UserDto 클래스 수정

아래와 같이 권한 정보에 대한 `authorityDtoSet` 필드를 추가하고 `from` 메소드를 추가합니다.

```java
private Set<AuthorityDto> authorityDtoSet;

    public static UserDto from(User user) {
        if(user == null) return null;

        return UserDto.builder()
                .username(user.getUsername())
                .nickname(user.getNickname())
                .authorityDtoSet(user.getAuthorities().stream()
                        .map(authority -> AuthorityDto.builder().authorityName(authority.getAuthorityName()).build())
                        .collect(Collectors.toSet()))
                .build();
    }
```

`from` 메소드는 `User` 객체를 매개변수로 받아서 해당 객체가 `null`이 아니면, 해당 객체를 `UserDto`로 생성해서 반환합니다.

### UserService 클래스 수정

`User`로 반환하던 이전 메소드들을 `UserDto`로 반환하도록 수정하겠습니다. (굵은 글씨를 봐주세요)

```java
@Transactional
    public **UserDto** signup(UserDto userDto) {
        if (userRepository.findOneWithAuthoritiesByUsername(userDto.getUsername()).orElse(null) != null) {
            throw new RuntimeException("이미 가입되어 있는 유저입니다.");
        }

        Authority authority = Authority.builder()
                .authorityName("ROLE_USER")
                .build();

        User user = User.builder()
                .username(userDto.getUsername())
                .password(passwordEncoder.encode(userDto.getPassword()))
                .nickname(userDto.getNickname())
                .authorities(Collections.singleton(authority))
                .activated(true)
                .build();

        return **UserDto.from**(userRepository.save(user));
    }

    @Transactional(readOnly = true)
    public **UserDto** getUserWithAuthorities(String username) {
        return **UserDto.from**(userRepository.findOneWithAuthoritiesByUsername(username)**.orElse(null))**;
    }

    @Transactional(readOnly = true)
    public **UserDto** getMyUserWithAuthorities() {
        return **UserDto.from**(SecurityUtil.getCurrentUsername().flatMap(userRepository::findOneWithAuthoritiesByUsername)**.orElse(null))**;
    }
```

회원가입 로직을 처리하는 `signup` 메소드는 기존 소스 그대로에서 `UserDto.from` 을 통해 `User`를 Dto로 생성해서 반환합니다.

나머지 두개의 권한 정보을 반환하는 메소드도 `UserDto`로 반환하도록 수정합니다.

기존에는 `Optional`을 통해서 `null` 예외처리를 해줬지만, 이젠 `null` 값이 들어오면 해당 값 그대로 리턴합니다.

### UserController 클래스 수정

요청에 대해 `User`로 반환하던 이전 메소드들을 `UserDto`로 반환하도록 수정하겠습니다.

```java
@PostMapping("/signup")
    public ResponseEntity<**UserDto**> signup(@Valid @RequestBody UserDto userDto) {
        return ResponseEntity.ok(userService.signup(userDto));
    }

    @GetMapping("/user")
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    public ResponseEntity<**UserDto**> getMyUserInfo(HttpServletRequest request) {
        return ResponseEntity.ok(userService.getMyUserWithAuthorities());
    }

    @GetMapping("/user/{username}")
    @PreAuthorize("hasAnyRole('ADMIN')")
    public ResponseEntity<**UserDto**> getUserInfo(@PathVariable String username) {
        return ResponseEntity.ok(userService.getUserWithAuthorities(username));
    }
```

기존과 비슷하게 반환하는 객체를 `UserDto`로 변경해줍니다.

API 요청에 대해 `Entity`을 반환하는것이 아닌 `Dto`를 반환하는 코드로 변경을 완료했습니다.

# 4. 회원가입 API 테스트

이제 우리가 만든 3개의 API를 Postman, H2 Console를 이용해 테스트해보겠습니다.

## 회원가입 요청

URL : [http://localhost:8080/api/signup](http://localhost:8080/api/signup) 경로로 `POST` 요청을 보냅니다.

![Untitled](5-1.png)

- Response
    
    ```json
    {
        "username": "hoon",
        "nickname": "nick",
        "authorityDtoSet": [
            {
                "authorityName": "ROLE_USER"
            }
        ]
    }
    ```
    

회원가입 API에 대한 응답이 정상적으로 반환됬습니다 이제 가입된 유저정보를 H2 Console 에서 확인해보겠습니다.

### H2 Console

<img src="5-2.png" width="300" height="500"/>

추가한 유저 정보가 잘 등록된것을 볼수있습니다.

이제 권한이 다른 두 계정(admin, uesr)을 가지고 두 개의 API를 테스트해보겠습니다.

## 권한 API 테스트

먼저 ADMIN 권한만 허용했던 API를 테스트하겠습니다.

URL : [http://localhost:8080/api/user/hoon](http://localhost:8080/api/user/hoon) 경로로 GET 요청을 합니다.

- Response - `GET` /api/user/hoon
    
    ![Untitled](5-3.png)
    

401 상태가 반환된것을 볼수있습니다.

### JWT Token 가져오기

ADMIN 계정을 로그인해서 token을 가져오겠습니다,

URL : [http://localhost:8080/api/authenticate](http://localhost:8080/api/authenticate) 경로에 POST 요청을 보냅니다.

- Response - `POST` /api/authenticate
    
    ```json
    {
        "token": "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbiIsImF1dGgiOiJST0xFX0FETUlOLFJPTEVfVVNFUiIsImV4cCI6MTY0MjE2NTU3N30.UyNbN-cX82pIRHOMKWTjnDSTLX-TWzER3otxNaKKTxeB9egSL2gp8FMzr5wznIFRXEyBdU-1cFMcKnQerBjiGg"
    }
    ```
    

그리고 해당 어드민 유저의 토큰을 HTTP Headers에 `Authorization : Bearer {jwt_token}` 형식으로 담고 다시 권한 API 경로로 GET 요청을 보냅니다.

### ADMIN 권한 테스트

- Response - `GET` /api/user/hoon
    
    ```json
    {
        "username": "hoon",
        "nickname": "nick",
        "authorityDtoSet": [
            {
                "authorityName": "ROLE_USER"
            }
        ]
    }
    ```
    

/api/user/hoon 경로는 `ROLE_ADMIN` 권한을 가진 유저만 접근할 수 있는데. 정상적으로 응답이 된것을 확인할수있습니다.

### USER 권한 테스트

이번에는 hoon 계정의 토큰으로 이 API를 재호출 해보도록 하겠습니다.

기존에 로그인 API를 hoon 계정으로 요청하고, 토큰을 발급받습니다.

- Response - `POST` /api/authenticate
    
    ```json
    {
        "token": "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJob29uIiwiYXV0aCI6IlJPTEVfVVNFUiIsImV4cCI6MTY0MjE2NjA1N30.UMN19s9OGrX10qcO6tgET91rggoatwtfutr6L2iuL4da67vF7vR_4D1zXOKb4_0pCVtamREhGsDm_Y-iMImBPg"
    }
    ```
    

hoon 계정으로 POST 요청을 했고 해당 토큰을 이용해서 다시 API 를 호출하겠습니다.

- Response - `GET` /api/user/hoon
    
    ```json
    {
        "timestamp": "2022-01-13T13:15:29.386+00:00",
        "status": 403,
        "error": "Forbidden",
        "path": "/api/user/hoon"
    }
    ```
    

hoon 계정의 토큰으로 요청을 해보면 `403 Foribidden` 에러가 반환된 것을 볼수있습니다.

해당 403 Forbidden 에러는 저희가 작성한 `JwtAccessDeniedHandler`에 의해 발생됬습니다.

이번에는 USER권한을 허용해줬던 API를 hoon 계정의 토큰으로 호출해보겠습니다.

- Response - `GET` /api/user
    
    ```json
    {
        "username": "hoon",
        "nickname": "nick",
        "authorityDtoSet": [
            {
                "authorityName": "ROLE_USER"
            }
        ]
    }
    ```
    

hoon 계정으로 발급받은 토큰으로 이 API 는 잘 호출되는 것을 볼수있습니다.

이제 해당 강의에서 준비한 JWT Tutorial의 모든 부분이 완료됬습니다. 읽어주셔서 감사합니다😊

# Reference

[https://gaemi606.tistory.com/entry/Spring-Boot-Spring-Security-PreAuthorize사용하기](https://gaemi606.tistory.com/entry/Spring-Boot-Spring-Security-PreAuthorize%EC%82%AC%EC%9A%A9%ED%95%98%EA%B8%B0)

[https://steemit.com/kr-dev/@igna84/spring-security-preauthorize-postauthorize](https://steemit.com/kr-dev/@igna84/spring-security-preauthorize-postauthorize)