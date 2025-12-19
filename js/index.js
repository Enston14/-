// элементы в DOM можно получить при помощи функции querySelector
const fruitsList = document.querySelector('.fruits__list'); // список карточек
const shuffleButton = document.querySelector('.shuffle__btn'); // кнопка перемешивания
const filterButton = document.querySelector('.filter__btn'); // кнопка фильтрации
const sortKindLabel = document.querySelector('.sort__kind'); // поле с названием сортировки
const sortTimeLabel = document.querySelector('.sort__time'); // поле с временем сортировки
const sortChangeButton = document.querySelector('.sort__change__btn'); // кнопка смены сортировки
const sortActionButton = document.querySelector('.sort__action__btn'); // кнопка сортировки
const kindInput = document.querySelector('.kind__input'); // поле с названием вида
const colorInput = document.querySelector('.color__input'); // поле с названием цвета
const weightInput = document.querySelector('.weight__input'); // поле с весом
const addActionButton = document.querySelector('.add__action__btn'); // кнопка добавления
const minWeightInput = document.querySelector('.minweight__input'); // поле минимального веса
const maxWeightInput = document.querySelector('.maxweight__input'); // поле максимального веса

// список фруктов в JSON формате
let fruitsJSON = `[
  {"kind": "Мангустин", "color": "фиолетовый", "weight": 13},
  {"kind": "Дуриан", "color": "зеленый", "weight": 35},
  {"kind": "Личи", "color": "розово-красный", "weight": 17},
  {"kind": "Карамбола", "color": "желтый", "weight": 28},
  {"kind": "Тамаринд", "color": "светло-коричневый", "weight": 22}
]`;

// преобразование JSON в объект JavaScript
let fruits = JSON.parse(fruitsJSON);

// Сохраняем исходный массив для возможности сброса фильтрации
let originalFruits = [...fruits];
let isFiltered = false;

/*** ОТОБРАЖЕНИЕ ***/

// Функция для получения класса цвета по названию
const getColorClass = (color) => {
  const colorLower = color.toLowerCase();
  if (colorLower.includes('фиолет')) return 'fruit_violet';
  if (colorLower.includes('зелен')) return 'fruit_green';
  if (colorLower.includes('розово-красный') || colorLower.includes('розовый')) return 'fruit_carmazin';
  if (colorLower.includes('желт')) return 'fruit_yellow';
  if (colorLower.includes('светло-коричневый') || colorLower.includes('коричневый')) return 'fruit_lightbrown';
  return 'fruit_green';
};

// отрисовка карточек
const display = () => {
  // очищаем fruitsList от вложенных элементов
  fruitsList.innerHTML = '';

  for (let i = 0; i < fruits.length; i++) {
    // формируем новый элемент <li>
    const fruitItem = document.createElement('li');
    fruitItem.className = `fruit__item ${getColorClass(fruits[i].color)}`;
    
    const fruitInfo = document.createElement('div');
    fruitInfo.className = 'fruit__info';
    fruitInfo.innerHTML = `
      <div>index: ${i}</div>
      <div>kind: ${fruits[i].kind}</div>
      <div>color: ${fruits[i].color}</div>
      <div>weight (кг): ${fruits[i].weight}</div>
    `;
    
    fruitItem.appendChild(fruitInfo);
    fruitsList.appendChild(fruitItem);
  }
};

// первая отрисовка карточек
display();

/*** ПЕРЕМЕШИВАНИЕ ***/

// генерация случайного числа в заданном диапазоне
const getRandomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// перемешивание массива
const shuffleFruits = () => {
  // Сохраняем исходный порядок для проверки
  const originalOrder = [...fruits];
  
  // Если массив слишком маленький
  if (fruits.length <= 1) {
    alert('Недостаточно элементов для перемешивания!');
    return;
  }
  
  // Алгоритм перемешивания Фишера-Йетса
  for (let i = fruits.length - 1; i > 0; i--) {
    const j = getRandomInt(0, i);
    [fruits[i], fruits[j]] = [fruits[j], fruits[i]];
  }
  
  // Проверяем, изменился ли порядок
  let isSameOrder = true;
  for (let i = 0; i < fruits.length; i++) {
    if (fruits[i] !== originalOrder[i]) {
      isSameOrder = false;
      break;
    }
  }
  
  // Если порядок не изменился, выводим предупреждение
  if (isSameOrder) {
    alert('Порядок не изменился при перемешивании!');
  }
};

shuffleButton.addEventListener('click', () => {
  shuffleFruits();
  display();
});

/*** ФИЛЬТРАЦИЯ ***/

