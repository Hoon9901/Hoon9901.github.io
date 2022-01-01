---
title: 'Gatsby로 블로그를 만들기'
date: 2021-09-28 00:09:36
tags :
    - Gatsby
    - Blog
keywords :
    - Gatsby
    - 블로그
    - 제작
---

처음에는 Jekyll로 블로그를 만들었는데 생각보다 마음에 안들어서, 검색하다보니 Gatsby를 발견했다.
Gatsby는 `React` 프레임워크를 기반으로 만들었는데 React를 전에 한번 입문해봐서 이걸로 선택했다.
<br>
<br>
처음에는 `npm`으로 node module를 설치해서 환경을 구성했는데. 후반에 가니깐 한번 꼬이니깐 계속 꼬여서
npm을 재설치하고 시간을 많이 잡아 먹었다. 그래서 `yarn`으로 다시 패키지 설치하고 하니 잘되더라.
<br>
<br>
# 1. Gatsby 설치

## Gatsby-cli 설치
패키지 매니저를 통해서 `gatsby-cli`를 설치한다.
``` sh
# npm
npm install -g gatsby-cli
```
```sh
# yarn
yarn add gatsby-cli
```

## 테마 설치
```sh
gatsby new [디렉터리 이름] [테마 깃허브 주소]
```
디렉터리에 다운받은 테마가 위치된다.
```sh
cd [디렉터리 이름]
yarn start
```

그후 [localhost:8000](localhost:8000) 를 접속해서 설치한 테마를 맛본다.

# 2. 나만의 블로그로 꾸미기
## 포스트 위치
다음 위치에서 블로그 포스팅을 추가할 수 있다.

- `content/blog` : 포스트 파일 위치
- `content/__about` : 프로필 파일 위치

<br>

포스트 파일은 `.markdown` 또는 `.md`을 사용한다.
<br>

## 메타데이터
`gatsby-config.js` 파일이나 `gatsby-meta-config.js`파일에서 
<br>
블로그를 설정하는
여러 요소를 수정할 수 있다.
원하는 설정으로 수정하면된다.

그 외의 설정은 
`gatsby-browser.js`, `gatsby-node.js`을 참고

## CSS 파일
`src/styles` 위치에서 CSS 속성들을 수정할 수 있다.

<br>
직접 설정을 다하면 글을 한번 작성해봐서 깃허브 저장소나 자신만의 서버에서 배포하면된다.

# 3. SEO 적용
SEO는 `search engine optimization`로 검색 엔진 최적화, 구글이나 네이버에서 우리 블로그를 찾기 쉽도록 사이트를 개선하는 프로세스이다.

## sitemap.xml 생성
검색엔진에 검색이 잘 되게 할려면 웹 크롤러가 우리 사이트를 찾아와 크롤링을 하는데, 우리는 이정표를 만들어줘야한다.
`sitemap.xml`이 이정표 역활을 한다.
<br>
gatsby는 `sitemap.xml`을 자동 생성해주는 플러그인이 있다. 추가하자
<br>
<br>
`gastby-config.js`
```js
    plugins: [
        ...
        'gatsby-plugin-sitemap',
    ]
```
plugins에 추가하면 build 될 때 마다 파일을 생성해준다.

<br>
그 후 플러그인을 설치하고, gatsby를 실행 한다.

```sh
yarn add gatsby-plugin-sitemap
gatsby develop
```

