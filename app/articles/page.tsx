import { ArticlePosts } from 'app/components/articleList'

export const metadata = {
  title: 'Article',
  description: 'Read my article.',
}

export default function Page() {
  return (
    <section>
      <h1 className="font-semibold text-2xl mb-8 tracking-tighter">Articles</h1>
      <ArticlePosts />
    </section>
  )
}
