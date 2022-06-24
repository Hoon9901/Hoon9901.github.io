---
title: '[Spring] @Autowird 자동 의존 주입과 명시적 의존 주입 간의 관계'
date: 2022-06-23
tags:
  - Spring
keywords :
  - 스프링
  - 스프링부트
  - SpringBoot
  - Autowired
---
# @Configuration  클래스에서 의존 주입(명시적 주입)을 했는데 자동 주입 대상이면 어떻게 될까?

```java
public class MemberInfoPrinter {
	...
	
	**@Autowired // 자동 주입**
	@Qualifier("printer")
	public void setPrinter(MemberPrinter printer){
		this.printer = printer;
	}
}
```

MemberInfoPrinter 클래스의 setPrinter 메소드는 위와 같이 @Autowired 어노테이션이 붙어 있다.

```java
@Configuration
public class AppCtx {
	...
	
	@Bean
	@Qualifier("printer")
	public MemberPrinter memberPrinter1() {
		return new MemberPrinter();
	}

	@Bean
	@Qualifier("summaryPrinter")
	public MemberSummaryPrinter memberPrinter2() {
		return new MemberSummaryPrinter();
	}
	
	@Bean
	public MemberList listPrinter() {
		return new MemberListPrinter();
	}

	@Bean
	public MemberInfoPrinter infoPrinter() {
		MemberInfoPrinter infoPrinter = new MemberInfoPrinter();
		**infoPrinter.setPrinter(memberPrinter2()); // 세터로 의존 주입**
		return infoPrinter;
	}
}
```

`infoPrinter()` 메소드는 `MemberInfoPrinter` 클래스의 `setPrinter()` 메소드를 호출해서 `memberPrinter2` `Bean`(**이메일과 이름만 출력한다**)을 주입한다.

이 상태에서 Spring 애플리케이션을 실행하고 info 명령어를 실행해보자.

그러면 과연 info 명령어를 실행하였을 때 이메일과 이름만을 출력할까?

### 출력 결과

```java
명령어를 입력하세요:
new a@b.c ABC abc abc
등록했습니다.

명령어를 입력하세요:
info a@b.c
**[null] 회원 정보: 아이디=1, 이메일=a@b.c, 이름=ABC, 등록일=2022-06-23**
```

출력 결과를 보면 회원의 전체 정보를 보여준다. 이는 `memberPrinter2` `Bean`(`MemberSummaryPrinter` 타입 객체)이 아닌 `memberPrinter1` `Bean`을 사용해서 회원 정보를 출력한 것을 의미한다.

즉 설정 클래스(@Configuration)에서 세터 메서드를 통해 의존을 주입해도 해당 세터 메서드에 @Autowired 어노테이션이 붙어있으면 자동 주입을 통해 일치하는 빈을 주입한다.

```java
	**@Autowired // 자동 주입**
	@Qualifier("printer")
	public void setPrinter(MemberPrinter printer){ 
	// SummaryPrinter 타입 Bean이 아닌 MemberPrinter를 주입받는다.
		this.printer = printer;
	}

```

**따라서 @Autowired 어노테이션을 사용했다면 설정 클래스에서 객체를 주입하기 보다는 스프링이 제공하는 자동 주입을 사용하는 편이 낫다.**

<aside>
✅ 자동 주입을 하는 코드와 수동으로 주입하는 코드가 섞여 있으면 주입을 제대로 하지 않아서 NPE 예외가 발생했을 때 원인을 찾는데 시간이 걸릴 수 있다. 의존 자동 주입(Autowired)를 일관되게 사용해야 이런 문제가 줄어든다. @Autowired를 사용하고 있다면 일부 자동 주입을 적용하기 어려운 코드를 제외한 나머지 코드는 @Autowird를 사용하자.

</aside>