[http://localhost:8000/sitemap.xml](http://localhost:8000/sitemap.xml)에 접속

```xml
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
    <url>
    ...
    </url>
</urlset>
```
위와 같은 xml 형식의 문서가 나오면 성공.

## rss.xml 생성
rss는 사이트를 방문하지 않아도 그 사이트의 새로운 글이 올라오면 알람을 준다고 생각하면된다.
그리고 rss를 등록하는것도 검색엔진최적화 작업에 해당된다.

```sh
yarn add gatsby-plugin-feed
```
`sitemap`과 마찬가지로 build 할때마다 새로운 파일을 생성해야 하니 plugins에 추가하자.

`gastby-config.js`
```js
    plugins: [
        ...
        'gatsby-plugin-feed',
    ]
```
`rss.xml` 이 제대로 생성됬는지 확인하자
```sh
gatsby develop
```
그 후 [http://localhost:8000/rss.xml](http://localhost:8000/rss.xml)에 접속
<br>
`rss.xml` 페이지가 제대로 나온다면 성공.

## robots.txt 생성
`robots.txt`도 웹 크롤러가 사이트에 접속하면 찾는 파일이므로 만들어준다.

```sh
yarn add gatsby-plugin-robots-txt
```
`gastby-config.js`

```js
plugins: [
	...
	{
      resolve: 'gatsby-plugin-robots-txt',
      options: {
        host: 웹사이트경로,
        sitemap: 웹사이트경로/sitemap.xml',
        policy: [{
          userAgent: '*',
          allow: '/'
        }]
      }
    },
	...
]
```
그리고 빌드해서 확인.

```sh
gatsby develop
```
그 후 [http://localhost:8000/robots.txt](http://localhost:8000/robots.txt)에 접속해
`robots.txt`가 생성됬는지 확인한다.

## 구글 서치 콘솔(GSC) 등록
[구글등록](https://search.google.com/search-console/about)에서 시작하기를 통해 등록한다.
우측에 URL 접두어를 선택하고 인증용 html 파일을 다운로드한다.
다운받은 html 파일은 프로젝트 경로에 복사하고 `package.json`에서 build 스크립트를 작성한다.
<br>
`package.json`

```json
  "scripts": {
        ...
        "copy" : "cp content/google인증용파일.html public/",
        "build": "gatsby build && npm run copy",
        ...
  }
```
빌드시 `npm run copy`를 통해 인증 html 파일을 public 경로로 복사해 줄 것이다.

```
yarn build
gatsby serve
```
를 통해 "http://localhost:9000/google인증파일.html" 접속해서 잘 뜨는지 확인한다.
그리고 sitemaps 메뉴내에 빈칸에 `sitemap.xml` 입력하고 제출한다.

그러면 구글검색엔진에 등록되기까진 몇시간정도 걸리므로 기다리고 검색창에 `site: 블로그주소` 를 입력해서 확인하자.


## 네이버 검색 노출

네이버 검색도 구글에 하던것처럼 하면된다.
https://searchadvisor.naver.com/console/board 접속해서 사이트를 등록한다.
- 좌측 사이드바 메뉴에서 요청 - 사이트맵 제출에서 sitemap.xml의 경로를 입력한다.
- 요청 - RSS 제출에서도 마찬가지로 경로를 입력한다.
- 검증 - robots.txt에서 robots.txt 검증 및 수집요청을 한다.
- 설정 - 수집 주기 설정을 빠르게를 체크한다.
모든 등록이 끝났으면 몇시간뒤에 검색창에서 `site: 블로그주소`를 입력해서 등록됬는지 확인한다.

## 다음 검색 노출
다음은 다른 검색엔진보다 매우 간단해서.
https://register.search.daum.net/index.daum에 접속해서 블로그를 등록만하면 끝이다.


# 끝으로
이렇게 간단하게 겟츠비를 통해서 블로그를 만들고 SEO 적용까지 해봤다.
생략된 부분도 많지만 충분히 참고할 수 있을 것이다.
React를 잘 사용하거나 앞으로 사용해야하는 개발자가 블로그를 만들게 된다면
Gatsby로 만들어보는 것을 추천한다. 테마로 만들어도 되지만 자신이 직접 react로 만들어도 좋을것이다.
<br>
만약에 블로그를 수정하다가 `npm` 관련 오류가 발생한다면, yarn으로 전환해서 구축하거나,
npm 패키지를 재설치 해보자.


