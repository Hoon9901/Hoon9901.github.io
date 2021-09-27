---
title: '[스프링부트] 속성 외부화'
date: 2021-09-27 19:09:93
category: 프로그래밍
thumbnail: { thumbnailSrc }
draft: false
---

#application.properties

스프링 애플리케이션은 다음 리소스가 주어진 순서대로 고려된다.

1. 명령행 인수
2. 패키징된 애플리케이션 외부의 `application.properties`
3. 패키징된 애플리케잇녀 내부의 `application.properties`

application-{profile}.properties는 프로필에 관련되지 않은 파일 보다 우선된다.

1. 명령행 인수
2. 패키징된 애플리케이션 외부의 `application-{profile}.properties`
3. 패키징된 애플리케이션 외부의 `application.properties`
4. 패키징된 애플리케이션 내부의 `application-{profile}.properties`
5. 패키징된 애플리케이션 내부의 `application.properties`

##application.properties 에서 속성 값 사용하기
속성 외부화를 위해 우리가 만든 application.properties를 사용할려면 `@Value` 어노테이션을 사용해야한다.
`@Value` 어노테이션은 스프링이 속성을 찾고 해당 속성의 값을 사용하도록 지시한다.

```java
public 리턴타입 메소드(@Value("${hi}") int hi) {
  ...
}
```

스프링은 hi라는 이름을 가진 속성을 감지하고 그 값을 사용한다.

또한 `:`을 사용해 기본값을 지정할 수 있다.

```java
public 리턴타입 메소드(@Value("${hi:10}") int hi) {
  ...
}
```

만약 `:` 기본값을 지정하면 값을 찾지 못했을 때 10을 기본값으로 사용한다.
기본값을 정의하지 않고, 해당 속성이 없을 때 `IllegalArgumentException`이 발생한다.

##프로필을 사용한 속성 재정의
스프링 부트는 프로필을 사용해 추가 구성 파일을 불러와 기존의 application.properties를 전부 대체 또는 일부를 재정의할 수 있다.
`application-{profile}.properties`를 만들면 된다.
만약에 `application.properties`에 `hi` 값이 있고, `application-hi.properties`에 `hi`라는 값이 있으면
`application-hi.properties`의 속성 우선순위가 높기 때문에 대체된다.

##다른 속성 파일로부터 속성 불러오기
내가 사용하고 싶은 속성 파일을 불러오고자 하면은, `@SpringBootApplication` 어노테이션이 붙은 클래스에
`@PropertySource` 어노테이션을 추가해 사용할 수 있다.

```java
@PropertySource("classpath:임의의속성파일.properties")
@SpringBootApplication
public class MySpringApp {
...
}
```

`@PropertySource` 어노테이션은 스프링부트가 시작할 때 추가 속성 파일을 불러와준다.
해당 어노테이션 대신 밑에 표의 매개변수를 사용하면 스프링 부트가 추가 속성 파일을 불러온다.

| 매개변수                          |                         설명 |
| :-------------------------------- | ---------------------------: |
| spring.config.name                |             불러올 파일 목록 |
| spring.config.location            |             속성 파일의 위치 |
| spring.config.additional-location | 속성 파일을 불러올 추가 위치 |

위 매개변수를 사용하면, application.properties는 불러오지 않는다.
모두 검색하는 방법으로는 `--spring.config.name=application,불러올속성파일`을 사용한다.
