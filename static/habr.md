# JS. Валидатор. Пишем свой YUP.

## Для чего нужна валидация при разработке и когда ее применять?

В web разработке при работе с пользовательскими данными валидация должна применяться при получении данных сервисом. Условно можно разделить валидацию на:

- **Клиентскую.** При вводе данных в формы важно провалидировать введенные данные и сообщить пользователю о их некорректности. Это дает понятный обратный отклик пользователю о его действиях и предотвращает дальнейшие некорректные действия в сервисе.
- **Серверную.** Любой код, выполняемый на клиенте, а также запросы, поступающие от клиентского приложения, не могут считаться доверенными и должны быть провалидировано. Нельзя рассчитывать на то, что клиентское приложение гарантированно подготовит корректные данные, так как при разработке может возникнуть несоответствие логики работы с данными на сервере и клиенте. При этом мы также можем столкнуться со случаем, когда клиент вручную подготавливает данные, маскируясь под приложение."

В целом, данные следует валидировать как можно чаще, особенно в контексте полного цикла разработки как на сервере, так и на клиенте. Давайте рассмотрим, какие библиотеки существуют для этой цели в настоящее время.

## Анализ существующих решений

Из популярных решений которые могут применять как на клиенте так и на сервере можно выделить `yup` и `zod`. Рассмотрим их особенности и обратим внимание на их недостатки.

В целом обе библиотеки страдают от:

