---
title: 'SpringBoot JWT 튜토리얼 - 3장 JWT코드, Security 설정 추가'
date: 2022-01-12
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
---
# 1. JWT 설정추가

application.yml 파일을 열고, jwt 설정을 추가하겠습니다.

```yaml
jwt:
  header: Authorization
  #HS512 알고리즘을 사용할 것이기 때문에 512bit, 즉 64byte 이상의 secret key를 사용해야 한다.
  #echo 'silvernine-tech-spring-boot-jwt-tutorial-secret-silvernine-tech-spring-boot-jwt-tutorial-secret'|base64
  secret: c2lsdmVybmluZS10ZWNoLXNwcmluZy1ib290LWp3dC10dXRvcmlhbC1zZWNyZXQtc2lsdmVybmluZS10ZWNoLXNwcmluZy1ib290LWp3dC10dXRvcmlhbC1zZWNyZXQK
  token-validity-in-seconds: 86400
```

- header : JWT를 검증하는데 필요한 정보
- secret : HS512 알고리즘을 사용할 것이기 때문에 512bit, 즉 64byte 이상의 secret key를 사용해야 한다
    - 위 예제에서는 Secret Key 를 Base64 로 인코딩한 값임.
- token-validity-in-seconds : 토큰의 만료시간을 지정함 (단위는 초)

이제 build.gradle 파일로 가서 JWT 관련 라이브러리를 추가합니다.

```yaml
implementation group: 'io.jsonwebtoken', name: 'jjwt-api', version: '0.11.2'
runtimeOnly group: 'io.jsonwebtoken', name: 'jjwt-impl', version: '0.11.2'
runtimeOnly group: 'io.jsonwebtoken', name: 'jjwt-jackson', version: '0.11.2'
```

그 후 그래들을 다시 불러와, 프로젝트에 의존성을 설치해줍니다. 

JWT 개발을 위한 준비는 완료되었고 이제 JWT 코드를 개발하겠습니다.

# 2. JWT 관련 코드 작성

## TokenProvider 클래스

jwt 패키지를 생성하고, 토큰의 생성과 토큰의 유효성 검증등을 담당할 Token Provider 를 만들겠습니다.

```java
@Component
public class TokenProvider implements InitializingBean {

    private final Logger logger = LoggerFactory.getLogger(TokenProvider.class);

    private static final String AUTHORITIES_KEY = "auth";

    private final String secret;
    private final long tokenValidityInMilliseconds;

    private Key key;

    public TokenProvider(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.token-validity-in-seconds}") long tokenValidityInSeconds) {
        this.secret = secret;
        this.tokenValidityInMilliseconds = tokenValidityInSeconds * 1000;
    }

    @Override
    public void afterPropertiesSet() {
        byte[] keyBytes = Decoders.BASE64.decode(secret);
        this.key = Keys.hmacShaKeyFor(keyBytes);
    }
}
```

`InitializingBean`  인터페이스를 구현하여, `afterPropertiesSet` 메소드를 Override 한 이유는

Bean이 생성이 되고, 의존성 주입을 받은 후에 secret 값을 Base64 Decode 해서 key 변수에 할당합니다.

### createToken 메소드

Authentication 객체의 권한정보를 이용해서 토큰을 생성하는 createToken 메소드를 추가합니다.

```java
public String createToken(Authentication authentication) {
      String authorities = authentication.getAuthorities().stream()
         .map(GrantedAuthority::getAuthority)
         .collect(Collectors.joining(","));

      long now = (new Date()).getTime();
      Date validity = new Date(now + this.tokenValidityInMilliseconds);

      return Jwts.builder()
         .setSubject(authentication.getName())
         .claim(AUTHORITIES_KEY, authorities)
         .signWith(key, SignatureAlgorithm.HS512)
         .setExpiration(validity)
         .compact();
   }
```

authenticaion 객체를 받아서 권한 설정을 하고, application.yml 에서 설정했던 토큰 만료시간을 설정하고 토큰을 생성합니다.

### getAuthenticaion 메소드

token을 매개변수로 받아서, 토큰에 담긴 정보를 이용해 Authenticaion 객체를 리턴하는 메소드를 작성합니다.

```java
public Authentication getAuthentication(String token) {
      Claims claims = Jwts
              .parserBuilder()
              .setSigningKey(key)
              .build()
              .parseClaimsJws(token)
              .getBody();

      Collection<? extends GrantedAuthority> authorities =
         Arrays.stream(claims.get(AUTHORITIES_KEY).toString().split(","))
            .map(SimpleGrantedAuthority::new)
            .collect(Collectors.toList());

      User principal = new User(claims.getSubject(), "", authorities);

      return new UsernamePasswordAuthenticationToken(principal, token, authorities);
   }
```

