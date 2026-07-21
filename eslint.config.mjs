import next from '@next/eslint-plugin-next';
import { FlatCompat } from '@eslint/eslintrc';

const fc = new FlatCompat();

export default [
  ...(async () => {
    const [nextConfig] = await Promise.resolve(
      fc.extends('next/core-web-vitals', 'next/typescript')
    );
    return [nextConfig];
  })(),
];