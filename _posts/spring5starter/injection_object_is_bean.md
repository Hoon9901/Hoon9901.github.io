---
title: '[Spring] 주입 대상 객체를 모두 빈으로 해야하나?'
date: 2022-03-21
tags:
  - Spring
keywords :
  - 스프링
  - 스프링부트
  - SpringBoot
  - Autowired
  - DI
---

# 주입 대상 객체를 모두 빈 객체로 설정해야 하나?
주입할 객체가 꼭 스프링 빈이어야 할 필요는 없다.

```java
import org.springframework.context.annotation.Configuration;

@Configuration
public class AppCtxNoMemberPrinterBean {
      private MemberPrinter printer = new MemberPrinter();
          ...
}
```
이 설정 코드는 `MemberPrinter`를 빈으로 등록하지 않았다.
이렇게 해도 정상적으로 작동한다.

객체를 스프링 빈으로 등록할 때와, 하지 않을 떄의 차이점
- 스프링 컨테이너가 객체를 관리하는지 여부
- 위 코드와 같이 설정하면 ``MemberPrinter``를 빈으로 등록하지 않으므로 스프링 컨테이너에서 `MemberPrinter`를 구할 수 없다.

```java
// MemberPrinter를 빈으로 등록하지 않았으므로
// 아래 코드는 Exception이 발생한다.
MemberPrinter printer = ctx.getBean(MemberPrinter.class);
```
스프링 컨테이너는 자동 주입, 라이프사이클 관리 등 단순 객체 생성 외에 객체 관리를

위해 다양한 기능을 제공하는데  빈으로 등록한 객체에만 적용한다

### 결론
스프링 컨테이너가 제공하는 관리 기능이 필요없고 

getBean() 메소드로 구할 필요가 없다면 빈 객체로 꼭 등록해야 하는 것을 아니다

최근에는 의존 자동 주입 기능을 프로젝트 전반에 걸쳐 사용하는 추세이기 때문에

의존 주입 대상은 스프링 빈으로 등록하는 것이 보통이다.# 주입 대상 객체를 모두 빈 객체로 설정해야 하나?
주입할 객체가 꼭 스프링 빈이어야 할 필요는 없다.