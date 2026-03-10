import express from "express";
import { nanoid } from "nanoid";
import cors from "cors";

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const app = express();
const PORT = 3000;

const JWT_SECRET = "access_secret";
const ACCESS_EXPIRES_IN = "15m";

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

let users = [];

function authMiddleware(req, res, next) {
  const header = req.headers.authorization || "";

  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({
      error: "Missing or invalid Authorization header",
    });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);

    // Сохраняем данные токена в req
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({
      error: "Invalid or expired token",
    });
  }
}

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

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API управления товарами",
      version: "1.0.0",
      description:
        "API для управления ассортиментом товаров и выполнения над ними CRUD операций.",
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: "Локальный сервер",
      },
    ],
  },
  apis: ["./index.js"],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - name
 *         - price
 *         - description
 *         - category
 *         - quanity
 *         - image
 *       properties:
 *         id:
 *           type: string
 *           description: Автоматически сгенерированный уникальный ID товара
 *         name:
 *           type: string
 *           description: Наименование товара
 *         price:
 *           type: integer
 *           description: Цена товара
 *         description:
 *           type: string
 *           description: Подробное описание товара
 *         category:
 *           type: string
 *           description: Категория товара, к которой он принадлежит
 *         quanity:
 *           type: integer
 *           description: Количество товара на складе
 *         image:
 *           type: string
 *           description: Ссылка на изображение товара
 *       example:
 *         id: "t6k0Kg"
 *         price: 199990
 *         name: "Ноутбук"
 *         description: "Мощный ноутбук с процессором Intel Core i7, 16 ГБ ОЗУ и SSD 512 ГБ. Идеален для работы и развлечений."
 *         category: "Электроника"
 *         quanity: 23
 *         image: "https://ezzzbox.ru/upload/iblock/834/q9zlxld8ndj7h6e2daixrru2n91gsyne.jpg"
 */

// Функция-помощник для получения товара из списка
function findProductOr404(id, res) {
  const product = products.find((p) => p.id == id);
  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return null;
  }
  return product;
}

function findUserOr404(email, res) {
  const user = users.find((u) => u.email == email);
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return null;
  }
  return user;
}

async function hashPassword(password) {
  const rounds = 10;
  return bcrypt.hash(password, rounds);
}

async function verifyPassword(password, passwordHash) {
  return bcrypt.compare(password, passwordHash);
}

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Регистрация нового пользователя
 *     description: Создаёт нового пользователя с хешированным паролем
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - firstName
 *               - lastName
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: example@domen.com
 *               firstName:
 *                 type: string
 *                 example: Ivan
 *               lastName:
 *                 type: string
 *                 example: Ivanov
 *               password:
 *                 type: string
 *                 example: qwerty12345
 *     responses:
 *       201:
 *         description: Пользователь успешно создан
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: fhzcYH
 *                 email:
 *                   type: string
 *                   example: example@domen.com
 *                 firstName:
 *                   type: string
 *                   example: Ivan
 *                 lastName:
 *                   type: string
 *                   example: Ivanov
 *                 password:
 *                   type: string
 *                   example: $2a$10$RYhnJE8fQB3Uv7q3V4F.iO3/f7bigK7zeAnLHmvpzgRoo9wpky9Qa
 *       400:
 *         description: Некорректные данные
 */
app.post("/api/auth/register", async (req, res) => {
  const { email, firstName, lastName, password } = req.body;

  if (
    email === undefined ||
    firstName === undefined ||
    lastName === undefined ||
    password === undefined
  ) {
    return res.status(400).json({ error: "user information are required" });
  }
  const newUser = {
    id: nanoid(6),
    email: email.trim(),
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    hashedPassword: await hashPassword(password),
  };

  users.push(newUser);
  res.status(201).json(newUser);
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Авторизация пользователя в систему
 *     description: Проверяет логин и пароль пользователя
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: example@domen.com
 *               password:
 *                 type: string
 *                 example: qwerty12345
 *     responses:
 *       200:
 *         description: Успешная авторизация
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 login:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Отсутствуют обязательные поля
 *       401:
 *         description: Неверные учётные данные
 *       404:
 *         description: Пользователь не найден
 */
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  if (email === undefined || password === undefined) {
    return res.status(400).json({ error: "email and password are required" });
  }

  const user = findUserOr404(email, res);
  if (!user) return;

  const isAuthentethicated = await verifyPassword(
    password,
    user.hashedPassword,
  );
  if (isAuthentethicated) {
    const accessToken = jwt.sign(
      {
        sub: user.id,
        email: user.email,
      },
      JWT_SECRET,
      {
        expiresIn: ACCESS_EXPIRES_IN,
      },
    );
    res.json({ accessToken });
  } else {
    res.status(401).json({ error: "not authentethicated" });
  }
});

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Возвращает список товаров магазина
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Список товаров
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 */
app.get("/api/products", (req, res) => {
  // GET-запрос на получение списка всех товаров.
  res.json(products);
});

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Возвращает конкретный товар по его ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID товара
 *     responses:
 *       200:
 *         description: Данные о конкретном товаре
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Товар не найден
 */
app.get("/api/products/:id", authMiddleware, (req, res) => {
  // GET-запрос на получение конкретного товара по id.
  const id = req.params.id;

  const product = findProductOr404(id, res);
  if (!product) return;

  res.json(product);
});

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Добавление нового товара
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *               - description
 *               - category
 *               - quanity
 *               - image
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: integer
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *               quanity:
 *                 type: integer
 *               image:
 *                 type: string
 *     responses:
 *       201:
 *         description: Товар успешно добавлен в ассортимент
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Ошибка в теле запроса на добавление товара
 */
app.post("/api/products", authMiddleware, (req, res) => {
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

/**
 * @swagger
 * /api/products/{id}:
 *   patch:
 *     summary: Обновление информации о конкретном товаре
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID товара
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: integer
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *               quanity:
 *                 type: integer
 *               image:
 *                 type: string
 *     responses:
 *       200:
 *         description: Данные о конкретном товаре успешно обновлены
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Нет данные для обновления
 *       404:
 *         description: Товар не найден
 */
app.patch("/api/products/:id", authMiddleware, (req, res) => {
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

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Удаляет товар по его ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID товара
 *     responses:
 *       204:
 *         description: Товар успешно удалён из ассортимента (тело ответа отсутствует)
 *       404:
 *         description: Товар не найден
 */
app.delete("/api/products/:id", authMiddleware, (req, res) => {
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
app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
  console.log(
    `Swagger UI доступен по адресу http://localhost:${PORT}/api-docs`,
  );
});
