# Pathways — Job Search Function Mockup

Інтерактивний UI-мокап платформи пошуку роботи "Pathways", згенерований через
[Figma Make](https://www.figma.com/make/) і допрацьовуваний вручну для BHMP
Network.

Проєкт зараз є **фронтенд-прототипом**: вакансії й трекер заявок —
тимчасові/захардкоджені дані без бекенду, але **автентифікація вже реальна**
через Supabase.

## Що вже реалізовано

- **Список вакансій** з фільтрами по сектору, типу зайнятості та пошуком за
  назвою/компанією/локацією
- **Деталі вакансії** у спліт-вʼю панелі з посиланням на сайт роботодавця
  (подача заявки — тільки зовнішня, не в самому додатку)
- **Трекер заявок** — канбан-дошка зі стадіями Saved / Applied / Interview / Offer
- **Роутинг через `react-router-dom`**: дашборд (`/`) доступний лише після
  входу, `/login` — окрема сторінка
- **Реальна автентифікація через Supabase Auth** (`src/context/AuthContext.tsx`,
  `src/lib/supabaseClient.ts`):
  - Sign up/Sign in зберігають справжній обліковий запис у Supabase (email +
    пароль), сесія живе в Supabase SDK (не в `localStorage`) і переживає
    перезавантаження сторінки та відкриття в кількох вкладках
  - Full Name, дата народження й обрана роль зберігаються в
    `user_metadata` користувача — окремої таблиці профілів поки не потрібно
  - Якщо в проєкті увімкнено підтвердження email, після реєстрації показується
    повідомлення "Check your email" замість негайного входу
  - Реальні помилки Supabase (зайнятий email, неправильний пароль тощо)
    відображаються у формі
- **Сторінка логіну** зі спліт-екраном (брендований BHMP Network фон з
  фото/лого зліва, форма справа):
  - **Реєстрація у 2 кроки** — вибір ролі (Student / Graduate / Professional /
    Career Changer; Employer і Partner поки задизейблені, з міткою "Soon"),
    потім Full Name / дата народження (Day-Month-Year, завжди англійською,
    незалежно від локалі браузера) / email / пароль + підтвердження
    (show/hide іконки на обох)
  - **Sign in** — простий одноступеневий email/пароль флоу
- **Світла/темна тема**

## Чого ще немає (наступні кроки)

- Реальний бекенд/API для вакансій (список і досі захардкоджений масив)
- Окрема таблиця `profiles` у Supabase з RLS — знадобиться, коли треба буде
  запитувати/показувати список користувачів (зараз досить `user_metadata`)
- Функціонал для ролей Employer/Partner (зараз лише заглушка в UI)
- Персистентність збережених вакансій і статусу заявок у трекері (зараз
  скидаються при перезавантаженні — на відміну від сесії логіну)
- Прямі посилання на конкретну вакансію чи вкладку
- Тести
- Оптимізація зображення фону логіну (`src/assets/login/team-photo.jpg`,
  ~1.9 МБ — варто стиснути/конвертувати в WebP перед продакшн-деплоєм)
- Покращення доступності (aria-атрибути, labels) та адаптивності під мобільні
- Узгодити брендинг: дашборд і назва проєкту досі "Pathways", тоді як сторінка
  логіну вже брендована під BHMP Network

## Стек

React 19 · React Router 7 · Supabase (Auth) · Vite 8 · TypeScript 5.7 · Tailwind CSS v4

## Структура

- `src/main.tsx` — точка входу, огортає `App` у `BrowserRouter`
- `src/App.tsx` — маршрути (`/`, `/login`) та `AuthProvider`
- `src/pages/` — `Dashboard.tsx` (гейтований `/`) та `LoginPage.tsx` (`/login`)
- `src/components/login/` — компоненти сторінки логіну (візард реєстрації,
  форма входу, поле дати народження, поле паролю, фонова панель)
- `src/components/shared.tsx` — спільні UI-атоми й CSS-var токени
  (`Logo`, `ThemeToggle`, `JobCard`, `JobDetail`, `TrackerView`)
- `src/components/RequireAuth.tsx` — guard, що редіректить на `/login`,
  поки триває перевірка сесії — нічого не рендерить
- `src/context/AuthContext.tsx` — `AuthProvider`/`useAuth`, обгортка над
  Supabase Auth (`signUp`/`signIn`/`logout`, підписка на зміну сесії)
- `src/lib/supabaseClient.ts` — єдиний Supabase-клієнт, читає
  `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` з env
- `src/data/jobs.ts` — захардкоджені вакансії, ролі, сектори, статуси
- `src/assets/login/` — лого та фонове фото BHMP Network

## Environment variables

Скопіюйте `.env.example` в `.env.local` і заповніть значеннями з Supabase
(Project Settings → API → Project URL / anon public key):

```bash
cp .env.example .env.local
```

```
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-public-key>
```

`.env.local` в `.gitignore`, у репозиторій не потрапляє. `anon key`
призначений для клієнтського коду і безпечний для використання в браузері —
захист даних забезпечують RLS-політики на боці Supabase, а не секретність
цього ключа. **`service_role` ключ ніколи не використовується на фронтенді.**

## Розробка

Проєкт розрахований на запуск усередині Figma Make (див. [AGENTS.md](AGENTS.md)
для деталей структури та конвенцій). Для локальної розробки:

```bash
pnpm install
pnpm dev
```

Інші команди: `pnpm build`, `pnpm preview`, `pnpm format`.
