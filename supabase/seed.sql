insert into public.sports (key, label, icon) values
  ('futbol', 'Fútbol', 'circle-dot'),
  ('beach_volley', 'Beach Vóley', 'waves'),
  ('beach_tenis', 'Beach Tenis', 'sunset'),
  ('tenis', 'Tenis', 'circle'),
  ('padel', 'Pádel', 'square')
on conflict (key) do nothing;