// фильтрация массива
const filterFruits = () => {
  const minWeight = parseFloat(minWeightInput.value);
  const maxWeight = parseFloat(maxWeightInput.value);
  
  // Проверяем ввод пользователя
  if (isNaN(minWeight) || isNaN(maxWeight)) {
    alert('Пожалуйста, введите корректные значения для фильтрации!');
    return;
  }
  
  if (minWeight > maxWeight) {
    alert('Минимальный вес не может быть больше максимального!');
    return;
  }
  
  // Если еще не фильтровали, сохраняем исходный массив
  if (!isFiltered) {
    originalFruits = [...fruits];
    isFiltered = true;
  }
  
  // Фильтруем массив
  fruits = originalFruits.filter((item) => {
    return item.weight >= minWeight && item.weight <= maxWeight;
  });
  
  // Если после фильтрации массив пустой
  if (fruits.length === 0) {
    alert('Нет фруктов в указанном диапазоне весов!');
    fruits = [...originalFruits];
    isFiltered = false;
    minWeightInput.value = '';
    maxWeightInput.value = '';
  }
};

filterButton.addEventListener('click', () => {
  filterFruits();
  display();
});

/*** СОРТИРОВКА ***/

let sortKind = 'bubbleSort'; // инициализация состояния вида сортировки
let sortTime = '-'; // инициализация состояния времени сортировки

// Приоритеты цветов для сортировки
const colorPriority = {
  'красный': 1,
  'розово-красный': 2,
  'оранжевый': 3,
  'желтый': 4,
  'зеленый': 5,
  'фиолетовый': 6,
  'светло-коричневый': 7,
  'коричневый': 8
};

const comparationColor = (a, b) => {
  const colorA = a.color.toLowerCase();
  const colorB = b.color.toLowerCase();
  
  const priorityA = colorPriority[colorA] || 99;
  const priorityB = colorPriority[colorB] || 99;
  
  return priorityA - priorityB;
};

const sortAPI = {
  bubbleSort(arr, comparation) {
    const sortedArray = [...arr];
    const n = sortedArray.length;
    
    for (let i = 0; i < n - 1; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        if (comparation(sortedArray[j], sortedArray[j + 1]) > 0) {
          [sortedArray[j], sortedArray[j + 1]] = [sortedArray[j + 1], sortedArray[j]];
        }
      }
    }
    
    return sortedArray;
  },

  quickSort(arr, comparation) {
    if (arr.length <= 1) {
      return arr;
    }
    
    const pivot = arr[Math.floor(arr.length / 2)];
    const left = [];
    const right = [];
    const equal = [];
    
    for (let item of arr) {
      const comparisonResult = comparation(item, pivot);
      if (comparisonResult < 0) {
        left.push(item);
      } else if (comparisonResult > 0) {
        right.push(item);
      } else {
        equal.push(item);
      }
    }
    
    return [...this.quickSort(left, comparation), ...equal, ...this.quickSort(right, comparation)];
  },

  // выполняет сортировку и производит замер времени
  startSort(sort, arr, comparation) {
    const start = performance.now();
    const sortedArray = sort(arr, comparation);
    const end = performance.now();
    sortTime = `${(end - start).toFixed(2)} ms`;
    sortTimeLabel.textContent = sortTime;
    return sortedArray;
  },
};

// инициализация полей
sortKindLabel.textContent = sortKind;
sortTimeLabel.textContent = sortTime;

sortChangeButton.addEventListener('click', () => {
  // переключаем значение sortKind между 'bubbleSort' / 'quickSort'
  sortKind = sortKind === 'bubbleSort' ? 'quickSort' : 'bubbleSort';
  sortKindLabel.textContent = sortKind;
  sortTimeLabel.textContent = '-';
});

sortActionButton.addEventListener('click', () => {
  // выводим в sortTimeLabel значение 'sorting...'
  sortTimeLabel.textContent = 'sorting...';
  
  // Даем браузеру время обновить интерфейс
  setTimeout(() => {
    const sortFunction = sortAPI[sortKind];
    const sortedArray = sortAPI.startSort(sortFunction, fruits, comparationColor);
    fruits = sortedArray;
    display();
  }, 10);
});

/*** ДОБАВИТЬ ФРУКТ ***/

addActionButton.addEventListener('click', () => {
  const kind = kindInput.value.trim();
  const color = colorInput.value.trim();
  const weight = parseFloat(weightInput.value.trim());
  
  // Проверяем, что все поля заполнены
  if (!kind || !color || isNaN(weight) || weight <= 0) {
    alert('Пожалуйста, заполните все поля корректно!\nВес должен быть положительным числом.');
    return;
  }
  
  // Создаем новый фрукт
  const newFruit = {
    kind: kind,
    color: color,
    weight: weight
  };
  
  // Добавляем в массив
  fruits.push(newFruit);
  
  // Очищаем поля ввода
  kindInput.value = '';
  colorInput.value = '';
  weightInput.value = '';
  
  // Обновляем отображение
  display();
  
  // Если был применен фильтр, сбрасываем его
  if (isFiltered) {
    originalFruits = [...fruits];
    isFiltered = false;
    minWeightInput.value = '';
    maxWeightInput.value = '';
  }
});

// Добавляем возможность нажимать Enter в полях ввода
[kindInput, colorInput, weightInput].forEach(input => {
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      addActionButton.click();
    }
  });
});

// Добавляем возможность нажимать Enter в полях фильтрации
[minWeightInput, maxWeightInput].forEach(input => {
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      filterButton.click();
    }
  });
});