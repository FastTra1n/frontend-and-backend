import express from "express";
import { nanoid } from "nanoid";
import cors from "cors";

const app = express();
const port = 3000;

let products = [
  {
    id: nanoid(6),
    name: "Ноутбук",
    price: 199990,
    description:
      "Мощный ноутбук с процессором Intel Core i7, 16 ГБ ОЗУ и SSD 512 ГБ. Идеален для работы и развлечений.",
    category: "Электроника",
    quanity: 23,
    image:
      "https://ezzzbox.ru/upload/iblock/834/q9zlxld8ndj7h6e2daixrru2n91gsyne.jpg",
  },
  {
    id: nanoid(6),
    name: "Набор посуды",
    price: 4590,
    description:
      "Набор из 10 предметов: кастрюли с антипригарным покрытием, сковорода и крышки. Подходит для всех типов плит.",
    category: "Дом",
    quanity: 42,
    image:
      "https://img-edg.joomcdn.net/4d4089a89581c336d83256e52d1d9da957371a72_original.jpeg",
  },
  {
    id: nanoid(6),
    name: "Горный велосипед",
    price: 89990,
    description:
      "Прочный алюминиевый сплав, 24 скорости, дисковые тормоза. Для активного отдыха на пересечённой местности.",
    category: "Спорт",
    quanity: 7,
    image: "https://static.richfamily.ru/photo/33/11/331152/1.webp",
  },
  {
    id: nanoid(6),
    name: "Увлажнитель воздуха",
    price: 3990,
    description:
      "Ультразвуковой увлажнитель с объёмом бака 4 л. Бесшумная работа, автоматическое отключение при недостатке воды.",
    category: "Дом",
    quanity: 15,
    image:
      "https://www.nt-nn.com/_data/resources/img/thumbnails/15733.60_4_1000x1000.jpg",
  },
  {
    id: nanoid(6),
    name: "Комплект постельного белья",
    price: 7490,
    description:
      "Сатин, 100% хлопок. В комплекте: простыня, пододеяльник, две наволочки. Размер евро.",
    category: "Дом",
    quanity: 31,
    image:
      "https://storage.yandexcloud.net/mostro-gm-media/047c1f40-97a2-afab-45f7-32cef397c4c0/69SZRAD.jpg",
  },
  {
    id: nanoid(6),
    name: "Смартфон",
    price: 54990,
    description:
      "Смартфон с 6.5-дюймовым экраном, тройная камера 48 Мп, 128 ГБ памяти.",
    category: "Электроника",
    quanity: 18,
    image:
      "https://www.mijia-shop.com/wp-content/uploads/2025/09/Xiaomi-17-Pro-Max-5.jpg",
  },
  {
    id: nanoid(6),
    name: "Кофеварка",
    price: 12990,
    description:
      "Рожковая кофеварка с давлением 15 бар, готовит эспрессо и капучино.",
    category: "Дом",
    quanity: 9,
    image:
      "https://goods-photos.static1-sima-land.com/items/3701084/0/400.jpg?v=1675848724",
  },
  {
    id: nanoid(6),
    name: "Палатка",
    price: 15990,
    description:
      "Трёхместная палатка с двойным дном и москитной сеткой. Водонепроницаемая.",
    category: "Спорт",
    quanity: 5,
    image: "https://static.richfamily.ru/photo/28/31/283179/1.webp",
  },
  {
    id: nanoid(6),
    name: "Книга 'JavaScript для начинающих'",
    price: 1990,
    description:
      "Понятное руководство по основам JavaScript с примерами и упражнениями.",
    category: "Книги",
    quanity: 27,
    image: "https://cdn.litres.ru/pub/c/cover/17254044.jpg",
  },
  {
    id: nanoid(6),
    name: "Беспроводные наушники",
    price: 7990,
    description:
      "Наушники с шумоподавлением, время работы до 20 часов, зарядный кейс.",
    category: "Электроника",
    quanity: 12,
    image: "https://i-store.net/_sh/73/7328.jpg",
  },
];

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// Middleware для парсинга JSON
app.use(express.json());

// Middleware для логирования запросов
app.use((req, res, next) => {
  res.on("finish", () => {
    console.log(
      `[${new Date().toISOString()}] [${req.method}]${res.statusCode} ${req.path}`,
    );
    if (
      req.method === "POST" ||
      req.method === "PUT" ||
      req.method === "PATCH"
    ) {
      console.log("Body:", req.body);
    }
  });
  next();
});

// Функция-помощник для получения товара из списка
function findProductOr404(id, res) {
  const product = products.find((p) => p.id == id);
  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return null;
  }
  return product;
}

app.get("/api/products", (req, res) => {
  // GET-запрос на получение списка всех товаров.
  res.json(products);
});

app.get("/api/products/:id", (req, res) => {
  // GET-запрос на получение конкретного товара по id.
  const id = req.params.id;

  const product = findProductOr404(id, res);
  if (!product) return;

  res.json(product);
});

app.post("/api/products", (req, res) => {
  // POST-запрос на добавление нового товара.
  const { name, price, description, category, quanity, image } = req.body;
  const newProduct = {
    id: nanoid(6),
    name: name.trim(),
    price: Number(price),
    description: description.trim(),
    category: category.trim(),
    quanity: Number(quanity),
    image: image.trim(),
  };
  products.push(newProduct);
  res.status(201).json(newProduct);
});

app.patch("/api/products/:id", (req, res) => {
  // PATCH-запрос на модифицирование конкретного товара по id.
  const id = req.params.id;

  const product = findProductOr404(id, res);
  if (!product) return;

  if (
    req.body?.name === undefined &&
    req.body?.price === undefined &&
    req.body?.description === undefined &&
    req.body?.category === undefined &&
    req.body?.quanity === undefined &&
    req.body?.image === undefined
  ) {
    return res.status(400).json({
      error: "Nothing to update",
    });
  }

  const { name, price, description, category, quanity, image } = req.body;

  if (name !== undefined) product.name = name.trim();
  if (price !== undefined) product.price = Number(price);
  if (description !== undefined) product.description = description.trim();
  if (category !== undefined) product.category = category.trim();
  if (quanity !== undefined) product.quanity = Number(quanity);
  if (image !== undefined) product.image = image.trim();

  res.status(200).json(product);
});

app.delete("/api/products/:id", (req, res) => {
  // DELETE-запрос на удаление товара по id.
  const id = req.params.id;

  const exists = products.some((p) => p.id === id);
  if (!exists) return res.status(404).json({ error: "Product not found" });

  products = products.filter((u) => u.id !== id);
  res.status(204).send();
});

app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

// Глобальный обработчик ошибок
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// Запуск сервера
app.listen(port, () => {
  console.log(`Сервер запущен на http://localhost:${port}`);
});
