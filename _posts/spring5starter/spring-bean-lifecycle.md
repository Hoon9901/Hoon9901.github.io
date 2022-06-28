---
title: '[Spring] 스프링 컨테이너와 빈의 라이프사이클'
date: 2022-06-28
tags:
  - Spring
keywords :
  - 스프링
  - 스프링부트
  - SpringBoot
  - bean
  - lifecycle
---

# 컨테이너 라이프사이클
스프링 컨테이너는 초기화와 종료라는 라이프사이클을 갖는다.

```java
// 1. 컨테이너 초기화
AnnotationConfigApplicationContext ctx = new AnnotationConfigApplicationConfigApplicationContext(AppContext.class)

// 2. 컨테이너에서 빈 객체를 구해서 사용
Greeter g = ctx.getBean("greeter", Greeter.class);
String msg = g.greet("스프링");
System.out.println(mgs);

// 3. 컨테이너 종료
ctx.close();
```

AnnotationConfigApplicationContext의 생성자를 이용해서 컨텍스트를 객체를 생성하는데 이 시점에 스프링 컨테이너를 초기화한다. 스프링 컨테이너는 설정 클래스에서 정보를 읽어와 알맞은 빈 객체를 생성하고 각 빈을 연결하는 작업을 수행한다.

컨테이너 초기화가 완료되면 컨테이너를 사용할 수 있다. 컨테이너를 사용한다는 것은 getBean()과 같은 메서드를 이용해서 컨테이너에 보관된 빈 객체를 구한다는 것을 뜻함.

컨테이너 사용이 끝나면 컨테이너를 종료한다. 컨테이너를 종료할 때 사용하는 메서드가 close() 메서드이다. close() 메서드는 AbstractApplicationContext 클래스에 정의되어 있다. 자바 설정을 사용하는 AnnotationConfigApplicationContext 클래스 모두 AbstractApplicationContext 클래스를 상속받고 있다.

컨테이너를 초기화하고 종료할 땐 다음의 작업도 함께 수행한다.

- 컨테이너 초기화 → 빈 객체의 생성, 의존 주입, 초기화
- 컨테이너 종료 → 빈 객체의 소멸

# 빈의 라이프사이클
스프링 컨테이너는 빈 객체의 라이프사이클을 관리한다. 컨테이너가 괸리하는 빈 객체의 라이프사이클은 다음과 같다.

- 빈 객체의 라이프사이클
    1. 객체 생성
    2. 의존 설정 → 의존 자동 주입을 통한 의존 설정 수행 
    3. 초기화
    4. 소멸

스프링 컨테이너를 초기화할 때 스프링 컨테이너는 가장 먼저 빈 객체를 생성하고 의존을 설정한다. 

모든 의존 설정이 완료되면 빈 객체의 초기화를 수행한다. 빈 객체를 초기화하기 위해 스프링은 빈 객체의 지정된 메서드를 호출한다. 

스프링 컨테이너를 종료하면 스프링 컨테이너는 빈 객체의 소멸을 처리한다. 이때에도 지정한 메서드를 호출한다.