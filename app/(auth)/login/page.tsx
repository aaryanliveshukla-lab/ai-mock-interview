'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFormik } from 'formik';
import * as Yup from 'yup';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const inputClassName =
    'block w-full rounded-md border border-white/10 bg-white/10 px-3 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6';

  const getSafeRedirectUrl = (rawValue: string | null) => {
    if (!rawValue || !rawValue.startsWith('/')) {
      return '/dashboard';
    }

    if (rawValue.startsWith('/login') || rawValue.startsWith('/register')) {
      return '/dashboard';
    }

    return rawValue;
  };

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: Yup.object({
      email: Yup.string().email('Invalid email').required('Required'),
      password: Yup.string()
        .min(6, 'Too short!')
        .required('Required'),
    }),
    onSubmit: async (values) => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(values),
        });

        if (response.ok) {
          // Redirect to dashboard or intended page
          const url = new URL(window.location.href);
          const redirectUrl = getSafeRedirectUrl(url.searchParams.get('callbackUrl'));
          router.push(redirectUrl);
        } else {
          const errorData = await response.json();
          formik.setErrors({
            ...formik.errors,
            ...errorData,
          });
          alert(errorData.error || 'Login failed');
        }
      } catch (error) {
        console.error('Login error:', error);
        alert('An error occurred during login');
      } finally {
        setIsLoading(false);
      }
    },
  });

  return (
    <div className="min-h-[100vh] flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-center text-white">Welcome Back</h2>
          <p className="text-center text-slate-300">
            Sign in to continue to Interview Prep
          </p>
        </div>
        <form onSubmit={formik.handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              className={inputClassName}
              {...formik.getFieldProps('email')}
            />
            {formik.touched.email && formik.errors.email ? (
              <p className="mt-1 text-sm text-red-600">{formik.errors.email}</p>
            ) : null}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              className={inputClassName}
              {...formik.getFieldProps('password')}
            />
            {formik.touched.password && formik.errors.password ? (
              <p className="mt-1 text-sm text-red-600">{formik.errors.password}</p>
            ) : null}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-200">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <a href="/forgot-password" className="font-medium text-indigo-300 hover:text-white">
                Forgot password?
              </a>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>

        <div className="text-center">
          <p className="text-sm text-slate-300">
            Don't have an account?{' '}
            <a href="/register" className="font-medium text-indigo-300 hover:text-white">
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
