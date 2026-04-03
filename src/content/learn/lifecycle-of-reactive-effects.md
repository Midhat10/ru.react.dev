---
title: 'Срок жизни Воздействий'
---

<Intro>

У Воздействий (Effects) иной срок жизни, чем у составных частей. Части могут появляться на экране, обновляться или исчезать. Воздействие же умеет лишь две вещи: начать связываться с чем-то и позже прекратить эту связь. Этот круг может повторяться многократно, если твоё Воздействие зависит от посылов (props) и хранимки (state), которые меняются со временем. Расписыватель даёт правило поверщику (linter), чтобы проверить, верно ли ты указал нужды своего Воздействия. Это позволяет Воздействию оставаться в ладу со свежими посылами и хранимкой.

</Intro>

<YouWillLearn>

- Чем срок жизни Воздействия отличается от круга составной части
- Как размышлять о каждом отдельном Воздействии в обособлении
- Когда твоему Воздействию нужно возобновить связь и почему
- Как определяются нужды (dependencies) твоего Воздействия
- Что значит для значения быть отзывчивым
- Что означает пустой ряд нужд
- Как Расписыватель через поверщик проверяет верность твоих нужд
- Что делать, если ты не согласен с поверщиком

</YouWillLearn>

## Срок жизни Воздействия {/*the-lifecycle-of-an-effect*/}

Каждая часть Расписывателя проходит через один и тот же жизненный круг:

- Часть *появляется*, когда её добавляют на экран.
- Часть *обновляется*, когда она получает новые посылы или хранимку, обычно в ответ на событие.
- Часть *исчезает*, когда её убирают с экрана.

**Это хороший способ размышлять о частях, но *не* о Воздействиях.** Вместо этого старайся думать о каждом Воздействии независимо от круга жизни твоей части. Воздействие описывает, как [связать сторонний строй](/learn/synchronizing-with-effects) с нынешними посылами и хранимкой. По мере того как твой устав меняется, связь нужно будет налаживать чаще или реже.

Чтобы пояснить это, рассмотри Воздействие, связывающее твою часть с узлом беседы:


```js
const serverUrl = 'https://localhost:1234';

function ChatRoom({ roomId }) {
  useEffect(() => {
    const connection = createConnection(serverUrl, roomId);
    connection.connect();
    return () => {
      connection.disconnect();
    };
  }, [roomId]);
  // ...
}
```

Внутри твоего Воздействия указывается, как **начать связываться:**


```js {2-3}
    // ...
    const connection = createConnection(serverUrl, roomId);
    connection.connect();
    return () => {
      connection.disconnect();
    };
    // ...
```

Очищение, которое возвращает твоё Воздействие, показывает, как **убрать связь:**

```js {5}
    // ...
    const connection = createConnection(serverUrl, roomId);
    connection.connect();
    return () => {
      connection.disconnect();
    };
    // ...
```

На первый взгляд кажется, что **Расписыватель** просто **налаживает связь**, когда часть появляется на экране, и **обрывает её**, когда часть исчезает. Но это ещё не всё! Порой приходится **многократно разрывать и наводить связь заново**, пока часть всё ещё находится перед глазами.

Давай разберёмся, *зачем* это нужно, *когда* это случается и *как* ты можешь этим править.

<Note>

