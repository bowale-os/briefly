# 🚀 Briefly Frontend - Step-by-Step Setup

Follow these steps in order to get your app running.

## Step 1: Create Next.js Project

```bash
npx create-next-app@15 briefly-frontend --ts --app --tailwind
cd briefly-frontend
```

## Step 2: Install Dependencies

```bash
npm install @tanstack/react-query zustand axios framer-motion class-variance-authority clsx tailwind-merge lucide-react next-themes react-use-gesture wavesurfer.js @radix-ui/react-slot tailwindcss-animate
```

## Step 3: Copy Configuration Files

Copy these files to your project root:

1. **package.json** (replace existing)
2. **next.config.js** (replace existing)
3. **tailwind.config.js** (replace existing)
4. **postcss.config.js** (replace existing)
5. **tsconfig.json** (replace existing)
6. **components.json** (new file)
7. **middleware.ts** (new file)
8. **.env.local** (new file)
9. **.gitignore** (replace existing)
10. **.eslintrc.json** (replace existing)

## Step 4: Copy App Files

Copy to `app/` directory:

1. **app/globals.css** (replace existing)
2. **app/layout.tsx** (replace existing)
3. **app/page.tsx** (replace existing)
4. **app/login/page.tsx** (new file - create folder)
5. **app/dashboard/page.tsx** (new file - create folder)
6. **app/history/page.tsx** (new file - create folder)
7. **app/player/[id]/page.tsx** (new file - create nested folders)

## Step 5: Copy Components

Copy to `components/` directory:

### UI Components (`components/ui/`)
1. **button.tsx**
2. **input.tsx**
3. **card.tsx**

### Custom Components
1. **components/theme-provider.tsx**
2. **components/query-provider.tsx**
3. **components/audio/AudioPlayer.tsx** (create audio folder)
4. **components/audio/BriefingCard.tsx**
5. **components/audio/PersonaSelector.tsx**

## Step 6: Copy Lib Files

Copy to `lib/` directory:

1. **lib/utils.ts**
2. **lib/api.ts**
3. **lib/auth.ts**

## Step 7: Copy Store Files

Copy to `store/` directory:

1. **store/useBriefingStore.ts**

## Step 8: Copy Public Files

Copy to `public/` directory:

1. **public/manifest.json**

## Step 9: Start Development Server

```bash
npm run dev
```

## Step 10: Open Browser

Navigate to `http://localhost:3000`

Login with:
- Email: `test@example.com`
- Password: `testpass`

---

## ✅ Checklist

- [ ] Step 1: Created Next.js project
- [ ] Step 2: Installed all dependencies
- [ ] Step 3: Copied all config files
- [ ] Step 4: Copied all app pages
- [ ] Step 5: Copied all components
- [ ] Step 6: Copied lib utilities
- [ ] Step 7: Copied store
- [ ] Step 8: Copied public files
- [ ] Step 9: Started dev server
- [ ] Step 10: Opened browser and logged in

---

## 📁 Final Directory Structure

```
briefly-frontend/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx
│   ├── login/page.tsx
│   ├── dashboard/page.tsx
│   ├── history/page.tsx
│   └── player/[id]/page.tsx
├── components/
│   ├── ui/
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   └── card.tsx
│   ├── audio/
│   │   ├── AudioPlayer.tsx
│   │   ├── BriefingCard.tsx
│   │   └── PersonaSelector.tsx
│   ├── theme-provider.tsx
│   └── query-provider.tsx
├── lib/
│   ├── utils.ts
│   ├── api.ts
│   └── auth.ts
├── store/
│   └── useBriefingStore.ts
├── public/
│   └── manifest.json
├── package.json
├── next.config.js
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
├── components.json
├── middleware.ts
├── .env.local
├── .gitignore
└── .eslintrc.json
```

---

**That's it! Your app should now be running at http://localhost:3000** 🎉