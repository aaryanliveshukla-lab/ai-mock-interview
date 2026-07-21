'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFormik } from 'formik';
import * as Yup from 'yup';

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const inputClassName =
    'block w-full rounded-md border border-white/10 bg-white/10 px-3 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6';

  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'student',
      phone: '',
      college: '',
      branch: '',
      graduationYear: '',
      skills: '',
      experience: '',
      projects: '',
      resumeUrl: '',
      careerGoal: '',
    },
    validationSchema: Yup.object({
      name: Yup.string().min(2, 'Too short!').required('Required'),
      email: Yup.string().email('Invalid email').required('Required'),
      password: Yup.string()
        .min(6, 'Too short!')
        .required('Required'),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('password')], 'Passwords must match')
        .required('Required'),
    }),
    onSubmit: async (values) => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: values.name,
            email: values.email,
            password: values.password,
            role: values.role,
            phone: values.phone,
            college: values.college,
            branch: values.branch,
            graduationYear: values.graduationYear,
            skills: values.skills,
            experience: values.experience,
            projects: values.projects,
            resumeUrl: values.resumeUrl,
            careerGoal: values.careerGoal,
          }),
        });

        if (response.ok) {
          // Redirect to login or email verification page
          router.push('/login?message=registered');
        } else {
          const errorData = await response.json();
          formik.setErrors({
            ...formik.errors,
            ...errorData,
          });
          alert(errorData.error || 'Registration failed');
        }
      } catch (error) {
        console.error('Registration error:', error);
        alert('An error occurred during registration');
      } finally {
        setIsLoading(false);
      }
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-center text-white">Create Account</h1>
      <form onSubmit={formik.handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="role" className="block text-sm font-medium mb-1 text-slate-200">
            Role
          </label>
          <select
            id="role"
            className={inputClassName}
            {...formik.getFieldProps('role')}
          >
            <option value="student">Student</option>
            <option value="trainer">Trainer</option>
            <option value="placement_officer">Placement Officer</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1 text-slate-200">
            Full Name
          </label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            className={inputClassName}
            {...formik.getFieldProps('name')}
          />
          {formik.touched.name && formik.errors.name ? (
            <p className="mt-1 text-sm text-red-600">{formik.errors.name}</p>
          ) : null}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1 text-slate-200">
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

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="phone" className="block text-sm font-medium mb-1 text-slate-200">
              Phone
            </label>
            <input id="phone" type="tel" className={inputClassName} {...formik.getFieldProps('phone')} />
          </div>
          <div>
            <label htmlFor="graduationYear" className="block text-sm font-medium mb-1 text-slate-200">
              Graduation Year
            </label>
            <input id="graduationYear" type="number" className={inputClassName} {...formik.getFieldProps('graduationYear')} />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="college" className="block text-sm font-medium mb-1 text-slate-200">
              College
            </label>
            <input id="college" type="text" className={inputClassName} {...formik.getFieldProps('college')} />
          </div>
          <div>
            <label htmlFor="branch" className="block text-sm font-medium mb-1 text-slate-200">
              Branch
            </label>
            <input id="branch" type="text" className={inputClassName} {...formik.getFieldProps('branch')} />
          </div>
        </div>

        <div>
          <label htmlFor="skills" className="block text-sm font-medium mb-1 text-slate-200">
            Skills
          </label>
          <input
            id="skills"
            type="text"
            placeholder="React, Node.js, SQL"
            className={inputClassName}
            {...formik.getFieldProps('skills')}
          />
        </div>

        <div>
          <label htmlFor="experience" className="block text-sm font-medium mb-1 text-slate-200">
            Experience
          </label>
          <input id="experience" type="text" className={inputClassName} {...formik.getFieldProps('experience')} />
        </div>

        <div>
          <label htmlFor="projects" className="block text-sm font-medium mb-1 text-slate-200">
            Projects
          </label>
          <textarea id="projects" rows={3} className={inputClassName} {...formik.getFieldProps('projects')} />
        </div>

        <div>
          <label htmlFor="resumeUrl" className="block text-sm font-medium mb-1 text-slate-200">
            Resume URL
          </label>
          <input id="resumeUrl" type="url" className={inputClassName} {...formik.getFieldProps('resumeUrl')} />
        </div>

        <div>
          <label htmlFor="careerGoal" className="block text-sm font-medium mb-1 text-slate-200">
            Career Goal
          </label>
          <textarea id="careerGoal" rows={3} className={inputClassName} {...formik.getFieldProps('careerGoal')} />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1 text-slate-200">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            className={inputClassName}
            {...formik.getFieldProps('password')}
          />
          {formik.touched.password && formik.errors.password ? (
            <p className="mt-1 text-sm text-red-600">{formik.errors.password}</p>
          ) : null}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1 text-slate-200">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            className={inputClassName}
            {...formik.getFieldProps('confirmPassword')}
          />
          {formik.touched.confirmPassword && formik.errors.confirmPassword ? (
            <p className="mt-1 text-sm text-red-600">{formik.errors.confirmPassword}</p>
          ) : null}
        </div>

        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {isLoading ? 'Creating account...' : 'Sign up'}
          </button>
        </div>
      </form>

      <div className="text-center">
        <p className="text-sm text-slate-300">
          Already have an account?{' '}
          <a href="/login" className="font-medium text-indigo-300 hover:text-white">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}
