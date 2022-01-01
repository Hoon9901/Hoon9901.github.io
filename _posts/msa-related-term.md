---
title: '마이크로서비스 아키텍처(MSA) 관련 용어 정리'
date: 2021-09-28 19:09:45
tags :
    - MSA
    - 마이크로서비스 아키텍쳐
    - 정리
keywords :
    - MSA
    - 마이크로서비스
    - 아키텍쳐
    - 용어 정리
---

개인적으로 참고할려고 기록하는 글입니다.

## MSA 구성요소 및 패턴의 유형

- 인프라 구성요소 : 마이크로서비스를 지탱하는 하부구조 인프라를 구축하는데 필요한 구성요소
- 플랫폼 패턴 : 인프라 위에서 마이크로서비스의 운영과 관리를 지원하는 플랫폼 차원의 패턴
- 애플리케이션 패턴 : 마이크로서비스 애플리케이션을 구성하는데 필요한 패턴

## 서비스 유형별 대표적인 클라우드 서비스

- `Iaas(Infrastructure as a Service)` :
  가상 머신, 스토리지, 네트워크 같은 인프라를 필요한 만큼 적시에 제공하는 서비스
  (예시 : AWS EC2, GCP Compute Engine, Azure VM)

- `CaaS(Container as a Service)` :
  컨테이너 기반 가상화를 사용해 컨테이너를 업로드, 구성, 실행, 확장, 중지할 수 있는 서비스
  (예시 : Google Kubernetes Engine, AWS ECS)

- `Paas(Platform as a Service)` : 애플리케이션을 즉시 개발, 실행, 관리할 수 있는 플랫폼 환경 서비스
  (예시 : Azure Web App, Google App Engine, Heroku, AWS Elastic Beanstalk)

## 개발 지원 환경 DevOps

- `DevOps` : 마이크로서비스를 빌드하고 테스트한 뒤 배포할 수 있게 도와주는 개발 지원 환경

- `CI/CD` - 자동화된 빌드나 배포작업,

  - `CI`는 `지속적 통합(Continuous Integration)` 자동으로 통합 및 테스트하고 그 결과를 기록하는 활동
  - `CD`는 `지속적 제공(Continuous Delivery)` 및 `지속적 배포(Continouss Deployment)` 실행환경에 내보내는 활동
  - `지속적 제공`은 빌드된 소스코드의 실행 파일을 실행환경에 반영하기 위해 승인 및 배포 담당자의 허가를 받아야하고
    배포도 수동으로 처리한다.
  - `지속적 배포`은 소스코드 저장소(Github)에서 빌드한 소스코드의 실행 파일을 실행 환경 까지 자동으로 배포하는 방식
    모든 영역을 자동화하는 것에 해당함.

- `Infrastructure as a Code` - 인프라 구성을 마치 프로그래밍하는 것 처럼 처리하고 소수의 인원으로 컨테이너 배포 처리하는 과정
  (배포 파이프라인 절차를 코드로 완벽히 자동화)

## MSA 주요 아키텍처 패턴

- Spring Cloud + DevOps
  - Spring Cloud : Spring Boot + Netflix OSS

## 참고한 자료

- [도메인 주도 설계로 시작하는 마이크로서비스 개발](http://www.yes24.com/Product/Goods/98880996)