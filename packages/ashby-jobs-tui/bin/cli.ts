#!/usr/bin/env node
import React from 'react';
import { render } from 'ink';
import { App } from '../src/app.js';

const { waitUntilExit } = render(React.createElement(App));
await waitUntilExit();
