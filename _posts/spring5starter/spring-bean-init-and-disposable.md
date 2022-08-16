---
title: '[Spring] 빈 객체의 초기화와 소멸 : initalizingBean과 DisposableBean 인터페이스 '
date: 2022-07-14
tags:
  - Spring   
  - 스프링5입문시리즈
keywords :
  - 스프링
  - 스프링부트
  - SpringBoot
  - Spring5
  - bean
  - lifecycle
---
스프링 컨테이너는 빈 객체를 초기화하고 소멸하기 위해 빈 객체의 지정한 메서드를 호출한다. 스프링은 다음의 두 인터페이스에 이 메서드를 정의한다.

- org.springframework.beans.factory.**initalizingBean**
- org.springframework.beans.factory.**DisposableBean**

두 인터페이스는 다음과 같다

```java
public interface initalizingBean {
	void afterPropertiesSet() throw Exception;
}

public interface DisposableBean {
	void destroy() throw Exception;
}
```

- 빈 객체를 생성한 뒤에 **초기화 과정이** 필요 : `InitalizingBean` 인터페이스를 상속하고 afterPropertiesSet() 메소드를 구현한다.
- 빈 객체의 **소멸 과정이** 필요 :  `DisposableBean` 인터페이스를 상속하고 `destroy()` 메소드를 구현한다.

### 초기화와 소멸과정이 필요한 예

1. 데이터베이스 커넥션 풀
    
    커넥션 풀을 위한 빈 객체는 초기화 과정에 데이터베이스 연결을 생성한다. 컨테이너를 사용하는 동안 연결을 유지하고 빈 객체를 소멸할 때 사용중인 데이터베이스 연결을 끊어야 한다.
    
2. 채팅 클라이언트
    
    채팅 클라이언트는 시작할 때 서버와 연결을 생성하고 종료할 때 연결을 끊는다. 이때 서버와의 연결을 생성하고 끊는 작업을 초기화/소멸 시점에 수행하면 된다.
    

### 간단한 코드 예제를 통해 알아보기

간단하게 빈 객체의 초기화와 소멸 시점을 코드를 작성하고 실행해서 알아보자

```java
public class Client implements InitializingBean, DisposableBean {

    private String host;

    public void setHost(String host) {
        this.host = host;
    }

    @Override
    public void afterPropertiesSet() throws Exception {
        System.out.println("Client.afterPropertiesSet() 실행");
    }

    public void send() {
        System.out.println("Client.sned() to " + host);
    }

    @Override
    public void destroy() throws Exception {
        System.out.println("Client.destroy() 실행");
    }
}
```

실행되는 순서를 알아보기 위해 콘솔에 관련 메세지를 출력하도록 했다.

`Client` 클래스를 위한 설정 클래스는 다음과 같다.

```java
@Configuration
public class AppCtxForClient {

    @Bean
    public Client client() {
        Client client = new Client();
        client.setHost("host");
        return client;
    }

}
```

이제 `AppCtxForClient`를 이용해서 스프링 컨테이너를 생성하고 `Client` 빈 객체를 구해 사용하는 코드를 작성한다.

```java
public class Main {

    public static void main(String[] args) throws IOException {
        AbstractApplicationContext ctx = new AnnotationConfigApplicationContext(
            AppCtxForClient.class);

        Client client = ctx.getBean(Client.class);
        client.send();

        ctx.close();
    }
}
```

`Main` 클래스를 실행해보면 다음과 같은 메세지가 출력된다.

```java
Client.afterPropertiesSet() 실행
Client.sned() to host
Client.destroy() 실행
7월 14, 2022 6:06:00 오후 org.springframework.context.support.AbstractApplicationContext doClose
정보: Closing org.springframework.context.annotation.AnnotationConfigApplicationContext@4b952a2d: startup date [Thu Jul 14 18:05:59 KST 2022]; root of context hierarchy
```

1. 스프링 컨테이너 생성
2. 빈 객체 생성
3. 빈 객체 초기화
    1. `afterPropertiesSet` 메소드 실행
4. 스프링 컨테이너 종료
5. 빈 객체 소멸
    1. `destory` 메소드 실행

만약 `ctx.close()` 메소드가 실행되지 않다면 컨테이너의 종료 과정을 수행하지 않기 때문에 빈 객체의 소멸 과정도 실행되지 않는다.