token으로 클레임을 만들고, 클레임에서 권한정보를 받아서 유저 객체를 만들어서 최종적으로 Authenticaion 객체를 리턴합니다.

- Claims : JWT 의 속성정보, java 에서 Claims 는 Json map 형식의 인터페이스임

### validateToken 메소드

token을 매개변수로 받아서, 토큰의 유효성 검증을 수행하는 validateToken 메소드를 작성합니다.

```java
public boolean validateToken(String token) {
      try {
         Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token);
         return true;
      } catch (io.jsonwebtoken.security.SecurityException | MalformedJwtException e) {
         logger.info("잘못된 JWT 서명입니다.");
      } catch (ExpiredJwtException e) {
         logger.info("만료된 JWT 토큰입니다.");
      } catch (UnsupportedJwtException e) {
         logger.info("지원되지 않는 JWT 토큰입니다.");
      } catch (IllegalArgumentException e) {
         logger.info("JWT 토큰이 잘못되었습니다.");
      }
      return false;
   }
```

토큰을 파싱하고, 발생하는 예외들을 캐치하여, 문제가 있음면 false, 정상이면 true를 리턴합니다.

## JwtFilter 클래스

JWT를 위한 커스텀 필터를 만들기 위해 JwtFilter 클래스를 생성합니다.

```java
public class JwtFilter extends GenericFilterBean {

    private static final Logger logger = LoggerFactory.getLogger(JwtFilter.class);

    public static final String AUTHORIZATION_HEADER = "Authorization";

    private TokenProvider tokenProvider;

    public JwtFilter(TokenProvider tokenProvider) {
        this.tokenProvider = tokenProvider;
    }

    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain)
            throws IOException, ServletException {
        
    }
}
```

- doFilter : JWT 토큰의 인증정보를 현재 실행중인 SecurityContext 에 저장하는 역활

GenericFilterBean을 상속받아 doFilter 메소드를 Override.

실제 필터링 로직은 doFilter 내부에 작성합니다.

### resolveToken 메소드

Request Header 에서 토큰정보를 가져오기 위한, resolveToken 메소드를 추가합니다.

```java
private String resolveToken(HttpServletRequest request) {
      String bearerToken = request.getHeader(AUTHORIZATION_HEADER);
      if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
         return bearerToken.substring(7);
      }
      return null;
   }
```

### doFilter 메소드 내부 로직

 doFilter의 내부 로직을 작성하겠습니다.

```clike
HttpServletRequest httpServletRequest = (HttpServletRequest) servletRequest;
      String jwt = resolveToken(httpServletRequest);
      String requestURI = httpServletRequest.getRequestURI();

      if (StringUtils.hasText(jwt) && tokenProvider.validateToken(jwt)) {
         Authentication authentication = tokenProvider.getAuthentication(jwt);
         SecurityContextHolder.getContext().setAuthentication(authentication);
         logger.debug("Security Context에 '{}' 인증 정보를 저장했습니다, uri: {}", authentication.getName(), requestURI);
      } else {
         logger.debug("유효한 JWT 토큰이 없습니다, uri: {}", requestURI);
      }

      filterChain.doFilter(servletRequest, servletResponse);
```

resolveToken 을 통해 토큰을 받아와서 유효성 검증을 하고 토큰이 정상적이면 Authenticaion 객체를 받아와서 

SecurityContext 에 저장합니다.

## JwtSecurityConfig 클래스

TokenProvider, JwtFilter 를 SecurityConfig에 적용할때 사용할 JwtSecurityConfig 클래스를 생성합니다.

```java
public class JwtSecurityConfig extends SecurityConfigurerAdapter<DefaultSecurityFilterChain, HttpSecurity> {

    private TokenProvider tokenProvider;

    public JwtSecurityConfig(TokenProvider tokenProvider) {
        this.tokenProvider = tokenProvider;
    }

    @Override
    public void configure(HttpSecurity http) {
        JwtFilter customFilter = new JwtFilter(tokenProvider);
        http.addFilterBefore(customFilter, UsernamePasswordAuthenticationFilter.class);
    }
}
```

SecurityConfigurerAdapter를 상속받고 TokenProvider를 주입받아서 configure 메소드를 Override 하여 JwtFilter를 통해 Security 로직에 필터를 등록합니다.

## JwtAuthenticationEntryPoint 클래스

유효한 자격증명을 제공하지 않고 접근하려 할때 401 Unauthorized 에러를 리턴할 JwtAuthenticationEntryPoint 클래스를 생성합니다.

```java
@Component
public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint {

    @Override
    public void commence(HttpServletRequest request,
                         HttpServletResponse response,
                         AuthenticationException authException) throws IOException {
        // 유효한 자격증명을 제공하지 않고 접근하려 할때 401
        response.sendError(HttpServletResponse.SC_UNAUTHORIZED);
    }
}
```

