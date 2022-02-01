---
title: 'asdf 를 이용한 JAVA 버전 별 설치'
date: 2022-01-05
tags:
  - JAVA
  - 자바
  - asdf
keywords :
  - 자바
  - 버전
  - JAVA
  - asdf
---
# asdf란? ([asdf 설치 하기](https://subicura.com/mac/dev/terminal-apps.html#asdf))

asdf-vm은 mac OS의 각종 프로그램의 버전을 손쉽게 관리해주는 **성의 없어 보이는 이름**의 도구입니다.<br/>
기존에 nvm, rbenv등 언어, 프로그램별로 달랐던 관리 도구를 하나로 통합해서 사용할 수 있습니다. <br/>
homebrew도 일부 버전 관리 기능을 제공하지만 asdf만큼 강력하지 않습니다.<br/>
asdf를 이용하면 버전 별로 설치할 수 있는 장점이 있습니다.<br/>
그래서 이번에는 Java 8 JDK와, Java 11 JDK 를 둘다 설치하는 것을 해보겠습니다.<br/>


## 시작

```json
❯ java --version
openjdk 11.0.13 2021-10-19 LTS
OpenJDK Runtime Environment Zulu11.52+13-CA (build 11.0.13+8-LTS)
OpenJDK 64-Bit Server VM Zulu11.52+13-CA (build 11.0.13+8-LTS, mixed mode)
```

현재 저의 자바 jdk 버전은 11입니다. 저는 jdk 8 버전의 자바 환경도 만들고 싶습니다. 
<br/>그럴려면 환경변수도 매번 지정해줘야하는 번거로움이 있습니다. 
<br/>asdf 를 이용해서 8버전과 11버전을 유연하게 돌아가며 사용할 수 있는 환경을 만들어 보겠습니다.

### 이전에 이미 설치한 JAVA JDK 는 어떡합니까?

만약 brew를 통해서 java를 설치하신 분이라면 brew uninstall 을 통해 jdk를 삭제하면 되고.

아니면 아래 명령어를 통해 삭제하시면 됩니다.

```json
❯ sudo rm -fr /Library/Internet\ Plug-Ins/JavaAppletPlugin.plugin
❯ sudo rm -fr /Library/PreferencesPanes/JavaControlPanel.prefPane
❯ sudo rm -fr ~/Library/Application\ Support/Java

❯ cd /Library/Java/JavaVirtualMachines/ 
❯ ls 
❯ sudo -rm -rf jdk-x.x.x.jdk
```

### JAVA Plugin 추가

