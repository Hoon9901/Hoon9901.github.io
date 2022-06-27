---
title: '[Spring] 컴포넌트 스캔에 따른 충돌처리'
date: 2022-06-27
tags:
  - Spring
keywords :
  - 스프링
  - 스프링부트
  - SpringBoot
  - Component
  - ComponentScan
  - Conflict
---
컴포넌트 스캔 기능을 사용해서 자동 빈 등록할 때에는 충돌에 주의해야한다.

크게 두가지의 충돌이 발생할 수 있다.

# 1. 빈 이름 충돌

- 두개의 패키지에 같은 이름의 클래스가 존재할 때(모두 `@Component` 가 붙어있음)
- `ConflictingBeanDefinitionException` 발생함
    - 클래스를 빈으로 등록할 떄 사용한 빈 이름이 타입이 일치하지 않는(다른 타입) 클래스의 빈 이름과 충돌이 난다는 것

컴포넌트 스캔 과정에서 쉽게 발생할 수 있다. 컴포넌트 스캔과정에서 서로 다른 타입인데 같은 빈 이름을 사용하는 경우가 있다면 **둘 중 하나에 명시적으로 빈 이름을 지정해서 이름 충돌을 피해야한다**.

# 2. 수동 등록한 빈과 충돌
## 수동 등록한 빈의 경우
```java
@Component
public class MemberDao {
		...
}
```

- 해당 클래스는 컴포넌트 스캔 대상
- 자동 등록된 빈의 이름은 “`memberDao`”

다음과 같이 설정 클래스에 직접 `MemberDao` 클래스를 “`memberDao`”라는 이름의 빈으로 등록하면 어떻게 될까?

```java
@Configuration
@ComponentScan(basePackages = {"spring"})
public class AppCtx {
		@Bean
		public MemberDao memberDao() {
			MemberDao memberDao = new MemberDao();
			return memberDao;
		}
}
```

스캔할 때 사용하는 빈 이름과 수동 등록한 빈 이름이 같은 경우,

수동 등록한 빈이 우선된다. 즉 `MemberDao` 타입의 빈은 `AppCtx`에서 정의한 한개만 존재.

## 다른 이름의 빈을 수동 등록할 경우
다음과 같이 다른 이름을 사용한다면?

```java
@Configuration
@ComponentScan(basePackages = {"spring"})
public class AppCtx {
		@Bean
		public MemberDao memberDao2() {
			MemberDao memberDao = new MemberDao();
			return memberDao;
		}
}
```

이 경우 스캔 등록한 “`memberDao`” 빈과 수동 등록한 “`memberDao2`” 빈이 모두 존재한다. `MemberDao` 타입의 빈이 두 개가 생성되므로 자동 주입(`@Autowired`)하는 코드는 `@Qualifier` 어노테이션을 사용해서 알맞은 빈을 선택해야한다.