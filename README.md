# Krazy Crunch — Fast Food Website (Next.js)

Full menu website with cart aur WhatsApp checkout. Customer menu se items add
karta hai, cart drawer khulta hai, apni details bharta hai, aur "Order via
WhatsApp" button dabate hi order pehle se type ho ke WhatsApp mein khul jata
hai — bas Send karna hota hai.

## Sabse pehle: apna WhatsApp number set karein

`src/config/site.ts` file kholein aur ye line update karein:

```ts
whatsappNumber: "923001234567",
```

Country code + number likhein, koi `+`, space ya dash nahi. Pakistan ke liye
`92` se shuru hoga (e.g. `923001234567`).


Isi file mein aap ye bhi edit kar sakte hain:
- `address`, `city`, `phoneDisplay` — location section aur footer ke liye
- `hours` — opening hours
- `deliveryFee`, `minOrderForFreeDelivery`
- `socials` — Instagram/Facebook links

## Menu edit karna

Sara menu `src/data/menu.ts` mein hai. Har item ka name, price, category,
description, spice level aur emoji/icon change kar sakte hain, ya naye items
add kar sakte hain — bas array mein object add karein.

## Local run karna

```bash
npm install
npm run dev
```

Phir browser mein `http://localhost:3000` kholein.

## Production build

```bash
npm run build
npm run start
```

## Deploy karna

Ye ek standard Next.js app hai — Vercel (sabse aasan, free tier available),
Netlify, ya kisi bhi Node hosting par deploy ho sakti hai:

1. GitHub par repo push karein
2. vercel.com par account banayein, repo import karein
3. Deploy — bas itna hi

## Project Structure

```
src/
  app/            -> pages, layout, global styles
  components/     -> Header, Hero, Menu, Cart Drawer, etc.
  context/        -> CartContext (cart state + WhatsApp message builder)
  data/           -> menu.ts (all food items)
  config/         -> site.ts (WhatsApp number, address, hours)
  lib/            -> shared TypeScript types
```

## Kaise kaam karta hai (WhatsApp checkout)

1. Customer "Add" dabata hai -> item cart mein add hota hai (localStorage mein
   save hota hai, refresh pe bhi cart nahi ukhadta)
2. Cart icon dabane par drawer khulta hai -> items, quantity, total dikhta hai
3. Customer apna name, phone, address bharta hai
4. "Order via WhatsApp" dabane par ek formatted message ke sath
   wa.me/<number>?text=... link naye tab mein khulta hai -> order pehle se
   type hota hai, customer sirf Send dabata hai

## POS shift / business day timing

The POS business day follows the restaurant shift: it starts at **2:00 PM** and
ends at **3:00 AM the next calendar day**. Orders placed after midnight and
before 3:00 AM belong to the shift that began the previous afternoon. The New
Order header total and the daily sales reports use this same business-day range.

To change the shift hours later, edit these constants in
`src/config/business-day.ts`:

```ts
export const BUSINESS_DAY_START_HOUR = 14;
export const BUSINESS_DAY_END_HOUR = 3;
```

Use 24-hour local time (for example, 1 PM is `13`). Keep the end hour as the
hour on the following calendar day. POS date-range queries use the shared
`businessDateInputValue()` and `businessDayRangeIso()` helpers in that file, so
pages that need a shift-based day should use those helpers too. The shift range
is 2:00 PM inclusive through 3:00 AM exclusive; 3:00 AM is outside the shift.
These settings change how existing orders are grouped in reports; they do not
change the saved order timestamps.