Некоторые Воздействия вовсе не возвращают Очищение. [Чаще всего](/learn/synchronizing-with-effects#how-to-handle-the-effect-firing-twice-in-development) тебе захочется его добавить — но если его нет, **Расписыватель** просто решит, что убирать за собой ничего не нужно.

</Note>

### Почему связь может налаживаться не один раз {/*why-synchronization-may-need-to-happen-more-than-once*/}

Представь, что часть `ChatRoom` (Комната) получает посыл `roomId`, который гость выбирает в списке. Положим, сначала гость выбрал комнату `"general"`. Твоё приложение открывает общее общение:


```js {3}
const serverUrl = 'https://localhost:1234';

function ChatRoom({ roomId /* "general" */ }) {
  // ...
  return <h1>Welcome to the {roomId} room!</h1>;
}
```

После того как интерфейс отобразится, **Расписыватель** запустит твоё Воздействие, чтобы **начать связываться.** Оно подключится к комнате `"general"`:

```js {3,4}
function ChatRoom({ roomId /* "general" */ }) {
  useEffect(() => {
    const connection = createConnection(serverUrl, roomId); // Connects to the "general" room
    connection.connect();
    return () => {
      connection.disconnect(); // Disconnects from the "general" room
    };
  }, [roomId]);
  // ...
```

Пока всё идет ладно.

Позже гость выбирает в списке другую комнату (например, `"travel"`). Сначала **Расписыватель** обновит лик программы:

```js {1}
function ChatRoom({ roomId /* "travel" */ }) {
  // ...
  return <h1>Welcome to the {roomId} room!</h1>;
}
```

Подумай, что должно быть дальше. Гость видит в интерфейсе, что выбрана комната `"travel"`. Однако Воздействие, которое запускалось в прошлый раз, всё ещё связано с комнатой `"general"`. **Посыл `roomId` сменился, поэтому то, что сделало Воздействие тогда (подключение к `"general"`), больше не ладит с тем, что на экране.**

В этот миг тебе нужно, чтобы **Расписыватель** сделал две вещи:

1. Разорвал связь со старым `roomId` (отключился от `"general"`)
2. Наладил связь с новым `roomId` (подключился к `"travel"`)

**К счастью, ты уже обучил Расписыватель делать и то, и другое!** Внутри Воздействия ты указал, как начать связываться, а в Очищении — как эту связь убрать. Всё, что нужно Расписывателю теперь — это вызвать их в верном порядке, с правильными посылами и хранимкой. Давай посмотрим, как именно это происходит.

### Как Расписыватель обновляет связь твоего Воздействия {/*how-react-re-synchronizes-your-effect*/}

Вспомним, что твоя часть `ChatRoom` получила новое значение посыла `roomId`. Раньше было `"general"`, а теперь — `"travel"`. Расписывателю нужно обновить связь твоего Воздействия, чтобы переподключить тебя к другой комнате.

Чтобы **разорвать связь**, Расписыватель вызовет Очищение, которое вернуло твое Воздействие после подключения к `"general"`. Поскольку тогда `roomId` был `"general"`, Очищение отключит тебя именно от этой комнаты:


```js {6}
function ChatRoom({ roomId /* "general" */ }) {
  useEffect(() => {
    const connection = createConnection(serverUrl, roomId); // Connects to the "general" room
    connection.connect();
    return () => {
      connection.disconnect(); // Disconnects from the "general" room
    };
    // ...
```

Затем **Расписыватель** запустит Воздействие, которое ты передал во время этой отрисовки. На этот раз `roomId` равен `"travel"`, так что оно **начнёт связываться** с комнатой `"travel"` (пока со временем не будет вызвано и его Очищение):


```js {3,4}
function ChatRoom({ roomId /* "travel" */ }) {
  useEffect(() => {
    const connection = createConnection(serverUrl, roomId); // Connects to the "travel" room
    connection.connect();
    // ...
```

Благодаря этому ты теперь подключен именно к той комнате, которую гость выбрал в интерфейсе. Беда миновала!

Каждый раз, когда твоя часть перерисовывается с другим `roomId`, твое Воздействие будет **обновлять связь**. К примеру, если гость сменит `roomId` с `"travel"` на `"music"`, **Расписыватель** снова **разорвет связь**, вызвав Очищение (отключив тебя от `"travel"`). Затем он **наведет новую связь**, запустив код Воздействия с новым посылом `roomId` (подключив тебя к `"music"`).

Наконец, когда гость уйдет на другой экран, `ChatRoom` исчезнет. Теперь поддерживать связь и вовсе не нужно. **Расписыватель** в последний раз **уберет связь** твоего Воздействия и отключит тебя от комнаты `"music"`.

### Взгляд со стороны Воздействия {/*thinking-from-the-effects-perspective*/}

Давай подытожим всё случившееся с точки зрения составной части `ChatRoom`:

1. `ChatRoom` появилась с `roomId`, равным `"general"`
1. `ChatRoom` обновилась с `roomId`, равным `"travel"`
1. `ChatRoom` обновилась с `roomId`, равным `"music"`
1. `ChatRoom` исчезла

В каждый из этих моментов жизни части твое Воздействие делало разные вещи:

1. Твое Воздействие подключилось к комнате `"general"`
1. Твое Воздействие отключилось от `"general"` и подключилось к `"travel"`
1. Твое Воздействие отключилось от `"travel"` и подключилось к `"music"`
1. Твое Воздействие отключилось от `"music"`

А теперь давай подумаем о том, что произошло с точки зрения самого Воздействия:


```js
  useEffect(() => {
    // Your Effect connected to the room specified with roomId...
    const connection = createConnection(serverUrl, roomId);
    connection.connect();
    return () => {
      // ...until it disconnected
      connection.disconnect();
    };
  }, [roomId]);
```

Структура этого кода может подсказать тебе, что всё случившееся — это просто последовательность непересекающихся отрезков времени:

1. Твое Воздействие подключилось к комнате `"general"` (пока его не отключили)
1. Твое Воздействие подключилось к комнате `"travel"` (пока его не отключили)
1. Твое Воздействие подключилось к комнате `"music"` (пока его не отключили)

Раньше ты думал с точки зрения составной части. Когда ты смотрел на это так, возникало искушение воспринимать Воздействия как «обратные вызовы» или «события жизненного цикла», которые срабатывают в определенное время, например «после отрисовки» или «перед исчезновением». Такой ход мыслей очень быстро становится запутанным, поэтому его лучше избегать.


**Вместо этого всегда сосредоточься на одном круге запуска/остановки за раз. Не должно иметь значения, рождается ли часть страницы, обновляется или уходит. Все, что тебе нужно сделать, — это описать, как начать лад и как его прекратить. Если ты сделаешь это добротно, твое Воздействие будет стоически переносить запуск и остановку столько раз, сколько потребуется.**

Это может напомнить тебе о том, как ты не задумываешься, рождается часть или обновляется, когда пишешь правила отрисовки, создающие **Живую Разметку**. Ты описываешь, что должно быть на экране, а **Расписыватель** [берет остальное на себя.](/learn/reacting-to-input-with-state)


### Как Расписыватель проверяет, что твоё Воздействие может обновлять связь {/*how-react-verifies-that-your-effect-can-re-synchronize*/}

Вот живой пример, с которым можно поиграть. Нажми «Открыть чат», чтобы часть `ChatRoom` появилась на экране:


<Sandpack>

```js
import { useState, useEffect } from 'react';
import { createConnection } from './chat.js';

const serverUrl = 'https://localhost:1234';

function ChatRoom({ roomId }) {
  useEffect(() => {
    const connection = createConnection(serverUrl, roomId);
    connection.connect();
    return () => connection.disconnect();
  }, [roomId]);
  return <h1>Welcome to the {roomId} room!</h1>;
}

export default function App() {
  const [roomId, setRoomId] = useState('general');
  const [show, setShow] = useState(false);
  return (
    <>
      <label>
        Choose the chat room:{' '}
        <select
          value={roomId}
          onChange={e => setRoomId(e.target.value)}
        >
          <option value="general">general</option>
          <option value="travel">travel</option>
          <option value="music">music</option>
        </select>
      </label>
      <button onClick={() => setShow(!show)}>
        {show ? 'Close chat' : 'Open chat'}
      </button>
      {show && <hr />}
      {show && <ChatRoom roomId={roomId} />}
    </>
  );
}
```

```js src/chat.js
export function createConnection(serverUrl, roomId) {
  // A real implementation would actually connect to the server
  return {
    connect() {
      console.log('✅ Connecting to "' + roomId + '" room at ' + serverUrl + '...');
    },
    disconnect() {
      console.log('❌ Disconnected from "' + roomId + '" room at ' + serverUrl);
    }
  };
}
```

```css
input { display: block; margin-bottom: 20px; }
button { margin-left: 10px; }
```

</Sandpack>

Заметим, что когда часть появляется впервые, ты видишь три записи в журнале:

1. `✅ Connecting to "general" room at https://localhost:1234...` *(только при разработке)*
1. `❌ Disconnected from "general" room at https://localhost:1234.` *(только при разработке)*
1. `✅ Connecting to "general" room at https://localhost:1234...`

Первые две записи — только для разработки. В этом режиме **Расписыватель** всегда пересоздает каждую часть один раз.

**Расписыватель проверяет, может ли твое Воздействие обновить связь, заставляя его сделать это немедленно при разработке.** Это напоминает то, как ты открываешь и закрываешь дверь лишний раз, чтобы убедиться, что замок работает. **Расписыватель** запускает и останавливает твое Воздействие один лишний раз, чтобы проверить, [хорошо ли ты прописал Очищение.](/learn/synchronizing-with-effects#how-to-handle-the-effect-firing-twice-in-development)

Главная причина, по которой твое Воздействие будет обновлять связь на деле — это изменение данных, которые оно использует. В песочнице выше смени выбранную комнату. Заметим, как при смене `roomId` твое Воздействие обновляет связь.

Однако бывают и более редкие случаи, когда нужно обновить связь. Например, попробуй подправить `serverUrl` в песочнице выше, пока чат открыт. Заметим, как Воздействие обновляет связь в ответ на твои правки в коде. В будущем **Расписыватель** может добавить больше возможностей, опирающихся на обновление связи.

### Как Расписыватель узнает, что нужно обновить связь Воздействия {/*how-react-knows-that-it-needs-to-re-synchronize-the-effect*/}

Тебе может быть интересно, как **Расписыватель** узнал, что твоему Воздействию нужно обновить связь после смены `roomId`. Это потому, что *ты сам сказал Расписывателю*, что код зависит от `roomId`, включив его в [список нужд:](/learn/synchronizing-with-effects#step-2-specify-the-effect-dependencies)


```js {1,3,8}
function ChatRoom({ roomId }) { // The roomId prop may change over time
  useEffect(() => {
    const connection = createConnection(serverUrl, roomId); // This Effect reads roomId 
    connection.connect();
    return () => {
      connection.disconnect();
    };
  }, [roomId]); // So you tell React that this Effect "depends on" roomId
  // ...
```

Вот как это работает:

1. Ты понимал, что `roomId` — это **посыл**, а значит, он может меняться со временем.
2. Ты понимал, что твое Воздействие читает `roomId` (то есть его логика зависит от значения, которое может измениться позже).
3. Вот почему ты указал его в **нуждах** своего Воздействия (чтобы оно обновляло связь при смене `roomId`).

Каждый раз после перерисовки составной части **Расписыватель** будет просматривать ряд нужд, который ты передал. Если хоть одно значение в ряду отличается от того, что было на том же месте в прошлый раз, **Расписыватель** обновит связь твоего Воздействия.

К примеру, если при первом зачине ты передал `["general"]`, а при следующей отрисовке — `["travel"]`, **Расписыватель** сличит `"general"` и `"travel"`. Это разные значения (согласно проверке [`Object.is`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is)), поэтому **Расписыватель** обновит связь. С другой стороны, если часть перерисовывается, но `roomId` не изменился, твое Воздействие останется связанным с той же комнатой.

### Каждое Воздействие — это отдельный процесс связи {/*each-effect-represents-a-separate-synchronization-process*/}

Не поддавайся искушению добавлять в Воздействие постороннюю логику только потому, что она должна срабатывать одновременно с тем, что ты уже написал. Допустим, ты хочешь отправлять весть в службу аналитики, когда гость заходит в комнату. У тебя уже есть Воздействие, которое зависит от `roomId`, и может потянуть добавить вызов аналитики прямо туда:


```js {3}
function ChatRoom({ roomId }) {
  useEffect(() => {
    logVisit(roomId);
    const connection = createConnection(serverUrl, roomId);
    connection.connect();
    return () => {
      connection.disconnect();
    };
  }, [roomId]);
  // ...
}
```

Но представь, что позже ты добавишь в это Воздействие ещё одну нужду, из-за которой придётся переподключаться. Если это Воздействие обновит связь, оно снова вызовет `logVisit(roomId)` для той же комнаты, чего ты совсем не планировал. Запись посещения — это **отдельный процесс**, не зависящий от подключения. Опиши их как два разных Воздействия:


```js {2-4}
function ChatRoom({ roomId }) {
  useEffect(() => {
    logVisit(roomId);
  }, [roomId]);

  useEffect(() => {
    const connection = createConnection(serverUrl, roomId);
    // ...
  }, [roomId]);
  // ...
}
```

**Каждое Воздействие в твоём коде должно отвечать за отдельный и независимый процесс связи.**

В примере выше удаление одного Воздействия не сломало бы работу другого. Это верный знак того, что они налаживают разные связи, и их стоило разделить. С другой стороны, если разбить цельную логику на разные Воздействия, код может выглядеть «чище», но [поддерживать его будет труднее.](/learn/you-might-not-need-an-effect#chains-of-computations) Вот почему нужно думать о том, один это процесс или разные, а не о красоте кода.

## Воздействия «откликаются» на отзывчивые значения {/*effects-react-to-reactive-values*/}

Твоё Воздействие читает две переменные (`serverUrl` и `roomId`), но в **нуждах** ты указал только `roomId`:


```js {5,10}
const serverUrl = 'https://localhost:1234';

function ChatRoom({ roomId }) {
  useEffect(() => {
    const connection = createConnection(serverUrl, roomId);
    connection.connect();
    return () => {
      connection.disconnect();
    };
  }, [roomId]);
  // ...
}
```

Почему же `serverUrl` не нужно указывать в нуждах?

Все потому, что `serverUrl` никогда не меняется при перерисовке. Он всегда один и тот же, сколько бы раз и по какой причине часть ни перерисовывалась. Раз `serverUrl` неизменен, нет никакого смысла указывать его в нуждах. В конце концов, нужды на что-то влияют только тогда, когда они меняются со временем!

С другой стороны, `roomId` при новой отрисовке может быть иным. **Посылы, хранимки и другие значения, объявленные внутри части, являются *отзывчивыми*, так как они вычисляются во время отрисовки и участвуют в потоке данных Расписывателя.**

Если бы `serverUrl` был переменной из хранимки, он стал бы отзывчивым. Отзывчивые значения обязательно должны быть в списке нужд:


```js {2,5,10}
function ChatRoom({ roomId }) { // Props change over time
  const [serverUrl, setServerUrl] = useState('https://localhost:1234'); // State may change over time

  useEffect(() => {
    const connection = createConnection(serverUrl, roomId); // Your Effect reads props and state
    connection.connect();
    return () => {
      connection.disconnect();
    };
  }, [roomId, serverUrl]); // So you tell React that this Effect "depends on" on props and state
  // ...
}
```

Добавив `serverUrl` в список нужд, ты гарантируешь, что Воздействие обновит связь после его изменения.

Попробуй сменить выбранную комнату или подправить адрес узла (server URL) в этой песочнице:


<Sandpack>

```js
import { useState, useEffect } from 'react';
import { createConnection } from './chat.js';

function ChatRoom({ roomId }) {
  const [serverUrl, setServerUrl] = useState('https://localhost:1234');

  useEffect(() => {
    const connection = createConnection(serverUrl, roomId);
    connection.connect();
    return () => connection.disconnect();
  }, [roomId, serverUrl]);

  return (
    <>
      <label>
        Server URL:{' '}
        <input
          value={serverUrl}
          onChange={e => setServerUrl(e.target.value)}
        />
      </label>
      <h1>Welcome to the {roomId} room!</h1>
    </>
  );
}

export default function App() {
  const [roomId, setRoomId] = useState('general');
  return (
    <>
      <label>
        Choose the chat room:{' '}
        <select
          value={roomId}
          onChange={e => setRoomId(e.target.value)}
        >
          <option value="general">general</option>
          <option value="travel">travel</option>
          <option value="music">music</option>
        </select>
      </label>
      <hr />
      <ChatRoom roomId={roomId} />
    </>
  );
}
```

```js src/chat.js
export function createConnection(serverUrl, roomId) {
  // A real implementation would actually connect to the server
  return {
    connect() {
      console.log('✅ Connecting to "' + roomId + '" room at ' + serverUrl + '...');
    },
    disconnect() {
      console.log('❌ Disconnected from "' + roomId + '" room at ' + serverUrl);
    }
  };
}
```

```css
input { display: block; margin-bottom: 20px; }
button { margin-left: 10px; }
```

</Sandpack>

Как только ты меняешь отзывчивое значение, будь то `roomId` или `serverUrl`, Воздействие заново наводит связь с узлом беседы.

### Что означает Воздействие с пустым рядом нужд {/*what-an-effect-with-empty-dependencies-means*/}

Что будет, если вынести и `serverUrl`, и `roomId` за пределы составной части?


```js {1,2}
const serverUrl = 'https://localhost:1234';
const roomId = 'general';

function ChatRoom() {
  useEffect(() => {
    const connection = createConnection(serverUrl, roomId);
    connection.connect();
    return () => {
      connection.disconnect();
    };
  }, []); // ✅ All dependencies declared
  // ...
}
```

Теперь код твоего Воздействия не использует *никаких* отзывчивых значений, поэтому его ряд нужд может быть пустым (`[]`).

Если смотреть глазами составной части, пустой ряд `[]` означает, что Воздействие наводит связь только при появлении части на экране, а разрывает её — только при исчезновении. (Помни, что **Расписыватель** всё равно [лишний раз обновит связь](#how-react-verifies-that-your-effect-can-re-synchronize) при разработке, чтобы проверить твой код на прочность.)



<Sandpack>

```js
import { useState, useEffect } from 'react';
import { createConnection } from './chat.js';

const serverUrl = 'https://localhost:1234';
const roomId = 'general';

function ChatRoom() {
  useEffect(() => {
    const connection = createConnection(serverUrl, roomId);
    connection.connect();
    return () => connection.disconnect();
  }, []);
  return <h1>Welcome to the {roomId} room!</h1>;
}

export default function App() {
  const [show, setShow] = useState(false);
  return (
    <>
      <button onClick={() => setShow(!show)}>
        {show ? 'Close chat' : 'Open chat'}
      </button>
      {show && <hr />}
      {show && <ChatRoom />}
    </>
  );
}
```

```js src/chat.js
export function createConnection(serverUrl, roomId) {
  // A real implementation would actually connect to the server
  return {
    connect() {
      console.log('✅ Connecting to "' + roomId + '" room at ' + serverUrl + '...');
    },
    disconnect() {
      console.log('❌ Disconnected from "' + roomId + '" room at ' + serverUrl);
    }
  };
}
```

```css
input { display: block; margin-bottom: 20px; }
button { margin-left: 10px; }
```

</Sandpack>

Однако если ты [смотришь глазами Воздействия](#thinking-from-the-effects-perspective), тебе и вовсе не нужно гадать, появляется часть на экране или исчезает. Важно лишь то, что ты описал, как **наладить** и **разорвать** связь. Сейчас у Воздействия нет отзывчивых нужд. Но если ты когда-нибудь захочешь, чтобы гость мог менять `roomId` или `serverUrl` (и они станут отзывчивыми), сам код Воздействия не изменится. Тебе нужно будет лишь добавить их в список нужд.

### Все переменные внутри части — отзывчивые {/*all-variables-declared-in-the-component-body-are-reactive*/}

Посылы и хранимки — не единственные отзывчивые значения. Всё, что ты вычисляешь на их основе, тоже становится отзывчивым. Если посылы или хранимка изменятся, твоя часть перерисуется, и вычисленные из них значения тоже станут другими. Вот почему все переменные из тела части, которые использует Воздействие, должны быть в списке его нужд.

Допустим, гость может выбрать узел беседы в списке, но также может задать узел по умолчанию в настройках. Предположим, ты уже положил настройки в [Среду](/learn/scaling-up-with-reducer-and-context), так что ты читаешь `settings` оттуда. Теперь ты вычисляешь `serverUrl` на основе выбранного узла из посылов и узла по умолчанию:


```js {3,5,10}
function ChatRoom({ roomId, selectedServerUrl }) { // roomId is reactive
  const settings = useContext(SettingsContext); // settings is reactive
  const serverUrl = selectedServerUrl ?? settings.defaultServerUrl; // serverUrl is reactive
  useEffect(() => {
    const connection = createConnection(serverUrl, roomId); // Your Effect reads roomId and serverUrl
    connection.connect();
    return () => {
      connection.disconnect();
    };
  }, [roomId, serverUrl]); // So it needs to re-synchronize when either of them changes!
  // ...
}
```

В этом примере `serverUrl` — не посыл и не переменная из хранимки. Это обычная переменная, которую ты вычисляешь во время отрисовки. Но раз она вычисляется при отрисовке, она может измениться при перерисовке части. Вот почему она отзывчива.

**Все значения внутри части (включая посылы, хранимку и переменные в теле части) отзывчивы. Любое отзывчивое значение может измениться при перерисовке, поэтому тебе нужно включать отзывчивые значения в нужды Воздействия.**

Иными словами, Воздействия «откликаются» на все значения из тела части.

<DeepDive>

#### Могут ли глобальные или изменяемые значения быть нуждами? {/*can-global-or-mutable-values-be-dependencies*/}

Изменяемые значения (включая глобальные переменные) не являются отзывчивыми.

**Изменяемое значение вроде [`location.pathname`](https://mozilla.org) не может быть нуждой.** Оно переменчиво и может измениться в любой миг совершенно вне потока данных Расписывателя. Его смена не вызовет перерисовку твоей части. Следовательно, даже если ты укажешь его в нуждах, Расписыватель *не узнает*, что нужно обновить связь Воздействия при его изменении. Это также нарушает правила Расписывателя, ведь чтение изменяемых данных во время отрисовки (когда ты вычисляешь нужды) нарушает [чистоту отрисовки.](/learn/keeping-components-pure) Вместо этого тебе стоит читать и подписываться на внешнее изменяемое значение через [`useSyncExternalStore`.](/learn/you-might-not-need-an-effect#subscribing-to-an-external-store)

**Изменяемое значение вроде [`ref.current`](/reference/react/useRef#reference) или то, что ты из него читаешь, тоже не может быть нуждой.** Сам объект ссылки, возвращаемый `useRef`, может быть нуждой, но его свойство `current` намеренно сделано изменяемым. Оно позволяет [следить за чем-то, не вызывая перерисовку.](/learn/referencing-values-with-refs) Но раз его смена не побуждает Расписыватель к перерисовке, оно не отзывчиво, и Расписыватель не поймет, что пора перезапустить Воздействие.

Как ты узнаешь ниже на этой странице, поверщик проверит эти ошибки сам.

</DeepDive>

### Расписыватель проверяет, каждое ли отзывчивое значение указано в нуждах {/*react-verifies-that-you-specified-every-reactive-value-as-a-dependency*/}

Если твой [поверщик настроен для Расписывателя,](/learn/editor-setup#linting) он проверит, чтобы каждое отзывчивое значение, используемое внутри Воздействия, было объявлено в его нуждах. Например, здесь возникнет ошибка, так как и `roomId`, и `serverUrl` отзывчивы:


<Sandpack>

```js
import { useState, useEffect } from 'react';
import { createConnection } from './chat.js';

function ChatRoom({ roomId }) { // roomId is reactive
  const [serverUrl, setServerUrl] = useState('https://localhost:1234'); // serverUrl is reactive

  useEffect(() => {
    const connection = createConnection(serverUrl, roomId);
    connection.connect();
    return () => connection.disconnect();
  }, []); // <-- Something's wrong here!

  return (
    <>
      <label>
        Server URL:{' '}
        <input
          value={serverUrl}
          onChange={e => setServerUrl(e.target.value)}
        />
      </label>
      <h1>Welcome to the {roomId} room!</h1>
    </>
  );
}

export default function App() {
  const [roomId, setRoomId] = useState('general');
  return (
    <>
      <label>
        Choose the chat room:{' '}
        <select
          value={roomId}
          onChange={e => setRoomId(e.target.value)}
        >
          <option value="general">general</option>
          <option value="travel">travel</option>
          <option value="music">music</option>
        </select>
      </label>
      <hr />
      <ChatRoom roomId={roomId} />
    </>
  );
}
```

```js src/chat.js
export function createConnection(serverUrl, roomId) {
  // A real implementation would actually connect to the server
  return {
    connect() {
      console.log('✅ Connecting to "' + roomId + '" room at ' + serverUrl + '...');
    },
    disconnect() {
      console.log('❌ Disconnected from "' + roomId + '" room at ' + serverUrl);
    }
  };
}
```

```css
input { display: block; margin-bottom: 20px; }
button { margin-left: 10px; }
```

</Sandpack>

Это может показаться ошибкой Расписывателя, но на самом деле он указывает на изъян в твоём коде. И `roomId`, и `serverUrl` могут со временем измениться, но ты забываешь обновить связь своего Воздействия при их смене. Ты останешься подключённым к начальным `roomId` и `serverUrl` даже после того, как гость выберет другие значения в интерфейсе.

Чтобы исправить изъян, следуй совету поверщика и укажи `roomId` и `serverUrl` в нуждах своего Воздействия:


```js {9}
function ChatRoom({ roomId }) { // roomId is reactive
  const [serverUrl, setServerUrl] = useState('https://localhost:1234'); // serverUrl is reactive
  useEffect(() => {
    const connection = createConnection(serverUrl, roomId);
    connection.connect();
    return () => {
      connection.disconnect();
    };
  }, [serverUrl, roomId]); // ✅ All dependencies declared
  // ...
}
```

Испробуй это исправление в песочнице выше. Убедись, что ошибка поверщика исчезла, а связь в чате обновляется когда нужно.

<Note>

В некоторых случаях **Расписыватель** *знает*, что значение никогда не изменится, даже если оно объявлено внутри части. Например, [деяние-указ `set`](/reference/react/useState#setstate), возвращаемое из `useState`, и объект ссылки из [`useRef`](/reference/react/useRef) являются *устойчивыми* — они гарантированно не меняются при перерисовке. Устойчивые значения не отзывчивы, так что их можно не вносить в список нужд. Впрочем, если добавишь — беды не будет: они всё равно не меняются.

</Note>

### Что делать, если ты не хочешь обновлять связь {/*what-to-do-when-you-dont-want-to-re-synchronize*/}

В прошлом примере ты исправил ошибку, указав `roomId` и `serverUrl` в нуждах.

**Однако вместо этого ты мог бы «доказать» поверщику, что эти значения не отзывчивы,** то есть они *не могут* измениться при перерисовке. К примеру, если `serverUrl` и `roomId` не зависят от отрисовки и всегда одинаковы, их можно просто вынести за пределы составной части. Теперь им не нужно быть в списке нужд.


```js {1,2,11}
const serverUrl = 'https://localhost:1234'; // serverUrl is not reactive
const roomId = 'general'; // roomId is not reactive

function ChatRoom() {
  useEffect(() => {
    const connection = createConnection(serverUrl, roomId);
    connection.connect();
    return () => {
      connection.disconnect();
    };
  }, []); // ✅ All dependencies declared
  // ...
}
```

Ты также можешь перенести их *внутрь Воздействия*. Они не вычисляются во время отрисовки, поэтому они не отзывчивы:

```js {3,4,10}
function ChatRoom() {
  useEffect(() => {
    const serverUrl = 'https://localhost:1234'; // serverUrl is not reactive
    const roomId = 'general'; // roomId is not reactive
    const connection = createConnection(serverUrl, roomId);
    connection.connect();
    return () => {
      connection.disconnect();
    };
  }, []); // ✅ All dependencies declared
  // ...
}
```

**Воздействия — это отзывчивые блоки кода.** Они обновляют связь, когда значения, которые ты читаешь внутри них, меняются. В отличие от распорядителей событий, которые срабатывают лишь один раз при действии, Воздействия запускаются всегда, когда того требует связь.

**Ты не можешь «выбирать» свои нужды.** Твои нужды обязаны включать каждое [отзывчивое значение](#all-variables-declared-in-the-component-body-are-reactive), которое ты читаешь в Воздействии. Поверщик строго следит за этим. Иногда это может приводить к трудностям, вроде бесконечных петель или слишком частых обновлений связи. Не чини эти беды, затыкая рот поверщику! Вот что стоит попробовать вместо этого:

* **Проверь, отвечает ли твое Воздействие за отдельный процесс связи.** Если твое Воздействие ничего не связывает, [оно может быть вовсе не нужным.](/learn/you-might-not-need-an-effect) Если оно связывает несколько независимых вещей, [раздели его.](#each-effect-represents-a-separate-synchronization-process)

* **Если ты хочешь прочитать свежий посыл или хранимку, не «откликаясь» на них и не обновляя связь Воздействия,** ты можешь разделить свое Воздействие на отзывчивую часть (которую оставишь в Воздействии) и неотзывчивую (которую вынесешь в так называемое _Событие Воздействия_). [Почитай об отделении Событий от Воздействий.](/learn/separating-events-from-effects)

* **Старайся не полагаться на объекты и деяния как на нужды.** Если ты создаешь объекты и деяния во время отрисовки, а затем читаешь их из Воздействия, они будут новыми при каждом проходе. Это заставит твое Воздействие обновлять связь постоянно. [Узнай больше об изъятии лишних нужд из Воздействий.](/learn/removing-effect-dependencies)

<Pitfall>

Поверщик — твой друг, но его силы не безграничны. Поверщик лишь знает, когда нужды указаны *неверно*. Он не знает *лучшего* способа решить твою задачу. Если поверщик требует добавить нужду, но это приводит к петле, это не значит, что его надо игнорировать. Тебе нужно изменить код внутри (или снаружи) Воздействия так, чтобы это значение перестало быть отзывчивым и ему не *нужно* было быть в списке нужд.

Если ты работаешь с уже готовым кодом, ты можешь встретить Воздействия, где поверщику «заткнули рот» вот так:


```js {3-4}
useEffect(() => {
  // ...
  // 🔴 Avoid suppressing the linter like this:
  // eslint-ignore-next-line react-hooks/exhaustive-deps
}, []);
```

На [следующих](/learn/separating-events-from-effects) [страницах](/learn/removing-effect-dependencies) ты узнаешь, как исправить такой код, не нарушая правил. Это всегда стоит того!

</Pitfall>

<Recap>

- Составные части могут появляться, обновляться и исчезать.
- У каждого Воздействия свой жизненный круг, отличный от окружающей его части.
- Каждое Воздействие описывает отдельный процесс связи, который может *начинаться* и *прекращаться*.
- Когда ты пишешь Воздействия, смотри на мир глазами каждого отдельного Воздействия (как наладить и убрать связь), а не глазами части (как она появляется или обновляется).
- Значения, объявленные внутри тела части, являются «отзывчивыми».
- Отзывчивые значения должны обновлять связь Воздействия, так как они могут меняться.
- Поверщик следит, чтобы все отзывчивые значения, используемые внутри Воздействия, были указаны в нуждах.
- Все ошибки, на которые указывает поверщик, справедливы. Всегда есть способ поправить код, не нарушая правил.

</Recap>

<Challenges>

#### Исправь переподключение при каждом нажатии клавиши {/*fix-reconnecting-on-every-keystroke*/}

В этом примере часть `ChatRoom` налаживает связь при появлении на экране, разрывает её при исчезновении и переподключается, когда ты выбираешь другую комнату. Это верное поведение, его нужно сохранить.

Однако есть неувязка. Стоит тебе начать писать в поле ввода сообщения внизу, как `ChatRoom` *тоже* переподключается к беседе. (Ты можешь заметить это, если очистишь журнал и что-нибудь напечатаешь). Исправь это, чтобы связь не прерывалась попусту.

<Hint>

Тебе может понадобиться добавить ряд нужд для этого Воздействия. Какие нужды там должны быть?


</Hint>

<Sandpack>

```js
import { useState, useEffect } from 'react';
import { createConnection } from './chat.js';

const serverUrl = 'https://localhost:1234';

function ChatRoom({ roomId }) {
  const [message, setMessage] = useState('');

  useEffect(() => {
    const connection = createConnection(serverUrl, roomId);
    connection.connect();
    return () => connection.disconnect();
  });

  return (
    <>
      <h1>Welcome to the {roomId} room!</h1>
      <input
        value={message}
        onChange={e => setMessage(e.target.value)}
      />
    </>
  );
}

export default function App() {
  const [roomId, setRoomId] = useState('general');
  return (
    <>
      <label>
        Choose the chat room:{' '}
        <select
          value={roomId}
          onChange={e => setRoomId(e.target.value)}
        >
          <option value="general">general</option>
          <option value="travel">travel</option>
          <option value="music">music</option>
        </select>
      </label>
      <hr />
      <ChatRoom roomId={roomId} />
    </>
  );
}
```

```js src/chat.js
export function createConnection(serverUrl, roomId) {
  // A real implementation would actually connect to the server
  return {
    connect() {
      console.log('✅ Connecting to "' + roomId + '" room at ' + serverUrl + '...');
    },
    disconnect() {
      console.log('❌ Disconnected from "' + roomId + '" room at ' + serverUrl);
    }
  };
}
```

```css
input { display: block; margin-bottom: 20px; }
button { margin-left: 10px; }
```

</Sandpack>

<Solution>

У этого Воздействия вовсе не было ряда нужд, поэтому оно обновляло связь после каждой перерисовки. Сперва добавь ряд нужд. Затем убедись, что каждое отзывчивое значение, которое использует Воздействие, указано в этом ряду. Например, `roomId` — отзывчивое значение (так как это посыл), поэтому его нужно включить в ряд. Это гарантирует, что когда гость выберет другую комнату, чат переподключится. С другой стороны, `serverUrl` определён за пределами части. Вот почему ему не нужно быть в этом ряду.


<Sandpack>

```js
import { useState, useEffect } from 'react';
import { createConnection } from './chat.js';

const serverUrl = 'https://localhost:1234';

function ChatRoom({ roomId }) {
  const [message, setMessage] = useState('');

  useEffect(() => {
    const connection = createConnection(serverUrl, roomId);
    connection.connect();
    return () => connection.disconnect();
  }, [roomId]);

  return (
    <>
      <h1>Welcome to the {roomId} room!</h1>
      <input
        value={message}
        onChange={e => setMessage(e.target.value)}
      />
    </>
  );
}

export default function App() {
  const [roomId, setRoomId] = useState('general');
  return (
    <>
      <label>
        Choose the chat room:{' '}
        <select
          value={roomId}
          onChange={e => setRoomId(e.target.value)}
        >
          <option value="general">general</option>
          <option value="travel">travel</option>
          <option value="music">music</option>
        </select>
      </label>
      <hr />
      <ChatRoom roomId={roomId} />
    </>
  );
}
```

```js src/chat.js
export function createConnection(serverUrl, roomId) {
  // A real implementation would actually connect to the server
  return {
    connect() {
      console.log('✅ Connecting to "' + roomId + '" room at ' + serverUrl + '...');
    },
    disconnect() {
      console.log('❌ Disconnected from "' + roomId + '" room at ' + serverUrl);
    }
  };
}
```

```css
input { display: block; margin-bottom: 20px; }
button { margin-left: 10px; }
```

</Sandpack>

</Solution>

#### Включение и выключение связи {/*switch-synchronization-on-and-off*/}

В этом примере Воздействие подписывается на событие окна [`pointermove`](https://developer.mozilla.org/en-US/docs/Web/API/Element/pointermove_event), чтобы перемещать розовую точку по экрану. Попробуй поводить над областью просмотра (или коснись экрана, если ты с мобильного устройства) и посмотри, как точка следует за твоими движениями.

Также здесь есть галочка. Её переключение меняет **хранимку** `canMove`, но сейчас эта переменная нигде в коде не используется. Твоя задача — изменить код так, чтобы когда `canMove` равно `false` (галочка снята), точка переставала двигаться. Когда же ты снова поставишь галочку (и `canMove` станет `true`), точка должна снова следовать за движениями. Иными словами, возможность точки двигаться должна быть в ладу с тем, стоит ли галочка.

<Hint>

Ты не можешь объявлять Воздействие по условию. Однако код внутри самого Воздействия может использовать условия!


</Hint>

<Sandpack>

```js
import { useState, useEffect } from 'react';

export default function App() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [canMove, setCanMove] = useState(true);

  useEffect(() => {
    function handleMove(e) {
      setPosition({ x: e.clientX, y: e.clientY });
    }
    window.addEventListener('pointermove', handleMove);
    return () => window.removeEventListener('pointermove', handleMove);
  }, []);

  return (
    <>
      <label>
        <input type="checkbox"
          checked={canMove}
          onChange={e => setCanMove(e.target.checked)} 
        />
        The dot is allowed to move
      </label>
      <hr />
      <div style={{
        position: 'absolute',
        backgroundColor: 'pink',
        borderRadius: '50%',
        opacity: 0.6,
        transform: `translate(${position.x}px, ${position.y}px)`,
        pointerEvents: 'none',
        left: -20,
        top: -20,
        width: 40,
        height: 40,
      }} />
    </>
  );
}
```

```css
body {
  height: 200px;
}
```

</Sandpack>

<Solution>

Одно из решений — обернуть призыв `setPosition` в условие `if (canMove) { ... }`:


<Sandpack>

```js
import { useState, useEffect } from 'react';

export default function App() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [canMove, setCanMove] = useState(true);

  useEffect(() => {
    function handleMove(e) {
      if (canMove) {
        setPosition({ x: e.clientX, y: e.clientY });
      }
    }
    window.addEventListener('pointermove', handleMove);
    return () => window.removeEventListener('pointermove', handleMove);
  }, [canMove]);

  return (
    <>
      <label>
        <input type="checkbox"
          checked={canMove}
          onChange={e => setCanMove(e.target.checked)} 
        />
        The dot is allowed to move
      </label>
      <hr />
      <div style={{
        position: 'absolute',
        backgroundColor: 'pink',
        borderRadius: '50%',
        opacity: 0.6,
        transform: `translate(${position.x}px, ${position.y}px)`,
        pointerEvents: 'none',
        left: -20,
        top: -20,
        width: 40,
        height: 40,
      }} />
    </>
  );
}
```

```css
body {
  height: 200px;
}
```

</Sandpack>

Alternatively, you could wrap the *event subscription* logic into an `if (canMove) { ... }` condition:

<Sandpack>

```js
import { useState, useEffect } from 'react';

export default function App() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [canMove, setCanMove] = useState(true);

  useEffect(() => {
    function handleMove(e) {
      setPosition({ x: e.clientX, y: e.clientY });
    }
    if (canMove) {
      window.addEventListener('pointermove', handleMove);
      return () => window.removeEventListener('pointermove', handleMove);
    }
  }, [canMove]);

  return (
    <>
      <label>
        <input type="checkbox"
          checked={canMove}
          onChange={e => setCanMove(e.target.checked)} 
        />
        The dot is allowed to move
      </label>
      <hr />
      <div style={{
        position: 'absolute',
        backgroundColor: 'pink',
        borderRadius: '50%',
        opacity: 0.6,
        transform: `translate(${position.x}px, ${position.y}px)`,
        pointerEvents: 'none',
        left: -20,
        top: -20,
        width: 40,
        height: 40,
      }} />
    </>
  );
}
```

```css
body {
  height: 200px;
}
```

</Sandpack>

В обоих этих случаях `canMove` — это отзывчивое значение, которое ты читаешь внутри Воздействия. Вот почему оно должно быть указано в списке нужд Воздействия. Это гарантирует, что Воздействие обновит связь после каждого изменения его значения.

</Solution>

#### Разберись с ошибкой залежалого значения {/*investigate-a-stale-value-bug*/}

В этом примере розовая точка должна двигаться, когда галочка стоит, и замирать, когда её нет. Логика для этого уже прописана: распорядитель событий `handleMove` проверяет **хранимку** `canMove`.

Однако по какой-то причине значение `canMove` внутри `handleMove` оказывается «залежалым»: оно всегда равно `true`, даже если ты снял галочку. Как такое возможно? Найди изъян в коде и исправь его.

<Hint>

Если ты видишь, что правило поверщика заглушено, убери заглушку! Именно там обычно и прячутся ошибки.


</Hint>

<Sandpack>

```js
import { useState, useEffect } from 'react';

export default function App() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [canMove, setCanMove] = useState(true);

  function handleMove(e) {
    if (canMove) {
      setPosition({ x: e.clientX, y: e.clientY });
    }
  }

  useEffect(() => {
    window.addEventListener('pointermove', handleMove);
    return () => window.removeEventListener('pointermove', handleMove);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <label>
        <input type="checkbox"
          checked={canMove}
          onChange={e => setCanMove(e.target.checked)} 
        />
        The dot is allowed to move
      </label>
      <hr />
      <div style={{
        position: 'absolute',
        backgroundColor: 'pink',
        borderRadius: '50%',
        opacity: 0.6,
        transform: `translate(${position.x}px, ${position.y}px)`,
        pointerEvents: 'none',
        left: -20,
        top: -20,
        width: 40,
        height: 40,
      }} />
    </>
  );
}
```

```css
body {
  height: 200px;
}
```

</Sandpack>

<Solution>

Проблема исходного кода заключалась в том, что правило поверщика нужд было заглушено. Если убрать эту заглушку, станет ясно, что это Воздействие зависит от деяния `handleMove`. И это логично: `handleMove` объявлено внутри тела части, что делает его отзывчивым значением. Каждое отзывчивое значение должно быть указано в нуждах, иначе оно может стать залежалым!

Создатель исходного кода «соврал» Расписывателю, заявив, что Воздействие не зависит (`[]`) от отзывчивых значений. Вот почему Расписыватель не обновил связь Воздействия после того, как `canMove` (и `handleMove` вместе с ним) изменилось. Поскольку Расписыватель не обновил связь, к окну в качестве слушателя осталось привязано то деяние `handleMove`, которое было создано при первом зачине. При первом зачине `canMove` было равно `true`, поэтому то старое деяние `handleMove` всегда будет видеть именно это значение.

**Если ты никогда не будешь заглушать поверщик, ты никогда не столкнёшься с проблемами залежалых значений.** Есть несколько способов исправить этот изъян, но всегда стоит начинать с удаления заглушки поверщика. А затем изменить код так, чтобы исправить саму ошибку.

Ты можешь изменить нужды Воздействия на `[handleMove]`, но так как это деяние будет создаваться заново при каждой отрисовке, можно и вовсе убрать ряд нужд. Тогда Воздействие *будет* обновлять связь после каждой перерисовки:


<Sandpack>

```js
import { useState, useEffect } from 'react';

export default function App() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [canMove, setCanMove] = useState(true);

  function handleMove(e) {
    if (canMove) {
      setPosition({ x: e.clientX, y: e.clientY });
    }
  }

  useEffect(() => {
    window.addEventListener('pointermove', handleMove);
    return () => window.removeEventListener('pointermove', handleMove);
  });

  return (
    <>
      <label>
        <input type="checkbox"
          checked={canMove}
          onChange={e => setCanMove(e.target.checked)} 
        />
        The dot is allowed to move
      </label>
      <hr />
      <div style={{
        position: 'absolute',
        backgroundColor: 'pink',
        borderRadius: '50%',
        opacity: 0.6,
        transform: `translate(${position.x}px, ${position.y}px)`,
        pointerEvents: 'none',
        left: -20,
        top: -20,
        width: 40,
        height: 40,
      }} />
    </>
  );
}
```

```css
body {
  height: 200px;
}
```

</Sandpack>

Это решение работает, но оно не идеально. Если ты добавишь `console.log('Подписываюсь снова')` внутрь Воздействия, ты заметишь, что оно переподписывается после каждой перерисовки. Переподписка происходит быстро, но всё же было бы хорошо избегать этого так часто.

Более удачным исправлением будет перенос деяния `handleMove` *внутрь* Воздействия. Тогда `handleMove` не будет отзывчивым значением, и твое Воздействие не будет зависеть от функции. Вместо этого оно будет зависеть от `canMove`, которое твой код теперь читает изнутри Воздействия. Это соответствует поведению, которое ты хотел, так как твое Воздействие теперь будет оставаться в ладу со значением `canMove`:


<Sandpack>

```js
import { useState, useEffect } from 'react';

export default function App() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [canMove, setCanMove] = useState(true);

  useEffect(() => {
    function handleMove(e) {
      if (canMove) {
        setPosition({ x: e.clientX, y: e.clientY });
      }
    }

    window.addEventListener('pointermove', handleMove);
    return () => window.removeEventListener('pointermove', handleMove);
  }, [canMove]);

  return (
    <>
      <label>
        <input type="checkbox"
          checked={canMove}
          onChange={e => setCanMove(e.target.checked)} 
        />
        The dot is allowed to move
      </label>
      <hr />
      <div style={{
        position: 'absolute',
        backgroundColor: 'pink',
        borderRadius: '50%',
        opacity: 0.6,
        transform: `translate(${position.x}px, ${position.y}px)`,
        pointerEvents: 'none',
        left: -20,
        top: -20,
        width: 40,
        height: 40,
      }} />
    </>
  );
}
```

```css
body {
  height: 200px;
}
```

</Sandpack>

Попробуй добавить `console.log('Resubscribing')` внутрь Воздействия и заметь, что теперь оно обновляет связь только тогда, когда ты переключаешь галочку (`canMove` меняется) или правишь код. Это лучше, чем прошлый подход, который всегда переподписывался.

Более общий подход к таким задачам ты встретишь в разделе [Отделение Событий от Воздействий.](/learn/separating-events-from-effects)

</Solution>

#### Исправь переключатель связи {/*fix-a-connection-switch*/}

В этом примере служба бесед в `chat.js` открывает два разных способа связи: `createEncryptedConnection` и `createUnencryptedConnection`. Корневая часть `App` даёт гостю выбрать, использовать шифрование или нет, и передаёт выбранное деяние в чадо `ChatRoom` через посыл `createConnection`.

Заметь, что поначалу записи в журнале говорят, что связь не зашифрована. Попробуй поставить галочку: ничего не произойдёт. Однако если после этого сменить комнату, то чат переподключится *и* включит шифрование (ты увидишь это в журнале). Это изъян. Исправь его так, чтобы переключение галочки *тоже* заставляло чат обновлять связь.

<Hint>

Заглушать поверщик — всегда подозрительно. Может, в этом и кроется изъян?


</Hint>

<Sandpack>

```js src/App.js
import { useState } from 'react';
import ChatRoom from './ChatRoom.js';
import {
  createEncryptedConnection,
  createUnencryptedConnection,
} from './chat.js';

export default function App() {
  const [roomId, setRoomId] = useState('general');
  const [isEncrypted, setIsEncrypted] = useState(false);
  return (
    <>
      <label>
        Choose the chat room:{' '}
        <select
          value={roomId}
          onChange={e => setRoomId(e.target.value)}
        >
          <option value="general">general</option>
          <option value="travel">travel</option>
          <option value="music">music</option>
        </select>
      </label>
      <label>
        <input
          type="checkbox"
          checked={isEncrypted}
          onChange={e => setIsEncrypted(e.target.checked)}
        />
        Enable encryption
      </label>
      <hr />
      <ChatRoom
        roomId={roomId}
        createConnection={isEncrypted ?
          createEncryptedConnection :
          createUnencryptedConnection
        }
      />
    </>
  );
}
```

```js src/ChatRoom.js active
import { useState, useEffect } from 'react';

export default function ChatRoom({ roomId, createConnection }) {
  useEffect(() => {
    const connection = createConnection(roomId);
    connection.connect();
    return () => connection.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  return <h1>Welcome to the {roomId} room!</h1>;
}
```

```js src/chat.js
export function createEncryptedConnection(roomId) {
  // A real implementation would actually connect to the server
  return {
    connect() {
      console.log('✅ 🔐 Connecting to "' + roomId + '... (encrypted)');
    },
    disconnect() {
      console.log('❌ 🔐 Disconnected from "' + roomId + '" room (encrypted)');
    }
  };
}

export function createUnencryptedConnection(roomId) {
  // A real implementation would actually connect to the server
  return {
    connect() {
      console.log('✅ Connecting to "' + roomId + '... (unencrypted)');
    },
    disconnect() {
      console.log('❌ Disconnected from "' + roomId + '" room (unencrypted)');
    }
  };
}
```

```css
label { display: block; margin-bottom: 10px; }
```

</Sandpack>

<Solution>

Если убрать заглушку поверщика, ты увидишь ошибку. Проблема в том, что `createConnection` — это посыл, а значит, это отзывчивое значение. Оно может меняться со временем! (И оно действительно должно меняться — когда гость ставит галочку, родительская часть передаёт иное значение в посыл `createConnection`). Вот почему оно должно быть нуждой. Включи его в список, чтобы исправить изъян:


<Sandpack>

```js src/App.js
import { useState } from 'react';
import ChatRoom from './ChatRoom.js';
import {
  createEncryptedConnection,
  createUnencryptedConnection,
} from './chat.js';

export default function App() {
  const [roomId, setRoomId] = useState('general');
  const [isEncrypted, setIsEncrypted] = useState(false);
  return (
    <>
      <label>
        Choose the chat room:{' '}
        <select
          value={roomId}
          onChange={e => setRoomId(e.target.value)}
        >
          <option value="general">general</option>
          <option value="travel">travel</option>
          <option value="music">music</option>
        </select>
      </label>
      <label>
        <input
          type="checkbox"
          checked={isEncrypted}
          onChange={e => setIsEncrypted(e.target.checked)}
        />
        Enable encryption
      </label>
      <hr />
      <ChatRoom
        roomId={roomId}
        createConnection={isEncrypted ?
          createEncryptedConnection :
          createUnencryptedConnection
        }
      />
    </>
  );
}
```

```js src/ChatRoom.js active
import { useState, useEffect } from 'react';

export default function ChatRoom({ roomId, createConnection }) {
  useEffect(() => {
    const connection = createConnection(roomId);
    connection.connect();
    return () => connection.disconnect();
  }, [roomId, createConnection]);

  return <h1>Welcome to the {roomId} room!</h1>;
}
```

```js src/chat.js
export function createEncryptedConnection(roomId) {
  // A real implementation would actually connect to the server
  return {
    connect() {
      console.log('✅ 🔐 Connecting to "' + roomId + '... (encrypted)');
    },
    disconnect() {
      console.log('❌ 🔐 Disconnected from "' + roomId + '" room (encrypted)');
    }
  };
}

export function createUnencryptedConnection(roomId) {
  // A real implementation would actually connect to the server
  return {
    connect() {
      console.log('✅ Connecting to "' + roomId + '... (unencrypted)');
    },
    disconnect() {
      console.log('❌ Disconnected from "' + roomId + '" room (unencrypted)');
    }
  };
}
```

```css
label { display: block; margin-bottom: 10px; }
```

</Sandpack>

Верно, что `createConnection` — это нужда. Однако этот код немного хрупок, потому что кто-нибудь может изменить часть `App` так, чтобы передавать встроенное деяние в качестве значения этого посыла. В таком случае его значение будет меняться при каждой перерисовке `App`, и Воздействие может обновлять связь слишком часто. Чтобы избежать этого, ты можешь передавать вниз `isEncrypted` вместо самого деяния:


<Sandpack>

```js src/App.js
import { useState } from 'react';
import ChatRoom from './ChatRoom.js';

export default function App() {
  const [roomId, setRoomId] = useState('general');
  const [isEncrypted, setIsEncrypted] = useState(false);
  return (
    <>
      <label>
        Choose the chat room:{' '}
        <select
          value={roomId}
          onChange={e => setRoomId(e.target.value)}
        >
          <option value="general">general</option>
          <option value="travel">travel</option>
          <option value="music">music</option>
        </select>
      </label>
      <label>
        <input
          type="checkbox"
          checked={isEncrypted}
          onChange={e => setIsEncrypted(e.target.checked)}
        />
        Enable encryption
      </label>
      <hr />
      <ChatRoom
        roomId={roomId}
        isEncrypted={isEncrypted}
      />
    </>
  );
}
```

```js src/ChatRoom.js active
import { useState, useEffect } from 'react';
import {
  createEncryptedConnection,
  createUnencryptedConnection,
} from './chat.js';

export default function ChatRoom({ roomId, isEncrypted }) {
  useEffect(() => {
    const createConnection = isEncrypted ?
      createEncryptedConnection :
      createUnencryptedConnection;
    const connection = createConnection(roomId);
    connection.connect();
    return () => connection.disconnect();
  }, [roomId, isEncrypted]);

  return <h1>Welcome to the {roomId} room!</h1>;
}
```

```js src/chat.js
export function createEncryptedConnection(roomId) {
  // A real implementation would actually connect to the server
  return {
    connect() {
      console.log('✅ 🔐 Connecting to "' + roomId + '... (encrypted)');
    },
    disconnect() {
      console.log('❌ 🔐 Disconnected from "' + roomId + '" room (encrypted)');
    }
  };
}

export function createUnencryptedConnection(roomId) {
  // A real implementation would actually connect to the server
  return {
    connect() {
      console.log('✅ Connecting to "' + roomId + '... (unencrypted)');
    },
    disconnect() {
      console.log('❌ Disconnected from "' + roomId + '" room (unencrypted)');
    }
  };
}
```

```css
label { display: block; margin-bottom: 10px; }
```

</Sandpack>

В этой версии часть `App` передает булев посыл вместо деяния. Внутри Воздействия ты сам решаешь, какое деяние использовать. Поскольку и `createEncryptedConnection`, и `createUnencryptedConnection` объявлены за пределами части, они не отзывчивы и не нуждаются в указании в нуждах. Ты узнаешь об этом больше в разделе [Удаление нужд Воздействия.](/learn/removing-effect-dependencies)

</Solution>

#### Наполни цепочку списков выбора {/*populate-a-chain-of-select-boxes*/}

В этом примере есть два списка выбора. Один позволяет гостю выбрать планету. Другой — место *на этой планете*. Второй список пока не работает. Твоя задача — сделать так, чтобы в нём отображались места на выбранной планете.

Посмотри, как работает первый список. Он наполняет **хранимку** `planetList` исходом обращения к `"/planets"`. Номер (ID) выбранной сейчас планеты хранится в переменной `planetId`. Тебе нужно найти, куда добавить код, чтобы в **хранимку** `placeList` попадал исход обращения к `"/planets/" + planetId + "/places"`.

Если ты всё сделаешь верно, выбор планеты наполнит список мест. Смена планеты должна менять и список мест.

<Hint>

Если у тебя есть два независимых процесса связи, тебе нужно описать их как два отдельных Воздействия.


</Hint>

<Sandpack>

```js src/App.js
import { useState, useEffect } from 'react';
import { fetchData } from './api.js';

export default function Page() {
  const [planetList, setPlanetList] = useState([])
  const [planetId, setPlanetId] = useState('');

  const [placeList, setPlaceList] = useState([]);
  const [placeId, setPlaceId] = useState('');

  useEffect(() => {
    let ignore = false;
    fetchData('/planets').then(result => {
      if (!ignore) {
        console.log('Fetched a list of planets.');
        setPlanetList(result);
        setPlanetId(result[0].id); // Select the first planet
      }
    });
    return () => {
      ignore = true;
    }
  }, []);

  return (
    <>
      <label>
        Pick a planet:{' '}
        <select value={planetId} onChange={e => {
          setPlanetId(e.target.value);
        }}>
          {planetList.map(planet =>
            <option key={planet.id} value={planet.id}>{planet.name}</option>
          )}
        </select>
      </label>
      <label>
        Pick a place:{' '}
        <select value={placeId} onChange={e => {
          setPlaceId(e.target.value);
        }}>
          {placeList.map(place =>
            <option key={place.id} value={place.id}>{place.name}</option>
          )}
        </select>
      </label>
      <hr />
      <p>You are going to: {placeId || '???'} on {planetId || '???'} </p>
    </>
  );
}
```

```js src/api.js hidden
export function fetchData(url) {
  if (url === '/planets') {
    return fetchPlanets();
  } else if (url.startsWith('/planets/')) {
    const match = url.match(/^\/planets\/([\w-]+)\/places(\/)?$/);
    if (!match || !match[1] || !match[1].length) {
      throw Error('Expected URL like "/planets/earth/places". Received: "' + url + '".');
    }
    return fetchPlaces(match[1]);
  } else throw Error('Expected URL like "/planets" or "/planets/earth/places". Received: "' + url + '".');
}

async function fetchPlanets() {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve([{
        id: 'earth',
        name: 'Earth'
      }, {
        id: 'venus',
        name: 'Venus'
      }, {
        id: 'mars',
        name: 'Mars'        
      }]);
    }, 1000);
  });
}

async function fetchPlaces(planetId) {
  if (typeof planetId !== 'string') {
    throw Error(
      'fetchPlaces(planetId) expects a string argument. ' +
      'Instead received: ' + planetId + '.'
    );
  }
  return new Promise(resolve => {
    setTimeout(() => {
      if (planetId === 'earth') {
        resolve([{
          id: 'laos',
          name: 'Laos'
        }, {
          id: 'spain',
          name: 'Spain'
        }, {
          id: 'vietnam',
          name: 'Vietnam'        
        }]);
      } else if (planetId === 'venus') {
        resolve([{
          id: 'aurelia',
          name: 'Aurelia'
        }, {
          id: 'diana-chasma',
          name: 'Diana Chasma'
        }, {
          id: 'kumsong-vallis',
          name: 'Kŭmsŏng Vallis'        
        }]);
      } else if (planetId === 'mars') {
        resolve([{
          id: 'aluminum-city',
          name: 'Aluminum City'
        }, {
          id: 'new-new-york',
          name: 'New New York'
        }, {
          id: 'vishniac',
          name: 'Vishniac'
        }]);
      } else throw Error('Unknown planet ID: ' + planetId);
    }, 1000);
  });
}
```

```css
label { display: block; margin-bottom: 10px; }
```

</Sandpack>

<Solution>

Здесь работают два независимых процесса связи:

- Первый список выбора связан с удалённым перечнем планет.
- Второй список выбора связан с удалённым перечнем мест для выбранного сейчас `planetId`.

Вот почему разумно описать их как два отдельных Воздействия. Вот пример того, как это можно сделать:


<Sandpack>

```js src/App.js
import { useState, useEffect } from 'react';
import { fetchData } from './api.js';

export default function Page() {
  const [planetList, setPlanetList] = useState([])
  const [planetId, setPlanetId] = useState('');

  const [placeList, setPlaceList] = useState([]);
  const [placeId, setPlaceId] = useState('');

  useEffect(() => {
    let ignore = false;
    fetchData('/planets').then(result => {
      if (!ignore) {
        console.log('Fetched a list of planets.');
        setPlanetList(result);
        setPlanetId(result[0].id); // Select the first planet
      }
    });
    return () => {
      ignore = true;
    }
  }, []);

  useEffect(() => {
    if (planetId === '') {
      // Nothing is selected in the first box yet
      return;
    }

    let ignore = false;
    fetchData('/planets/' + planetId + '/places').then(result => {
      if (!ignore) {
        console.log('Fetched a list of places on "' + planetId + '".');
        setPlaceList(result);
        setPlaceId(result[0].id); // Select the first place
      }
    });
    return () => {
      ignore = true;
    }
  }, [planetId]);

  return (
    <>
      <label>
        Pick a planet:{' '}
        <select value={planetId} onChange={e => {
          setPlanetId(e.target.value);
        }}>
          {planetList.map(planet =>
            <option key={planet.id} value={planet.id}>{planet.name}</option>
          )}
        </select>
      </label>
      <label>
        Pick a place:{' '}
        <select value={placeId} onChange={e => {
          setPlaceId(e.target.value);
        }}>
          {placeList.map(place =>
            <option key={place.id} value={place.id}>{place.name}</option>
          )}
        </select>
      </label>
      <hr />
      <p>You are going to: {placeId || '???'} on {planetId || '???'} </p>
    </>
  );
}
```

```js src/api.js hidden
export function fetchData(url) {
  if (url === '/planets') {
    return fetchPlanets();
  } else if (url.startsWith('/planets/')) {
    const match = url.match(/^\/planets\/([\w-]+)\/places(\/)?$/);
    if (!match || !match[1] || !match[1].length) {
      throw Error('Expected URL like "/planets/earth/places". Received: "' + url + '".');
    }
    return fetchPlaces(match[1]);
  } else throw Error('Expected URL like "/planets" or "/planets/earth/places". Received: "' + url + '".');
}

async function fetchPlanets() {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve([{
        id: 'earth',
        name: 'Earth'
      }, {
        id: 'venus',
        name: 'Venus'
      }, {
        id: 'mars',
        name: 'Mars'        
      }]);
    }, 1000);
  });
}

async function fetchPlaces(planetId) {
  if (typeof planetId !== 'string') {
    throw Error(
      'fetchPlaces(planetId) expects a string argument. ' +
      'Instead received: ' + planetId + '.'
    );
  }
  return new Promise(resolve => {
    setTimeout(() => {
      if (planetId === 'earth') {
        resolve([{
          id: 'laos',
          name: 'Laos'
        }, {
          id: 'spain',
          name: 'Spain'
        }, {
          id: 'vietnam',
          name: 'Vietnam'        
        }]);
      } else if (planetId === 'venus') {
        resolve([{
          id: 'aurelia',
          name: 'Aurelia'
        }, {
          id: 'diana-chasma',
          name: 'Diana Chasma'
        }, {
          id: 'kumsong-vallis',
          name: 'Kŭmsŏng Vallis'        
        }]);
      } else if (planetId === 'mars') {
        resolve([{
          id: 'aluminum-city',
          name: 'Aluminum City'
        }, {
          id: 'new-new-york',
          name: 'New New York'
        }, {
          id: 'vishniac',
          name: 'Vishniac'
        }]);
      } else throw Error('Unknown planet ID: ' + planetId);
    }, 1000);
  });
}
```

```css
label { display: block; margin-bottom: 10px; }
```

</Sandpack>

Этот код немного повторяется. Однако это не повод объединять всё в одно Воздействие! Если ты так поступишь, тебе придётся объединить нужды обоих Воздействий в один список, и тогда смена планеты приведёт к повторному запросу списка всех планет. Воздействия — это не инструмент для повторного использования кода.

Вместо этого, чтобы убрать повторы, ты можешь вынести часть логики в личное подключение, например `useSelectOptions`:


<Sandpack>

```js src/App.js
import { useState } from 'react';
import { useSelectOptions } from './useSelectOptions.js';

export default function Page() {
  const [
    planetList,
    planetId,
    setPlanetId
  ] = useSelectOptions('/planets');

  const [
    placeList,
    placeId,
    setPlaceId
  ] = useSelectOptions(planetId ? `/planets/${planetId}/places` : null);

  return (
    <>
      <label>
        Pick a planet:{' '}
        <select value={planetId} onChange={e => {
          setPlanetId(e.target.value);
        }}>
          {planetList?.map(planet =>
            <option key={planet.id} value={planet.id}>{planet.name}</option>
          )}
        </select>
      </label>
      <label>
        Pick a place:{' '}
        <select value={placeId} onChange={e => {
          setPlaceId(e.target.value);
        }}>
          {placeList?.map(place =>
            <option key={place.id} value={place.id}>{place.name}</option>
          )}
        </select>
      </label>
      <hr />
      <p>You are going to: {placeId || '...'} on {planetId || '...'} </p>
    </>
  );
}
```

```js src/useSelectOptions.js
import { useState, useEffect } from 'react';
import { fetchData } from './api.js';

export function useSelectOptions(url) {
  const [list, setList] = useState(null);
  const [selectedId, setSelectedId] = useState('');
  useEffect(() => {
    if (url === null) {
      return;
    }

    let ignore = false;
    fetchData(url).then(result => {
      if (!ignore) {
        setList(result);
        setSelectedId(result[0].id);
      }
    });
    return () => {
      ignore = true;
    }
  }, [url]);
  return [list, selectedId, setSelectedId];
}
```

```js src/api.js hidden
export function fetchData(url) {
  if (url === '/planets') {
    return fetchPlanets();
  } else if (url.startsWith('/planets/')) {
    const match = url.match(/^\/planets\/([\w-]+)\/places(\/)?$/);
    if (!match || !match[1] || !match[1].length) {
      throw Error('Expected URL like "/planets/earth/places". Received: "' + url + '".');
    }
    return fetchPlaces(match[1]);
  } else throw Error('Expected URL like "/planets" or "/planets/earth/places". Received: "' + url + '".');
}

async function fetchPlanets() {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve([{
        id: 'earth',
        name: 'Earth'
      }, {
        id: 'venus',
        name: 'Venus'
      }, {
        id: 'mars',
        name: 'Mars'        
      }]);
    }, 1000);
  });
}

async function fetchPlaces(planetId) {
  if (typeof planetId !== 'string') {
    throw Error(
      'fetchPlaces(planetId) expects a string argument. ' +
      'Instead received: ' + planetId + '.'
    );
  }
  return new Promise(resolve => {
    setTimeout(() => {
      if (planetId === 'earth') {
        resolve([{
          id: 'laos',
          name: 'Laos'
        }, {
          id: 'spain',
          name: 'Spain'
        }, {
          id: 'vietnam',
          name: 'Vietnam'        
        }]);
      } else if (planetId === 'venus') {
        resolve([{
          id: 'aurelia',
          name: 'Aurelia'
        }, {
          id: 'diana-chasma',
          name: 'Diana Chasma'
        }, {
          id: 'kumsong-vallis',
          name: 'Kŭmsŏng Vallis'        
        }]);
      } else if (planetId === 'mars') {
        resolve([{
          id: 'aluminum-city',
          name: 'Aluminum City'
        }, {
          id: 'new-new-york',
          name: 'New New York'
        }, {
          id: 'vishniac',
          name: 'Vishniac'
        }]);
      } else throw Error('Unknown planet ID: ' + planetId);
    }, 1000);
  });
}
```

```css
label { display: block; margin-bottom: 10px; }
```

</Sandpack>

Загляни во вкладку `useSelectOptions.js` в песочнице, чтобы увидеть, как это устроено. В идеале большинство Воздействий в твоём приложении со временем должны быть заменены личными подключениями — написанными тобой или сообществом. Личные подключения прячут логику связи внутри себя, так что вызывающая часть даже не знает о Воздействии. По мере работы над приложением у тебя сложится целый набор подключений на выбор, и со временем тебе уже не придётся писать Воздействия внутри своих частей так часто.


</Solution>

</Challenges>
