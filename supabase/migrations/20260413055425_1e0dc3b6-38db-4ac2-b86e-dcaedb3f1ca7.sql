ALTER TABLE public.posts DROP CONSTRAINT IF EXISTS posts_user_id_fkey;
ALTER TABLE public.books DROP CONSTRAINT IF EXISTS books_user_id_fkey;
ALTER TABLE public.quotes DROP CONSTRAINT IF EXISTS quotes_user_id_fkey;