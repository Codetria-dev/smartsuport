# SmartSupport - Frontend

SaaS scheduling system - Modern and responsive interface for appointment management.

> **Part of the Codetria Portfolio**
> Project backend: [link to backend repository]

---

## Preview

![SmartSupport Dashboard](https://via.placeholder.com/800x400?text=SmartSupport+Preview)

---

## Features

- Complete authentication (Login/Register with JWT)
- Dashboard with appointment overview
- Appointment CRUD (create, edit, cancel)
- Filters by date/client/service
- User profile with data editing
- Responsive - works on mobile and desktop
- Automatic refresh token (persistent session)

---

## Tech Stack

| Technology     | Version | Purpose                |
| -------------- | ------- | ---------------------- |
| React          | 18.2    | Declarative UI         |
| TypeScript     | 5.x     | Static typing          |
| Vite           | 5.x     | Fast build tool        |
| React Router   | 6.x     | SPA navigation         |
| Axios          | 1.x     | HTTP requests          |
| Tailwind CSS   | 4.x     | Utility-first styling  |

---

## Prerequisites

- Node.js 18+ (recommended v20 LTS)
- npm or yarn or pnpm
- Backend running (SmartSupport API)

---

## Installation and Setup

```bash
# 1. Clone the repository
git clone https://github.com/your-username/smartsupport-frontend.git

# 2. Enter the folder
cd smartsupport-frontend

# 3. Install dependencies
npm install

# 4. Configure environment variables
cp .env.example .env
# Edit .env with your API URL
# Example: VITE_API_URL=http://localhost:3333

# 5. Start development server
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## Authentication System (Technical Details)

The frontend implements stateless authentication with JWT + Context API:

```
Login -> API returns { access_token, refresh_token }
  |
  v
Store tokens in localStorage
  |
  v
Axios interceptor adds header: Authorization: Bearer {token}
  |
  v
Token expires -> automatic silent refresh
  |
  v
Refresh fails -> user is automatically logged out
```

**Key files:**
- `src/contexts/AuthContext.tsx` - Global state management
- `src/services/api.ts` - Axios interceptor
- `src/utils/refreshToken.ts` - Renewal logic

---

## Folder Structure

```
frontend/
├── src/
│   ├── components/       # Reusable components (Button, Input, Modal)
│   ├── contexts/         # React contexts (AuthContext main)
│   ├── pages/            # Full pages (Login, Dashboard, Profile)
│   ├── routes/           # Public/private routes with guards
│   ├── services/         # API calls (appointments, user)
│   ├── types/            # Global TypeScript interfaces
│   └── utils/            # Helper functions (formatting, validation)
├── .env.example          # Environment variables template
├── index.html
├── package.json
└── vite.config.ts
```

---

## Available Scripts

```bash
npm run dev      # Development with hot-reload
npm run build    # Production build (/dist folder)
npm run preview  # Preview production build locally
npm run lint     # Run ESLint on code
```

---

## Tailwind CSS Customization

The project uses Tailwind CSS v4 via PostCSS. Configure as follows:

```bash
npm install -D tailwindcss @tailwindcss/postcss postcss
```

`tailwind.css` file:
```css
@import "tailwindcss";
@theme {
  --color-brand: #d64e38;
}
```

---

## Environment Variables

| Variable        | Example                    | Required |
| --------------- | -------------------------- | -------- |
| VITE_API_URL    | http://localhost:3333      | Yes      |
| VITE_APP_NAME   | SmartSupport               | Optional |

---

## Responsiveness

The layout was developed with Mobile First approach:

| Breakpoint  | Width        |
| ----------- | ------------ |
| Mobile      | < 640px      |
| Tablet      | >= 768px     |
| Desktop     | >= 1024px    |

Tested on: Chrome, Firefox, Safari, Edge (mobile and desktop).

---

## Future Improvements (Roadmap)

- Dark mode
- PWA for mobile installation
- Appointment charts (Recharts)
- Real-time notifications (WebSocket)

---

## License

This project is part of the Codetria Portfolio - educational and demonstrational use.

---

## Contact

Developed by [Your Name]
[Your LinkedIn] | [Your GitHub] | [Your Portfolio]
