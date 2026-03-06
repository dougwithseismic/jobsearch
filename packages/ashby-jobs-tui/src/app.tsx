import React from 'react';
import { Box, Text, useApp, useInput } from 'ink';
import { StoreProvider, useAppState, useDispatch } from './state/store.js';
import { useDataLoader } from './hooks/use-data-loader.js';
import { Header } from './components/layout/header.js';
import { Footer } from './components/layout/footer.js';
import { ScreenContainer } from './components/layout/screen-container.js';
import { HelpScreen } from './screens/help.js';
import { BrowseScreen } from './screens/browse.js';
import { SearchScreen } from './screens/search.js';
import { ScrapeScreen } from './screens/scrape.js';
import { getDataPath } from './utils/data-path.js';
import type { Screen } from './state/types.js';

const SCREENS: Screen[] = ['dashboard', 'browse', 'search', 'scrape'];

function PlaceholderScreen({ name }: { name: string }) {
  const state = useAppState();
  return (
    <Box flexDirection="column">
      <Text bold>{name}</Text>
      <Text color="gray">
        {state.data
          ? `${state.data.length} companies loaded`
          : 'No data loaded. Go to Scrape tab to fetch jobs.'}
      </Text>
    </Box>
  );
}

function ScreenRouter({ screen }: { screen: Screen }) {
  switch (screen) {
    case 'dashboard':
      return <PlaceholderScreen name="Dashboard" />;
    case 'browse':
      return <BrowseScreen />;
    case 'search':
      return <SearchScreen />;
    case 'scrape':
      return <ScrapeScreen />;
  }
}

function AppInner() {
  const state = useAppState();
  const dispatch = useDispatch();
  const { exit } = useApp();

  useDataLoader();

  useInput((input, key) => {
    if (input === 'q' && !state.showHelp) {
      exit();
      return;
    }
    if (input === '?') {
      dispatch({ type: 'TOGGLE_HELP' });
      return;
    }
    if (input === '/' && state.screen !== 'search') {
      dispatch({ type: 'SET_SCREEN', screen: 'search' });
      return;
    }
    if (key.tab) {
      const idx = SCREENS.indexOf(state.screen);
      const next = key.shift
        ? SCREENS[(idx - 1 + SCREENS.length) % SCREENS.length]!
        : SCREENS[(idx + 1) % SCREENS.length]!;
      dispatch({ type: 'SET_SCREEN', screen: next });
    }
    if (key.escape && state.showHelp) {
      dispatch({ type: 'TOGGLE_HELP' });
    }
  });

  return (
    <Box flexDirection="column" height="100%">
      <Header />
      <ScreenContainer>
        {state.showHelp ? (
          <HelpScreen />
        ) : (
          <ScreenRouter screen={state.screen} />
        )}
      </ScreenContainer>
      <Footer />
    </Box>
  );
}

export function App() {
  return (
    <StoreProvider dataPath={getDataPath()}>
      <AppInner />
    </StoreProvider>
  );
}
