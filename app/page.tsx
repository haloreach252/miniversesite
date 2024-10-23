// /app/page.tsx

import { Metadata } from 'next';
import Hero from './components/home/Hero';
import NewsFeed from './components/home/NewsFeed';

export const metadata: Metadata = {
  title: 'Home | Miniverse Studios',
  description: 'Welcome to Miniverse Studios. Feel free to explore our games, gallery, and sign up for future content updates!'
}

const HomePage = () => {
  return (
    <div>
      <Hero />
      <NewsFeed />
    </div>
  )
}

export default HomePage;