[asdf-java plugin 깃허브 링크](https://github.com/halcyon/asdf-java#java_home)

- 먼저 자바 플러그인을 추가합니다

```json
❯ asdf plugin-add java https://github.com/halcyon/asdf-java.git
```

### 자바 플러그인 업데이트

플러그인 목록을 최신화합니다.

```json
❯ asdf plugin update java
```

### 자바 버전 별 플러그인 보기

아래 명령어를 이용하면 설치할 수 있는 자바의 버전들이 나타납니다.

```json
❯ asdf list-all java
...
sapmachine-jre-18-internal.0
temurin-17.0.0+35
temurin-17.0.1+12
temurin-jre-17.0.1+12
zulu-8.52.0.23
zulu-8.54.0.21
zulu-8.56.0.23
zulu-8.58.0.13
zulu-11.43.1017
zulu-11.43.1021
zulu-11.45.27
zulu-11.48.21
zulu-11.50.19
zulu-11.52.13
zulu-13.35.1019
zulu-13.35.1025
zulu-13.37.21
zulu-13.40.15
zulu-13.42.17
zulu-13.44.13
zulu-15.28.1013
zulu-15.29.15
zulu-15.32.15
zulu-15.34.17
zulu-15.36.13
zulu-16.28.11
zulu-16.30.15
zulu-16.30.19
zulu-16.32.15
zulu-17.28.13
zulu-17.30.15
...
```

(오라클 jdk는 설치안하는것을 추천합니다. [[JDK 라이선스 유료화]](https://zdnet.co.kr/view/?no=20181102140004)

### JAVA 8, 11 버전 설치

자바 8버전과 11버전의 openjdk를 설치하겠습니다.

```json
❯ asdf install java zulu-8.58.0.13
❯ asdf install java zulu-11.52.13
```

### asdf 설치한 자바 버전 확인하기

아래 명령어를 통해, 설치된 자바 버전들을 볼수있습니다.

```json
❯ asdf list java
  zulu-11.52.13
  zulu-8.58.0.13
```

### Global 버전으로 지정하기

설치한 버전을 전역 버전으로 지정합니다. 즉 내 컴퓨터의 자바 버전을 지정한 버전으로 설정합니다.

저는 8버전을 지정했습니다.

```json
❯ asdf global java zulu-8.58.0.13
```

### JAVA_HOME 설정하기

[sadf java-plugin JAVA_HOME 설정](https://github.com/halcyon/asdf-java#java_home)

아래 명령어를 실행하면, 자바 위치를 지정합니다. (처음 한번만 실행하면 됩니다)

```json
. ~/.asdf/plugins/java/set-java-home.zsh
```

### 자바 버전 확인하기

아래 명령어를 통해 정상적으로 설치되었는지 확인합니다.

```json
❯ java -version
openjdk version "1.8.0_312"
OpenJDK Runtime Environment (Zulu 8.58.0.13-CA-macos-aarch64) (build 1.8.0_312-b07)
OpenJDK 64-Bit Server VM (Zulu 8.58.0.13-CA-macos-aarch64) (build 25.312-b07, mixed mode)
```

정상적으로 8버전의 jdk가 나오는 것을 볼 수 있습니다.

또한 자바 환경 변수 위치까지 jdk 8로 변경된 것 을 볼 수 있습니다.

```json
❯ echo $JAVA_HOME
/Users/seonghun/.asdf/installs/java/zulu-8.58.0.13/zulu-8.jdk/Contents/Home
```

### 현재 전역으로 설정된 버전들 보기

자바 뿐만 아니라 다른 프로그램들의 버전 현황을 볼 수 있습니다. (global version)

```json
❯ asdf current
java            zulu-8.58.0.13  /Users/seonghun/.tool-versions
nodejs          lts-fermium     Not installed. Run "asdf install nodejs lts-fermium"
yarn            1.22.17         /Users/seonghun/.tool-versions
```

### 자바 버전 변경하기

아래 명령어를 통해 11버전의 자바 jdk 로 변경하겠습니다.

```json
❯ asdf global java zulu-11.52.13
```

그 후 정상적으로 버전이 변경됬는지 확인하겠습니다.

```json
❯ java --version
openjdk 11.0.13 2021-10-19 LTS
OpenJDK Runtime Environment Zulu11.52+13-CA (build 11.0.13+8-LTS)
OpenJDK 64-Bit Server VM Zulu11.52+13-CA (build 11.0.13+8-LTS, mixed mode)
```

8버전에서 11버전으로 변경된 것 을 확인할 수 있습니다.

아래 명령어로 자바 환경변수 경로까지 자동으로 변경된 것 을 볼수있습니다.

```json
❯ echo $JAVA_HOME
/Users/seonghun/.asdf/installs/java/zulu-11.52.13/zulu-11.jdk/Contents/Home
```

### 결론

`asdf globale java <version>` 명령어 한 줄 만으로 자바 버전을 쉽게 변경할 수 있었습니다.

(원래라면 자바 버전을 버전마다 변수로 추가해줘야함)

자바 뿐만 아니라 npm, yarn 같은 패키지 매니저 또한 지원하니 검색해서 유용하게 쓰시면 되겠습니다.

---

[참고](https://www.wiserfirst.com/blog/install-java-with-asdf/)

[subicura 님 mac asdf 설치](https://subicura.com/mac/dev/terminal-apps.html#asdf/)

[맥에서 Brew로 자바 설치하기(자바 버전 바꾸기)](https://llighter.github.io/install-java-on-mac/)