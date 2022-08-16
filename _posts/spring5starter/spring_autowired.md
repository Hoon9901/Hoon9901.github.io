---
title: '[Spring] @Autowird 어노테이션을 이용한 의존 자동 주입과 @Qualifier 빈 한정자'
date: 2022-06-23
tags:
  - Spring
  - 스프링5입문시리즈
keywords :
  - 스프링
  - 스프링부트
  - SpringBoot
  - Autowired
  - DI
---
# @Autowired 어노테이션을 이용한 의존 자동 주입
## 자동 주입 기능을 사용하지 않은 코드 (직접 의존 주입)
````java
    @Bean
    public MemberDao memberDao(){
        return new MemberDao();
    }
    
    @Bean
    public ChangePasswordService changePwdSvc() {
        ChangePasswordService pwdSvc = new ChangePasswordService();
        **pwdSvc.setMemberDao(memberDao());**
        return pwdSvc;
    }
````
위 코드에서는 직접 세터 메소드를 통해 의존 주입을 하고있다 <br/>
자동 주입 기능을 사용하면 스프링이 알아서 의존 객체를 찾아서 주입한다.

```java
    @Bean
    public MemberDao memberDao(){
        return new MemberDao();
    }
    
    @Bean
    public ChangePasswordService changePwdSvc() {
        ChangePasswordService pwdSvc = new ChangePasswordService();
        return pwdSvc;
    }
```

자동 주입 기능을 사용하면, 위 코드 처럼 의존 객체를 명시하지 않아도,<br/>
스프링이 필요한 의존 Bean 객체를 찾아서 주입해준다.

# 자동 주입 기능 사용
매우 간단하다. 의존을 주입할 대상에 @Autowired 어노테이션을 붙이기만 하면 된다.
## @Autowired 

Bean 객체의 메소드에 @Autowired 어노테이션을 붙이면 스프링은 해당 메서드를 호출한다.
</br> 이때 메서드 파라미터 타입에 해당하는 Bean 객체를 찾아 인자로 주입한다.

```java
@Bean
public MemberDao memberDao(){
        return new MemberDao();
        }


// 1. 필드 자동 주입
@Autowired
private MemberDao mebmerDao;

// 2. 메서드 자동 주입
@Autowired
public void setMemberDao(MemberDao memberDao) {
    this.memberDao = memberDao;
}
```

@Autowired 어노테이션을 필드나, 세터 메서드에 붙이면 
</br> 스프링은 타입이 일치하는 Bean 객체를 찾아서 주입한다.

## 자동 주입 예외 케이스
### 주입해야할 빈 객체가 없다면?
```
Error creating bean with name 'memberRegSvc': Unsatisfied dependency expressed through field 'memberDao'; 
nested exception is org.springframework.beans.factory.NoSuchBeanDefinitionException: No qualifying bean of type 'com.example.sp5chap04.spring.MemberDao' available: expected at least 1 bean which qualifies as autowire candidate
```
memberRegSvc Bean 객체가 생성하는 도중, 의존하는 memberDao 객체를 스프링이 찾이를 못해 `NoSuchBeanDefinitionException` 
</br> 예외가 발생했다.

### 주입해야할 빈이 두개 이상이면?
```java
    // MemberPrinter 를 주입받는 세터 메서드
	@Autowired
    public void setMemberPrinter(MemberPrinter printer) {
        this.printer = printer;
    }
    
    // 동일한 Bean 객체를 생성한다
    @Bean
    public MemberPrinter memberPrinter1() {
        return new MemberPrinter();
    }

    @Bean
    public MemberPrinter memberPrinter2() {
        return new MemberPrinter();
    }
```
해당 코드 처럼, MemberPrinter 타입의 Bean 객체가 2개 정도 만들어진 상태에서는 어떻게 될까?

```
springframework.beans.factory.NoUniqueBeanDefinitionException: No qualifying bean of type 'com.example.sp5chap04.spring.MemberPrinter' available: expected single matching bean but found 2: memberPrinter1,memberPrinter2
```

MemberPrinter 타입의 빈이 여러개 있어서, 한정할 수 없는데, </br>
해당 타입 빈이 한개가 아니라, 이름이 memberPrinter1, memberPrinter2 인 두개의 빈을 </br>
발견 했다는 사실을 알려준다. </br>

## @Qualifier 어노테이션
자동 주입 가능한 빈이 두 개 이상이면 자동 주입할 빈을 지정하는 방법이 필요할 때 시용한다. <br/>
@Qualifier 어노테이션을 사용하면 자동 주입 대상 빈을 한정할 수 있다.

```java
@Configuration
public class AppCtx {
    
    ...
    
    @Bean
    **@Qualifier("printer")**
    public MemberPrinter memberPrinter1(){
        return new MemberPrinter();
    }

    @Bean
    public MemberPrinter memberPrinter2() {
        return new MemberPrinter();
    }
}
```
위 코드에서 memberPrinter1() 메소드에 "printer" 값을 갖는 @Qualifier 어노테이션을 붙였다 <br/>
이 설정은 해당 Bean의 한정 값으로 "printer"를 지정한다.

이렇게 지정한 한정 값은 @Autowired 어노테이션에서 자동 주입할 빈을 한정할 때 사용한다.
```java
public class MemberListPrinter{
    
    ...
    
	@Autowired
	@Qualifier("printer")
	public void setMemberPrinter(MemberPrinter printer) {
		this.printer = printer;
	}
}
```
setMemberPrinter() 메소드에 @Autowired 어노테이션을 붙였으므로 MemberPrinter 타입의 빈을 자동 주입한다. <br/>
이떄 @Qualifier 어노테이션 값이 "printer" 이므로 한정 값이 "printer"인 Bean을 의존 주입 후보로 사용한다.

@Autowired 어노테이션을 필드, 메서드에 모두 적용할 수 있으므로 @Qualifier 어노테이션도 필드, 메소드 모두 적용할 수 있다.