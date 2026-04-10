import React from 'react'
import LoginForm from '../components/auth/LoginForm'

export default function LoginPage() {
  return (
    <main className="min-h-[80vh] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <LoginForm />
      </div>
    </main>
  )
}
