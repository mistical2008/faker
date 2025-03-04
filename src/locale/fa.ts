/*
 * This file is automatically generated.
 * Run 'pnpm run generate:locales' to update.
 */

import { Faker } from '../faker';
import en from '../locales/en';
import fa from '../locales/fa';

const faker = new Faker({
  locale: 'fa',
  localeFallback: 'en',
  locales: {
    fa,
    en,
  },
});

export = faker;