AuthneticaionEntryPoint 를 구현하고, commence 메소드를 Override 합니다

이 클래스는 유효하지 않는 자격증명은 401 에러를 전송하는 클래스입니다.

## JwtAccessDeniedHandler 클래스

필요한 권한이 존재하지 않는 경우에 403 Forbidden 에러를 리턴하기 위해 JwtAccessDeniedHandler 클래스를 생성합니다.

```java
@Component
public class JwtAccessDeniedHandler implements AccessDeniedHandler {

    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response, AccessDeniedException accessDeniedException) throws IOException {
        //필요한 권한이 없이 접근하려 할때 403
        response.sendError(HttpServletResponse.SC_FORBIDDEN);
    }
}
```

AccessDeniedHandler를 구현하하고, handle 메소드를 Override합니다.

필요한 권한이 없이 접근할때 403 에러를 리턴합니다.

# 3. Security 설정 추가

## SecurityConfig 에 추가

이제 만들었던 5개의 클래스를 SecurityConfig 에 적용하겠습니다.

```java
@EnableWebSecurity
@EnableGlobalMethodSecurity(prePostEnabled = true)
public class SecurityConfig extends WebSecurityConfigurerAdapter {

    private final TokenProvider tokenProvider;
    private final JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;
    private final JwtAccessDeniedHandler jwtAccessDeniedHandler;

    public SecurityConfig(
            TokenProvider tokenProvider,
            JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint,
            JwtAccessDeniedHandler jwtAccessDeniedHandler
    ) {
        this.tokenProvider = tokenProvider;
        this.jwtAuthenticationEntryPoint = jwtAuthenticationEntryPoint;
        this.jwtAccessDeniedHandler = jwtAccessDeniedHandler;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Override
    public void configure(WebSecurity web) {
        web.ignoring()
                .antMatchers(
                        "/h2-console/**"
                        ,"/favicon.ico"
                );
    }

    @Override
    protected void configure(HttpSecurity httpSecurity) throws Exception {
        httpSecurity
                // token을 사용하는 방식이기 때문에 csrf를 disable합니다.
                .csrf().disable()

                .exceptionHandling()
                .authenticationEntryPoint(jwtAuthenticationEntryPoint)
                .accessDeniedHandler(jwtAccessDeniedHandler)

                // enable h2-console
                .and()
                .headers()
                .frameOptions()
                .sameOrigin()

                // 세션을 사용하지 않기 때문에 STATELESS로 설정
                .and()
                .sessionManagement()
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)

                .and()
                .authorizeRequests()
                .antMatchers("/api/hello").permitAll()
                .antMatchers("/api/authenticate").permitAll()
                .antMatchers("/api/signup").permitAll()

                .anyRequest().authenticated()

                .and()
                .apply(new JwtSecurityConfig(tokenProvider));
    }
}
```

- `@EnableGlobalMethodSecurity` : @PreAuthorize 어노테이션을 메소드 단위로 추가한다

SecurityConfig는 TokenProvider, JwtAuthenticaionEntryPoint, JwtAccessDeniedHandler 를 주입받습니다. 

passwordEncoder로 BCryptPasswordEncoder를 사용합니다.

configure 메소드에서 많은 부분이 추가됬는데(HttpSecurity 매개인자) 

일단 토큰을 사용하기 때문에 csrf 는 disable 합니다 Exception을 핸들링할때 우리가 작성한 클래스를 추가합니다.

그리고 h2-console 을 위한 설정들을 추가해줬고, 우리는 세션을 사용하지 않기 때문에 세션 설정을 STATELESS로 설정합니다.

로그인 API, 회원가입 API 는 토큰이 없는 상태에서 요청이 들어오기 때문에 모두 permitAll 설정을 해줬습니다.

마지막으로 JwtFilter를 addFilterBefore로 등록했던 JwtSecurityConfig 클래스도 적용해줍니다.

### 서버 실행

서버를 최종적으로 실행하면 아무 오류없이 잘 실행되는 것을 볼수있습니다.

```java
2022-01-10 20:36:56.570  INFO 44384 --- [           main] o.s.b.w.embedded.tomcat.TomcatWebServer  : Tomcat started on port(s): 8080 (http) with context path ''
2022-01-10 20:36:56.575  INFO 44384 --- [           main] c.e.jwttutorial.JwtTutorialApplication   : Started JwtTutorialApplication in 2.078 seconds (JVM running for 2.671)
```

이제 JWT 설정 추가, JWT 관련 코드 개발, Security 설정 추가하는 작업이 완료되었습니다.

다음편에서는 DB와 연결하는 Repository를 만들고 로그인 API 를 구현하겠습니다.