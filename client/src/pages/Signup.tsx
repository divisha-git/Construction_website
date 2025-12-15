import React from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import axios from 'axios'
import { Link } from 'react-router-dom'

const schema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['ENGINEER', 'OWNER']).default('ENGINEER'),
})

type FormData = z.infer<typeof schema>

export default function Signup() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) })
  const [serverError, setServerError] = React.useState<string | null>(null)
  const [success, setSuccess] = React.useState<string | null>(null)

  const onSubmit = async (data: FormData) => {
    setServerError(null)
    setSuccess(null)
    try {
      const res = await axios.post('/api/auth/signup', data)
      setSuccess('Account created! You can log in now.')
      localStorage.setItem('token', res.data.token)
    } catch (e: any) {
      setServerError(e?.response?.data?.message || 'Signup failed')
    }
  }

  return (
    <div className="min-h-screen grid place-items-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="w-full max-w-md bg-slate-900/70 backdrop-blur border border-slate-700 rounded-2xl p-8 shadow-2xl">
        <h1 className="text-2xl font-semibold text-white mb-6">Create your account</h1>
        {serverError && <p className="text-red-400 mb-3 text-sm">{serverError}</p>}
        {success && <p className="text-emerald-400 mb-3 text-sm">{success}</p>}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="text-sm text-slate-300">Name</label>
            <input className="mt-1 w-full h-11 px-3 rounded-md bg-slate-800 text-white placeholder-slate-400 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Your name" {...register('name')} />
            {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className="text-sm text-slate-300">Email</label>
            <input type="email" className="mt-1 w-full h-11 px-3 rounded-md bg-slate-800 text-white placeholder-slate-400 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="you@example.com" {...register('email')} />
            {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <label className="text-sm text-slate-300">Password</label>
            <input type="password" className="mt-1 w-full h-11 px-3 rounded-md bg-slate-800 text-white placeholder-slate-400 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="••••••••" {...register('password')} />
            {errors.password && <p className="text-xs text-red-400 mt-1">{errors.password.message}</p>}
          </div>
          <div>
            <label className="text-sm text-slate-300">Role</label>
            <select className="mt-1 w-full h-11 px-3 rounded-md bg-slate-800 text-white border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              {...register('role')}
            >
              <option value="ENGINEER">Engineer</option>
              <option value="OWNER">Owner</option>
            </select>
            {errors.role && <p className="text-xs text-red-400 mt-1">{errors.role.message as any}</p>}
          </div>
          <button disabled={isSubmitting} className="inline-flex items-center justify-center h-11 w-full rounded-md bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-60">
            {isSubmitting ? 'Creating...' : 'Create account'}
          </button>
        </form>
        <p className="text-sm text-slate-400 mt-6">Already have an account? <Link className="text-indigo-400 hover:underline" to="/login">Sign in</Link></p>
      </div>
    </div>
  )
}
