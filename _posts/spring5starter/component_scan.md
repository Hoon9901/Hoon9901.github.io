---
title: '[Spring] @Component, @ComponentScan 으로 스캔 대상 지정'
date: 2022-06-24
tags:
  - Spring
keywords :
  - 스프링
  - 스프링부트
  - SpringBoot
  - Component
  - ComponentScan
---

# @Component 어노테이션
스프링이 검색해서 빈으로 등록할 수 있도록 할려면 클래스에 `@Component` 어노테이션을 붙여야 한다.
`@Componet` 어노테이션은 해당 클래스를 스캔 대상으로 표시한다.

```java
**@Component**
public class MemberDao {
	private static long nextId = 0;
	private Map<String, Member> map = new HashMap<>();
	... 생략
}
```

`@Component` 어노테이션에 값을 주었는지에 따라 빈으로 등록할 때 사용할 이름이 결정된다.
- `value` 값을 주지 않았다면 : 클래스 이름의 첫 글자를 소문자로 바꾼 이름을 사용한다.
    - ex) `MemberDao` 클래스라면,  “`memberDao`”를 빈 이름으로 사용하고
        
        `MemberRegisterService` 클래스라면 “`memberRegisterService`”를 빈 이름으로 사용한다.
        
# @ComponentScan 어노테이션

`@Component` 어노테이션을 붙인 클래스를 스캔해서 스프링 빈으로 등록하려면 설정 클래스(`@Configuration`)에 `@ComponentScan` 어노테이션을 적용해야 한다.

```java
@Configuration
@ComponentScan(basePackages = {"com.example.sp5chap04.spring"})
public class AppCtx {

    @Bean
    @Qualifier("printer")
    public MemberPrinter memberPrinter1() {
        return new MemberPrinter();
    }

    @Bean
    @Qualifier("summaryPrinter")
    public MemberPrinter memberPrinter2() {
        return new MemberSummaryPrinter();
    }

    @Bean
    public VersionPrinter versionPrinter() {
        VersionPrinter versionPrinter = new VersionPrinter();
        versionPrinter.setMajorVersion(5);
        versionPrinter.setMinorVersion(0);
        return versionPrinter;
    }
}
```

`@Component` 어노테이션을 붙인 클래스를 검색해서 `Bean`으로 등록해주기 때문에 설정 코드가 줄어들었다.

- `basePackages` 속성 : 해당 속성값을 `{”com.example.sp5chap04.spring”}` 로 해주었다.
    - 이 속성은 스캔 대상 패키지 목록을 지정한다.
    - `“com.example.sp5chap04.spring”` 패키지와 그 하위 패키지에 속한 클래스를 스캔 대상으로 지정한다.

## 스캔 대상에서 제외하거나 포함하기

### excludeFilters 속성

`excludeFilters` 속성을 사용하면 스캔할 때 특정 대상을 자동 등록 대상에서 제외할 수 있다.

```java
@Configuration
**@ComponentScan(basePackages = {"com.example.sp5chap04.spring"}, excludeFilters = @ComponentScan.Filter(type = FilterType.REGEX, pattern = "spring\\.*Dao"))**
public class AppCtxWithExclude {

    @Bean
    public MemberDao memberDao() {
        return new MemberDao();
    }
    
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
    public VersionPrinter versionPrinter() {
        VersionPrinter versionPrinter = new VersionPrinter();
        versionPrinter.setMajorVersion(5);
        versionPrinter.setMinorVersion(0);
        return versionPrinter;
    }

}
```

`@Filter` 어노테이션의 `type` 속성 값으로  `FilterType.REGEX`를 주었다. 이는 정규표현식을 사용해서 제외 대상을 지정한다는 것을 의미한다.

`pattern` 속성은 `FilterType`에 적용할 값을 설정한다. `“spring.”`으로 시작하고 `Dao`로 끝나는 정규표현식을 지정했으므로 `spring.MemberDao` 클래스를 컴포넌트 스캔 대상에서 제외한다.

### FilterType.ASPECTJ

```java
@ComponentScan(basePackages = {"com.example.sp5chap04.spring"}, excludeFilters = @ComponentScan.Filter(type = FilterType.ASPECTJ, pattern = "spring.*Dao"))
```

`FilterType.ASPECTJ`를 필터타입으로 설정할 수 있다. 이 타입을 사용하면 정규표현식 대신 `AspectJ` 패턴을 사용해서 대상을 지정한다.

- `AspectJ` 패턴이 동작하려면 의존 대상에 `aspectjweaver` 모듈을 추가해야한다.
    
    ```java
    	<dependency>
    			<groupId>org.aspectj</groupId>
    			<artifactId>aspectjweaver</artifactId>
    			<version>1.8.13</version>
    		</dependency>
    ```
    

### FilterType.ANNOTATION

특정 어노테이션을 붙인 타입을 컴포넌트 대상에서 제외할 수도 있다.

```java
@Retention(RUNTIME)
@Target(TYPE)
public @interface NoProduct {
}

@Retention(RUNTIME)
@Target(TYPE)
public @interface ManualBean {
}
```

이 두 어노테이션을 붙인 클래스를 컴포넌트 스캔 대상에서 제외하려면 다음과 같이 `excludeFilters` 속성을 설정한다.

```java
@Configuration
@ComponentScan(basePackages = {"com.example.sp5chap04.spring"}, excludeFilters = @ComponentScan.Filter(type = FilterType.ANNOTATION, classes = {NoProduct.class, ManualBean.class ))
public class AppCtxWithExclude {

}
```

`type` 속성 값으로 `FilterType.ANNOTATION`을 사용하면 `classes` 속성에 필터로 사용할 어노테이션 타입을 값으로 준다.

```java
@ManualBean
@Component
public class MemberDao {
	...
}
```

`@ManualBean` 어노테이션을 제외 대상에 추가했으므로 `MemberDao` 클래스를 컴포넌트 스캔 대상에서 제외한다.

## FilterType.ASSIGNABLE_TYPE

특정 타입이나 그 하위 타입을 컴포넌트 스캔 대상에서 제외하려면 `ASSIGNABLE_TYPE`을 `FilterType`으로 사용한다.

```java
@Configuration
@ComponentScan(basePackages = {"com.example.sp5chap04.spring"}, excludeFilters = @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = MemberDao.class ))
public class AppCtxWithExclude {
```

`classes` 속성에는 제외할 타입 목록을 지정한다. 제외할 타입이 한 개 이상이면 배열 표기를 사용할 수 있다.

## 설정할 필터가 두개 이상

`@ComponentScan`의 `excludeFilters` 속성에 배열을 사용해서 `@Filter` 목록을 전달하면 된다.

```java
@Configuration
@CompoenentScan(basePackages = {"com.example.sp5chap04.spring"}, excludeFilters = {
	@Filter(type = FilterType.ANNOTATION, classes = ManualBean.class), 
	@Filter(type = FilterType.REGEX, pattern = "spring2\\.*")
})
```