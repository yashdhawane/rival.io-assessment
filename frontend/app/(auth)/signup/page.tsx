import Link from 'next/link'
import SignupForm from '@/components/auth/signup-form'

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full space-y-8 p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div>
          <h2 className="text-center text-3xl font-bold text-gray-900 dark:text-white">
            Create your account
          </h2>
        </div>
        <SignupForm />
        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-600 hover:text-blue-500">
            Login
          </Link>
        </p>
      </div>
    </div>
  )
}
