-- Drop old owner-only delete policies
DROP POLICY IF EXISTS "Users can delete own books" ON public.books;
DROP POLICY IF EXISTS "Users can delete own quotes" ON public.quotes;
DROP POLICY IF EXISTS "Users can delete own articles" ON public.articles;
DROP POLICY IF EXISTS "Authors can delete posts" ON public.posts;

-- Drop old owner-only update policies
DROP POLICY IF EXISTS "Users can update own books" ON public.books;
DROP POLICY IF EXISTS "Users can update own quotes" ON public.quotes;
DROP POLICY IF EXISTS "Users can update own articles" ON public.articles;
DROP POLICY IF EXISTS "Authors can update posts" ON public.posts;

-- Create new delete policies allowing any authenticated user
CREATE POLICY "Authenticated users can delete books" ON public.books FOR DELETE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete quotes" ON public.quotes FOR DELETE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete articles" ON public.articles FOR DELETE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete posts" ON public.posts FOR DELETE TO authenticated USING (true);

-- Create new update policies allowing any authenticated user
CREATE POLICY "Authenticated users can update books" ON public.books FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can update quotes" ON public.quotes FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can update articles" ON public.articles FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can update posts" ON public.posts FOR UPDATE TO authenticated USING (true);