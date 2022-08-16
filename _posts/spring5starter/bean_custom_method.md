---
title: '[Spring] InitializingBean, DisposableBean 구현없이 초기화/소멸 메소드 실행하기'
date: 2022-07-22
tags:
  - Spring
  - 스프링5입문시리즈
keywords :
  - 스프링
  - 스프링부트
  - SpringBoot
  - InitializingBean
  - DisposableBean
---
모든 클래스가 `InitializingBean`, `DisposableBean` 인터페이스를 상속받아 구현할 수 있는 것은 아니다. 

외부에서 제공받은 클래스(외부 라이브러리 등)를 스프링 `Bean` 객체로 설정하고 싶을 때도 있다. 이 경우에는 소스코드를 수정하지 않는 이상 두 인터페이스를 구현할 수 없다. 

이렇게 해당 인터페이스를 구현할 수 없거나 이 두 인터페이스를 사용하고 싶지 않은 경우에는 스프링 설정에서 직접 메소드를 지정할 수 있다.

## 1. @Bean 태그 속성으로 메소드 지정

```java
public class Client2 {

    private String host;

    public void setHost(String host) {
        this.host = host;
    }

    public void connect() {
        System.out.println("Client2.connect() 실행");
    }

    public void send() {
        System.out.printf("Client2.send() to " + host);
    }

    public void close() {
        System.out.printf("Client2.close() 실행");
    } 
}
```

`Clien2` 클래스를 빈으로 사용하려면(Client2가 외부 라이브러리에서 제공하는 클라이언트 인 경우도 포함) 초기화 과정에서 `connect()` 메소드를 실행하고 소멸 과정에서 `close()` 메소드를 실행해야 한다면 다음과 같이 `@Bean` 어노테이션의 속성을 지정해주면 된다.

```java
@Bean(initMethod = "connect", destroyMethod = "close")
    public Client2 client2() {
        Client2 client2 = new Client2();
        client2.setHost("외부 라이브러리");
        return client2;
    }
```

- `initMethod` 속성 : 초기화 과정에 사용할 메소드 이름 지정
- `destoryMethod` 속성 : 소멸 과정에 사용할 메소드 이름 지정

⚠️ `initMethod`, `destroyMethod` 속성에 지정한 메소드는 파라미터가 없어야한다. 
파라미터가 존재할 경우 스프링 컨테이너는 예외를 발생시킨다.

위 설정을 추가한뒤 스프링을 실행하자. 
다음과 같이 `Clien2`  빈 객체를 위한 초기화/소멸 메소드가 실행된 것을 알 수 있다.

```java
Client2.connect() 실행
7월 22, 2022 11:09:53 오전 org.springframework.context.support.AbstractApplicationContext doClose
정보: Closing org.springframework.context.annotation.AnnotationConfigApplicationContext@4b952a2d: startup date [Fri Jul 22 11:09:53 KST 2022]; root of context hierarchy
Client2.close() 실행
Client.destroy() 실행]
```

## 2. 빈 설정 메소드에서 직접 초기화

설정 클래스는 자바 코드이므로 `initMethod` 속성을 사용하는 대신 다음과 같이 빈 설정 메서드에서 직접 초기화를 수행해도 된다.

```java
@Bean(destroyMethod = "close")
    public Client2 client3() {
        Client2 client2 = new Client2();
        client2.setHost("외부 라이브러리");
        **client2.connect(); // 직접 초기화 메소드 호출**
        return client2;
    }
```

## 3. 설정 코드에서 커스텀 초기화 메소드 실행 시 주의할점

초기화 메소드가 두번 불리지 않도록 하는 것

```java
		@Bean
    public Client client() {
        Client client = new Client(); // initializingBean 구현체임
        client.setHost("외부 라이브러리");
        client.afterPropertieset();
        return client2;
    }
```

이 코드는 빈 설정 메소드에서 `afterProperitesSet()` 메소드를 호출한다. 그런데 `Client` 클래스는 `InitalizingBean` 인터페이스를 구현했기 때문에 스프링 컨테이너는 빈 객체 생성 이후 `afterPropertiesSet()`메소드를 실행한다. 즉 해당 메소드가 두번 호출되는 것이다.

초기화 관련 메소드를 빈 설정 코드에서 직접 실행할 때는 이렇게 초기화 메소드가 두번 호출되지 않도록 주의해야한다.