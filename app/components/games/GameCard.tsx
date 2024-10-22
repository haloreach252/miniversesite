// components/games/GameCard.tsx
"use client"

import React from "react";
import {
  Card,
  CardContent,
  Typography,
  CardActionArea,
  Box,
} from "@mui/material";

interface Game {
  id: number;
  title: string;
  shortDescription: string;
  plannedReleaseDate: string;
}

interface GameCardProps {
  game: Game;
  onClick: (id: number) => void;
}

const GameCard: React.FC<GameCardProps> = ({ game, onClick }) => {
  return (
    <Card>
      <CardActionArea onClick={() => onClick(game.id)}>
        <Box
          className="w-full h-48 bg-gray-200"
          sx={{
            backgroundImage: `url(/images/games/${game.title.toLowerCase().replace(' ', '_')}_cover.jpg)`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <CardContent>
          <Typography gutterBottom variant="h6" component="div">
            {game.title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {game.shortDescription}
          </Typography>
          <Typography variant="caption" color="text.secondary" className="mt-2 block">
            Planned Release: {new Date(game.plannedReleaseDate).toLocaleDateString()}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default GameCard;
