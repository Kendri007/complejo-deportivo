-- Se saca "Beach Fútbol" del catálogo de deportes; queda "Fútbol" a secas
-- más beach vóley, beach tenis, tenis y pádel.
delete from public.sports where key = 'beach_futbol';
