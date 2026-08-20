-- Krazy Crunch - Menu Items table (run in Supabase SQL Editor, after orders table)

create table if not exists menu_items (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  name text not null,
  description text not null default '',
  price numeric not null,
  category text not null,
  emoji text not null default '🍽️',
  accent text not null default 'mustard' check (accent in ('chili', 'mustard', 'leaf')),
  badge text,
  spice_level int not null default 0,
  is_active boolean not null default true,
  sort_order int not null default 0
);

create index if not exists menu_items_category_idx on menu_items (category);
create index if not exists menu_items_sort_idx on menu_items (sort_order);

alter table menu_items enable row level security;

drop policy if exists "menu_items_anon_all" on menu_items;
create policy "menu_items_anon_all" on menu_items
  for all
  to anon
  using (true)
  with check (true);

alter publication supabase_realtime add table menu_items;

-- Seed with the existing menu (safe to run once; skip if you already have items)
insert into menu_items (name, description, price, category, emoji, accent, badge, spice_level, sort_order) values
('Krazy Solo Deal', '1 Zinger burger, regular fries, regular drink.', 950, 'Deals', '🍔', 'chili', 'Bestseller', 1, 0),
('Krazy Duo Deal', '2 Zinger burgers, 2 fries, 2 drinks - made for sharing.', 1750, 'Deals', '🍔', 'mustard', null, 1, 1),
('Krazy Family Feast', '8pc fried chicken, 4 burgers, 2 large fries, 1.5L drink.', 4200, 'Deals', '🍗', 'chili', 'Krazy Special', 2, 2),
('Krazy Piece (1pc)', 'Our signature double-crunch fried chicken, one piece.', 380, 'Fried Chicken', '🍗', 'chili', null, 2, 3),
('Krazy Piece (2pc)', 'Two pieces of the signature double-crunch chicken.', 700, 'Fried Chicken', '🍗', 'chili', null, 2, 4),
('Krunch Wings (6pc)', 'Six hot wings tossed in Krazy spice rub.', 650, 'Fried Chicken', '🍗', 'chili', 'Bestseller', 3, 5),
('Full Platter', '6pc fried chicken, fries, coleslaw, dip, 2 rolls.', 2400, 'Fried Chicken', '🍽️', 'mustard', null, 2, 6),
('Zinger Krazy Burger', 'Crispy zinger fillet, Krazy sauce, iceberg, toasted bun.', 550, 'Burgers', '🍔', 'chili', 'Bestseller', 2, 7),
('Krazy Beef Burger', 'Flame-grilled beef patty, cheddar, house sauce.', 620, 'Burgers', '🍔', 'mustard', null, 1, 8),
('Double Krunch Burger', 'Two crispy fillets stacked, double cheese, spicy mayo.', 780, 'Burgers', '🍔', 'chili', 'New', 2, 9),
('Krazy Roll', 'Spiced chicken strips, mint chutney, paratha wrap.', 420, 'Wraps & Rolls', '🌯', 'leaf', null, 2, 10),
('Loaded Krunch Wrap', 'Crispy chicken, cheese sauce, fries, folded and grilled.', 590, 'Wraps & Rolls', '🌯', 'chili', 'New', 2, 11),
('Spicy Shawarma Roll', 'Marinated chicken shawarma, garlic sauce, pickles.', 380, 'Wraps & Rolls', '🌯', 'mustard', null, 2, 12),
('Krazy Fries', 'Golden crispy fries, Krazy seasoning.', 280, 'Sides', '🍟', 'mustard', null, 1, 13),
('Krazy Loaded Fries', 'Fries topped with cheese sauce and chili flakes.', 450, 'Sides', '🍟', 'chili', 'Bestseller', 2, 14),
('Coleslaw', 'Fresh, creamy house-made coleslaw.', 180, 'Sides', '🥗', 'leaf', null, 0, 15),
('Garlic Mayo Dip', 'Extra dip on the side - because more is more.', 100, 'Sides', '🥣', 'mustard', null, 0, 16),
('Cold Drink (345ml)', 'Chilled soft drink of your choice.', 150, 'Beverages', '🥤', 'chili', null, 0, 17),
('Fresh Lemonade', 'Tangy, fresh-squeezed, served ice cold.', 220, 'Beverages', '🍋', 'leaf', null, 0, 18),
('Krazy Milkshake', 'Thick shake - chocolate, vanilla or strawberry.', 380, 'Beverages', '🥛', 'mustard', 'New', 0, 19);
