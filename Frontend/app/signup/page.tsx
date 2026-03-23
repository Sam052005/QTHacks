'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { useAuthStore } from '@/lib/auth-store'

export default function SignupPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [collegeYear, setCollegeYear] = useState('')
  const [course, setCourse] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()
  const setAuth = useAuthStore((state) => state.setAuth)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('http://localhost:3001/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, collegeYear, course }),
      })
      const data = await res.json()
      if (res.ok) {
        setAuth(data.user, data.token)
        router.push('/')
      } else {
        setError(data.error || 'Signup failed')
      }
    } catch (err) {
      setError('Something went wrong')
    }
  }

  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Create Account</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Username</label>
              <Input value={username} onChange={(e) => setUsername(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">College Year</label>
              <Input placeholder="e.g. 3rd Year" value={collegeYear} onChange={(e) => setCollegeYear(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Course</label>
              <Input placeholder="e.g. Computer Science" value={course} onChange={(e) => setCourse(e.target.value)} required />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full">Sign Up</Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-sm text-muted-foreground">
            Already have an account? <Link href="/login" className="text-primary hover:underline">Login</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
