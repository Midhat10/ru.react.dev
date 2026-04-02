---
title: useState
---

<Intro>

`useState` — это **Подключение** Расписывателя, которое дозволяет тебе наделить свою [составную часть](/learn/state-a-components-memory) **состоянием** (переменной памятью).

```js
const [state, setState] = useState(initialState)
```

</Intro>

<InlineToc />

---

## Толкование {/*reference*/}

### `useState(initialState)` {/*usestate*/}

Зови `useState` в самом зачине своей составной части, дабы завести **хранимку** [для её вестей.](/learn/state-a-components-memory)


```js
import { useState } from 'react';

function MyComponent() {
  const [age, setAge] = useState(28);
  const [name, setName] = useState('Taylor');
  const [todos, setTodos] = useState(() => createTodos());
  // ...
```

Обычай велит давать имена **хранимкам** по образу `[something, setSomething]`, используя [расплетание ряда.](https://javascript.info)

[Гляди примеры ниже.](#usage)

#### Доводы {/*parameters*/}

* `initialState`: Значение, которое ты хочешь заложить в **хранимку** изначально. Оно может быть любого рода, но для дел (функций) есть особый нрав. Этот довод будет оставлен без внимания после первой отрисовки.
  * Если ты передашь дело как `initialState`, оно будет считаться _зачинающим делом_. Оно должно быть чистым, не принимать доводов и возвращать значение любого рода. Расписыватель позовёт твоё зачинающее дело при созидании составной части и упрячет его исход как зачин **хранимки**. [Гляди пример ниже.](#avoiding-recreating-the-initial-state)

#### Исход {/*returns*/}

`useState` возвращает ряд ровно из двух значений:

1. Нынешнее состояние **хранимки**. При первой отрисовке оно будет ладить с тем `initialState`, что ты передал.
2. [`set` function](#setstate) (дело-правильщик), которое дозволяет тебе обновить **хранимку** до иного значения и побудить к **перерисовке**.

#### Предостережения {/*caveats*/}

* `useState` — это **Подключение**, посему ты можешь звать его только **в самом зачине своей составной части** или в своих собственных Подключениях. Ты не можешь звать его внутри кругов (циклов) или условий. Если тебе это надобно — выдели новую часть и перенеси **хранимку** в неё.
* В **Строгом уставе** Расписыватель **позовёт твоё зачинающее дело дважды**, дабы [помочь тебе сыскать случайную нечистоту в уставе.](#my-initializer-or-updater-function-runs-twice) Сие творится лишь при созидании и не влияет на **живое дело**. Если твоё дело чистое (каким ему и подобает быть), это не сдвинет смысл работы. Исход одного из призывов будет отброшен.

---

### `set` functions, вроде `setSomething(nextState)` {/*setstate*/}

Дело-правильщик `set`, возвращаемое `useState`, дозволяет тебе обновить **хранимку** до иного значения и побудить к **перерисовке**. Ты можешь передать новую хранимку прямо или через дело, которое высчитает его на основе прошлого:


```js
const [name, setName] = useState('Edward');

function handleClick() {
  setName('Taylor');
  setAge(a => a + 1);
  // ...
  }
```

#### Доводы {/*setstate-parameters*/}

* `nextState`: Значение, которое ты хочешь заложить в **хранимку**. Оно может быть любого рода, но для дел есть особый нрав.
  * Если ты передашь дело как `nextState`, оно будет считаться _обновляющим делом_. Оно должно быть чистым, принимать лишь один довод (ожидающее состояние) и возвращать следующее состояние. Расписыватель поставит твоё обновляющее дело в очередь и наметит **перерисовку** части. Во время следующей отрисовки Расписыватель высчитает новое состояние, применив все накопленные в очереди дела к прошлому значению. [Гляди пример ниже.](#updating-state-based-on-the-previous-state)

#### Исход {/*setstate-returns*/}

Дела `set` не возвращают никакого значения.

#### Предостережения {/*setstate-caveats*/}

* Дело `set` **обновляет хранимку только для *следующей* отрисовки**. Если ты попытаешься прочесть значение из **хранимки** тотчас после призыва `set`, [ты всё ещё получишь старое значение](#ive-updated-the-state-but-logging-gives-me-the-old-value), которое было на экране до твоего призыва.

* Если новое значение, коие ты даёшь, тождественно нынешнему (что проверяется через сличение [`Object.is`](https://mozilla.org)), Расписыватель **пропустит перерисовку части и всех её чад.** Сие нужно для сбережения мощи. Хотя в иных случаях Расписыватель всё же может позвать твою часть перед тем, как пропустить чад, на твой устав это влиять не должно.

* Расписыватель [собирает правки состояния в пучки.](/learn/queueing-a-series-of-state-updates) Он обновляет экран **после того, как отработают все распорядители деяний** и позовут свои дела `set`. Это упреждает множественные перерисовки во время одного деяния. В редких случаях, когда тебе нужно заставить Расписыватель обновить экран раньше (например, для доступа к узлам разметки), можно использовать [`flushSync`.](/reference/react-dom/flushSync)

* У дела `set` стойкое имя (identity), посему ты часто будешь видеть, что его не вписывают в нужды (зависимости) **Воздействий**, но его наличие там не заставит **Воздействие** срабатывать лишний раз. Если **поверщик** (линтер) дозволяет опустить нужду без погрешностей, значит, сие безопасно. [Узнай больше об изъятии нужд из Воздействий.](/learn/removing-effect-dependencies#move-dynamic-objects-and-functions-inside-your-effect)

* Звать дело `set` *во время отрисовки* дозволено только внутри той части, что отрисовывается прямо сейчас. Расписыватель отбросит её исход и тотчас попытается отрисовать её снова с новым состоянием. Такой узор письма нужен редко, но его можно использовать, дабы **беречь вести из прошлых отрисовок**. [Гляди пример ниже.](#storing-information-from-previous-renders)

* В **Строгом уставе** Расписыватель **позовёт твоё обновляющее дело дважды**, дабы [помочь тебе сыскать случайную нечистоту в уставе.](#my-initializer-or-updater-function-runs-twice) Сие творится лишь при созидании. Если твоё дело чистое, это не сдвинет смысл работы. Исход одного из призывов будет отброшен.

---

## Употребление {/*usage*/}

### Наделение части хранимкой {/*adding-state-to-a-component*/}

Зови `useState` в самом зачине своей составной части, дабы объявить одну или несколько [хранимок.](/learn/state-a-components-memory)


```js [[1, 4, "age"], [2, 4, "setAge"], [3, 4, "42"], [1, 5, "name"], [2, 5, "setName"], [3, 5, "'Taylor'"]]
import { useState } from 'react';

function MyComponent() {
  const [age, setAge] = useState(42);
  const [name, setName] = useState('Taylor');
  // ...
  }
```

Обычай велит давать имена **хранимкам** по образу `[something, setSomething]`, используя [расплетание ряда.](https://javascript.info)

`useState` возвращает ряд ровно из двух звеньев:

1. <CodeStep step={1}>Нынешнее состояние</CodeStep> этой **хранимки**, изначально равное тому <CodeStep step={3}>зачину</CodeStep>, что ты предоставил.
2. <CodeStep step={2}>`set` function</CodeStep> (дело-правильщик), которое дозволяет тебе сменить его на любое иное значение в ответ на волеизъявление.

Чтобы обновить то, что начертано на экране, позови дело `set` с новым состоянием:


```js [[2, 2, "setName"]]
function handleClick() {
  setName('Robin');
}
```

**Расписыватель** упрячет следующее значение в память, отрисует твою составную часть снова с новыми значениями и обновит лик программы.

<Pitfall>

Призыв дела `set` [**не меняет** нынешнюю **хранимку** в уже выполняемом уставе](#ive-updated-the-state-but-logging-gives-me-the-old-value):



```js {3}
function handleClick() {
  setName('Robin');
  console.log(name); // Still "Taylor"!
}
```

Сие влияет лишь на то, что `useState` вернёт тебе, начиная со *следующей* отрисовки.

</Pitfall>

<Recipes titleText="Basic useState examples" titleId="examples-basic">

#### Счётчик (число) {/*counter-number*/}

В этом примере **хранимка** `count` удерживает число. Нажатие на кнопку увеличивает его.

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

#### Текстовое поле (вервь) {/*text-field-string*/}

В этом примере **хранимка** `text` удерживает вервь (строку). Когда ты пишешь, `handleChange` считывает свежее значение из узла разметки обозревателя и зовёт `setText`, дабы обновить **хранимку**. Сие позволяет явить нынешний `text` ниже.


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

#### Галочка (да-нет) {/*checkbox-boolean*/}

В этом примере **хранимка** `liked` удерживает значение «да-нет» (булево). Когда ты жмёшь на поле ввода, `setLiked` обновляет **хранимку** `liked` вестью о том, отмечена ли галочка в обозревателе. Переменная `liked` используется для отрисовки текста под полем ввода.


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

#### Образчик (две хранимки) {/*form-two-variables*/}

Ты можешь объявить более одной **хранимки** в одной и той же составной части. Каждая **хранимка** живёт своей волей, в полном обособлении от иных.


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

---

### Править хранимку на основе её прошлого значения {/*updating-state-based-on-the-previous-state*/}

Положим, `age` (возраст) равен `42`. Этот распорядитель зовёт `setAge(age + 1)` трижды:


```js
function handleClick() {
  setAge(age + 1); // setAge(42 + 1)
  setAge(age + 1); // setAge(42 + 1)
  setAge(age + 1); // setAge(42 + 1)
}
```

Однако после одного нажатия `age` станет лишь `43`, а не `45`! Сие творится оттого, что призыв дела `set` [не обновляет](/learn/state-as-a-snapshot) **хранимку** `age` в уже запущенном уставе. Посему каждый призыв `setAge(age + 1)` превращается в `setAge(43)`.

Дабы решить сию задачу, **ты можешь передать *обновляющее дело*** в `setAge` вместо следующего значения:


```js [[1, 2, "a", 0], [2, 2, "a + 1"], [1, 3, "a", 0], [2, 3, "a + 1"], [1, 4, "a", 0], [2, 4, "a + 1"]]
function handleClick() {
  setAge(a => a + 1); // setAge(42 => 43)
  setAge(a => a + 1); // setAge(43 => 44)
  setAge(a => a + 1); // setAge(44 => 45)
}
```

Здесь `a => a + 1` — это твоё **обновляющее дело**. Оно берёт <CodeStep step={1}>ожидающее значение</CodeStep> и вычисляет из него <CodeStep step={2}>следующее значение</CodeStep>.

**Расписыватель** ставит твои обновляющие дела в [очередь.](/learn/queueing-a-series-of-state-updates) Затем, во время следующей отрисовки, он позовёт их в том же порядке:

1. `a => a + 1` примет `42` как ожидающее значение и вернёт `43` как следующее.
2. `a => a + 1` примет `43` как ожидающее значение и вернёт `44` как следующее.
3. `a => a + 1` примет `44` как ожидающее значение и вернёт `45` как следующее.

Иных правок в очереди нет, посему в итоге **Расписыватель** упрячет `45` как нынешнее состояние **хранимки**.

По обычаю, ожидающий довод принято величать первой буквицей имени **хранимки**, например `a` для `age`. Однако ты можешь прозвать его и `prevAge` или как-то иначе, если тебе так понятнее.

**Расписыватель** может [позвать твои обновляющие дела дважды](#my-initializer-or-updater-function-runs-twice) при созидании, дабы убедиться, что они [чистые.](/learn/keeping-components-pure)


<DeepDive>

#### Всегда ли лучше использовать обновляющее дело? {/*is-using-an-updater-always-preferred*/}

Ты можешь услышать совет всегда писать устав вроде `setAge(a => a + 1)`, если то, что ты кладёшь в **хранимку**, высчитывается из её прошлого значения. Вреда в этом нет, но и нужды во всём подряд — тоже.

В большинстве случаев нет разницы между этими двумя путями. **Расписыватель** всегда следит, чтобы при волеизъявлениях (нажатиях), **хранимка** `age` обновилась до следующего клика. Это значит, что нет угрозы, будто распорядитель увидит «залежалый» `age` в начале своего дела.

Однако, если ты творишь многую правку в одном и том же деянии, обновляющие дела могут подсобить. Ещё они полезны, когда дотянуться до самой переменной **хранимки** неудобно (такое бывает при сбережении мощи отрисовок).

Если ты ценишь лад и единство выше, чем краткость письма, то разумно всегда писать обновляющее дело, коль скоро новое значение берётся из старого. Если же оно высчитывается из прошлого значения какой-то *иной* **хранимки**, возможно, тебе стоит объединить их в одну **вещь** и [использовать сводник (reducer).](/learn/extracting-state-logic-into-a-reducer)

</DeepDive>

<Recipes titleText="Разница между передачей обновляющего дела и передачей значения прямо" titleId="examples-updater">

#### Передача обновляющего дела {/*passing-the-updater-function*/}

В этом примере передаётся обновляющее дело, посему кнопка «+3» трудится исправно.


<Sandpack>

```js
import { useState } from 'react';

export default function Counter() {
  const [age, setAge] = useState(42);

  function increment() {
    setAge(a => a + 1);
  }

  return (
    <>
      <h1>Your age: {age}</h1>
      <button onClick={() => {
        increment();
        increment();
        increment();
      }}>+3</button>
      <button onClick={() => {
        increment();
      }}>+1</button>
    </>
  );
}
```

```css
button { display: block; margin: 10px; font-size: 20px; }
h1 { display: block; margin: 10px; }
```

</Sandpack>

<Solution />

#### Передача следующего значения прямо {/*passing-the-next-state-directly*/}

В этом примере обновляющее дело **не** передаётся, посему кнопка «+3» **не трудится так, как замышлялось**.


<Sandpack>

```js
import { useState } from 'react';

export default function Counter() {
  const [age, setAge] = useState(42);

  function increment() {
    setAge(age + 1);
  }

  return (
    <>
      <h1>Your age: {age}</h1>
      <button onClick={() => {
        increment();
        increment();
        increment();
      }}>+3</button>
      <button onClick={() => {
        increment();
      }}>+1</button>
    </>
  );
}
```

```css
button { display: block; margin: 10px; font-size: 20px; }
h1 { display: block; margin: 10px; }
```

</Sandpack>

<Solution />

</Recipes>

---

### Править вещи и ряды в хранимке {/*updating-objects-and-arrays-in-state*/}

Ты можешь класть **вещи** (объекты) и **ряды** (массивы) в свою **хранимку**. В мире Расписывателя хранимка почитается неизменной (только для чтения), посему **тебе следует *заменять* её, а не *искажать* уже существующие вещи**. К примеру, если в твоей хранимке лежит вещь `form`, не искажай её:


```js
// 🚩 Don't mutate an object in state like this:
form.firstName = 'Taylor';
```

Вместо этого замени всю **вещь** целиком, сотворив новую:

```js
// ✅ Replace state with a new object
setForm({
  ...form,
  firstName: 'Taylor'
});
```

Почитай об [обновлении вещей в хранимке](/learn/updating-objects-in-state) и [обновлении рядов в хранимке](/learn/updating-arrays-in-state), дабы уяснить больше.

<Recipes titleText="Примеры вещей и рядов в хранимке" titleId="examples-objects">

#### Образчик (вещь) {/*form-object*/}

В этом примере **хранимка** `form` удерживает вещь (объект). У каждого поля ввода есть свой распорядитель правки, который зовёт `setForm` с новым состоянием всего образчика. Устав `{ ...form }` (расплетание) гарантирует, что вещь в хранимке будет заменена, а не искажена.


<Sandpack>

```js
import { useState } from 'react';

export default function Form() {
  const [form, setForm] = useState({
    firstName: 'Barbara',
    lastName: 'Hepworth',
    email: 'bhepworth@sculpture.com',
  });

  return (
    <>
      <label>
        First name:
        <input
          value={form.firstName}
          onChange={e => {
            setForm({
              ...form,
              firstName: e.target.value
            });
          }}
        />
      </label>
      <label>
        Last name:
        <input
          value={form.lastName}
          onChange={e => {
            setForm({
              ...form,
              lastName: e.target.value
            });
          }}
        />
      </label>
      <label>
        Email:
        <input
          value={form.email}
          onChange={e => {
            setForm({
              ...form,
              email: e.target.value
            });
          }}
        />
      </label>
      <p>
        {form.firstName}{' '}
        {form.lastName}{' '}
        ({form.email})
      </p>
    </>
  );
}
```

```css
label { display: block; }
input { margin-left: 5px; }
```

</Sandpack>

<Solution />

#### Образчик (вложенная вещь) {/*form-nested-object*/}

В этом примере **хранимка** имеет глубокое вложение. Когда ты правишь вложенные вести, тебе надобно сотворить копию не только той вещи, которую ты обновляешь, но и всех вещей, что «содержат» её на пути к верху. Почитай об [обновлении вложенных вещей](/learn/updating-objects-in-state#updating-a-nested-object), дабы уяснить больше.


<Sandpack>

```js
import { useState } from 'react';

export default function Form() {
  const [person, setPerson] = useState({
    name: 'Niki de Saint Phalle',
    artwork: {
      title: 'Blue Nana',
      city: 'Hamburg',
      image: 'https://i.imgur.com/Sd1AgUOm.jpg',
    }
  });

  function handleNameChange(e) {
    setPerson({
      ...person,
      name: e.target.value
    });
  }

  function handleTitleChange(e) {
    setPerson({
      ...person,
      artwork: {
        ...person.artwork,
        title: e.target.value
      }
    });
  }

  function handleCityChange(e) {
    setPerson({
      ...person,
      artwork: {
        ...person.artwork,
        city: e.target.value
      }
    });
  }

  function handleImageChange(e) {
    setPerson({
      ...person,
      artwork: {
        ...person.artwork,
        image: e.target.value
      }
    });
  }

  return (
    <>
      <label>
        Name:
        <input
          value={person.name}
          onChange={handleNameChange}
        />
      </label>
      <label>
        Title:
        <input
          value={person.artwork.title}
          onChange={handleTitleChange}
        />
      </label>
      <label>
        City:
        <input
          value={person.artwork.city}
          onChange={handleCityChange}
        />
      </label>
      <label>
        Image:
        <input
          value={person.artwork.image}
          onChange={handleImageChange}
        />
      </label>
      <p>
        <i>{person.artwork.title}</i>
        {' by '}
        {person.name}
        <br />
        (located in {person.artwork.city})
      </p>
      <img 
        src={person.artwork.image} 
        alt={person.artwork.title}
      />
    </>
  );
}
```

```css
label { display: block; }
input { margin-left: 5px; margin-bottom: 5px; }
img { width: 200px; height: 200px; }
```

</Sandpack>

<Solution />

#### Ряд (массив) {/*list-array*/}

В этом примере **хранимка** `todos` (дела) удерживает ряд (массив). Каждый распорядитель кнопки зовёт `setTodos` с новой версией этого ряда. Устав расплетания `[...todos]`, а также сведения `todos.map()` и `todos.filter()` гарантируют, что ряд в хранимке будет заменен, а не искажен.


<Sandpack>

```js src/App.js
import { useState } from 'react';
import AddTodo from './AddTodo.js';
import TaskList from './TaskList.js';

let nextId = 3;
const initialTodos = [
  { id: 0, title: 'Buy milk', done: true },
  { id: 1, title: 'Eat tacos', done: false },
  { id: 2, title: 'Brew tea', done: false },
];

export default function TaskApp() {
  const [todos, setTodos] = useState(initialTodos);

  function handleAddTodo(title) {
    setTodos([
      ...todos,
      {
        id: nextId++,
        title: title,
        done: false
      }
    ]);
  }

  function handleChangeTodo(nextTodo) {
    setTodos(todos.map(t => {
      if (t.id === nextTodo.id) {
        return nextTodo;
      } else {
        return t;
      }
    }));
  }

  function handleDeleteTodo(todoId) {
    setTodos(
      todos.filter(t => t.id !== todoId)
    );
  }

  return (
    <>
      <AddTodo
        onAddTodo={handleAddTodo}
      />
      <TaskList
        todos={todos}
        onChangeTodo={handleChangeTodo}
        onDeleteTodo={handleDeleteTodo}
      />
    </>
  );
}
```

```js src/AddTodo.js
import { useState } from 'react';

export default function AddTodo({ onAddTodo }) {
  const [title, setTitle] = useState('');
  return (
    <>
      <input
        placeholder="Add todo"
        value={title}
        onChange={e => setTitle(e.target.value)}
      />
      <button onClick={() => {
        setTitle('');
        onAddTodo(title);
      }}>Add</button>
    </>
  )
}
```

```js src/TaskList.js
import { useState } from 'react';

export default function TaskList({
  todos,
  onChangeTodo,
  onDeleteTodo
}) {
  return (
    <ul>
      {todos.map(todo => (
        <li key={todo.id}>
          <Task
            todo={todo}
            onChange={onChangeTodo}
            onDelete={onDeleteTodo}
          />
        </li>
      ))}
    </ul>
  );
}

function Task({ todo, onChange, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  let todoContent;
  if (isEditing) {
    todoContent = (
      <>
        <input
          value={todo.title}
          onChange={e => {
            onChange({
              ...todo,
              title: e.target.value
            });
          }} />
        <button onClick={() => setIsEditing(false)}>
          Save
        </button>
      </>
    );
  } else {
    todoContent = (
      <>
        {todo.title}
        <button onClick={() => setIsEditing(true)}>
          Edit
        </button>
      </>
    );
  }
  return (
    <label>
      <input
        type="checkbox"
        checked={todo.done}
        onChange={e => {
          onChange({
            ...todo,
            done: e.target.checked
          });
        }}
      />
      {todoContent}
      <button onClick={() => onDelete(todo.id)}>
        Delete
      </button>
    </label>
  );
}
```

```css
button { margin: 5px; }
li { list-style-type: none; }
ul, li { margin: 0; padding: 0; }
```

</Sandpack>

<Solution />

#### Письмо складного устава правки с Погружением {/*writing-concise-update-logic-with-immer*/}

Если замена рядов и вещей без искажения кажется тебе докучной, ты можешь взять набор заготовок вроде [Погружения](https://github.com/immerjs/use-immer) (Immer), дабы сократить повторы в уставе. Погружение дозволяет тебе писать складный устав, будто ты искажаешь вещи, но под исподом оно само заменяет их неизменно:


<Sandpack>

```js
import { useState } from 'react';
import { useImmer } from 'use-immer';

let nextId = 3;
const initialList = [
  { id: 0, title: 'Big Bellies', seen: false },
  { id: 1, title: 'Lunar Landscape', seen: false },
  { id: 2, title: 'Terracotta Army', seen: true },
];

export default function BucketList() {
  const [list, updateList] = useImmer(initialList);

  function handleToggle(artworkId, nextSeen) {
    updateList(draft => {
      const artwork = draft.find(a =>
        a.id === artworkId
      );
      artwork.seen = nextSeen;
    });
  }

  return (
    <>
      <h1>Art Bucket List</h1>
      <h2>My list of art to see:</h2>
      <ItemList
        artworks={list}
        onToggle={handleToggle} />
    </>
  );
}

function ItemList({ artworks, onToggle }) {
  return (
    <ul>
      {artworks.map(artwork => (
        <li key={artwork.id}>
          <label>
            <input
              type="checkbox"
              checked={artwork.seen}
              onChange={e => {
                onToggle(
                  artwork.id,
                  e.target.checked
                );
              }}
            />
            {artwork.title}
          </label>
        </li>
      ))}
    </ul>
  );
}
```

```json package.json
{
  "dependencies": {
    "immer": "1.7.3",
    "react": "latest",
    "react-dom": "latest",
    "react-scripts": "latest",
    "use-immer": "0.5.1"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test --env=jsdom",
    "eject": "react-scripts eject"
  }
}
```

</Sandpack>

<Solution />

</Recipes>

---

### Как избежать повторного созидания начала хранимки {/*avoiding-recreating-the-initial-state*/}

Расписыватель сберегает начало хранимки лишь единожды и оставляет его без внимания при последующих отрисовках.


```js
function TodoList() {
  const [todos, setTodos] = useState(createInitialTodos());
  // ...
```

Хотя исход дела `createInitialTodos()` нужен лишь для первого зачина, ты всё равно зовёшь это дело при каждой отрисовке. Сие может быть расточительным, если оно созидает великие ряды или творит тяжкие расчёты.

Дабы решить сию задачу, ты можешь **передать его как *зачинающее* дело** в `useState` вместо самого значения:


```js
function TodoList() {
  const [todos, setTodos] = useState(createInitialTodos);
  // ...
```

Заметим, что ты передаёшь `createInitialTodos`, то есть **само дело**, а не `createInitialTodos()`, что было бы исходом его призыва. Если ты передашь само дело в `useState`, **Расписыватель** позовёт его лишь единожды, при самом зачине.

**Расписыватель** может [позвать твои зачинающие дела дважды](#my-initializer-or-updater-function-runs-twice) при созидании, дабы убедиться, что они [чистые.](/learn/keeping-components-pure)

<Recipes titleText="Разница между передачей зачинающего дела и передачей начала прямо" titleId="examples-initializer">

#### Передача зачинающего дела {/*passing-the-initializer-function*/}

В этом примере передаётся зачинающее дело, посему дело `createInitialTodos` срабатывает лишь при зачине. Оно не запускается при перерисовке части — к примеру, когда ты пишешь в поле ввода.


<Sandpack>

```js
import { useState } from 'react';

function createInitialTodos() {
  const initialTodos = [];
  for (let i = 0; i < 50; i++) {
    initialTodos.push({
      id: i,
      text: 'Item ' + (i + 1)
    });
  }
  return initialTodos;
}

export default function TodoList() {
  const [todos, setTodos] = useState(createInitialTodos);
  const [text, setText] = useState('');

  return (
    <>
      <input
        value={text}
        onChange={e => setText(e.target.value)}
      />
      <button onClick={() => {
        setText('');
        setTodos([{
          id: todos.length,
          text: text
        }, ...todos]);
      }}>Add</button>
      <ul>
        {todos.map(item => (
          <li key={item.id}>
            {item.text}
          </li>
        ))}
      </ul>
    </>
  );
}
```

</Sandpack>

<Solution />

#### Передача начала хранимки прямо {/*passing-the-initial-state-directly*/}

В этом примере зачинающее дело **не** передаётся, посему дело `createInitialTodos` срабатывает при каждой отрисовке — например, когда ты пишешь в поле ввода. Зримой разницы в поведении нет, но такой устав менее бережлив к мощи.


<Sandpack>

```js
import { useState } from 'react';

function createInitialTodos() {
  const initialTodos = [];
  for (let i = 0; i < 50; i++) {
    initialTodos.push({
      id: i,
      text: 'Item ' + (i + 1)
    });
  }
  return initialTodos;
}

export default function TodoList() {
  const [todos, setTodos] = useState(createInitialTodos());
  const [text, setText] = useState('');

  return (
    <>
      <input
        value={text}
        onChange={e => setText(e.target.value)}
      />
      <button onClick={() => {
        setText('');
        setTodos([{
          id: todos.length,
          text: text
        }, ...todos]);
      }}>Add</button>
      <ul>
        {todos.map(item => (
          <li key={item.id}>
            {item.text}
          </li>
        ))}
      </ul>
    </>
  );
}
```

</Sandpack>

<Solution />

</Recipes>

---

### Сброс хранимки через ключ {/*resetting-state-with-a-key*/}

Ты часто будешь встречать признак `key` (ключ) при [отрисовке рядов.](/learn/rendering-lists) Однако у него есть и иное назначение.

Ты можешь **сбросить хранимку составной части, передав ей иной `key`.** В этом примере кнопка «Сброс» меняет **хранимку** `version`, которую мы передаём как `key` в часть `Form` (Образчик). Когда `key` меняется, **Расписыватель** созидает часть `Form` (и всех её чад) заново, с чистого листа, посему и её **хранимка** сбрасывается к началу.

Почитай о [сбережении и сбросе хранимки](/learn/preserving-and-resetting-state), дабы уяснить больше.


<Sandpack>

```js src/App.js
import { useState } from 'react';

export default function App() {
  const [version, setVersion] = useState(0);

  function handleReset() {
    setVersion(version + 1);
  }

  return (
    <>
      <button onClick={handleReset}>Reset</button>
      <Form key={version} />
    </>
  );
}

function Form() {
  const [name, setName] = useState('Taylor');

  return (
    <>
      <input
        value={name}
        onChange={e => setName(e.target.value)}
      />
      <p>Hello, {name}.</p>
    </>
  );
}
```

```css
button { display: block; margin-bottom: 20px; }
```

</Sandpack>

---

### Сбережение вестей из прошлых отрисовок {/*storing-information-from-previous-renders*/}

Обычно ты правишь **хранимку** в распорядителях деяний. Однако в редких случаях тебе может понадобиться подстроить **хранимку** в ответ на саму отрисовку — к примеру, если ты хочешь сдвинуть значение, когда меняется пришедший **дар** (prop).

В большинстве случаев тебе сие не надобно:

* **Если искомое значение можно высчитать целиком из нынешних даров или иных хранимок, [удали сию лишнюю хранимку вовсе.](/learn/choosing-the-state-structure#avoid-redundant-state)** Если ты опасаешься слишком частых расчётов, **Подключение** [`useMemo`](/reference/react/useMemo) тебе подсобит.
* Если ты хочешь сбросить **хранимки** всего древа частей, [передай своей части иной `key`.](#resetting-state-with-a-key)
* Если есть возможность, обнови все нужные **хранимки** прямо в распорядителях деяний.

В том редком случае, когда ничто из вышесказанного не ладит с твоим делом, есть узор письма, позволяющий обновить **хранимку** на основе уже отрисованных вестей, призвав дело `set` прямо во время отрисовки части.

Вот пример. Сия составная часть `CountLabel` являет дар `count`, переданный ей:


```js src/CountLabel.js
export default function CountLabel({ count }) {
  return <h1>{count}</h1>
}
```

Положим, ты хочешь явить, *вырос или умалился* счётчик с прошлой правки. Дар `count` сам об этом не поведает — тебе надобно блюсти его прошлое значение. Добавь **хранимку** `prevCount`, дабы следить за ним. Добавь и иную **хранимку**, прозванную `trend` (веяние), дабы помнить, вырос счёт или умалился. Сличи `prevCount` с нынешним `count`, и ежели они не в ладу, обнови и `prevCount`, и `trend`. Теперь ты можешь явить и нынешний дар `count`, и то, *как он сдвинулся с прошлой отрисовки*.


<Sandpack>

```js src/App.js
import { useState } from 'react';
import CountLabel from './CountLabel.js';

export default function App() {
  const [count, setCount] = useState(0);
  return (
    <>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
      <button onClick={() => setCount(count - 1)}>
        Decrement
      </button>
      <CountLabel count={count} />
    </>
  );
}
```

```js src/CountLabel.js active
import { useState } from 'react';

export default function CountLabel({ count }) {
  const [prevCount, setPrevCount] = useState(count);
  const [trend, setTrend] = useState(null);
  if (prevCount !== count) {
    setPrevCount(count);
    setTrend(count > prevCount ? 'increasing' : 'decreasing');
  }
  return (
    <>
      <h1>{count}</h1>
      {trend && <p>The count is {trend}</p>}
    </>
  );
}
```

```css
button { margin-bottom: 10px; }
```

</Sandpack>

Заметим, что если ты зовёшь дело `set` прямо во время отрисовки, оно должно быть упрятано в условие вроде `prevCount !== count`, и внутри него обязательно должен быть призыв вида `setPrevCount(count)`. Иначе твоя составная часть будет перерисовываться по кругу, пока не случится крушение. Также ты можешь править только **хранимку** той части, что *отрисовывается прямо сейчас*. Призыв дела `set` *иной* части во время отрисовки — это великая погрешность. Наконец, твой призыв `set` всё равно должен [обновлять хранимку без искажения](#updating-objects-and-arrays-in-state) — это не даёт тебе права нарушать иные правила [чистых дел.](/learn/keeping-components-pure)

Такой узор письма может быть тяжким для уразумения, и обычно его лучше избегать. Однако это всё же краше, чем править хранимку в **Воздействии** (Effect). Когда ты зовёшь дело `set` во время отрисовки, **Расписыватель** перерисует эту часть тотчас после того, как она выйдет через указ `return`, и до того, как начнёт отрисовывать её чад. Так чадам не придётся отрисовываться дважды. Остаток твоего дела всё равно выполнится (а исход будет отброшен). Если твоё условие стоит под всеми призывами **Подключений**, ты можешь добавить ранний `return;`, дабы запустить отрисовку заново поскорее.


---

## Сыск погрешностей {/*troubleshooting*/}

### Я обновил хранимку, но в журнале Живописи всё равно старое значение {/*ive-updated-the-state-but-logging-gives-me-the-old-value*/}

Призыв дела `set` **не меняет хранимку в уже запущенном уставе**:


```js {4,5,8}
function handleClick() {
  console.log(count);  // 0

  setCount(count + 1); // Request a re-render with 1
  console.log(count);  // Still 0!

  setTimeout(() => {
    console.log(count); // Also 0!
  }, 5000);
}
```

Сие творится оттого, что [**хранимка** ведёт себя подобно снимку.](/learn/state-as-a-snapshot) Обновление хранимки — это наказ на новую отрисовку с новым значением, но оно не трогает переменную `count` в твоём уже запущенном распорядителе **Живописи**.

Если тебе надобно использовать следующее значение тотчас, ты можешь сберечь его в переменной перед тем, как передать его делу `set`:


```js
const nextCount = count + 1;
setCount(nextCount);

console.log(count);     // 0
console.log(nextCount); // 1
```

---

### I've updated the state, but the screen doesn't update {/*ive-updated-the-state-but-the-screen-doesnt-update*/}

React will **ignore your update if the next state is equal to the previous state,** as determined by an [`Object.is`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is) comparison. This usually happens when you change an object or an array in state directly:

```js
obj.x = 10;  // 🚩 Wrong: mutating existing object
setObj(obj); // 🚩 Doesn't do anything
```

You mutated an existing `obj` object and passed it back to `setObj`, so React ignored the update. To fix this, you need to ensure that you're always [_replacing_ objects and arrays in state instead of _mutating_ them](#updating-objects-and-arrays-in-state):

```js
// ✅ Correct: creating a new object
setObj({
  ...obj,
  x: 10
});
```

---

### I'm getting an error: "Too many re-renders" {/*im-getting-an-error-too-many-re-renders*/}

You might get an error that says: `Too many re-renders. React limits the number of renders to prevent an infinite loop.` Typically, this means that you're unconditionally setting state *during render*, so your component enters a loop: render, set state (which causes a render), render, set state (which causes a render), and so on. Very often, this is caused by a mistake in specifying an event handler:

```js {1-2}
// 🚩 Wrong: calls the handler during render
return <button onClick={handleClick()}>Click me</button>

// ✅ Correct: passes down the event handler
return <button onClick={handleClick}>Click me</button>

// ✅ Correct: passes down an inline function
return <button onClick={(e) => handleClick(e)}>Click me</button>
```

If you can't find the cause of this error, click on the arrow next to the error in the console and look through the JavaScript stack to find the specific `set` function call responsible for the error.

---

### My initializer or updater function runs twice {/*my-initializer-or-updater-function-runs-twice*/}

In [Strict Mode](/reference/react/StrictMode), React will call some of your functions twice instead of once:

```js {2,5-6,11-12}
function TodoList() {
  // This component function will run twice for every render.

  const [todos, setTodos] = useState(() => {
    // This initializer function will run twice during initialization.
    return createTodos();
  });

  function handleClick() {
    setTodos(prevTodos => {
      // This updater function will run twice for every click.
      return [...prevTodos, createTodo()];
    });
  }
  // ...
```

This is expected and shouldn't break your code.

This **development-only** behavior helps you [keep components pure.](/learn/keeping-components-pure) React uses the result of one of the calls, and ignores the result of the other call. As long as your component, initializer, and updater functions are pure, this shouldn't affect your logic. However, if they are accidentally impure, this helps you notice the mistakes.

For example, this impure updater function mutates an array in state:

```js {2,3}
setTodos(prevTodos => {
  // 🚩 Mistake: mutating state
  prevTodos.push(createTodo());
});
```

Because React calls your updater function twice, you'll see the todo was added twice, so you'll know that there is a mistake. In this example, you can fix the mistake by [replacing the array instead of mutating it](#updating-objects-and-arrays-in-state):

```js {2,3}
setTodos(prevTodos => {
  // ✅ Correct: replacing with new state
  return [...prevTodos, createTodo()];
});
```

Now that this updater function is pure, calling it an extra time doesn't make a difference in behavior. This is why React calling it twice helps you find mistakes. **Only component, initializer, and updater functions need to be pure.** Event handlers don't need to be pure, so React will never call your event handlers twice.

Read [keeping components pure](/learn/keeping-components-pure) to learn more.

---

### I'm trying to set state to a function, but it gets called instead {/*im-trying-to-set-state-to-a-function-but-it-gets-called-instead*/}

You can't put a function into state like this:

```js
const [fn, setFn] = useState(someFunction);

function handleClick() {
  setFn(someOtherFunction);
}
```

Because you're passing a function, React assumes that `someFunction` is an [initializer function](#avoiding-recreating-the-initial-state), and that `someOtherFunction` is an [updater function](#updating-state-based-on-the-previous-state), so it tries to call them and store the result. To actually *store* a function, you have to put `() =>` before them in both cases. Then React will store the functions you pass.

```js {1,4}
const [fn, setFn] = useState(() => someFunction);

function handleClick() {
  setFn(() => someOtherFunction);
}
```
