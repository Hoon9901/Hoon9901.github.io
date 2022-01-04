---
title: 'SpringSecurity 란?'
date: 2022-01-04
tags:
  - Spring Security
keywords :
  - 스프링
  - 스프링부트
  - SpringBoot
  - Spring Security
---
## Spring Security란?

- Spring 기반의 애플리케이션의 보안(인증과 권한, 인가 등)을 담당하는 스프링 하위 프레임워크
- **인증**과 **권한**에 대한 부분을 **Filter** 흐름에 따라 처리
    - Filter는 Dispatcher Servlet 으로 가기전에 적용
    - 따라서 가장 먼저 URL 요청을 받는다.
    - 하지만, Interceptor는 Dispatcher와 Contoller 사이에 위치한다는 점에서 적용 시기의 차이가 있다.

### 인증(Authentication)과 인가(Authorization)

- 인증(Authentiacation) : 해당 사용자가 본인이 맞는지를 **확인**하는 절차
- 인가(Authorization) : 인증된 사용자가 요청한 자원에 접근 가능한지를 결정하는 절차

> Authentiacation → (인증 성공 후) → Authorization
> 

- Spring Security는 기본적으로 인증 절차를 거친 후, 인가 절차를 진행
- 인가 과정에서 해당 리소스에 대한 접근 권한이 있는지를 확인하게 된다.
- Spring Security에서는 이러한 인증과 인가를 위해 Principal을 아이디로, Credential을 비밀번호로 사용하는 **Credential 기반의 인증 방식을** 사용한다.
    - Principal(접근 주체) : 보호받는 리소스에 접근하는 대상
    - Credential(비밀전호) : 리소스에 접근하는 대상의 비밀번호