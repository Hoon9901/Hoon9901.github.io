---
title: 'Json Web Token(JWT) 란?'
date: 2022-01-10
tags:
  - 보안
  - Token
keywords :
  - Json
  - JWT
  - Token
  - Security
---
# 1. JWT (Json Web Token)란?

---

- JSON 객체를 사용해서 토큰 자체에 정보를 저장하는 Web Token
- Header, Payload, Signature 3개 부분으로 구성됨.
- 쿠키나 세션을 이용한 인증보다 안전하고 효율적임
- 일반적으로는 `Authorization : <type> <credentials>` 형태로 Request Header 에 담겨져 오기 떄문에 Header 값을 확인해서 가져올 수 있음.

## 1.1 장단점

---

- 장점
    - 중앙 인증 서버, 저장소에 대한 의존성이 없어서 수평확장에 유리
    - Base64 URL Safe Encoding 이라 URL, Cookie, Header 어떤 형태로 사용가능
    - Stateless 한 서버 구현 가능
    - 웹이 아닌 모바일에서도 사용 가능
    - 인증 정보를 다른 곳에서도 사용 가능 (OAuth)
- 단점
    - Payload 의 정보가 많아지면 네트워크 사용량 증가
    - 다른 사람이 토큰을 decode 하여 데이터 확인 가능
    - 토큰을 탈취당한 경우 대처하기 어려움
        - 기본적으로는 서버에서 관리하는게 아니다보니 탈취당한 경우 강제 로그아웃 처리가 불가능
        - 토큰 유효시간이 만료되기 전까지는 탈취자는 자유롭게 인증 가능
        - 그래서 유효시간을 짧게 가져가고 refresh Token 을 발급하는 방식으로 많이 사용

## 1.2 Token 구성요소

---

- Header
    - `alg` : Signature 를 해싱하기 위한 알고리즘 정보를 갖고 있음
    - `typ` : 토큰의 타입을 나타내는데 없어도 됨(보통 JWT 를 사용)
- Payload
    - 서버와 클라이언트가 주고받는, 시스템에서 실제로 사용될 정보에 대한 내용을 담고 있음
    - JWT가 [기본적으로 갖고 있는 키워드](https://datatracker.ietf.org/doc/html/rfc7519#section-4.1)가 존재
    - 원한다면 추가 가능
        - `iss` : 토큰 발급자
        - `sub` : 토큰 제목
        - `aud` : 토큰 대상
        - `exp` : 토큰의 만료시간
        - `nbf` : Not Before
        - `iat` : 토큰이 발급된 시간
        - `jti` : JWT의 고유 식별자
- Signature
    - 서버에서 토큰이 유효한지 검증하기 위한 문자열
    - Header + Payload + Secret Key 로 값을 생성하므로 데이터 변조 여부를 판단 가능
    - Secret Key 는 노출되지 않도록 서버에서 관리 필요

## 1.3 토큰 인증 타입

---

`Authorization: <type> <credentials>` 형태에서 `<type>` 부분에 들어값 값.

엄격한 규칙이 있는건 아니고, 일반적으로 많이 사용되는 형태

- Basic
    - 사용자 아이디와 암호를 Base64로 인코딩한 값을 토큰으로 사용
- Bearer
    - JWT 또는 OAuth 에 대한 토큰을 사용
- Digest
    - 서버에서 난수 데이터 문자열을 클라이언트에 보냄
    - 클라이언트는 사용자 정보와 nonce 를 포함하는 해시값을 사용하여 응답
- HOBA
    - 전자 서명 기반 인증
- Mutual
    - 암호를 이용한 클라이언트-서버 상호 인증
- AWS4-HMAC-SHA256
    - AWS 전자 서명 기반 인증

# 2. Refresh Token

---

**JWT 역시 탈취되면 누구나 API 를 호출할 수 있다는 [단점이](https://www.notion.so/JWT-6b901ef070744b6bb65fff7f5343fd35) 존재.**

세션은 탈취된 경우 세션 저장소에서 탈취된 세션 ID를 삭제하면되지만, JWT 는 서버에서 관리하지 않기 때문에 속수무책으로 당할 수 밖에 없음.

그래서 탈취되어도 피해가 최소한 되도록 유효시간을 짧게 가져감.

하지만 만료 시간을 30분으로 설정하면 일반 사용자는 30분마다 새로 로그인하여 토큰을 발급받아야 함.

**사용자가 매번 로그인 하는 과정을 생략하기 위해 필요한게 Refresh Token.**

### 발급 과정

1. Refresh Token 은 로그인 토큰(Access Token) 보다 긴 유효 시간을 가지며, Access Token 이 만료된 사용자가 재발급을 원할 경우 Refresh Toekn을 함께 전달함.
2. 서버는 Access Token 에 담긴 사용자의 정보를 확인하고 Refresh Token 이 아직 만료되지 않았다면, 새로운 토큰을 발급해줌

위와 같이 하면 매번 로그인해야하는 번거로움 없이 로그인을 지속적으로 유지 할 수 있음.

### 주의

Refresh Token 은 사용자가 로그인할 때 같이 발급되며, 클라이언트가 안전한 곳에 보관하고 있어야 함.

Access Token과 달리 매 요청마다 주고 받지 않기 때문에 탈취 당할 위험이 적으며, 요청 주기가 길기 때문에 별도의 저장소에 보관함. (정책마다 다르게 사용)

## 2.1 Refresh Token 저장소

---

Refresh Token 은 서버에서 별도의 저장소에 보관하는 것이 좋다.

- Refresh Token 은 사용자 정보가 없기 때문에 저장소에 값이 있으면 검증 시 어떤 사용자의 토큰인지 판단하기 용이
- 탈취당했을 때 저장소에서 Refresh Token 정보를 삭제하면 Access Token 만료 후에 재발급이 안되게 강제 로그아웃 처리 가능
- 일반적으로 Redis 많이 사용

## 2.2 Refresh Token 으로 Access Token 재발급 시나리오

---

1. 클라이언트는 `access token` 으로 API 요청하며 서비스 제공
2. `access token` 이 만료되면 서버에서 `access token` 만료 응답을 내려줌
3. 클라이언트는 access token 만료응답을 받고 재발급을 위해 `access token + refresh token` 을 함께 보냄
4. 서버는 `refresh token` 의 만료 여부를 확인
5. `acces token` 으로 유저 정보(username 또는 userid) 를 획득하고 저장소에 해당 유저 정보를 key 값으로 한 value 가 `refresh token` 과 일치하는지 확인
6.  4 - 5 번의 검증이 끝나면 새로운 토큰 세트 (access + refresh ) 발급
7. 서버는 `refresh token` 저장소의 value 업데이트

## 참고

- [JWT Token 확인 가능한 사이트](https://jwt.io)
- [참고한 블로그](https://bcp0109.tistory.com/321)