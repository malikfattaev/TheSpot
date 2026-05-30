import { FlatCompat } from '@eslint/eslintrc';
import shared from '@thespot/config/eslint';

const compat = new FlatCompat({ baseDirectory: import.meta.dirname });

export default [...shared, ...compat.extends('next/core-web-vitals')];
