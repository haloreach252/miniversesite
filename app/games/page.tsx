// app/games/page.tsx

import GameGrid from '../components/games/GameGrid';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Games | Miniverse Studios',
  description: 'Discover our collection of games, featuring our 2 main games: Ebon Gates and Eldritch Dawn'
}

const GamesPage = () => {
  return (
    <GameGrid />
  );
};

export default GamesPage;