- **Излишнее многообразие функциональности.** К этому можно отнести как и преобразование типов - обе библиотеки предоставляют функциональность преобразования типов при валидации, так и стремление предусмотреть все возможные случаи валидации. Это увеличивает размер кодовой базы и уменьшает понятность кода для других разработчиков, которые решаться залезть в исходники. Для примера метод [getIn](https://github.com/jquense/yup/blob/5c77e0d4f9373151bcf0cd558c95986b6e4800d7/src/util/reach.ts#L6) в yup и [непроходимое поле regexp](https://github.com/colinhacks/zod/blob/18a0c288a361c0f7c269829f576494280ec9b1a8/src/types.ts#L583), [методы которые обязаны предусматривать все варианты конфигурации](https://github.com/colinhacks/zod/blob/18a0c288a361c0f7c269829f576494280ec9b1a8/src/types.ts#L4271) в zod (Это не говоря уже о файлах размером в 6000 строк.).
- **Игнорирование вопросов производительности.** Обе библиотеки делают упор скорее на расширении функциональности, чем на производительность того что у них есть. И это проявляется мелочах, например в этих библиотеках добавление любого нового правила валидации приводит к полному копированию сущности [yup](https://github.com/jquense/yup/blob/5c77e0d4f9373151bcf0cd558c95986b6e4800d7/src/schema.ts#L773), [zod](https://github.com/colinhacks/zod/blob/18a0c288a361c0f7c269829f576494280ec9b1a8/src/types.ts#L868C3-L868C12).

## Архитектура библиотеки

### Принципы

Попробдуем создать свою библеотку, избежав указанных выше проблем. Для этого сформилируем принципы которыми мы должно руководстоваться

- Код должен быть **простым**
- Код должен быть **производительным** на столько, на сколько это позволяет предыдущий пункт

### Структура

Попробуем отталкиваться от кода который мы ожидаем видеть в готовой библиотеки. По аналогии с yup и zod выглядеть это должно примерно вот так:

```ts
const schema = string().min(2);
const value = 'hello';

schema.validate(value);
```

Нужно отметить что здесь присутствует две и более валидации

- string() - проверяет что value является строком (по умолчанию строка также не должны быть пустой)
- min(2) - проверяет что длина строки должна быть как минимум 2 символа

Эти условия мы могли бы добавлять и дальше, но мы уже видим главное,

- структура, которую мы выберем для хранения правил, должна поддерживать неограниченный список правил
- необходимо предусмотреть цепочку методов, чтобы можно было записать следующее: `string().min(2).max(4)`

Выглядеть это может так:

```ts
type Checker = () => string;
class String {
  conditions: Checker[] = [];

  constructor() {
    // Добавление правила валидации
    this.conditions.push((value) => {
      if (typeof value !== 'string') {
        return 'Is not a string';
      }
      return '';
    });
  }

  min(num: string) {
    // Добавление правила валидации
    this.conditions.push((value) => {
      if (value.length < min) {
        return 'Too short string';
      }
      return '';
    });

    // Возвращение всей сущности для возможности чейнинга
    return this;
  }
}
```

Теперь для того чтобы узнать провалидиировать передамаемые данные осталось узнать существует ли такой condition который вернет непустую строку при выполнении:

```ts
type Checker = () => string;
class String {
  conditions: Checker[] = [];
  // ...
  validate(value: any) {
    for (const condition of this.confiditons) {
      const error = condition(value);
      if (error !== '') {
        return error;
      }
    }

    return '';
  }
}
```

Здесь можно заметить что мы останавливаемся на первой встреченной ошибке и завершаем цикл проверок. В реальном мире это добавит производительности нашему решению. Такому же подходу мы будет следовать при работе с другими данными, например, объектами - прерывать перебор при выявлении первое ошибки. Такое решение может кому-то показаться странным, но на мой взгляд оно является самым практичным:

- Если нам интересна каждая ошибка в данных, напрмиер при валидации форм. Для каждой сущности(инпута) можно написать свою валидацию
- Если нам интресно почему сервер не принял наши данные, и мы предполагаем что есть несколько причин. Сначала можно исправить уже указанную ошибку, а потом исправлять новые

Мы уже предусмотрели несколько проверок, но жизнь всегда многообразнее, и стоит позволить разработчику самому добавлять правила помимо стандартных

```ts
type Checker = () => string;
class String {
  conditions: Checker[] = [];

  test(checker: (value: any) => string) {
    this.conditions.push(checker);
    return this;
  }
}
```

Сразу отметим что `validate()`, `test()`, `conditions()` кажутеся общими методами/свойствами, без который не обойдется ни один тип валидации. Поэтому вынесем их в отдельный класс от которого будет наследовать все наши конкретные типы. Финальный код будет выглядеть так:

```ts
type Checker = (value: any) => string;
class Schema {
  conditions: Checker[] = [];

  validate(value: any) {
    for (const condition of this.conditions) {
      const error = condition(value);
      if (error !== '') {
        return error;
      }
    }

    return '';
  }

  test(checker: Checker) {
    this.conditions.push(checker);
    return this;
  }
}

class String extends Schema {
  constructor() {
    super();
    this.conditions.push((value) => {
      if (typeof value !== 'string') {
        return 'Is not a string';
      }
      return '';
    });
  }

  min(min: number) {
    this.conditions.push((value) => {
      if (value.length < min) {
        return 'Too short string';
      }
      return '';
    });

    return this;
  }
}

const checkUpperCase = (value: string) => {
  if (value !== value.toUpperCase()) {
    return 'NOT UPPER CASE';
  }

  return '';
};
const string = () => new String();
const schema = string().min(2).test(checkUpperCase);

const valueValid = 'HELLO';
const valueError = 'Hello';

console.log(schema.validate(valueValid)); // ''
console.log(schema.validate(valueError)); // 'NOT UPPER CASE'
```

Отмечу что [реальный пример](https://github.com/utftu/desy/blob/446eb4f40082b3a97875784faaec4f533511850d/src/string/string.ts#L57) только немного сложнее, поскольку

- conditions - должен содержать имена правил, чтобы в определенных случаях их можно было заменить или убрать. Поэтому вместо обычных функций стоит использовать объекты, который содержат имена и эти функции
- сообщение об ошибке от checker хотелось бы видеть более информативным, при сложной вложенной структуре в тексте пригодилось бы название ключа в котором произошла ошибка

### Вложенные структуры

Мы написали отличный код для примитива, а что делать с более сложными структурами? Например

```ts
const user = {
  name: 'Aleksey',
  age: 42,
};
```

Для этого нам понадобится отдельная сущность `object`, которая позволит писать вложенные правила

```ts
const schema = object({
  name: string(),
  age: number(),
});
```

```ts
class Object extends Schema {
  constructor(objSchema) {
    super();
    this.conditions.push((obj) => {
      for (const key in objSchema) {
        const innerSchema = objSchema[key];

        // innerSchema сама знает как провалидировать данные, нам остается только ее запустить
        const error = innerSchema.validate(obj);
        if (error !== '') {
          return `${key} props has wrong type`;
        }
      }

      return '';
    });
  }
}
```

### Ts типы

Описывая схему, мы по сути уже указываем типы, которые должны быть в валидируемом объекте. Используя ts мы вполне можем избавить разработчика от необходимости описывать типы несколько раз. Для того чтобы это реализовать попробуем сделать немного магии ts

Простой пример

```ts
const schema = string();
const rawValue = 'hello';

const error = schema(rawValue);
if (error !== '') {
  // do something
}

const value = rawValue as Infer<typeof schema>; // string type
```

Попробуем это реализовать. Как основу идею создадим внутренее поле types, которое будет хранить тип сущности и откуда Infer сможет получить необходимый тип

```ts
class Schema<TValue> {
  types!: TValue;
}

class String extends Schema<string> {}

type Infer<TType extends Schema<any>> = TType['types'];
```

Работает! Теперь перейдем к более сложному примеру:

```ts
const rawUser = {
  name: 'Aleksey',
};

const schema = object({
  name: string(),
});

const error = schema(rawUser);
if (error !== '') {
  // do something
}

const user = rawUser as Infer<typeof schema>; // {name: string, age: number} type
```

Попробуем реализовать. Сейчас будет немного магии TypeScript, поэтому уберите детей и последователей Flow

```ts
type Infer<TType extends Schema<any>> = TType['types'];

class Schema<TValue> {
  types!: TValue;
}

class String extends Schema<string> {}

const string = () => new String();

type ObjectValue = Record<string, Schema<any>>;
type PreparedTypes<TValue extends ObjectValue> = {
  [K in keyof TValue]: Infer<TValue[K]>;
};

class ObjectVidator<
  TValue extends ObjectValue,
  TValueTypes = PreparedTypes<TValue>,
> extends Schema<TValueTypes> {
  value: TValue;

  constructor(value: TValue) {
    super();
    this.value = value;
  }
}

function object<TValue extends ObjectValue>(value: TValue) {
  return new ObjectVidator(value);
}

const schema = object({
  name: string(),
});

type User = Infer<typeof schema>; // {name: string} type
```

### Реальная библиотека

Подходы описанные выше верхнеуровнево описывают концепцию библиотеки которую можно реализовать. Теперь дело за добавлением конкретных типов для number, boolean и так далее. При этом создание реальной библиотеки потребует большее количество ресурсов. Путь описанный выше я проделал при написании своей библиотеки desy. В ней вы можете подсмотреть как выглядит указанный код на самом деле и если захотите использовать в своем проекте

[desy](https://github.com/utftu/desy) - Dead Extraordinary Simple Yup

#### Мысли о производительности

После написание библиотеки меня удивило на сколько desy оказался более производительным чем другие решения. Я конечно ожидал лучших бенчмарков, но не такого бурного прироста который произошел в реальности. Как причину можно выделить

- отказ от прокидывания ошибок
- отказ от валидации при нахождении ошибок
- отказ от иммутабельных структур и усложненного кода с глубоким ветвлением

Писать конкретные цифры всегда сомнительное дело, поэтому замеры можно изучить [самостоятельно](https://github.com/utftu/desy/blob/master/bench.ts)

### Вопросы которые могли остаться

- Почему индикатор ошибки это строка?
  Строка является самым выразительным средством сообщения о деталях ошибки. Учитывая что мы отказались от пробрасывания ошибок, true/false нам тожно не подойдут
- Почему не пробрасываем ошибки?
  Проброс ошибок является операцией которая должна сообщать о непредвиденной работе приложения. Несоотвествие данных схеме, при том что это происходит внутри специально созданной для этого программы нельзя назвать непредвиденных ситуациях. Мы буквально просим программу сообщить о том являются ли данные валидными или нет. Для этого должны использоваться обычные способы работы с данными. +производительность
- Почему все проверки синхронные?
  Поддержка асинхронный проверок потребовала бы увеличения кодовой базы и разветвления логики выполнения. При этом асинхронные проверки требуются крайне редко. Настолько редко что в этих случаях проще обойтись без готового решения

## Заключение

Как итог хотелось бы сказать:

- Многие библиотеки которые мы используем в повседневной жизни не являются ни производительными, ни понятными или расширяемыми. Мы просто привыкли к этим инструментам и часто воспринимаем как что-то глобальное и незыблемое. Иногда нужно писать свои велосипеды и возможно какой-то и из них окажется лучше оригинала. Не стоит забывать что многие популярные библиотеки это ответ автора - на то что ему что-то не понравилось в уже существующих
- Валидируйте данные. Серьезно. Пользователю нельзя доверять. И лучше используйте для валидации [desy](https://github.com/utftu/desy)