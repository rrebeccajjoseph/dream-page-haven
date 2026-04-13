
DROP POLICY "Published posts viewable by authenticated" ON public.posts;
CREATE POLICY "Posts viewable by everyone" ON public.posts FOR SELECT USING (published = true);

DROP POLICY "Quotes viewable by authenticated" ON public.quotes;
CREATE POLICY "Quotes viewable by everyone" ON public.quotes FOR SELECT USING (true);

DROP POLICY "Books viewable by authenticated" ON public.books;
CREATE POLICY "Books viewable by everyone" ON public.books FOR SELECT USING (true);
