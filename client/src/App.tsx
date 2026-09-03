// Signal Cathedral style reminder: the game is a full-bleed instrument window, not a conventional centered application shell.
import { TooltipProvider } from "@/components/ui/tooltip";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import GameCanvas from "./components/GameCanvas";

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <GameCanvas />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
