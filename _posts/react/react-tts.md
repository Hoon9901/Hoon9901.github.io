---
title: '[React] 외부 라이브러리 없이 Text To Speech(TTS)를 사용해보자'
date: 2022-07-13
tags:
  - React
keywords :
  - React
  - 리액트
  - TTS
  - TexttoSpeech
---

외부 라이브러리 없이, 웹 표준을 만족하는 API인 Web Speech API 만으로 TTS를 사용해보자.

Web Speech API는 크게 SpeechSynthesis(Text-to-Speech)와 SpeechRecognition (Asynchronous Speech Recognition) 두 가지로 나뉜다.

SpeechSynthesis는 텍스트를 음성으로 변환하는 API이고, SpeechSRecognition은 음성을 텍스트로 변환하는 APi이다. 우리가 사용해야할 API는 SpeechSynthesis이다. 해당 API는 대부분의 모던 브라우저에서는 지원된다. (해당 API가 지원하는 브라우저 목록이 궁금하다면? [https://caniuse.com/?search=speech](https://caniuse.com/?search=speech))

## 1. Web Speech API 세팅

```jsx
const pitch = 1;
const rate = 1;

async function populateVoiceList(synth: SpeechSynthesis) {
    try {
      const voices = await synth.getVoices().sort(function (a, b) {
        const aname = a.name.toUpperCase();
        const bname = b.name.toUpperCase();
        if (aname < bname) return -1;
        else if (aname === bname) return 0;
        else return +1;
      });
  
      return voices;
    } catch (error) {
      throw new Error("Failure retrieving voices");
    }
}

export async function speak(textToRead: string, synth: SpeechSynthesis) {
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = () => populateVoiceList
    }
  
    if (synth.speaking) {
      console.error("speechSynthesis.speaking")
      return
    }
    if (textToRead !== "") {
      const utterThis = new SpeechSynthesisUtterance(textToRead)
      utterThis.onend = function (event) {
      }
      utterThis.onerror = function (event) {
        console.error("SpeechSynthesisUtterance.onerror")
      }
      // utterThis.voice = voices[0]
      utterThis.pitch = pitch
      utterThis.rate = rate
      synth.speak(utterThis)
    }
}
```

`speechSynthesis.onvoiceschanged` 조건문은 우리가 사용할 수 있는 음성 목록을 가져온다.

- 해당 부분에 synth.getVoices()를 통해 임의의 사용자 지정 음성 목록을 만들면 유용하다.

이 단계를 건너뛰면 `SpeechSynthesis`에 음성을 제공하지 않아 오류가 발생할 수 있다. 비동기로 설정하지 않으면 음성 합성기가 읽기를 시도할 때 음성이 잘리거나 준비되지 않을 수 있는 문제가 발생한다.

그 후 함수의 인자로 넘어온 textToRead 문자열 검사를 한 후, synth.speak(utterThis) 함수를 사용하므로 음성 재생을 한다.

## 2. Button으로 TTS 재생

```jsx
<Button
   variant="outlined"
   startIcon={<CampaignIcon />}
   onClick={() => {
       speechSynthesis.cancel();
       speak('여름에 해당하는 이미지를 찾으세요', window.speechSynthesis);
}}>
설명 듣기
</Button>
```
mui component의 Button 컴포넌트를 구현하여 사용했다.

버튼이 클릭되면 speechSynthesis API를 종료하고, 제작한 speak 함수를 호출한다.

![Untitled](1.png)

위 와 같은 모습으로 간단하게 TTS 기능을 구현할 수 있다.

# 레퍼런스

[https://blog.seulgi.kim/2016/08/web-speechsynthesis-tts-api.html](https://blog.seulgi.kim/2016/08/web-speechsynthesis-tts-api.html)

[https://www.singlestoneconsulting.com/blog/how-to-build-a-text-to-speech-app-with-the-web-speech-api/](https://www.singlestoneconsulting.com/blog/how-to-build-a-text-to-speech-app-with-the-web-speech-api/)