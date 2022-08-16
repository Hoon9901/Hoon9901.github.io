---
title: '[Spring] 빈 객체의 생성과 관리 범위(@Scope 어노테이션)'
date: 2022-08-16
tags:
  - Spring
  - 스프링5입문시리즈
keywords :
  - 스프링
  - 스프링부트
  - SpringBoot
  - Scope
  - Singletone
  - Prototype
---
## 싱글톤 범위
```java
Client client1 = ctx.getBean("client", Client.class);
Client client2 = ctx.getBean("client", Client.class);
```

위 코드에서 `client1` 객체와 `client2` 객체는 동일한 객체이다. 

스프링 컨테이너는 빈 객체를 한 개만 생성한다. 한 식별자에 대해 한 개의 객체만 존재하는 빈은 싱글톤(`Singleton`) 범위(`Scope`)를 갖는다. 별도 설정을 하지 않으면 빈은 싱글톤 범위를 갖는다

## 프로토타입 범위

```java
// client 빈의 범위가 프로토타입
Client client1 = ctx.getBean("client", Client.class);
Client client2 = ctx.getBean("client", CLient.class);
```

위 코드에 서 `client` 빈의 범위가 프로토타입이면 `client1` 과 `client2` 는 서로 다른 객체이다.

사용 빈도가 낮지만 빈의 범위를 프로토타입으로 지정할 수 있다. 프로토타입으로 지정하면 빈 객체를 구할 때 마다 매번 새로운 객체를 생성한다.

### 포로토타입 범위의 라이프사이클

프로토타입 범위를 갖는 빈은 완전한 라이프사이클을 따르지 않는다. 스프링 컨테이너는 프로토타입의 빈 객체를 생성하고 프로퍼티를 설정하고 초기화 작업까지는 수행하지만, 컨테이너를 종료한다고 해서 반드시 생성한 프로토타입 빈 객체의 소멸 메서드를 실행하지는 않는다. **따라서 프로토타입 범위의 빈을 사용할 때는 빈 객체의 소멸 처리를 직접해야한다**

## @Scope 어노테이션

### 프로토타입 범위 지정

특정 빈을 프로토타입 범위로 지정하려면 다음과 같이 사용하면 된다.

```java
@Bean
**@Scope("prototype")**
public Client client() {
	Client client = new Client();
	client.setHost("host");
	return client;
}
```

- @Bean 어노테이션과 함께 @Scope 어노테이션을 “prototype” 값을 갖도록 한다

### 싱글톤 범위 지정

싱글톤 범위를 명시적으로 지정하고 싶다면 다음과 같이 사용하면 된다.

```java
@Bean(initMethod = "connect", destroyMethod = "close")
@Scope("singleton")
public Client2 client2() {
	Client2 client = new Client2();
	client.setHost("host");
	return client;
}
```

- @Bean 어노테이션과 함께 @Scope 어노테이션을 “singleton” 값을 갖도록 한다