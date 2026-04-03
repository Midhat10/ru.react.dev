---
title: "Представляем react.dev"
author: Дан Абрамов и Рашель Наборс
date: 2023/03/16
description: Сегодня мы с трепетом запускаем react.dev — новый дом для Расписывателя и его устава. В этой грамоте мы желаем провести для тебя прогулку по новому подворью.
---

16 марта 2023 г., [Дан Абрамов](https://bsky.app/profile/danabra.mov) и [Рашель Наборс](https://twitter.com/rachelnabors)

---

<Intro>

Сегодня мы с трепетом запускаем [react.dev](https://react.dev) — новый дом для **Расписывателя** (React) и его устава (документации). В этой грамоте мы желаем провести для тебя прогулку по новому подворью.

</Intro>

---

## Вкратце {/*tldr*/}

* Новое подворье **Расписывателя** ([react.dev](https://react.dev)) обучает современному письму через части-дела (функции) и особые Приёмы (Хуки).
* Мы добавили чертежи, лики, испытания и более 600 новых живых примеров.
* Прежнее подворье с уставом теперь переехало на [legacy.reactjs.org](https://legacy.reactjs.org).

## Новое подворье, новое имя, новый зачин {/*new-site-new-domain-new-homepage*/}

Для начала — немного хозяйственных вестей.

Дабы отпраздновать запуск нового устава и, что важнее, чётко отделить былые труды от новых, мы переехали на краткое имя [react.dev](https://react.dev). Старое имя [reactjs.org](https://reactjs.org) теперь будет приводить тебя сюда.

Ветхие уставы **Расписывателя** ныне сокрыты в архиве на [legacy.reactjs.org](https://legacy.reactjs.org). Все старые связи (ссылки) будут сами направлять туда, дабы не «ломать мировую сеть», но обновляться то ветхое подворье более не будет.

Верь или нет, но **Расписывателю** скоро исполнится десять лет. В годах Свода Жизни (JavaScript) это целое столетие! Мы [обновили заглавную страницу](https://react.dev), дабы явить, почему мы считаем **Расписыватель** добрым способом созидать облик для гостя сегодня, и поправили руководства для новичков, выделив современные основы (фреймворки).

Если ты ещё не зрел новый зачин — взгляни!

## Полный переход на современный Расписыватель с Приёмами {/*going-all-in-on-modern-react-with-hooks*/}

Когда в 2018 году мы явили миру особые Приёмы (Хуки), те правила полагали, что читатель уже знаком с сословиями (классами). Это помогло миру быстро принять Приёмы, но со временем старый устав перестал служить новым читателям. Им приходилось учить **Расписыватель** дважды: сначала через сословия, а затем снова через Приёмы.

**Новый устав обучает Расписывателю через Приёмы с самого начала.** Весь устав поделен на две главные части:

* **[Постижение Расписывателя](/learn)** — это путь для самоличного прохождения, обучающий делу с чистого листа.
* **[Справочник Посредников](/reference)** — даёт все подробности и примеры использования для каждого **Посредника** (API) Расписывателя.

Давай присмотримся поближе к тому, что можно найти в каждой части.

<Note>

Всё ещё остаются редкие случаи использования сословий (классов), у которых нет замены через Приёмы. Сословия по-прежнему поддерживаются и описаны в разделе [Забытые Посредники](/reference/react/legacy) на новом подворье.

</Note>


## Быстрый зачин {/*quick-start*/}

Раздел «Постижение» открывается страницей [Быстрый зачин](/learn). Это краткая прогулка по миру **Расписывателя** (React). Она знакомит с правилами письма (синтаксисом) для таких понятий, как составные части, **настройки** (пропсы) и данные из хранилищ (состояние), но не вдаётся в глубокие подробности их использования.

Если тебе любо постигать через дело, мы советуем следом заглянуть в [Поучение: Крестики-нолики](/learn/tutorial-tic-tac-toe). Оно проведёт тебя через созидание небольшой забавы на **Расписывателе**, обучая умениям, которые пригодятся тебе в каждом будничном деле. Вот что ты возведёшь:


<Sandpack>

```js src/App.js
import { useState } from 'react';

function Square({ value, onSquareClick }) {
  return (
    <button className="square" onClick={onSquareClick}>
      {value}
    </button>
  );
}

function Board({ xIsNext, squares, onPlay }) {
  function handleClick(i) {
    if (calculateWinner(squares) || squares[i]) {
      return;
    }
    const nextSquares = squares.slice();
    if (xIsNext) {
      nextSquares[i] = 'X';
    } else {
      nextSquares[i] = 'O';
    }
    onPlay(nextSquares);
  }

  const winner = calculateWinner(squares);
  let status;
  if (winner) {
    status = 'Winner: ' + winner;
  } else {
    status = 'Next player: ' + (xIsNext ? 'X' : 'O');
  }

  return (
    <>
      <div className="status">{status}</div>
      <div className="board-row">
        <Square value={squares[0]} onSquareClick={() => handleClick(0)} />
        <Square value={squares[1]} onSquareClick={() => handleClick(1)} />
        <Square value={squares[2]} onSquareClick={() => handleClick(2)} />
      </div>
      <div className="board-row">
        <Square value={squares[3]} onSquareClick={() => handleClick(3)} />
        <Square value={squares[4]} onSquareClick={() => handleClick(4)} />
        <Square value={squares[5]} onSquareClick={() => handleClick(5)} />
      </div>
      <div className="board-row">
        <Square value={squares[6]} onSquareClick={() => handleClick(6)} />
        <Square value={squares[7]} onSquareClick={() => handleClick(7)} />
        <Square value={squares[8]} onSquareClick={() => handleClick(8)} />
      </div>
    </>
  );
}

export default function Game() {
  const [history, setHistory] = useState([Array(9).fill(null)]);
  const [currentMove, setCurrentMove] = useState(0);
  const xIsNext = currentMove % 2 === 0;
  const currentSquares = history[currentMove];

  function handlePlay(nextSquares) {
    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
  }

  function jumpTo(nextMove) {
    setCurrentMove(nextMove);
  }

  const moves = history.map((squares, move) => {
    let description;
    if (move > 0) {
      description = 'Go to move #' + move;
    } else {
      description = 'Go to game start';
    }
    return (
      <li key={move}>
        <button onClick={() => jumpTo(move)}>{description}</button>
      </li>
    );
  });

  return (
    <div className="game">
      <div className="game-board">
        <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay} />
      </div>
      <div className="game-info">
        <ol>{moves}</ol>
      </div>
    </div>
  );
}

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}
```

```css src/styles.css
* {
  box-sizing: border-box;
}

body {
  font-family: sans-serif;
  margin: 20px;
  padding: 0;
}

.square {
  background: #fff;
  border: 1px solid #999;
  float: left;
  font-size: 24px;
  font-weight: bold;
  line-height: 34px;
  height: 34px;
  margin-right: -1px;
  margin-top: -1px;
  padding: 0;
  text-align: center;
  width: 34px;
}

.board-row:after {
  clear: both;
  content: '';
  display: table;
}

.status {
  margin-bottom: 10px;
}
.game {
  display: flex;
  flex-direction: row;
}

.game-info {
  margin-left: 20px;
}
```

</Sandpack>

Мы также желаем выделить наставление [«Мыслим в духе Расписывателя»](/learn/thinking-in-react) — именно оно заставило всё «встать на свои места» для многих из нас. **Мы обновили оба этих классических поучения, чтобы в них использовались части-дела (функции) и особые Приёмы (Хуки),** так что они теперь как новенькие.

<Note>

Пример выше — это *песочница*. Мы добавили множество таких песочниц — более 600! — по всему нашему подворью. Ты можешь править любую из них или нажать «Раздвоить» (Fork) в верхнем правом углу, дабы открыть её в отдельной вкладке. Песочницы позволяют тебе быстро играть с **Посредниками** (APIs) Расписывателя, изведывать свои задумки и проверять своё понимание.

</Note>


## Постигай Расписыватель шаг за шагом {/*learn-react-step-by-step*/}

Мы желаем, чтобы у каждого в мире была равная возможность безвозмездно и самостоятельно обучиться **Расписывателю**.

Посему раздел «Обучение» устроен как путь для самоличного прохождения, поделенный на главы. Первые две главы повествуют об основах **Расписывателя**. Если ты только начинаешь знакомство или хочешь освежить былое в памяти, начни здесь:

- **[Очерк облика](/learn/describing-the-ui)** научит, как являть данные с помощью составных частей.
- **[Добавление живости](/learn/adding-interactivity)** научит, как обновлять экран в ответ на действия гостя.

Следующие две главы более мудрёные, они дадут тебе глубокое видение самых хитрых мест:

- **[Правление запасом](/learn/managing-state)** научит, как ладить с правилами, когда твоё дело становится сложнее.
- **[Запасные выходы](/learn/escape-hatches)** научат, как можно «выйти за пределы» **Расписывателя** и когда это имеет наибольший смысл.

 Каждая глава состоит из нескольких родственных страниц. Большинство из них обучают особому умению или приёму — к примеру, [Письмо разметки через JSX](/learn/writing-markup-with-jsx), [Обновление предметов в хранилище](/learn/updating-objects-in-state) или [Обмен данными между частями](/learn/sharing-state-between-components). Некоторые страницы поясняют саму мысль — как [Отрисовка и Передача](/learn/render-and-commit) или [Состояние как Снимок мига](/learn/state-as-a-snapshot). А есть и такие, как [Возможно, тебе не нужно Воздействие](/learn/you-might-not-need-an-effect), где мы делимся советами, основанными на нашем многолетнем опыте.

Тебе вовсе не обязательно читать эти главы по порядку. У кого на это есть время?! Но ты можешь. Страницы в разделе «Обучение» опираются только на те понятия, что были явлены ранее. Если хочешь прочесть это как книгу — в добрый путь!


### Проверь своё понимание через испытания {/*check-your-understanding-with-challenges*/}

Большинство страниц в разделе «Обучение» заканчиваются несколькими испытаниями, дабы проверить твоё понимание. К примеру, вот пара задач со страницы об [Условной отрисовке](/learn/conditional-rendering#challenges).

Тебе не обязательно решать их прямо сейчас! Разве что тебе *очень* приспичило.

<Challenges noTitle={true}>

#### Яви знак для незавершённых дел через `? :` {/*show-an-icon-for-incomplete-items-with--*/}

Используй условный наказ (`условие ? а : б`), чтобы отрисовать ❌, если `isPacked` (уложено) не является истиной (`true`).


<Sandpack>

```js
function Item({ name, isPacked }) {
  return (
    <li className="item">
      {name} {isPacked && '✅'}
    </li>
  );
}

export default function PackingList() {
  return (
    <section>
      <h1>Sally Ride's Packing List</h1>
      <ul>
        <Item 
          isPacked={true} 
          name="Space suit" 
        />
        <Item 
          isPacked={true} 
          name="Helmet with a golden leaf" 
        />
        <Item 
          isPacked={false} 
          name="Photo of Tam" 
        />
      </ul>
    </section>
  );
}
```

</Sandpack>

<Solution>

<Sandpack>

```js
function Item({ name, isPacked }) {
  return (
    <li className="item">
      {name} {isPacked ? '✅' : '❌'}
    </li>
  );
}

export default function PackingList() {
  return (
    <section>
      <h1>Sally Ride's Packing List</h1>
      <ul>
        <Item 
          isPacked={true} 
          name="Space suit" 
        />
        <Item 
          isPacked={true} 
          name="Helmet with a golden leaf" 
        />
        <Item 
          isPacked={false} 
          name="Photo of Tam" 
        />
      </ul>
    </section>
  );
}
```

</Sandpack>

</Solution>

#### Яви важность дела через `&&` {/*show-the-item-importance-with-*/}

В этом примере каждая часть страницы `Item` (Дело) получает числовую **Настройку** (пропс) `importance` (важность). Используй наказ `&&` (и), чтобы отрисовать *«(Важность: Х)»* курсивом, но только для тех дел, чья важность не равна нулю. Твой список дел в итоге должен выглядеть так:

* Космический скафандр *(Важность: 9)*
* Шлем с золотым листом
* Снимок Тэма *(Важность: 6)*

Не забудь добавить пробел между двумя надписями!


<Sandpack>

```js
function Item({ name, importance }) {
  return (
    <li className="item">
      {name}
    </li>
  );
}

export default function PackingList() {
  return (
    <section>
      <h1>Sally Ride's Packing List</h1>
      <ul>
        <Item 
          importance={9} 
          name="Space suit" 
        />
        <Item 
          importance={0} 
          name="Helmet with a golden leaf" 
        />
        <Item 
          importance={6} 
          name="Photo of Tam" 
        />
      </ul>
    </section>
  );
}
```

</Sandpack>

<Solution>

Это должно сработать (принести плоды):

<Sandpack>

```js
function Item({ name, importance }) {
  return (
    <li className="item">
      {name}
      {importance > 0 && ' '}
      {importance > 0 &&
        <i>(Importance: {importance})</i>
      }
    </li>
  );
}

export default function PackingList() {
  return (
    <section>
      <h1>Sally Ride's Packing List</h1>
      <ul>
        <Item 
          importance={9} 
          name="Space suit" 
        />
        <Item 
          importance={0} 
          name="Helmet with a golden leaf" 
        />
        <Item 
          importance={6} 
          name="Photo of Tam" 
        />
      </ul>
    </section>
  );
}
```

</Sandpack>

Заметь, что тебе следует писать `importance > 0 && ...` (важность больше нуля), а не просто `importance && ...`, дабы в случае, если **важность** равна `0`, этот самый ноль не вывелся как итог на экран!

В этом решении используются два отдельных условия, чтобы вставить пробел между именем и меткой важности. В ином случае ты мог бы использовать **Зерно** (Fragment) с ведущим пробелом: `importance > 0 && <> <i>...</i></>` или добавить пробел прямо внутрь `<i>`: `importance > 0 && <i> ...</i>`.

</Solution>

</Challenges>

Обрати внимание на кнопку «Показать решение» в левом нижнем углу. Она сподручна, если ты хочешь проверить себя!

### Настрой своё чутьё через чертежи и лики {/*build-an-intuition-with-diagrams-and-illustrations*/}

Когда нам не хватало слов и кода, дабы пояснить суть дела, мы добавляли чертежи, что помогают настроить чутьё. К примеру, вот один из чертежей со страницы о [Сохранении и Сбросе запаса сведений (состояния)](/learn/preserving-and-resetting-state):

<Diagram name="preserving_state_diff_same_pt1" height={350} width={794} alt="Чертеж с тремя частями. Первая содержит узел div с ребенком section, внутри которого живет Счётчик с запасом 3. Во второй части section удален. В третьей на месте section явился div с новым Счётчиком, чей запас равен 0.">

Когда `section` (секция) сменяется на `div` (блок), старая секция удаляется, и добавляется новый блок.

</Diagram>

Ты также встретишь разные лики (иллюстрации) по всему уставу — вот один из них, где [обозреватель расцвечивает экран](/learn/render-and-commit#epilogue-browser-paint):

<Illustration alt="Обозреватель рисует натюрморт с карточкой." src="/images/docs/illustrations/i_browser-paint.png" />

Мы получили подтверждение от создателей обозревателей, что сие изображение на все 100% научно верно.


## Новый, подробный Справочник Посредников {/*a-new-detailed-api-reference*/}

В [Справочнике Посредников](/reference/react) (API Reference) у каждого **Посредника** Расписывателя теперь есть своя страница. Это касается всех видов орудий:

- Врождённые Приёмы, такие как [`useState`](/reference/react/useState) (установка запаса).
- Врождённые части страницы, такие как [`<Suspense>`](/reference/react/Suspense) (ожидание).
- Обычные части обозревателя, такие как [`<input>`](/reference/react-dom/components/input) (поле ввода).
- Посредники для основ (фреймворков), такие как [`renderToPipeableStream`](/reference/react-dom/server/renderToReadableStream) (поточная отрисовка).
- Иные орудия Расписывателя, такие как [`memo`](/reference/react/memo) (заповедная часть).

Ты заметишь, что страница каждого Посредника поделена как минимум на две части: *Описание* (Reference) и *Применение* (Usage).

[Описание](/reference/react/useState#reference) даёт строгий очерк того, как выглядит орудие, перечисляя его доводы (аргументы) и то, что оно возвращает. Оно краткое, но может показаться туманным, если ты ещё не знаком с этим орудием. Оно говорит, что Посредник делает, но не как его обуздать.

[Применение](/reference/react/useState#usage) являет, зачем и как тебе использовать это орудие на деле — так, как поведал бы соратник или добрый друг. Оно открывает **верные случаи того, как каждый Посредник задумывался к использованию дружиной Расписывателя.** Мы добавили расцвеченные куски кода, примеры совместного труда разных орудий и готовые наказы (рецепты), кои ты можешь просто перенести к себе:

<Recipes titleText="Простые примеры установки запаса" titleId="examples-basic">

#### Счётчик (число) {/*counter-number*/}

В этом примере в хранилище `count` (счёт) лежит число. Нажатие на кнопку прибавляет к нему единицу.


<Sandpack>

```js
import { useState } from 'react';

export default function Counter() {
  const [count, setCount] = useState(0);

  function handleClick() {
    setCount(count + 1);
  }

  return (
    <button onClick={handleClick}>
      You pressed me {count} times
    </button>
  );
}
```

</Sandpack>

<Solution />

#### Text field (string) {/*text-field-string*/}

In this example, the `text` state variable holds a string. When you type, `handleChange` reads the latest input value from the browser input DOM element, and calls `setText` to update the state. This allows you to display the current `text` below.

<Sandpack>

```js
import { useState } from 'react';

export default function MyInput() {
  const [text, setText] = useState('hello');

  function handleChange(e) {
    setText(e.target.value);
  }

  return (
    <>
      <input value={text} onChange={handleChange} />
      <p>You typed: {text}</p>
      <button onClick={() => setText('hello')}>
        Reset
      </button>
    </>
  );
}
```

</Sandpack>

<Solution />

#### Checkbox (boolean) {/*checkbox-boolean*/}

In this example, the `liked` state variable holds a boolean. When you click the input, `setLiked` updates the `liked` state variable with whether the browser checkbox input is checked. The `liked` variable is used to render the text below the checkbox.

<Sandpack>

```js
import { useState } from 'react';

export default function MyCheckbox() {
  const [liked, setLiked] = useState(true);

  function handleChange(e) {
    setLiked(e.target.checked);
  }

  return (
    <>
      <label>
        <input
          type="checkbox"
          checked={liked}
          onChange={handleChange}
        />
        I liked this
      </label>
      <p>You {liked ? 'liked' : 'did not like'} this.</p>
    </>
  );
}
```

</Sandpack>

<Solution />

#### Form (two variables) {/*form-two-variables*/}

You can declare more than one state variable in the same component. Each state variable is completely independent.

<Sandpack>

```js
import { useState } from 'react';

export default function Form() {
  const [name, setName] = useState('Taylor');
  const [age, setAge] = useState(42);

  return (
    <>
      <input
        value={name}
        onChange={e => setName(e.target.value)}
      />
      <button onClick={() => setAge(age + 1)}>
        Increment age
      </button>
      <p>Hello, {name}. You are {age}.</p>
    </>
  );
}
```

```css
button { display: block; margin-top: 10px; }
```

</Sandpack>

<Solution />

</Recipes>

Некоторые страницы **Посредников** также включают разделы [Устранение неполадок](/reference/react/useEffect#troubleshooting) (для привычных бед) и [Иные пути](/reference-dom/findDOMNode#alternatives) (для забытых орудий).

Мы надеемся, что такой подход сделает справочник полезным не только как способ подсмотреть довод (аргумент), но и как путь узреть всё многообразие дел, что можно сотворить с любым орудием — и как оно связано с остальными.

## Что дальше? {/*whats-next*/}

На этом наша малая прогулка окончена! Оглядись на новом подворье, примечай, что тебе любо, а что нет, и присылай свои вести в наш [список дел](https://github.com/reactjs/react.dev/issues).

Мы признаём, что сей труд занял долгое время. Мы желали держать высокую планку качества, коей достойна вся дружина **Расписывателя**. Пока мы писали сей устав и созидали примеры, мы находили изъяны в собственных речах, ошибки в самом **Расписывателе** и даже пустоты в его устройстве, над коими ныне трудимся. Мы верим, что новый устав поможет нам в будущем держать и сам **Расписыватель** на недосягаемой высоте.

Мы вняли многим твоим прошениям о расширении подворья, к примеру:

- Предоставление версии на **Образе действия** (TypeScript) для всех примеров;
- Создание обновлённых руководств по скорости, проверке (тестированию) и доступности для всех гостей;
- Описание **Серверных частей** отдельно от основ (фреймворков), что их поддерживают;
- Труд с международной дружиной над переводом нового устава;
- Добавление недостающих дел на само подворье (к примеру, вещание RSS для этой летописи).

Теперь, когда [react.dev](https://react.dev/) вышел в мир, мы сможем переключить внимание с «погони» за сторонними учителями на добавление новых вестей и дальнейшее украшение нашего подворья.

Мы полагаем, что ныне — лучшее время, дабы постигать **Расписыватель**.

## Кто трудился над сим? {/*who-worked-on-this*/}

В дружине **Расписывателя** [Рашель Наборс](https://twitter.com/rachelnabors/) вела сей проект (и создала лики-иллюстрации), а [Дан Абрамов](https://bsky.app/profile/danabra.mov) проложил путь обучения. Они же вместе составили большую часть писания.

Разумеется, ни одно столь великое дело не вершится в одиночку. Нам есть за что благодарить многих людей!

[Сильвия Варгас](https://twitter.com/SylwiaVargas) переделала наши примеры, дабы уйти от пустых имен и котят к учёным, творцам и городам со всего света. [Мэгги Эпплтон](https://twitter.com/Mappletons) превратила наши наброски в стройную систему чертежей.

Благодарим [Давида Маккейба](https://twitter.com/mcc_abe), [Софи Альперт](https://twitter.com/sophiebits), [Рика Хэнлона](https://twitter.com/rickhanlonii), [Эндрю Кларка](https://twitter.com/acdlite) и [Мэтта Кэрролла](https://twitter.com/mattcarrollcode) за их вклад в писание. Также благодарим [Наталью Теплухину](https://twitter.com/n_tepluhina) и [Себастьяна Маркбоге](https://twitter.com/sebmarkbage) за их мысли и советы.

Спасибо [Дану Лебовицу](https://twitter.com/lebo) за облик подворья и [Раззану Градинару](https://dribbble.com/GradinarRazvan) за облик песочниц.

На поприще зодчества спасибо [Джареду Палмеру](https://twitter.com/jaredpalmer) за первые пробы. Благодарим [Дейна Гранта](https://twitter.com/danecando) и [Дастина Гудмана](https://twitter.com/dustinsgoodman) из [ThisDotLabs](https://www.thisdot.co/) за помощь в возведении облика. Спасибо [Ивсу ван Хоорну](https://twitter.com/CompuIves), [Алексу Молдовану](https://twitter.com/alexnmoldovan), [Джасперу Де Моору](https://twitter.com/JasperDeMoor) и [Данило Вознике](https://twitter.com/danilowoz) из [CodeSandbox](https://codesandbox.io/) за их труд над вложением песочниц. Спасибо [Рику Хэнлону](https://twitter.com/rickhanlonii) за правку цветов и мелких примет. Благодарим [Хариша Кумара](https://www.strek.in/) и [Луну Руан](https://twitter.com/lunaruan) за добавление новых дел на подворье и заботу о нём.

Огромное спасибо тем, кто безвозмездно отдал своё время, дабы испытать устав на ранних порах. Твоё рвение и бесценные вести помогли нам придать форму этому труду. Особая благодарность нашему испытателю [Дебби О'Брайен](https://twitter.com/debs_obrien), коя поведала о своём опыте работы с уставом на соборе React Conf 2021.

Наконец, благодарим всё **мирское сообщество Расписывателя** за то, что вдохновляли нас. Ты — причина, по которой мы вершим это, и мы надеемся, что новый устав поможет тебе использовать **Расписыватель** для созидания любого облика, коего ты пожелаешь.

