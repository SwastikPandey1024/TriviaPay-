import React from 'react'
import RegisterForm from '../components/auth/RegisterForm'

export default function RegisterPage() {
  return (
    <main className="min-h-[80vh] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <RegisterForm />
      </div>
    </main>
  )
}
